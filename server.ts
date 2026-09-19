import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  NINETEEN_RULES_SYSTEM_CORE_AR,
  NINETEEN_RULES_SYSTEM_CORE_EN,
  buildTutorChatSystemInstruction,
  buildVisionAssistantSystemInstruction,
  shouldEnableSearchGrounding,
} from "./server/aiRules";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for large payload (diagram images in base64)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Helper to safely get the Gemini API key strictly from server environment variables
const getApiKey = () => {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (
    !key ||
    key === "MY_GEMINI_API_KEY" ||
    key === "your_gemini_api_key_here" ||
    key.trim() === ""
  ) {
    return null;
  }
  return key.trim();
};

// Initialize Gemini Client safely without throwing on startup
const getGeminiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper to call Gemini models with resilient cascade across available models
// Handles quota limits (429 / resource_exhausted) gracefully
async function callGeminiWithCascade(
  ai: GoogleGenAI,
  requestPayload: {
    contents: any;
    config?: any;
  }
) {
  const models = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...requestPayload,
        model,
      });
      return response;
    } catch (err: any) {
      console.warn(`[Gemini Cascade] Model ${model} failed or hit quota:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError;
}


// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Analyze Textbook Diagram Image with Strict Visual Inspection & Content Recognition
app.post("/api/analyze-diagram", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        isValid: false,
        error: "Missing image data"
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.error("[DEV DIAGNOSTICS] GEMINI_API_KEY is not configured in server environment. Multimodal visual analysis requires a valid GEMINI_API_KEY.");
      return res.status(500).json({
        success: false,
        isValid: false,
        errorType: "api_key_missing",
        messageAr: "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.",
        messageEn: "Unable to analyze the image at this time. Please try again.",
      });
    }

    // Clean base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    const prompt = `أنت نظام رؤية حاسوبية وخبير تربوي متخصص في فحص وتحليل الصور والرسومات والمسائل والجداول في المناهج والكتب المدرسية.
مهمتك إجبارية ودقيقة تنقسم لمرحلتين حاسمتين:

المرحلة الأولى: الفحص البصري الدقيق والتحقق من صلاحية وجودة الصورة (Visual Inspection & Clarity Check):
- انظر للصورة أولاً بتمعن ودقة:
  1. هل الصورة سوداء بالكامل، مظلمة جداً، غير واضحة، معتمة، بيضاء فارغة، مشوشة للغاية (blurry)، أو لا يمكن قراءة أي نصوص أو تمييز أي رسم أو جدول فيها إطلاقاً؟
  2. هل الصورة لا علاقة لها بالمحتوى الدراسي (مثل صورة أرضية، جدار، أو تشويش عشوائي)؟
  => إذا كانت الصورة كذلك (غير واضحة، مظلمة، أو لا يمكن قراءتها):
     يجب عليك حتماً ودون أي استثناء إرجاع كائن JSON بالحقول:
     {
       "isValid": false,
       "status": "unclear",
       "rejectionReasonAr": "الصورة غير واضحة أو مظلمة أو لا يمكن قراءتها، يرجى رفع صورة أوضح تحتوي على رسم أو مخطط أو جدول أو سؤال دراسي.",
       "rejectionReasonEn": "The image is unclear, too dark, or unreadable. Please upload a clearer image of a diagram, chart, table, or study question."
     }
     *تحذير إلزامي صارم*: يُحظر عليك تماماً اختراع محتوى غير موجود، أو افتراض رسم أو جهاز أو مسألة ليست في الصورة! لا تعطي أي شرح عشوائي!

المرحلة الثانية: إذا كانت الصورة واضحة وقابلة للقراءة وتحتوي على محتوى دراسي أو علمي أو تقني (isValid: true):
- حدد أولاً وبالدليل البصري ما تحتويه الصورة فعلياً قبل أي شرح:
  1. نوع النموذج التعليمي الملائم تلقائياً (modelType):
     - "anatomy": إذا كانت صورة تشريحية (أعضاء جسم الإنسان، القلب، الجهاز الهضمي، الدماغ، الخلية...)
     - "botany": إذا كانت صورة نبات أو أحياء نباتية (الجذور، الساق، الأوراق، البناء الضوئي، الزهرة...)
     - "experiment": إذا كانت تجربة علمية (مختبر، أدوات تجربة، تفاعل، مراحل، نتائج...)
     - "machine": إذا كانت سيارة، محرك، آلة ميكانيكية، جهاز كهربائي، روبوت، أو حاسوب
     - "device": إذا كان جهازاً تقنياً أو أداة إلكترونية
     - "geography_map": إذا كانت خريطة جغرافية أو مخططاً تضاريسياً أو طبقات أرض
     - "chemistry": إذا كانت تفاعلاً كيميائياً، جدولاً دورياً، أو روابط جزيئية
     - "physics": إذا كانت دارة كهربائية، مسألة قوى، بصريات، أو ميكانيكا
     - "question": إذا كانت مسألة دراسية أو سؤالاً من كتاب
     - "general_educational": لمخطط تعليمي آخر
  2. نوع المحتوى (contentType): "diagram" | "question" | "table" | "chart" | "textbook_page" | "other"
  3. العنوان الحقيقي الدقيق لما تحتويه الصورة (titleAr و titleEn).
  4. المادة الدراسية الفعلية (subjectAr و subjectEn).
  5. المرحلة الدراسية الملائمة (gradeLevelAr و gradeLevelEn).
  6. الشرح المنظم للمحتوى (summaryAr و summaryEn):
     شرح متكامل ومنظم يوضح الفكرة الأساسية وما تحتويه الصورة وكيف تعمل.
  7. شرح مبسط مناسب للطالب (simpleSummaryAr و simpleSummaryEn):
     شرح سهل ومبسط وميسر بلغة واضحة تناسب الطالب وتساعده على الفهم السريع دون تعقيد.
  8. شرح بالتفصيل والتعمق (detailedExplanationAr و detailedExplanationEn):
     شرح موسع وعميق للمستخدم والباحث الذي يريد التعمق، يشرح العلة والسبب العلمي (Why & Mechanism)، والآليات الدقيقة، والقوانين المرتبطة، مع الاستدلال العلمي الرصين وفق القواعد الأساسية.
  9. الأجزاء أو العناصر الحقيقية المكتشفة في الصورة (parts):
     استخرج العناصر والمكونات الحقيقية الظاهرة في الصورة فقط، مع تحديد إحداثياتها (x, y) بنسبة مئوية دقيقة (من 0 إلى 100) لتثبيت الأرقام والعلامات التفاعلية فوقها مباشرة:
     - id: "part-1", "part-2"...
     - nameAr / nameEn: اسم الجزء أو المكون
     - functionAr / functionEn: وظيفته أو دوره الحيوي أو الميكانيكي في المنظومة
     - descriptionAr / descriptionEn: وصف وشرح علمي مفصل
     - relationToOtherPartsAr / relationToOtherPartsEn: علاقته وتداخله مع باقي الأجزاء وكيف يتصل أو يتكامل معها
     - keyFactAr / keyFactEn: معلومة هامة وسريعة
     - stepOrder: الترتيب المنطقي
     - stageTitleAr / stageTitleEn: عنوان المرحلة إن وجدت
     - x, y: الإحداثيات الفعلية المئوية (0 إلى 100)
  10. أسئلة اختبار تفاعلية ذاتية مبنية على محتوى الصورة الفعلي (quiz): 3 إلى 4 أسئلة:
      - id: "q-1", "q-2"...
      - questionAr, questionEn
      - optionsAr (4 خيارات), optionsEn (4 options)
      - correctAnswerIndex (0 to 3)
      - explanationAr, explanationEn
  11. 3 نقاط رئيسية ملخصة للاستذكار (keyTakeawaysAr و keyTakeawaysEn).
  12. أسئلة استكشافية مقترحة (suggestedQuestionsAr).

أخرج فقط كود JSON خالصاً مطابقاً دون أي نصوص إضافية خارج الـ JSON.`;

    try {
      const response = await callGeminiWithCascade(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          systemInstruction: NINETEEN_RULES_SYSTEM_CORE_AR,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const text = response.text?.trim() || "{}";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleaned);

      // Verify if the AI rejected the image as unclear/black/unreadable
      if (parsedData.isValid === false || parsedData.status === "unclear") {
        return res.json({
          success: false,
          isValid: false,
          status: "unclear",
          rejectionReasonAr: parsedData.rejectionReasonAr || "الصورة غير واضحة أو مظلمة، يرجى رفع صورة أوضح.",
          rejectionReasonEn: parsedData.rejectionReasonEn || "The image is unclear or too dark. Please upload a clearer image.",
        });
      }

      // Valid real vision analysis
      res.json({
        success: true,
        isValid: true,
        data: {
          ...parsedData,
          isRealVisionAnalysis: true,
        },
      });
    } catch (modelError: any) {
      console.error("[DEV/SERVER LOG] Gemini vision analysis cascade encountered error:", modelError?.message || modelError);
      return res.status(500).json({
        success: false,
        isValid: false,
        errorType: "analysis_failed",
        messageAr: "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.",
        messageEn: "Unable to analyze the image at this time. Please try again.",
      });
    }
  } catch (error: any) {
    console.error("Error in /api/analyze-diagram:", error);
    res.status(500).json({
      success: false,
      isValid: false,
      errorType: "unexpected_error",
      messageAr: "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.",
      messageEn: "Unable to analyze the image at this time. Please try again.",
    });
  }
});

// API: AI Educational Tutor Chat
app.post("/api/diagram-chat", async (req, res) => {
  try {
    const { message, diagramSummary, currentPart, history = [], languageMode = "ar" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const isEn = languageMode === "en";
    const ai = getGeminiClient();

    // Helper to generate a direct, accurate answer or request clarification when offline/fallback
    const generateDirectFallbackReply = (msg: string): string => {
      const trimmed = msg.trim();
      const lower = trimmed.toLowerCase();

      // Check if message is too vague, gibberish, or unclear
      if (
        trimmed.length < 3 ||
        /^[\s\.,\?!؟]+$/.test(trimmed) ||
        /^(شو|ايش|ماذا|ليش|كيف|الو|مرحبا|هاي|hi|hello|hey|\?)$/i.test(trimmed)
      ) {
        return isEn
          ? "Your question is too brief or unclear. Could you please specify what exact part, concept, or process in this diagram you would like me to explain?"
          : "سؤالك غير محدد أو غير واضح بما يكفي. يرجى توضيح استفسارك أو تحديد الجزء أو العملية التي تود أن أشرحها لك في هذا المخطط لأجيبك مباشرة بدقة.";
      }

      // Check if user is asking about function / role / purpose
      if (/وظيفة|دور|مهمة|فائدة|ماذا يفعل|function|role|purpose/i.test(lower)) {
        if (currentPart) {
          return isEn
            ? `Regarding "${currentPart.nameEn}": Its primary function is: ${currentPart.function || currentPart.description || "to regulate and maintain core physiological processes within this system."}`
            : `بخصوص "${currentPart.nameAr || currentPart.name}": وظيفته الأساسية والمباشرة هي: ${currentPart.function || currentPart.description || "القيام بدور حيوي منظم داخل هذا النظام التعليمي."}`;
        }
        return isEn
          ? `In this diagram (${diagramSummary?.titleEn || "Diagram"}), the primary function is: ${diagramSummary?.summary || "to demonstrate the functional integration of all depicted biological/scientific components."}`
          : `في هذا المخطط (${diagramSummary?.titleAr || "المخطط التعليمي"})، الوظيفة والهدف الأساسي هو: ${diagramSummary?.summary || "توضيح التكامل الوظيفي بين المكونات الظاهرة ومسار انتقال الطاقة والمادة."}`;
      }

      // Check if user is asking about location / where is it
      if (/أين|موقع|مكان|يقع|where|location/i.test(lower)) {
        if (currentPart) {
          return isEn
            ? `Location of "${currentPart.nameEn}": Situated strategically within the ${diagramSummary?.titleEn || "system"}, connected directly with adjacent structures.`
            : `موقع "${currentPart.nameAr || currentPart.name}": يقع في موضع محدد ضمن ${diagramSummary?.titleAr || "النظام"} ليرتبط تشريحياً ووظيفياً بالأجزاء المجاورة له.`;
        }
        return isEn
          ? `Please select a specific component on the diagram to see its exact spatial location and anatomical position.`
          : `يرجى النقر على أي عنصر محدد في المخطط لأوضح لك موقعه المكاني الدقيق وعلاقته بالأعضاء المحيطة.`;
      }

      // Check if user is asking "what is this?" / definition
      if (/ما هو|ما هي|ماهو|ماهي|تعريف|what is/i.test(lower)) {
        if (currentPart) {
          return isEn
            ? `Definition of "${currentPart.nameEn}": ${currentPart.description || currentPart.function || "A key functional component of this diagram."}`
            : `تعريف "${currentPart.nameAr || currentPart.name}": ${currentPart.description || currentPart.function || "عنصر ومكون علمي رئيسي يظهر بوضوح في هذا المخطط."}`;
        }
        return isEn
          ? `This diagram depicts: ${diagramSummary?.titleEn || "Scientific Diagram"}. ${diagramSummary?.summary || ""}`
          : `يوضح هذا المخطط: ${diagramSummary?.titleAr || "مخطط علمي تعليمي"}. ${diagramSummary?.summary || ""}`;
      }

      // Check if asking about relationship / connection between parts
      if (/علاقة|ارتباط|كيف يتصل|تكامل|relation|connect|integrate/i.test(lower)) {
        if (currentPart) {
          return isEn
            ? `Functional connection of "${currentPart.nameEn}": It works in sequence with the rest of the system by receiving physiological inputs and passing on processed substances.`
            : `العلاقة التكاملية لـ "${currentPart.nameAr || currentPart.name}": يعمل بتناغم مباشر مع المكونات الأخرى عبر استقبال المدخلات ومعالجتها وتمرير المخرجات لضمان استمرار الدورة الوظيفية.`;
        }
        return isEn
          ? `All parts in ${diagramSummary?.titleEn || "this diagram"} work as an integrated unit to achieve equilibrium and proper systemic function.`
          : `جميع الأجزاء في هذا المخطط (${diagramSummary?.titleAr || ""}) تعمل كوحدة متكاملة لتحقيق التوازن والأداء الحيوي السليم.`;
      }

      // If user asks about a specific part from diagram parts list
      if (diagramSummary?.parts && Array.isArray(diagramSummary.parts)) {
        for (const p of diagramSummary.parts) {
          if (
            (p.name && lower.includes(p.name.toLowerCase())) ||
            (p.nameEn && lower.includes(p.nameEn.toLowerCase()))
          ) {
            return isEn
              ? `Direct answer regarding "${p.nameEn || p.name}": ${p.function || "This part plays an essential role in this structure."}`
              : `إجابة مباشرة حول "${p.name || p.nameEn}": وظيفته ومهمته هي: ${p.function || "يؤدي هذا الجزء دوراً أساسياً في هذا التركيب العلمي."}`;
          }
        }
      }

      // If cannot determine intent from question
      return isEn
        ? `Your question regarding "${trimmed}" needs a bit more context. Could you please specify what exact scientific aspect you would like answered?`
        : `سؤالك حول "${trimmed}" يحتاج إلى تحديد أدق؛ هل تود معرفة الوظيفة الحيوية، أم الموقع التشريحي، أم آلية عمل هذا الجزء؟ يرجى التوضيح لأجيبك مباشرة بدقة وبدون تخمين.`;
    };

    if (!ai) {
      const reply = generateDirectFallbackReply(message);
      return res.json({ reply, demoMode: true });
    }

    const enableSearch = shouldEnableSearchGrounding(message);
    const systemInstruction = buildTutorChatSystemInstruction(diagramSummary, currentPart, isEn);

    // Format chat history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.text }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [
        {
          text: `${message}\n\n(تنبيه صارم: أجب عن سؤال المستخدم المحدد مباشرة وبأقل عدد كافٍ من الكلمات، وتوقف فوراً دون مقدمات أو حشو أو إعادة شرح المخطط كاملاً.)`,
        },
      ],
    });

    try {
      const config: any = {
        systemInstruction,
        temperature: 0.2,
      };
      if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await callGeminiWithCascade(ai, {
        contents,
        config,
      });

      const reply = response.text || (isEn ? "Could you please rephrase your question so I can assist you with precision?" : "سؤالك غير واضح تماماً، هل يمكنك إعادة صياغة السؤال أو توضيح ما تقصده بالتحديد لأتمكن من إجابتك بدقة؟");
      res.json({ reply });
    } catch (modelError: any) {
      console.warn("Tutor chat generation error, using fallback reply:", modelError);
      const reply = generateDirectFallbackReply(message);
      res.json({ reply, demoMode: true });
    }
  } catch (error: any) {
    console.error("Error in /api/diagram-chat:", error);
    res.json({
      reply: "أهلاً بك! يسعدني دائماً الإجابة عن أي استفسار حول هذا المخطط التعليمي وأجزائه المختلفة.",
      demoMode: true,
    });
  }
});

// In-memory audio cache for instant TTS responses
const ttsCache = new Map<string, Buffer>();

// Helper to chunk long text into natural sentences
function chunkText(text: string, maxLen = 100): string[] {
  const clean = text.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  let remaining = clean;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let idx = remaining.lastIndexOf(" ", maxLen);
    if (idx <= 0) {
      idx = maxLen;
    }
    const chunk = remaining.substring(0, idx).trim();
    if (chunk) chunks.push(chunk);
    remaining = remaining.substring(idx).trim();
  }
  return chunks;
}

// API: Visual Search & Region Inspection
app.post("/api/inspect-region", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", region, diagramContext } = req.body;

    if (!region || typeof region.x !== "number" || typeof region.y !== "number") {
      return res.status(400).json({ error: "Missing valid region coordinates" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      console.warn("GEMINI_API_KEY not configured for inspect-region");
      return res.status(500).json({
        recognized: false,
        nameAr: "تعذر فحص المنطقة حاليًا",
        nameEn: "Region inspection unavailable",
        whatIsThisAr: "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.",
        whatIsThisEn: "Unable to analyze the image at this time. Please try again.",
      });
    }

    const existingPartsSummary =
      diagramContext?.existingParts
        ?.map(
          (p: any) =>
            `- ${p.nameAr} (${p.nameEn}) at x:${Math.round(p.x)}%, y:${Math.round(p.y)}%: ${p.functionAr}`
        )
        .join("\n") || "لا توجد أجزاء مسجلة مسبقاً";

    const prompt = `أنت خبير فحص بصري تعليمي وتحليل مجهري وتشريحي للمخططات العلمية والكتب المدرسية.
قام الطالب بتحديد وفحص منطقة معينة على الرسم التعليمي المرفق عند الإحداثيات التالية:
- النسبة المئوية الأفقية X: ${Math.round(region.x)}% (من أصل 100%)
- النسبة المئوية الرأسية Y: ${Math.round(region.y)}% (من أصل 100%)
${
  region.width && region.height
    ? `- أبعاد المستطيل المحدد: عرض ${Math.round(region.width)}% وارتفاع ${Math.round(region.height)}%`
    : ""
}

سياق المخطط العام:
- عنوان المخطط: ${diagramContext?.titleAr || "مخطط علمي"} (${diagramContext?.titleEn || "Scientific Diagram"})
- المادة/الموضوع: ${diagramContext?.subjectAr || "العلوم والتشريح"}
- الأجزاء المعروفة في هذا المخطط:
${existingPartsSummary}

مهمتك هي التعرف بدقة بالغة على هذا الجزء/العنصر في المنطقة المحددة، ثم الإجابة المنهجية والدقيقة باللغتين العربية والإنجليزية على الأسئلة الأربعة التالية للدارس:
1. "ما هذا؟" (What is this?): الاسم الدقيق للعنصر ونوعه وطبيعته التركيبية.
2. "ما وظيفته؟" (What is its function?): دوره الحيوي أو الفيزيائي أو العلمي وماذا يقدم للنظام ككل.
3. "أين يوجد؟" (Where is it located?): موقعه التشريحي الدقيق وعلاقته بالمحيط المكاني له داخل المخطط والكائن.
4. "ما علاقته بباقي الأجزاء؟" (What is its relation to other parts?): كيف يتصل وظيفياً وتشريحياً بالأعضاء أو المكونات المجاورة، وما هي مدخلاته ومخرجاته وتكامله معها.

أخرج كائن JSON حصراً بالحقول التالية:
{
  "recognized": true,
  "nameAr": "اسم العنصر بالعربية بدقة",
  "nameEn": "English Name",
  "whatIsThisAr": "شرح دقيق لماهيته وطبيعته التركيبية بالعربية",
  "whatIsThisEn": "Accurate structural explanation in English",
  "functionAr": "شرح وظيفته الحيوية ودوره الأساسي بالعربية",
  "functionEn": "Accurate functional explanation in English",
  "locationAr": "تحديد موقعه الدقيق في الجسم أو النظام بالعربية",
  "locationEn": "Accurate spatial location explanation in English",
  "relationToOtherPartsAr": "شرح تفصيلي لعلاقته الوظيفية والتشريحية بباقي الأجزاء والاتصال بينها",
  "relationToOtherPartsEn": "Detailed explanation of functional and structural connectivity with adjacent parts",
  "keyFactAr": "معلومة ذهبية هامة وممتعة عن هذا الجزء للطلاب",
  "keyFactEn": "Key fascinating educational takeaway in English"
}
أخرج كود JSON فقط بدون أي نصوص تمهيدية أو تنسيقات markdown إضافية.`;

    let contentsParts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }
    contentsParts.push({ text: prompt });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: contentsParts,
        },
        config: {
          systemInstruction: NINETEEN_RULES_SYSTEM_CORE_AR,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(cleaned);

      result.region = region;
      res.json(result);
    } catch (modelError: any) {
      console.warn("Region inspection Gemini error:", modelError);
      return res.status(500).json({
        recognized: false,
        nameAr: "تعذر فحص المنطقة حاليًا",
        nameEn: "Region inspection unavailable",
        whatIsThisAr: "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.",
        whatIsThisEn: "Unable to analyze the image at this time. Please try again.",
      });
    }
  } catch (error: any) {
    console.error("Error in /api/inspect-region:", error);
    return res.status(500).json({
      recognized: false,
      nameAr: "تعذر فحص المنطقة حاليًا",
      nameEn: "Region inspection unavailable",
      whatIsThisAr: "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.",
      whatIsThisEn: "Unable to analyze the image at this time. Please try again.",
    });
  }
});

// ============================================================================
// Professional Vision Assistant & Multimodal Image Analysis System
// ============================================================================

// In-memory image cache for multi-turn conversations (session-bound)
const visionSessionImageCache = new Map<string, { base64: string; mimeType: string; timestamp: number }>();

// Cleanup stale session images older than 2 hours
setInterval(() => {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  for (const [key, val] of visionSessionImageCache.entries()) {
    if (val.timestamp < twoHoursAgo) {
      visionSessionImageCache.delete(key);
    }
  }
}, 15 * 60 * 1000);

app.post("/api/vision-assistant", async (req, res) => {
  try {
    const {
      sessionId,
      imageBase64,
      mimeType = "image/jpeg",
      prompt,
      intent = "analyze",
      chatHistory = [],
      imageDimensions,
    } = req.body;

    const userPrompt = (prompt || "").trim() || "قم بتحليل وشرح هذه الصورة بالتفصيل وبشكل تعليمي منظم.";

    // Session-bound image caching for continuous follow-up turns
    let effectiveImageBase64 = imageBase64;
    let effectiveMimeType = mimeType;

    if (sessionId) {
      if (imageBase64) {
        visionSessionImageCache.set(sessionId, {
          base64: imageBase64,
          mimeType,
          timestamp: Date.now(),
        });
      } else {
        const cached = visionSessionImageCache.get(sessionId);
        if (cached) {
          effectiveImageBase64 = cached.base64;
          effectiveMimeType = cached.mimeType;
        }
      }
    }

    const ai = getGeminiClient();

    if (!ai) {
      console.warn("GEMINI_API_KEY not set for /api/vision-assistant");
      return res.status(500).json({
        success: false,
        response: "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.",
        detectedType: "general",
        clarityStatus: "clear",
        suggestedFollowUps: [],
      });
    }

    // Clean base64 string
    const cleanBase64 = effectiveImageBase64
      ? effectiveImageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "")
      : "";

    // Build the Multimodal Vision System Instruction incorporating the 19 Foundational Rules
    const systemInstruction = buildVisionAssistantSystemInstruction(intent, false);

    // Prepare contents parts
    const parts: any[] = [];

    // Add image inline data if available
    if (cleanBase64) {
      parts.push({
        inlineData: {
          mimeType: effectiveMimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    // Build context summary from prior turns if multi-turn chat
    let conversationContext = "";
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      conversationContext = "سجل المحادثة السابقة حول هذه الصورة:\n" +
        chatHistory
          .slice(-6)
          .map((m: any) => `${m.role === "user" ? "المستخدم" : "المساعد"}: ${m.text}`)
          .join("\n\n") +
        "\n\n";
    }

    const strictBehaviorDirective = `
توجيه سلوكي صارم للذكاء الاصطناعي (أولوية مطلقة):
1. أجب عن سؤال المستخدم مباشرة أولاً وبأقل عدد كافٍ من الكلمات، ثم توقف.
2. إذا كان السؤال بسيطاً أو محدداً (مثل: ما هذا، ما وظيفته، كم الناتج، حل المسألة، ما الإجابة الصحيحة): أعطِ الإجابة المباشرة أو الحل فوراً.
3. وجود الصورة وسيلة لاستخراج الإجابة عن السؤال فقط؛ لا تصف الصورة ولا تسرد جميع عناصرها ولا تكرر الشرح ما لم يطلب المستخدم ذلك صراحة.
4. تجنب تماماً المقدمات الطويلة والترحيب وعبارات مثل "بالتأكيد سأساعدك" أو "دعنا نستكشف". ادخل في الجواب فوراً.
`;

    const fullPrompt = `${systemInstruction}\n\n${strictBehaviorDirective}\n\n${conversationContext}طلب المستخدم الحالي:\n"${userPrompt}"\n(نوع النية المطلوبة: ${intent})`;
    parts.push({ text: fullPrompt });

    const response = await callGeminiWithCascade(ai, {
      contents: {
        parts,
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "{}";
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return res.json({
        success: true,
        response: parsed.response || rawText,
        detectedType: parsed.detectedType || "general",
        clarityStatus: parsed.clarityStatus || "clear",
        unclearExplanation: parsed.unclearExplanation || "",
        suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps)
          ? parsed.suggestedFollowUps
          : [
              "اشرح لي المزيد عن هذا الموضوع",
              "هل هناك تفاصيل إضافية في الصورة؟",
              "اختبرني في هذه المفاهيم",
            ],
        isRealVisionAnalysis: true,
      });
    } catch (parseErr) {
      // Fallback if model responded with raw markdown directly
      return res.json({
        success: true,
        response: cleaned,
        detectedType: "general",
        clarityStatus: "clear",
        suggestedFollowUps: [
          "هل يمكنك توضيح نقطة معينة بالتفصيل؟",
          "ما هي الاستنتاجات الإضافية من هذه الصورة؟",
        ],
        isRealVisionAnalysis: true,
      });
    }
  } catch (error: any) {
    console.error("Error in /api/vision-assistant:", error);
    return res.status(500).json({
      success: false,
      response: "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.",
      detectedType: "general",
      clarityStatus: "clear",
      suggestedFollowUps: [],
    });
  }
});

// ============================================================================
// User Authentication & Persistence System
// ============================================================================
const USERS_FILE_PATH = path.join(process.cwd(), "users-db.json");

function loadServerUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const content = fs.readFileSync(USERS_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Could not read users-db.json, initializing empty list", e);
  }
  return [];
}

function saveServerUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not save to users-db.json", e);
  }
}

// In-memory cache synced with disk
let serverUsersCache = loadServerUsers();

function hashPasswordServer(password: string, salt: string = "edugraphic_salt_2026"): string {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

// Validate username on server:
// - Accepts letters (Arabic & English) and spaces between words only
// - Strict rejection of numbers (0-9, ٠-٩, ۰-۹)
// - Strict rejection of symbols/punctuation (@, #, $, %, &, *, !, etc.)
// - Length between 2 and 35 characters
function validateServerUsername(username: string): { valid: boolean; error?: string } {
  const trimmed = (username || "").trim();
  if (!trimmed) {
    return { valid: false, error: "اسم المستخدم مطلوب" };
  }
  if (trimmed.length < 2 || trimmed.length > 35) {
    return { valid: false, error: "يجب أن يكون طول اسم المستخدم بين 2 و 35 حرفاً" };
  }
  // Check for numbers: Western (0-9), Arabic-Indic (٠-٩), Persian (۰-۹)
  const numbersRegex = /[0-9\u0660-\u0669\u06F0-\u06F9]/;
  if (numbersRegex.test(trimmed)) {
    return { valid: false, error: "ممنوع وجود الأرقام داخل اسم المستخدم، يسمح فقط بالأحرف والكلمات" };
  }
  // Allow only Arabic and English letters plus spaces
  const allowedLettersOnlyRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]+$/;
  if (!allowedLettersOnlyRegex.test(trimmed)) {
    return { valid: false, error: "ممنوع وجود الرموز الخاصة مثل @ # $ % & * ! وغيرها، يسمح فقط بالأحرف والكلمات" };
  }
  return { valid: true };
}

// Endpoint: Check username availability
app.post("/api/auth/check-username", (req, res) => {
  try {
    const { username, currentUserId } = req.body;
    const clean = (username || "").trim().toLowerCase();
    const existing = serverUsersCache.find(
      (u: any) =>
        (u.usernameNormalized === clean || u.username?.toLowerCase() === clean) &&
        u.id !== currentUserId
    );
    res.json({ available: !existing });
  } catch (e) {
    res.json({ available: true });
  }
});

// Endpoint: Register User
app.post("/api/auth/register", (req, res) => {
  try {
    const { user, password } = req.body;
    if (!user || !user.username) {
      return res.status(400).json({ error: "بيانات المستخدم غير مكتملة" });
    }

    const cleanUsername = user.username.trim();
    const check = validateServerUsername(cleanUsername);
    if (!check.valid) {
      return res.status(400).json({ error: check.error });
    }

    const cleanNormalized = cleanUsername.toLowerCase();
    const existing = serverUsersCache.find(
      (u: any) => (u.usernameNormalized || u.username?.toLowerCase()) === cleanNormalized
    );

    if (existing) {
      return res.status(409).json({ error: "اسم المستخدم هذا مسجل بالفعل، يرجى اختيار اسم آخر" });
    }

    const passwordHash = password ? hashPasswordServer(password) : "";

    const newUserRecord = {
      ...user,
      id: user.id || "usr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7),
      username: cleanUsername,
      usernameNormalized: cleanNormalized,
      passwordHash: passwordHash,
      authProvider: user.authProvider || "local",
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    delete newUserRecord.password;

    serverUsersCache.push(newUserRecord);
    saveServerUsers(serverUsersCache);

    const { passwordHash: _, ...safeUser } = newUserRecord;
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error("Error in /api/auth/register:", error);
    res.status(500).json({ error: "فشل في تسجيل المستخدم على الخادم" });
  }
});

// Endpoint: Login User
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const clean = (username || "").trim();

    if (!clean) {
      return res.status(400).json({ error: "اسم المستخدم مطلوب" });
    }

    const cleanLower = clean.toLowerCase();
    const found = serverUsersCache.find(
      (u: any) =>
        (u.usernameNormalized || u.username?.toLowerCase()) === cleanLower ||
        (u.email && u.email?.toLowerCase() === cleanLower)
    );

    if (!found) {
      return res.status(404).json({
        error: "لم يتم العثور على حساب بهذا الاسم، يرجى التحقق من البيانات أو إنشاء حساب جديد",
      });
    }

    // Verify password securely using hash
    if (found.passwordHash || (found.password && String(found.password).trim() !== "")) {
      const inputHash = hashPasswordServer(password || "");
      const isMatch =
        found.passwordHash === inputHash ||
        (found.password && String(found.password) === String(password));

      if (!isMatch) {
        return res.status(401).json({
          error: "كلمة المرور غير صحيحة، يرجى المحاولة مجدداً",
        });
      }
    }

    found.lastLoginAt = new Date().toISOString();
    saveServerUsers(serverUsersCache);

    const { password: _, passwordHash: __, ...safeUser } = found;
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error("Error in /api/auth/login:", error);
    res.status(500).json({ error: "فشل تسجيل الدخول" });
  }
});

// Endpoint: Update Username
app.post("/api/auth/update-username", (req, res) => {
  try {
    const { userId, newUsername } = req.body;
    const clean = (newUsername || "").trim();
    const check = validateServerUsername(clean);
    if (!check.valid) {
      return res.status(400).json({ error: check.error });
    }

    const cleanNormalized = clean.toLowerCase();
    const conflict = serverUsersCache.find(
      (u: any) =>
        (u.usernameNormalized || u.username?.toLowerCase()) === cleanNormalized &&
        u.id !== userId
    );

    if (conflict) {
      return res.status(409).json({ error: "اسم المستخدم هذا مسجل بالفعل لحساب آخر" });
    }

    const user = serverUsersCache.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    user.username = clean;
    user.usernameNormalized = cleanNormalized;
    user.displayName = clean;
    user.updatedAt = new Date().toISOString();
    saveServerUsers(serverUsersCache);

    const { password: _, passwordHash: __, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: "فشل تحديث اسم المستخدم" });
  }
});

// Endpoint: Update Password
app.post("/api/auth/update-password", (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const user = serverUsersCache.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({ error: "هذا الحساب مسجل عبر Google ولا يتطلب كلمة مرور" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "يجب ألا تقل كلمة المرور الجديدة عن 6 خانات" });
    }

    // Verify current password if account already had password
    if (user.passwordHash || (user.password && String(user.password).trim() !== "")) {
      const currentHash = hashPasswordServer(currentPassword || "");
      const isMatch =
        user.passwordHash === currentHash ||
        (user.password && String(user.password) === String(currentPassword));
      if (!isMatch) {
        return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
      }
    }

    user.passwordHash = hashPasswordServer(newPassword);
    delete user.password;
    user.updatedAt = new Date().toISOString();
    saveServerUsers(serverUsersCache);

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error: any) {
    res.status(500).json({ error: "فشل تغيير كلمة المرور" });
  }
});

// Endpoint: Update Avatar
app.post("/api/auth/update-avatar", (req, res) => {
  try {
    const { userId, avatarUrl } = req.body;
    const user = serverUsersCache.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    user.avatarUrl = avatarUrl;
    user.updatedAt = new Date().toISOString();
    saveServerUsers(serverUsersCache);

    const { password: _, passwordHash: __, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: "فشل تحديث صورة الملف الشخصي" });
  }
});

// Endpoint: Get list of registered users (sanitized, without passwords)
app.get("/api/auth/users", (req, res) => {
  try {
    const safeUsers = serverUsersCache.map((u: any) => {
      const { password: _, ...safe } = u;
      return safe;
    });
    res.json({ users: safeUsers });
  } catch (e) {
    res.json({ users: [] });
  }
});

// Endpoint: Fast / Direct Email Sign-In (Login or 1-step streamlined onboarding)
app.post("/api/auth/quick-email", (req, res) => {
  try {
    const { email, displayName } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length < 5) {
      return res.status(400).json({ error: "يرجى إدخال عنوان بريد إلكتروني صحيح" });
    }

    const existing = serverUsersCache.find(
      (u: any) => u.email && u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      existing.lastLoginAt = new Date().toISOString();
      saveServerUsers(serverUsersCache);
      const { password: _, ...safeUser } = existing;
      return res.json({ success: true, user: safeUser, isNew: false });
    }

    // Create a new streamlined account
    const emailPrefix = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_\u0621-\u064A]/g, "");
    const baseUsername = emailPrefix.length >= 2 ? emailPrefix : "متعلم_المعرفة";
    let finalUsername = baseUsername;
    let counter = 1;
    while (serverUsersCache.some((u: any) => u.username?.toLowerCase() === finalUsername.toLowerCase())) {
      finalUsername = `${baseUsername}_${counter++}`;
    }

    const finalDisplayName = (displayName || "").trim() || finalUsername;

    const newUser = {
      id: "email-user-" + Date.now(),
      username: finalUsername,
      displayName: finalDisplayName,
      email: cleanEmail,
      password: "",
      authProvider: "local",
      userCategory: "متعلم عام (كافة الأعمار)",
      ageGroup: "جميع الأعمار",
      schoolName: "التعليم المفتوح والذاتي",
      gradeLevel: "كافة المستويات",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: {
        languageMode: "ar",
        themeMode: "light",
        fontSize: "md",
        soundEffects: true,
        highContrast: false,
      },
      history: [],
      quizzes: [],
      chats: {},
      stats: {
        diagramsAnalyzed: 0,
        quizzesCompleted: 0,
        studyStreakDays: 1,
        earnedBadges: ["مستكشف المعرفة"],
      },
    };

    serverUsersCache.push(newUser);
    saveServerUsers(serverUsersCache);

    const { password: _, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser, isNew: true });
  } catch (error: any) {
    console.error("Error in /api/auth/quick-email:", error);
    res.status(500).json({ error: "فشل الدخول بالبريد الإلكتروني" });
  }
});

// Endpoint: Reset Password for Registered Account
app.post("/api/auth/reset-password", (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    const cleanId = (identifier || "").trim();
    const cleanPass = (newPassword || "").trim();

    if (!cleanId) {
      return res.status(400).json({ error: "يرجى كتابة البريد الإلكتروني أو اسم المستخدم" });
    }

    if (!cleanPass || cleanPass.length < 3) {
      return res.status(400).json({ error: "يجب ألا تقل كلمة المرور الجديدة عن 3 خانات" });
    }

    const found = serverUsersCache.find(
      (u: any) =>
        u.username?.toLowerCase() === cleanId.toLowerCase() ||
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
    );

    if (!found) {
      return res.status(404).json({
        error: "لم يتم العثور على أي حساب مسجل بهذا البريد أو اسم المستخدم",
      });
    }

    found.password = cleanPass;
    found.lastLoginAt = new Date().toISOString();
    saveServerUsers(serverUsersCache);

    res.json({
      success: true,
      message: "تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بها.",
    });
  } catch (error: any) {
    console.error("Error in /api/auth/reset-password:", error);
    res.status(500).json({ error: "فشل استعادة الحساب وتحديث كلمة المرور" });
  }
});

// Endpoint: Google Auth Login/Register
app.post("/api/auth/google", (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ error: "بيانات حساب جوجل مطلوبة" });
    }

    const existingIndex = serverUsersCache.findIndex(
      (u: any) =>
        (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
        u.id === user.id
    );

    if (existingIndex >= 0) {
      serverUsersCache[existingIndex] = {
        ...serverUsersCache[existingIndex],
        ...user,
        lastLoginAt: new Date().toISOString(),
      };
      saveServerUsers(serverUsersCache);
      const { password: _, ...safeUser } = serverUsersCache[existingIndex];
      return res.json({ success: true, user: safeUser });
    }

    serverUsersCache.push({
      ...user,
      lastLoginAt: new Date().toISOString(),
    });
    saveServerUsers(serverUsersCache);

    res.json({ success: true, user });
  } catch (error: any) {
    console.error("Error in /api/auth/google:", error);
    res.status(500).json({ error: "فشل ربط حساب جوجل" });
  }
});

// Endpoint: Sync User Account (Preferences, History, Quizzes, Chats, Stats)
app.post("/api/auth/sync", (req, res) => {
  try {
    const { user } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: "معرف المستخدم مطلوب" });
    }

    const index = serverUsersCache.findIndex((u: any) => u.id === user.id);
    if (index >= 0) {
      const existingPass = serverUsersCache[index].password;
      serverUsersCache[index] = {
        ...serverUsersCache[index],
        ...user,
        password: user.password || existingPass || "",
      };
    } else {
      serverUsersCache.push(user);
    }

    saveServerUsers(serverUsersCache);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/auth/sync:", error);
    res.status(500).json({ error: "فشل مزامنة بيانات المستخدم" });
  }
});

// Endpoint: Fetch isolated data for a specific user
app.get("/api/user/data", (req, res) => {
  try {
    const userId = (req.query.userId as string) || "";
    if (!userId) {
      return res.status(400).json({ error: "معرف المستخدم مطلوب" });
    }
    const found = serverUsersCache.find((u: any) => u.id === userId);
    if (!found) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }
    const { password: _, ...safeUser } = found;
    res.json({ success: true, user: safeUser });
  } catch (e) {
    res.status(500).json({ error: "خطأ في استرجاع بيانات المستخدم" });
  }
});

// Endpoint: Permanently Delete User Account and All Data from Server
app.post("/api/auth/delete-account", (req, res) => {
  try {
    const { userId, username } = req.body;
    if (!userId && !username) {
      return res.status(400).json({ error: "معرف الحساب أو اسم المستخدم مطلوب لحذف الحساب" });
    }

    const initialCount = serverUsersCache.length;
    serverUsersCache = serverUsersCache.filter(
      (u: any) =>
        u.id !== userId &&
        (!username || (u.username && u.username.toLowerCase() !== username.toLowerCase()))
    );

    saveServerUsers(serverUsersCache);
    res.json({
      success: true,
      deleted: initialCount !== serverUsersCache.length,
      message: "تم حذف الحساب وجميع بياناته نهائياً من قاعدة البيانات بنجاح.",
    });
  } catch (error: any) {
    console.error("Error in /api/auth/delete-account:", error);
    res.status(500).json({ error: "فشل حذف الحساب من الخادم" });
  }
});

// Endpoint: Admin / System Reset (Wipes all legacy accounts while maintaining schema)
app.post("/api/auth/reset-all", (req, res) => {
  try {
    serverUsersCache = [];
    saveServerUsers([]);
    res.json({ success: true, message: "تمت تهيئة قاعدة البيانات والبدء بنظام جديد كلياً." });
  } catch (error: any) {
    res.status(500).json({ error: "فشل تهيئة قاعدة البيانات" });
  }
});

// API: High-Quality Educational TTS (Supports Native Arabic and English)
app.get("/api/tts", async (req, res) => {
  try {
    const text = ((req.query.text as string) || "").trim();
    const lang = ((req.query.lang as string) || "ar").toLowerCase().startsWith("en") ? "en" : "ar";

    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }

    const cacheKey = `${lang}:${text}`;
    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(cached);
    }

    const chunks = chunkText(text, 100);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(
        chunk
      )}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
      });

      if (!response.ok) {
        throw new Error(`TTS provider returned status ${response.status}`);
      }

      const arrayBuf = await response.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuf));
    }

    const combined = Buffer.concat(audioBuffers);
    if (ttsCache.size > 200) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, combined);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(combined);
  } catch (error: any) {
    console.error("Error in /api/tts:", error);
    res.status(500).json({ error: error?.message || "Failed to generate TTS audio" });
  }
});

// ==========================================
// API: Intelligent Notes AI Assistant
// ==========================================
app.post("/api/notes/ai-assist", async (req, res) => {
  try {
    const { action, noteTitle, noteContent, notes, customPrompt, languageMode } = req.body;
    const isEn = languageMode === "en";

    // Combine notes content if multiple notes provided
    let combinedText = "";
    if (notes && Array.isArray(notes) && notes.length > 0) {
      combinedText = notes
        .map((n: any, idx: number) => `--- [ملاحظة ${idx + 1}: ${n.title || "بدون عنوان"}] (${n.category || "عام"})\n${n.content}\n`)
        .join("\n");
    } else {
      combinedText = `[عنوان الملاحظة: ${noteTitle || "بدون عنوان"}]\n\n${noteContent || ""}`;
    }

    if (!combinedText.trim()) {
      return res.status(400).json({
        success: false,
        error: isEn ? "Notes content is empty" : "محتوى الملاحظات فارغ",
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback generator if no API key configured
      let fallbackText = "";
      if (action === "summarize") {
        fallbackText = `### 📝 ملخص الملاحظات:\n- تركز هذه الملاحظات على المحاور الأساسية لموضوع: **${noteTitle || "الملاحظة"}**.\n- تم تدوين العناصر المهمة لتيسير الاستيعاب السريع.\n- يُنصح بمراجعة المفاهيم المحورية وتطبيقها عملياً.`;
      } else if (action === "generate_quiz") {
        fallbackText = `### ❓ بنك أسئلة استيعاب مستخرج من الملاحظات:\n1. **سؤال الفهم:** ما الفكرة الجوهرية التي تدور حولها هذه الملاحظات؟\n   - *الإجابة:* مراجعة المحاور المكتوبة في "${noteTitle || "الملاحظة"}".\n2. **سؤال تطبيقي:** كيف يمكنك توظيف النقاط المذكورة لحل مسألة متعلقة بها؟`;
      } else if (action === "key_points") {
        fallbackText = `### ⭐ أهم النقاط المستخرجة:\n1. **المفهوم الأول:** النقاط المحورية المدونة في الملاحظة.\n2. **الهدف التعليمي:** استيعاب وتطبيق الخطوات المسجلة بدقة.`;
      } else {
        fallbackText = `### 💡 المعالجة التعليمية للملاحظة:\nتم فحص وتدقيق محتوى الملاحظات بنجاح. يمكنك مواصلة التعديل أو إضافة محاور جديدة.`;
      }
      return res.json({ success: true, resultText: fallbackText });
    }

    let actionPrompt = "";
    if (action === "summarize") {
      actionPrompt = isEn
        ? "Summarize these notes comprehensively and systematically, highlighting core takeaways, mechanisms, and main themes clearly in elegant Markdown format."
        : "قم بتلخيص هذه الملاحظات تلخيصاً علمياً منهجياً وافياً، مع إبراز الأفكار الجوهرية والعلل والنتائج بأسلوب Markdown أنيق ومنظم بدون حشو.";
    } else if (action === "generate_quiz") {
      actionPrompt = isEn
        ? "Transform these notes into a high-yield study quiz (multiple choice and conceptual comprehension questions) with model answers and scientific rationales in clean Markdown."
        : "حوّل هذه الملاحظات إلى اختبار تعليمي ذاتي تفاعلي (أسئلة اختيار من متعدد مع خيارات وشرح الإجابة الصحيحة، وأسئلة فهم عميق) بصيغة Markdown منسقة.";
    } else if (action === "explain") {
      actionPrompt = isEn
        ? "Deeply explain the concepts in these notes step-by-step, clarifying the underlying scientific mechanisms, practical real-world examples, and logical connections."
        : "اشرح المفاهيم الواردة في هذه الملاحظات شرحاً تعليمياً مبسطاً ورصيناً خطوة بخطوة، مع توضيح العلة والسبب وأمثلة توضيحية لتعميق الفهم وفق دستور التعليم الذكي.";
    } else if (action === "structure") {
      actionPrompt = isEn
        ? "Re-organize, restructure, and refine these notes into a pristine hierarchical outline with clear headings, bullet points, checklists, and summary boxes in Markdown."
        : "أعد ترتيب وهيكلة هذه الملاحظات وصياغتها في هيكل تنظيمي رائع: عناوين رئيسية وفرعية واضحة، قوائم نقطية، قوائم مهام (Checkboxes)، وصناديق إبراز للمفاهيم الهامة في Markdown.";
    } else if (action === "key_points") {
      actionPrompt = isEn
        ? "Extract the absolute most critical key points, formulas, definitions, and golden rules that must be memorized or retained from these notes."
        : "استخرج أهم النقاط والمفاهيم الذهبية والقوانين والمصطلحات الأساسية التي يجب التركيز عليها وحفظها من هذه الملاحظات في نقاط مركزة ومرقمة.";
    } else if (customPrompt) {
      actionPrompt = customPrompt;
    } else {
      actionPrompt = isEn
        ? "Analyze and provide helpful educational insights on these notes."
        : "قم بتحليل وتقديم رؤى تعليمية مفيدة ومنظمة حول هذه الملاحظات.";
    }

    const systemInstruction = isEn
      ? `${NINETEEN_RULES_SYSTEM_CORE_EN}\n\nYou are an elite educational tutor assisting the student with their personal study notes. Output clean, deeply informative, and elegantly structured Markdown.`
      : `${NINETEEN_RULES_SYSTEM_CORE_AR}\n\nأنت مرشد ومساعد تعليمي فائق الذكاء، تساعد الطالب في دراسة وتنظيم ملاحظاته الشخصية بدقة متناهية واستدلال علمي رصين. أخرج إجابتك بتنسيق Markdown احترافي وعناوين منظمة.`;

    const userMessage = `${actionPrompt}\n\nإليك محتوى الملاحظات:\n${combinedText}`;

    const response = await callGeminiWithCascade(ai, {
      contents: {
        parts: [{ text: userMessage }],
      },
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const resultText = response?.text?.trim() || "";
    return res.json({
      success: true,
      resultText: resultText || (isEn ? "No output received" : "لم يتم توليد محتوى"),
    });
  } catch (error: any) {
    console.error("Error in /api/notes/ai-assist:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "فشلت معالجة الملاحظات بالذكاء الاصطناعي",
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduGraphic server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
