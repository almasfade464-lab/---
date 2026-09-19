import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Network,
} from "lucide-react";
import { DiagramPart, LanguageMode } from "../types";
import { speechManager } from "../utils/speech";

interface PartDetailsCardProps {
  part: DiagramPart | null;
  totalParts: number;
  currentIndex: number;
  onSelectNext: () => void;
  onSelectPrev: () => void;
  onAskAiAboutPart: (part: DiagramPart) => void;
  languageMode: LanguageMode;
}

export const PartDetailsCard: React.FC<PartDetailsCardProps> = ({
  part,
  totalParts,
  currentIndex,
  onSelectNext,
  onSelectPrev,
  onAskAiAboutPart,
  languageMode,
}) => {
  const isEn = languageMode === "en";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingLang, setSpeakingLang] = useState<"ar" | "en" | null>(null);

  useEffect(() => {
    const unsubscribe = speechManager.subscribe((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) setSpeakingLang(null);
    });
    return unsubscribe;
  }, []);

  if (!part) {
    return (
      <div
        dir={isEn ? "ltr" : "rtl"}
        className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[300px] shadow-xs"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {isEn ? "Select a Diagram Part to Explore" : "حدد جزءاً من المخطط للاستكشاف"}
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          {isEn
            ? "Click on any interactive hotspot on the diagram to see its biological function, scientific explanation, and audio pronunciation."
            : "انقر على أي نقطة رقمية على الرسم التخطيطي لعرض وظيفتها والشرح الصوتي والعلمي بالتفصيل."}
        </p>
      </div>
    );
  }

  const handleSpeakArabic = () => {
    if (isSpeaking && speakingLang === "ar") {
      speechManager.stop();
      setSpeakingLang(null);
      return;
    }
    setSpeakingLang("ar");
    speechManager.speak(
      `${part.nameAr}. ${part.functionAr}. ${part.descriptionAr}`,
      "ar",
      undefined,
      () => setSpeakingLang(null)
    );
  };

  const handleSpeakEnglish = () => {
    if (isSpeaking && speakingLang === "en") {
      speechManager.stop();
      setSpeakingLang(null);
      return;
    }
    setSpeakingLang("en");
    speechManager.speak(
      `${part.nameEn}. ${part.functionEn}. ${part.descriptionEn}`,
      "en",
      undefined,
      () => setSpeakingLang(null)
    );
  };

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Top Header Card */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentIndex + 1}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {isEn
                ? `Part ${currentIndex + 1} of ${totalParts}`
                : `جزء ${currentIndex + 1} من ${totalParts}`}
            </span>
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center gap-1">
            <button
              id="prev-part-btn"
              onClick={onSelectPrev}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title={isEn ? "Previous part" : "الجزء السابق"}
            >
              {isEn ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
            <button
              id="next-part-btn"
              onClick={onSelectNext}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title={isEn ? "Next part" : "الجزء التالي"}
            >
              {isEn ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Part Title and Bilingual Pronunciation */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 leading-snug font-sans">
            {isEn ? part.nameEn : part.nameAr}
          </h3>
          <p
            className="text-sm font-semibold text-emerald-700 tracking-wide font-sans"
            dir={isEn ? "rtl" : "ltr"}
          >
            {isEn ? part.nameAr : part.nameEn}
          </p>
        </div>

        {/* Audio Action Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60">
          <button
            id="speak-ar-btn"
            onClick={handleSpeakArabic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              isSpeaking && speakingLang === "ar"
                ? "bg-emerald-600 text-white animate-pulse"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {isSpeaking && speakingLang === "ar" ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isEn ? "Arabic Voice" : "نطق بالعربية"}</span>
          </button>

          <button
            id="speak-en-btn"
            onClick={handleSpeakEnglish}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              isSpeaking && speakingLang === "en"
                ? "bg-emerald-600 text-white animate-pulse"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {isSpeaking && speakingLang === "en" ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isEn ? "English Voice" : "Pronounce (EN)"}</span>
          </button>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 space-y-4 text-xs leading-relaxed flex-1">
        {/* Function Box */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isEn ? "Biological Function & Role" : "الوظيفة والأهمية الحيوية (Function)"}</span>
          </div>
          <p className="text-slate-800 mb-1 leading-relaxed font-medium">
            {isEn ? part.functionEn || part.functionAr : part.functionAr}
          </p>
          {(isEn || languageMode === "both") && (
            <p
              className="text-slate-600 text-[11px] leading-relaxed italic border-t border-emerald-200/50 pt-1 mt-1 font-sans"
              dir={isEn ? "rtl" : "ltr"}
            >
              {isEn ? part.functionAr : part.functionEn}
            </p>
          )}
        </div>

        {/* Detailed Description */}
        <div>
          <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEn ? "Detailed Description & Context" : "الشرح والوصف المفصل (Description)"}</span>
          </h4>
          <p className="text-slate-600 leading-relaxed">
            {isEn ? part.descriptionEn || part.descriptionAr : part.descriptionAr}
          </p>
          {(isEn || languageMode === "both") && (
            <p
              className="text-slate-500 text-[11px] leading-relaxed mt-1 font-sans"
              dir={isEn ? "rtl" : "ltr"}
            >
              {isEn ? part.descriptionAr : part.descriptionEn}
            </p>
          )}
        </div>

        {/* Relation to Other Parts in the System */}
        {(part.relationToOtherPartsAr || part.relationToOtherPartsEn) && (
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-1.5 text-xs">
              <Network className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{isEn ? "Interconnection & Relation to Other Parts" : "علاقته وتداخله مع باقي الأجزاء (Integration)"}</span>
            </div>
            <p className="text-blue-950 font-medium leading-relaxed">
              {isEn ? part.relationToOtherPartsEn || part.relationToOtherPartsAr : part.relationToOtherPartsAr}
            </p>
            {(isEn || languageMode === "both") && part.relationToOtherPartsAr && part.relationToOtherPartsEn && (
              <p
                className="text-blue-800 text-[11px] leading-relaxed mt-1 font-sans italic border-t border-blue-200/60 pt-1"
                dir={isEn ? "rtl" : "ltr"}
              >
                {isEn ? part.relationToOtherPartsAr : part.relationToOtherPartsEn}
              </p>
            )}
          </div>
        )}

        {/* Key Fact / Did you know? */}
        {(part.keyFactAr || part.keyFactEn) && (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{isEn ? "Did you know?" : "هل تعلم؟ (Did you know?)"}</span>
            </div>
            <p className="text-amber-900 text-xs font-medium leading-relaxed">
              {isEn ? part.keyFactEn || part.keyFactAr : part.keyFactAr}
            </p>
            {(isEn || languageMode === "both") && part.keyFactAr && part.keyFactEn && (
              <p
                className="text-amber-800 text-[11px] mt-1 font-sans italic"
                dir={isEn ? "rtl" : "ltr"}
              >
                {isEn ? part.keyFactAr : part.keyFactEn}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Chat Quick Trigger */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          id="ask-ai-part-btn"
          onClick={() => onAskAiAboutPart(part)}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isEn
              ? `Ask AI Tutor about (${part.nameEn})`
              : `اسأل المعلم الذكي عن (${part.nameAr})`}
          </span>
        </button>
      </div>
    </div>
  );
};
