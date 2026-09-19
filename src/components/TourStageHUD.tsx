import React from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { DiagramPart, LanguageMode } from "../types";

interface TourStageHUDProps {
  currentPart: DiagramPart;
  currentIndex: number;
  totalSteps: number;
  isSpeaking: boolean;
  languageMode: LanguageMode;
  onReplayAudio: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const TourStageHUD: React.FC<TourStageHUDProps> = ({
  currentPart,
  currentIndex,
  totalSteps,
  isSpeaking,
  languageMode,
  onReplayAudio,
  onNextStep,
  onPrevStep,
  hasNext,
  hasPrev,
}) => {
  const isEn = languageMode === "en";
  const stageNum = currentIndex + 1;
  const stageTitle =
    isEn
      ? currentPart.stageTitleEn || `Stage ${stageNum}: ${currentPart.nameEn}`
      : currentPart.stageTitleAr || `المرحلة ${stageNum}: ${currentPart.nameAr}`;

  return (
    <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-2xl p-4 text-white overflow-hidden relative group">
        {/* Glowing Top Edge Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-indigo-500 animate-pulse" />

        {/* Header: Stage Badge + Audio Equalizer + Controls */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>
                {isEn
                  ? `Stage ${stageNum} of ${totalSteps}`
                  : `المرحلة ${stageNum} من ${totalSteps}`}
              </span>
            </span>

            {/* Live Audio Equalizer Bars */}
            {isSpeaking ? (
              <div
                className="flex items-end gap-0.5 h-4 px-2 py-0.5 bg-blue-950/80 rounded-full border border-blue-500/40 text-blue-400"
                title={isEn ? "Narrator speaking" : "الراوي يشرح الآن"}
              >
                <div className="w-1 bg-blue-400 rounded-full animate-eq-1" />
                <div className="w-1 bg-emerald-400 rounded-full animate-eq-2" />
                <div className="w-1 bg-cyan-400 rounded-full animate-eq-3" />
                <span className="text-[9px] font-semibold mr-1 font-mono text-blue-300">
                  {isEn ? "Audio" : "صوت"}
                </span>
              </div>
            ) : null}
          </div>

          <button
            onClick={onReplayAudio}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isSpeaking
                ? "bg-blue-600 border-blue-400 text-white animate-pulse"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
            title={isSpeaking ? (isEn ? "Stop voice" : "إيقاف الصوت") : (isEn ? "Play voice" : "استماع للشرح")}
          >
            {isSpeaking ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            )}
          </button>
        </div>

        {/* Titles */}
        <h3 className="text-base font-bold text-white mb-0.5 leading-snug">
          {stageTitle}
        </h3>
        <p className="text-xs text-blue-300 font-medium mb-2.5 font-sans" dir="ltr">
          {currentPart.nameEn}
        </p>

        {/* Function / Biological Action */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 mb-2.5 text-xs text-slate-200 leading-relaxed">
          {isEn ? currentPart.functionEn : currentPart.functionAr}
        </div>

        {/* Key Fact / "معلومة ذهبية" */}
        {(currentPart.keyFactAr || currentPart.keyFactEn) && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-200 leading-relaxed mb-3">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-300">
                {isEn ? "Key Takeaway: " : "معلومة علمية: "}
              </span>
              <span>{isEn ? currentPart.keyFactEn : currentPart.keyFactAr}</span>
            </div>
          </div>
        )}

        {/* Bottom Fast Navigation inside HUD */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <button
            onClick={onPrevStep}
            disabled={!hasPrev}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              hasPrev
                ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                : "opacity-40 cursor-not-allowed text-slate-500 border-transparent"
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{isEn ? "Previous" : "السابق"}</span>
          </button>

          <span className="text-[11px] font-mono text-slate-400">
            {stageNum} / {totalSteps}
          </span>

          <button
            onClick={onNextStep}
            disabled={!hasNext}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
              hasNext
                ? "bg-blue-600 border-blue-500 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
                : "bg-emerald-600/80 border-emerald-500/80 text-white cursor-default"
            }`}
          >
            {hasNext ? (
              <>
                <span>{isEn ? "Next" : "التالي"}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isEn ? "Completed" : "اكتمل الشرح"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
