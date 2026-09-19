import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  FileCode,
  HelpCircle,
  Share2,
  RefreshCw,
  Crop,
  Layers,
  ChevronDown,
  Info,
  Bookmark,
} from "lucide-react";
import Markdown from "react-markdown";
import {
  VisionSession,
  VisionChatMessage,
  VisionAnalysisIntent,
  ThemeMode,
  LanguageMode,
} from "../types";
import { speechManager } from "../utils/speech";
import { saveVisionAnalysisAsNote } from "../utils/notesFirestore";
import { getApiUrl } from "../utils/apiConfig";

interface VisionAssistantViewProps {
  session: VisionSession | null;
  onUpdateSession?: (updated: VisionSession) => void;
  onBack: () => void;
  onNewAnalysis?: () => void;
  onNewImage?: () => void;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
  onConvertToDiagram?: (session: VisionSession) => void;
  userId?: string;
  onOpenNotes?: (noteId?: string) => void;
}

export const VisionAssistantView: React.FC<VisionAssistantViewProps> = ({
  session,
  onUpdateSession,
  onBack,
  onNewAnalysis,
  onNewImage,
  themeMode = "light",
  languageMode = "ar",
  onConvertToDiagram,
  userId,
  onOpenNotes,
}) => {
  const isDark = themeMode === "dark";
  const isEn = languageMode === "en";

  const handleTriggerNew = () => {
    if (onNewAnalysis) {
      onNewAnalysis();
    } else if (onNewImage) {
      onNewImage();
    }
  };

  // Follow-up chat input state
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [savedVisionNoteIds, setSavedVisionNoteIds] = useState<Record<string, boolean>>({});

  const handleSaveVisionToNotes = async (msgId: string, analysisText: string) => {
    try {
      await saveVisionAnalysisAsNote({
        title: `${isEn ? "Vision Analysis" : "تحليل بصري"}: ${session.prompt.slice(0, 45)}...`,
        imageUrl: session.imageUrl,
        question: session.prompt,
        analysisText,
        userId: userId || "guest",
        category: "📚 الدراسة",
      });
      setSavedVisionNoteIds((prev) => ({ ...prev, [msgId]: true }));
      setTimeout(() => {
        setSavedVisionNoteIds((prev) => ({ ...prev, [msgId]: false }));
      }, 3500);
    } catch (e) {
      console.error("Failed to save vision note:", e);
    }
  };

  // Zoom & image view state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages, isLoading]);

  // Initial trigger if session has no assistant response yet
  useEffect(() => {
    if (session && session.messages.length === 1 && session.messages[0].role === "user") {
      executeVisionTurn(session.prompt, session.initialIntent, true);
    }
  }, [session?.id]);

  if (!session) {
    return (
      <div className={`max-w-4xl mx-auto px-4 py-16 text-center space-y-6 ${isDark ? "text-white" : "text-slate-900"}`}>
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">
            {isEn ? "No Active Vision Session" : "لا توجد جلسة تحليل نشطة"}
          </h2>
          <p className={`text-sm max-w-md mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isEn
              ? "Capture your screen or upload any screenshot/diagram to start an interactive visual AI conversation."
              : "التقط شاشتك أو ارفع أي صورة أو رسم لبدء محادثة ذكية وتحليل تفاعلي مع الصورة."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleTriggerNew}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEn ? "Capture Screen or Upload" : "التقاط الشاشة أو رفع صورة"}</span>
          </button>
          <button
            onClick={onBack}
            className={`px-5 py-3 rounded-xl text-sm font-bold border cursor-pointer ${
              isDark ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {isEn ? "Back to Home" : "العودة للرئيسية"}
          </button>
        </div>
      </div>
    );
  }

  const executeVisionTurn = async (
    prompt: string,
    intent: VisionAnalysisIntent = "custom",
    isFirstTurn = false
  ) => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);

    // If follow-up, append user message
    let updatedMessages = [...session.messages];
    if (!isFirstTurn) {
      const userMsg: VisionChatMessage = {
        id: "msg_" + Date.now(),
        role: "user",
        text: prompt,
        timestamp: new Date().toISOString(),
        intent,
      };
      updatedMessages.push(userMsg);
      onUpdateSession?.({
        ...session,
        messages: updatedMessages,
      });
      setInputText("");
    }

    try {
      const response = await fetch(getApiUrl("/api/vision-assistant"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          imageBase64: isFirstTurn ? session.imageUrl : undefined,
          mimeType: "image/jpeg",
          prompt,
          intent,
          chatHistory: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          imageDimensions: session.imageDimensions,
        }),
      });

      const data = await response.json();

      const assistantMsg: VisionChatMessage = {
        id: "msg_ai_" + Date.now(),
        role: "assistant",
        text: data.response || "تم تحليل محتوى الصورة بنجاح.",
        timestamp: new Date().toISOString(),
        detectedType: data.detectedType,
        clarityStatus: data.clarityStatus,
        suggestedFollowUps: data.suggestedFollowUps || [],
        isRealVisionAnalysis: data.isRealVisionAnalysis,
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      onUpdateSession?.({
        ...session,
        messages: finalMessages,
      });
    } catch (err) {
      console.error("Vision assistant error:", err);
      const errorMsg: VisionChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        text: isEn
          ? "An error occurred while analyzing the image. Please try asking again or check connection."
          : "حدث خطأ أثناء معالجة استفسارك، يرجى المحاولة مجدداً أو طرح سؤال آخر.",
        timestamp: new Date().toISOString(),
      };
      onUpdateSession?.({
        ...session,
        messages: [...updatedMessages, errorMsg],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeak = (text: string, msgId: string) => {
    if (speakingMsgId === msgId) {
      speechManager.stop();
      setSpeakingMsgId(null);
      return;
    }

    speechManager.stop();
    setSpeakingMsgId(msgId);
    // Strip markdown tags for natural speech
    const cleanText = text
      .replace(/#+\s/g, "")
      .replace(/[*_`]/g, "")
      .replace(/```[\s\S]*?```/g, "كود برمجي")
      .slice(0, 800);

    speechManager.speak(
      cleanText,
      languageMode === "en" ? "en" : "ar",
      undefined,
      () => setSpeakingMsgId(null)
    );
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(3, Math.max(0.7, prev + delta)));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  // Human-readable format for image metadata
  const dimensionsLabel = session.imageDimensions
    ? `${session.imageDimensions.width} × ${session.imageDimensions.height} px ${
        session.imageDimensions.isTall
          ? isEn
            ? "(Long Screenshot)"
            : "(لقطة شاشة طولية)"
          : ""
      }`
    : "";

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className={`min-h-[calc(100vh-80px)] flex flex-col transition-colors ${
        isDark ? "bg-[#0B1528] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Workspace Bar */}
      <header
        className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 sticky top-14 z-20 backdrop-blur-md ${
          isDark
            ? "bg-[#101C33]/90 border-slate-800 text-white"
            : "bg-white/95 border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="vision-back-btn"
            onClick={onBack}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600"
            }`}
            title={isEn ? "Back" : "العودة"}
          >
            {isEn ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-600/20 text-blue-500 font-bold text-xs">
                Vision AI
              </span>
              <h1 className="text-sm sm:text-base font-bold truncate max-w-[200px] sm:max-w-md">
                {session.title || (isEn ? "Image Vision Analysis" : "تحليل الرؤية الذكي للصورة")}
              </h1>
            </div>
            {dimensionsLabel && (
              <p
                className={`text-[11px] font-mono ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {dimensionsLabel}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onConvertToDiagram && (
            <button
              id="vision-convert-diagram-btn"
              onClick={() => onConvertToDiagram(session)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? "bg-slate-800/90 border-slate-700 text-blue-400 hover:bg-slate-700"
                  : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
              }`}
              title={isEn ? "Convert to Interactive Diagram" : "تحويل إلى مخطط تفاعلي كامل"}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isEn ? "To Interactive Diagram" : "تحويل لمخطط تفاعلي"}
              </span>
            </button>
          )}

          <button
            id="vision-new-image-btn"
            onClick={handleTriggerNew}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isEn ? "New Image" : "صورة جديدة"}</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Panel Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Image Preview & Controls - 5 Cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-3 lg:sticky lg:top-28">
          <div
            className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col relative transition-all ${
              isDark ? "bg-[#101C33] border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            {/* Image Header & Zoom controls */}
            <div
              className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-medium ${
                isDark
                  ? "bg-slate-900/60 border-slate-800/80 text-slate-300"
                  : "bg-slate-50 border-slate-200/80 text-slate-600"
              }`}
            >
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                {isEn ? "Source Image Reference" : "الصورة المرجعية للتحليل"}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleZoom(-0.2)}
                  className="p-1 rounded-md hover:bg-slate-500/20 transition-colors cursor-pointer"
                  title={isEn ? "Zoom Out" : "تصغير"}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => handleZoom(0.2)}
                  className="p-1 rounded-md hover:bg-slate-500/20 transition-colors cursor-pointer"
                  title={isEn ? "Zoom In" : "تكبير"}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-1 rounded-md hover:bg-slate-500/20 transition-colors cursor-pointer"
                  title={isEn ? "Reset Zoom" : "إعادة الضبط"}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable / Pinchable Image Canvas Container */}
            <div
              ref={imageContainerRef}
              className={`max-h-[500px] lg:max-h-[620px] overflow-auto flex items-center justify-center p-3 relative ${
                isDark ? "bg-[#070E1A]" : "bg-slate-100/70"
              }`}
            >
              <img
                src={session.imageUrl}
                alt="Source for vision analysis"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center top",
                  transition: "transform 0.15s ease-out",
                }}
                className="max-w-full rounded-lg shadow-xs object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Footer notice with aspect ratio details */}
            <div
              className={`px-4 py-2 text-[11px] border-t flex items-center justify-between ${
                isDark
                  ? "border-slate-800 text-slate-400 bg-slate-900/30"
                  : "border-slate-100 text-slate-500 bg-slate-50/50"
              }`}
            >
              <span>
                {session.imageDimensions?.isTall
                  ? isEn
                    ? "Tall screenshot: scroll inside image to view all sections"
                    : "لقطة طولية: مرر داخل الصورة لمشاهدة كافة الأجزاء"
                  : isEn
                  ? "Full visual context linked to chat"
                  : "الصورة مرتبطة بسياق المحادثة المباشرة"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Structured Analysis & Threaded Conversation - 7 Cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Conversation Messages */}
          <div className="flex flex-col gap-4">
            {session.messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const isSpeaking = speakingMsgId === msg.id;

              if (isUser) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-xs ${
                        isDark
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-blue-600 text-white rounded-br-xs"
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              }

              // Assistant Response
              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl border p-4 sm:p-6 shadow-xs relative transition-all ${
                    isDark
                      ? "bg-[#101C33] border-slate-800/90 text-slate-100"
                      : "bg-white border-slate-200/90 text-slate-800"
                  }`}
                >
                  {/* Top Bar for Assistant Message */}
                  <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs sm:text-sm font-bold text-blue-500">
                            {isEn ? "EduGraphic Vision Assistant" : "مساعد الرؤية الذكي"}
                          </h2>
                          {msg.detectedType && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                isDark
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {msg.detectedType === "code"
                                ? isEn
                                  ? "Code"
                                  : "كود برمجي"
                                : msg.detectedType === "math_question"
                                ? isEn
                                  ? "Math / Science"
                                  : "مسألة رياضية"
                                : msg.detectedType === "textbook"
                                ? isEn
                                  ? "Textbook"
                                  : "كتاب دراسي"
                                : msg.detectedType === "table"
                                ? isEn
                                  ? "Data Table"
                                  : "جدول بيانات"
                                : isEn
                                ? "Multimodal"
                                : "تحليل متعدد الوسائط"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio TTS Button */}
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSpeaking
                            ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400/50"
                            : isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
                            : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        }`}
                        title={
                          isSpeaking
                            ? isEn
                              ? "Stop Audio"
                              : "إيقاف الصوت"
                            : isEn
                            ? "Listen to Explanation"
                            : "استمع للشرح صوتياً"
                        }
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Save to My Notes */}
                      <button
                        onClick={() => handleSaveVisionToNotes(msg.id, msg.text)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                          savedVisionNoteIds[msg.id]
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : isDark
                            ? "bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700"
                            : "bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200"
                        }`}
                        title={isEn ? "Save this analysis to My Notes" : "حفظ هذا التحليل في ملاحظاتي"}
                      >
                        {savedVisionNoteIds[msg.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span className="text-[10px] text-white">
                              {isEn ? "Saved" : "تم الحفظ ✓"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[10px] hidden sm:inline">
                              {isEn ? "Save to Notes" : "حفظ في ملاحظاتي"}
                            </span>
                          </>
                        )}
                      </button>

                      {/* Copy Markdown */}
                      <button
                        onClick={() => handleCopyMarkdown(msg.text, index)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          copiedIndex === index
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
                            : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        }`}
                        title={isEn ? "Copy to Clipboard" : "نسخ الشرح"}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Unclear warning banner if applicable */}
                  {msg.clarityStatus && msg.clarityStatus !== "clear" && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {isEn
                            ? "Partial Clarity Notice: "
                            : "تنبيه وضوح الصورة: "}
                        </span>
                        <span>
                          {isEn
                            ? "Some text or numbers in the image appear blurry or cut off. To ensure highest accuracy, consider uploading a closer crop of that section."
                            : "بعض النصوص أو الأرقام في الصورة تبدو غير واضحة أو مقطوعة جزئياً. لضمان أدق إجابة، يمكنك تقريب أو اقتصاص الجزء المطلوب."}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Render Markdown Response */}
                  <div
                    className={`markdown-body text-xs sm:text-sm leading-relaxed ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    <Markdown
                      components={{
                        h1: ({ children }) => (
                          <h3 className="text-base sm:text-lg font-black text-blue-500 mt-4 mb-2 pb-1 border-b border-blue-500/20">
                            {children}
                          </h3>
                        ),
                        h2: ({ children }) => (
                          <h3 className="text-sm sm:text-base font-extrabold text-blue-500 mt-3 mb-2">
                            {children}
                          </h3>
                        ),
                        h3: ({ children }) => (
                          <h4 className="text-xs sm:text-sm font-bold text-blue-500 mt-3 mb-1.5">
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2.5 leading-relaxed font-normal">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 my-2 ps-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-1 my-2 ps-2 font-medium">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote
                            className={`p-3 my-2.5 rounded-xl border-s-4 font-medium ${
                              isDark
                                ? "bg-slate-800/60 border-blue-500 text-slate-200"
                                : "bg-blue-50/70 border-blue-600 text-blue-950"
                            }`}
                          >
                            {children}
                          </blockquote>
                        ),
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeString = String(children).replace(/\n$/, "");
                          const isInline = !className && !codeString.includes("\n");

                          if (isInline) {
                            return (
                              <code
                                className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
                                  isDark
                                    ? "bg-slate-800 text-blue-300"
                                    : "bg-slate-100 text-blue-700"
                                }`}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }

                          return (
                            <div className="relative my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 text-[11px] text-slate-400 font-mono border-b border-slate-800">
                                <span>{match ? match[1] : "code"}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(codeString);
                                  }}
                                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{isEn ? "Copy" : "نسخ"}</span>
                                </button>
                              </div>
                              <pre className="p-3 text-[11px] sm:text-xs font-mono overflow-x-auto leading-relaxed">
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  </div>

                  {/* Suggested Follow-up Questions Chips */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-500/20">
                      <p
                        className={`text-[11px] font-semibold mb-2 flex items-center gap-1.5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                        {isEn
                          ? "Suggested follow-up questions for this image:"
                          : "أسئلة متابعة مقترحة حول هذه الصورة:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.suggestedFollowUps.map((question, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => executeVisionTurn(question, "custom")}
                            disabled={isLoading}
                            className={`px-3 py-1.5 rounded-xl text-xs text-start font-medium border transition-all cursor-pointer ${
                              isDark
                                ? "bg-slate-800/80 border-slate-700 hover:bg-slate-700 hover:border-blue-500 text-slate-200"
                                : "bg-slate-100 border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700"
                            }`}
                          >
                            💬 {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div
                className={`rounded-2xl border p-4 shadow-xs flex items-center gap-3 animate-pulse ${
                  isDark
                    ? "bg-[#101C33] border-slate-800 text-blue-400"
                    : "bg-white border-slate-200 text-blue-600"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold">
                    {isEn
                      ? "Vision AI is inspecting the image and calculating response..."
                      : "الذكاء الاصطناعي يفحص الصورة المرئية بعناية ويجهز الإجابة..."}
                  </p>
                  <p
                    className={`text-[11px] ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {isEn
                      ? "Analyzing visual elements, equations, text, and structure"
                      : "تحليل العناصر البصرية، المعادلات، النصوص، والهيكل"}
                  </p>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Follow-up Prompt Input Box (Persistent thread linked to image) */}
          <div
            className={`rounded-2xl border p-2.5 sm:p-3 shadow-md sticky bottom-4 z-10 backdrop-blur-md ${
              isDark
                ? "bg-[#101C33]/95 border-slate-700"
                : "bg-white/95 border-slate-300 shadow-slate-200"
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeVisionTurn(inputText, "custom");
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isEn
                    ? "Ask a follow-up about this image (e.g., 'Why did you use this law?')..."
                    : "اسأل أي سؤال متابعة حول نفس الصورة (مثال: 'ليش استخدمت القانون هذا؟')..."
                }
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />

              <button
                id="vision-submit-prompt-btn"
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                  !inputText.trim() || isLoading
                    ? "bg-slate-400/40 text-slate-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30"
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isEn ? "Ask" : "إرسال"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
