import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  GraduationCap,
  Layers,
  Compass,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { DiagramAnalysis, LanguageMode, ThemeMode } from "../types";
import { speechManager } from "../utils/speech";

interface EducationalExplanationsSectionProps {
  diagram: DiagramAnalysis;
  languageMode: LanguageMode;
  themeMode: ThemeMode;
  onSaveToNotes?: () => void;
  isSavedInNotes?: boolean;
}

export const EducationalExplanationsSection: React.FC<EducationalExplanationsSectionProps> = ({
  diagram,
  languageMode,
  themeMode,
  onSaveToNotes,
  isSavedInNotes = false,
}) => {
  const isEn = languageMode === "en";
  const isDark = themeMode === "dark";

  const [activeTier, setActiveTier] = useState<"structured" | "simple" | "detailed">("structured");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fallbacks to guarantee content is always rich and present
  const structuredText = isEn
    ? diagram.summaryEn || diagram.directSummaryEn || diagram.summaryAr
    : diagram.summaryAr || diagram.directSummaryAr || diagram.summaryEn;

  const simpleText = isEn
    ? diagram.simpleSummaryEn || diagram.summaryEn || diagram.summaryAr
    : diagram.simpleSummaryAr || diagram.summaryAr || diagram.directSummaryAr;

  const detailedText = isEn
    ? diagram.detailedExplanationEn || diagram.summaryEn || diagram.summaryAr
    : diagram.detailedExplanationAr || diagram.summaryAr || diagram.directSummaryAr;

  const getCurrentText = () => {
    switch (activeTier) {
      case "simple":
        return simpleText;
      case "detailed":
        return detailedText;
      default:
        return structuredText;
    }
  };

  const handleCopyText = async () => {
    const text = getCurrentText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Copy failed", err);
    }
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
    } else {
      const text = getCurrentText();
      setIsSpeaking(true);
      speechManager.speak(
        text,
        isEn ? "en" : "ar",
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const getTierIcon = (tier: "structured" | "simple" | "detailed") => {
    switch (tier) {
      case "simple":
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case "detailed":
        return <Compass className="w-4 h-4 text-purple-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div
      id="educational-explanations-section"
      className={`rounded-2xl border transition-all p-5 sm:p-6 space-y-4 shadow-sm ${
        isDark ? "bg-[#0A1325] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Header and Tier Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <BookOpen className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold">
              {isEn ? "Educational Text Explanation" : "الشرح النصي للمحتوى التعليمي"}
            </h3>
            {diagram.modelType && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {diagram.modelType === "anatomy"
                  ? isEn ? "Anatomy" : "نموذج تشريحي"
                  : diagram.modelType === "botany"
                  ? isEn ? "Botany" : "علم النبات"
                  : (diagram.modelType === "machine" || diagram.modelType === "device")
                  ? isEn ? "Apparatus & Tech" : "جهاز وتقنية"
                  : diagram.modelType === "experiment"
                  ? isEn ? "Experiment" : "تجربة علمية"
                  : diagram.modelType === "geography_map"
                  ? isEn ? "Geographic" : "خريطة جغرافية"
                  : isEn ? "Educational Model" : "نموذج تعليمي"}
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isEn
              ? "Choose your preferred depth of explanation: Structured overview, simplified student view, or comprehensive deep dive."
              : "اختر مستوى الشرح المناسب لك: الشرح المنظم، شرح مبسط للطالب، أو الشرح التفصيلي للتعمق."}
          </p>
        </div>

        {/* Quick Action Buttons (Audio, Copy, Save to Notes) */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            id="expl-listen-btn"
            type="button"
            onClick={handleToggleSpeech}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isSpeaking
                ? "bg-blue-600 text-white border-blue-500 animate-pulse shadow-md"
                : isDark
                ? "bg-[#101C33] border-slate-700 text-slate-300 hover:bg-[#162747]"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
            title={isSpeaking ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen to this explanation" : "استماع لهذا الشرح")}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-500" />}
            <span>{isSpeaking ? (isEn ? "Stop" : "إيقاف") : (isEn ? "Listen" : "استماع")}</span>
          </button>

          <button
            id="expl-copy-btn"
            type="button"
            onClick={handleCopyText}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              copied
                ? "bg-emerald-600 text-white border-emerald-500"
                : isDark
                ? "bg-[#101C33] border-slate-700 text-slate-300 hover:bg-[#162747]"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isEn ? "Copied" : "تم النسخ") : (isEn ? "Copy" : "نسخ")}</span>
          </button>

          {onSaveToNotes && (
            <button
              id="expl-save-notes-btn"
              type="button"
              onClick={onSaveToNotes}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isSavedInNotes
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold"
                  : isDark
                  ? "bg-[#101C33] border-slate-700 text-slate-300 hover:bg-[#162747]"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isSavedInNotes ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSavedInNotes ? (isEn ? "Saved" : "محفوظ") : (isEn ? "Save in Notes" : "حفظ في ملاحظاتي")}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Explanation Tabs */}
      <div className={`p-1.5 rounded-xl border grid grid-cols-3 gap-1.5 ${
        isDark ? "bg-[#060D19] border-slate-800" : "bg-slate-100 border-slate-200"
      }`}>
        <button
          id="tab-structured-explanation"
          type="button"
          onClick={() => {
            setActiveTier("structured");
            if (isSpeaking) speechManager.stop();
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTier === "structured"
              ? "bg-blue-600 text-white shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white"
          }`}
        >
          {getTierIcon("structured")}
          <span className="truncate">{isEn ? "Structured Overview" : "الشرح المنظم"}</span>
        </button>

        <button
          id="tab-simple-explanation"
          type="button"
          onClick={() => {
            setActiveTier("simple");
            if (isSpeaking) speechManager.stop();
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTier === "simple"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white"
          }`}
        >
          {getTierIcon("simple")}
          <span className="truncate">{isEn ? "Simplified Student View" : "شرح مبسط للطالب"}</span>
        </button>

        <button
          id="tab-detailed-explanation"
          type="button"
          onClick={() => {
            setActiveTier("detailed");
            if (isSpeaking) speechManager.stop();
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTier === "detailed"
              ? "bg-purple-600 text-white shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white"
          }`}
        >
          {getTierIcon("detailed")}
          <span className="truncate">{isEn ? "In-Depth Details" : "شرح بالتفصيل (متعمق)"}</span>
        </button>
      </div>

      {/* Active Tab Body */}
      <div className="space-y-4 pt-1">
        {/* Tier-Specific Badge Banner */}
        <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
          activeTier === "simple"
            ? isDark
              ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
            : activeTier === "detailed"
            ? isDark
              ? "bg-purple-950/30 border-purple-800/60 text-purple-300"
              : "bg-purple-50 border-purple-200 text-purple-900"
            : isDark
            ? "bg-blue-950/30 border-blue-800/60 text-blue-300"
            : "bg-blue-50 border-blue-200 text-blue-900"
        }`}>
          {getTierIcon(activeTier)}
          <span className="font-semibold">
            {activeTier === "simple"
              ? isEn
                ? "🌱 Simplified Concept: Crafted for fast retention, clear analogies, and zero academic jargon."
                : "🌱 تبسيط المفهوم: مصمم لسهولة الفهم والاستيعاب السريع باستخدام التشبيهات الواضحة واللغة الميسرة."
              : activeTier === "detailed"
              ? isEn
                ? "🔬 Advanced Scientific Mechanics: Deep-dive analysis covering physical/chemical causes, functional roles, and system interconnectivity."
                : "🔬 الاستدلال العلمي المتعمق: دراسة تفصيلية لآلية العمل، العلة والسبب العلمي، وترابط الأجزاء ببعضها."
              : isEn
              ? "📘 Structured Educational Summary: Key facts, operational sequence, and core definitions."
              : "📘 الشرح المنظم: نظرة شاملة ومرتبة تغطي التعريفات، المكونات الأساسية، وخلاصة المحتوى."}
          </span>
        </div>

        {/* Text Paragraphs */}
        <div className={`p-4 sm:p-5 rounded-xl border leading-relaxed text-sm sm:text-base space-y-3 font-normal ${
          isDark ? "bg-[#060D19] border-slate-800/90 text-slate-200" : "bg-slate-50/70 border-slate-200 text-slate-800"
        }`}>
          {getCurrentText()
            .split("\n\n")
            .map((paragraph, pIdx) => (
              <p key={pIdx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
        </div>

        {/* Adaptive Real-world & Misconceptions Insights (if available) */}
        {diagram.adaptiveExplanation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {diagram.adaptiveExplanation.realWorldApplicationAr && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                isDark ? "bg-[#0B1528] border-blue-900/40 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-900"
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? "Real-World Application:" : "التطبيق في الحياة والواقع:"}</span>
                </div>
                <p className="leading-relaxed">{diagram.adaptiveExplanation.realWorldApplicationAr}</p>
              </div>
            )}

            {diagram.adaptiveExplanation.commonMisconceptionsAr && diagram.adaptiveExplanation.commonMisconceptionsAr.length > 0 && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                isDark ? "bg-[#0B1528] border-rose-900/40 text-rose-200" : "bg-rose-50 border-rose-200 text-rose-900"
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{isEn ? "Common Misconceptions to Avoid:" : "مفاهيم خاطئة شائعة يجب تجنبها:"}</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {diagram.adaptiveExplanation.commonMisconceptionsAr.map((misc, mIdx) => (
                    <li key={mIdx} className="leading-relaxed">{misc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
