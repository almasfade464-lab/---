import React, { useState } from "react";
import {
  X,
  FileText,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Markdown from "react-markdown";
import { DiagramAnalysis, LanguageMode } from "../types";
import { speechManager } from "../utils/speech";

interface ImageTextExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: DiagramAnalysis;
  languageMode?: LanguageMode;
  isSavedInNotes?: boolean;
  onSaveToNotes?: () => void;
}

export const ImageTextExplanationModal: React.FC<ImageTextExplanationModalProps> = ({
  isOpen,
  onClose,
  diagram,
  languageMode = "ar",
  isSavedInNotes = false,
  onSaveToNotes,
}) => {
  const isEn = languageMode === "en";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  // Build the structured pedagogical explanation from the diagram parts, summary, and text
  const generateStructuredTextExplanation = () => {
    const partsList = diagram.parts.map((p, idx) => `• **${p.nameAr}** (${p.nameEn}): ${p.functionAr}. ${p.descriptionAr}`).join("\n");

    const takeaways = diagram.keyTakeawaysAr?.length
      ? diagram.keyTakeawaysAr.map((t) => `• ${t}`).join("\n")
      : `• فهم العلاقة التكاملية بين مكونات ${diagram.titleAr}.\n• ربط المفاهيم النظرية بالتطبيقات الحيوية والعملية.`;

    return `### 📖 شرح نصوص ومفاهيم الصورة بالتفصيل

#### 1. الفكرة الأساسية والمفهوم المحوري:
المحتوى المعروض في هذا الرسم يتناول **${diagram.titleAr}** لمادة **${diagram.subjectAr}** (${diagram.gradeLevelAr}).
${diagram.directSummaryAr || diagram.summaryAr}

#### 2. قراءة النصوص والمصطلحات والبيانات الظاهرة:
تم استخراج المصطلحات والبيانات من الصورة وترتيبها منطقياً:
${partsList}

#### 3. التحليل العلمي والاستدلال المنهجي:
- **الآلية وسبب الحدوث:** تعمل هذه الأجزاء بتسلسل دقيق ومنسق لنقل الطاقة، المادة، أو الإشارات، بما يضمن استقرار المنظومة.
- **التكامل الوظيفي:** لا يعمل أي جزء بمعزل عن الآخر؛ فتعطيل أو تغير أي مكون ينعكس مباشرة على سائر أجزاء المنظومة.

#### 4. ملخص النقاط التعليمية للاستذكار السريع:
${takeaways}
`;
  };

  const explanationText = generateStructuredTextExplanation();

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      // Clean markdown tags for natural speech readout
      const cleanSpeech = explanationText
        .replace(/###|####|\*\*|•|\*|-/g, "")
        .replace(/\n+/g, " ");
      speechManager.speak(cleanSpeech, isEn ? "en" : "ar", () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(explanationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isEn ? "In-Image Text & Concepts Explanation" : "شرح نصوص ومفاهيم الصورة"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {diagram.subjectAr}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEn ? diagram.titleEn : diagram.titleAr}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSpeaking) speechManager.stop();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isEn ? "Close" : "إغلاق"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {/* Speak Button */}
            <button
              onClick={handleToggleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                isSpeaking
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{isEn ? "Stop Voice" : "إيقاف الصوت"}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isEn ? "Listen to Explanation" : "استماع للشرح الصوتي"}</span>
                </>
              )}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isEn ? "Copied" : "تم النسخ") : (isEn ? "Copy" : "نسخ النص")}</span>
            </button>
          </div>

          {/* Save to Notes Button */}
          {onSaveToNotes && (
            <button
              onClick={onSaveToNotes}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                isSavedInNotes
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                  : "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40"
              }`}
            >
              {isSavedInNotes ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSavedInNotes ? (isEn ? "Saved in Notes" : "محفوظ في ملاحظاتي") : (isEn ? "Save to My Notes" : "حفظ في ملاحظاتي")}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-slate-200">
          <div className="markdown-body space-y-3">
            <Markdown
              components={{
                h3: ({ children }) => (
                  <h3 className="text-base sm:text-lg font-bold text-blue-400 border-b border-slate-700 pb-1 mb-2">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm sm:text-base font-bold text-emerald-400 mt-4 mb-1">
                    {children}
                  </h4>
                ),
                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-2 ps-1">{children}</ul>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-bold">{children}</strong>
                ),
              }}
            >
              {explanationText}
            </Markdown>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{isEn ? "First-principles scientific explanation" : "شرح مبني على الاستدلال العلمي الدقيق"}</span>
          </span>
          <button
            onClick={() => {
              if (isSpeaking) speechManager.stop();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            {isEn ? "Close" : "إغلاق"}
          </button>
        </div>
      </div>
    </div>
  );
};
