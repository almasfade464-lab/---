import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Check,
  Zap,
} from "lucide-react";
import { DiagramPart, LanguageMode } from "../types";

interface GuidedTourTimelineProps {
  parts: DiagramPart[];
  currentStepIndex: number;
  isPlaying: boolean;
  isSpeaking: boolean;
  autoAdvance: boolean;
  speed: number;
  languageMode: LanguageMode;
  onSelectStep: (index: number) => void;
  onTogglePlay: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onToggleAutoAdvance: () => void;
  onChangeSpeed: (speed: number) => void;
  onReplayStep: () => void;
  onCloseTour: () => void;
}

export const GuidedTourTimeline: React.FC<GuidedTourTimelineProps> = ({
  parts,
  currentStepIndex,
  isPlaying,
  isSpeaking,
  autoAdvance,
  speed,
  languageMode,
  onSelectStep,
  onTogglePlay,
  onPrevStep,
  onNextStep,
  onToggleAutoAdvance,
  onChangeSpeed,
  onReplayStep,
  onCloseTour,
}) => {
  const isEn = languageMode === "en";
  const progressPercent = Math.round(
    ((currentStepIndex + 1) / Math.max(parts.length, 1)) * 100
  );

  return (
    <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-2xl p-3 sm:p-4 text-white">
        {/* Subtle Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stage Stepper Pills Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
          {parts.map((part, index) => {
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;
            const stepNum = index + 1;
            const label = isEn ? part.nameEn : part.nameAr;

            return (
              <button
                key={part.id}
                onClick={() => onSelectStep(index)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                  isCurrent
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-500/40 scale-105 ring-2 ring-white/30"
                    : isPast
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                }`}
                title={`${isEn ? "Go to stage" : "الانتقال إلى"}: ${label}`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? "bg-white text-blue-700"
                      : isPast
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {isPast ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : stepNum}
                </span>
                <span>{label}</span>

                {/* Arrow connector between stages except the last */}
                {index < parts.length - 1 && (
                  <span className="text-slate-600 text-[10px] mr-0.5 select-none font-sans">
                    →
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/10 mt-1">
          {/* Left: Player Status & Stage Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {isEn ? "Stage" : "المرحلة"} {currentStepIndex + 1} / {parts.length}
              </span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
              ({progressPercent}%)
            </span>
          </div>

          {/* Center: Main Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevStep}
              disabled={currentStepIndex <= 0}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                currentStepIndex > 0
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                  : "opacity-40 cursor-not-allowed text-slate-600 border-transparent"
              }`}
              title={isEn ? "Previous stage" : "المرحلة السابقة"}
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Big Primary Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 border border-amber-400"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40 border border-blue-400 animate-pulse"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{isEn ? "Pause Tour" : "إيقاف مؤقت"}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>{isEn ? "Resume Tour" : "متابعة الشرح"}</span>
                </>
              )}
            </button>

            <button
              onClick={onNextStep}
              disabled={currentStepIndex >= parts.length - 1}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                currentStepIndex < parts.length - 1
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                  : "opacity-40 cursor-not-allowed text-slate-600 border-transparent"
              }`}
              title={isEn ? "Next stage" : "المرحلة التالية"}
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onReplayStep}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
              title={isEn ? "Replay stage explanation" : "إعادة شرح المرحلة"}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Auto Advance, Speed, and Exit */}
          <div className="flex items-center gap-2">
            {/* Auto Advance Toggle */}
            <button
              onClick={onToggleAutoAdvance}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                autoAdvance
                  ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title={
                autoAdvance
                  ? isEn
                    ? "Auto-advance when audio finishes (Enabled)"
                    : "الانتقال التلقائي مفعل بعد انتهاء النطق"
                  : isEn
                  ? "Manual advance (Disabled)"
                  : "الانتقال يدوي فقط"
              }
            >
              <Zap
                className={`w-3.5 h-3.5 ${
                  autoAdvance ? "text-emerald-400" : "text-slate-500"
                }`}
              />
              <span className="hidden md:inline">
                {isEn ? "Auto Advance" : "انتقال تلقائي"}
              </span>
            </button>

            {/* Speed Selector */}
            <button
              onClick={() => {
                const nextSpeed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : 1;
                onChangeSpeed(nextSpeed);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              title={isEn ? "Playback Speed" : "سرعة الانتقال"}
            >
              {speed}x
            </button>

            {/* Exit Tour */}
            <button
              onClick={onCloseTour}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/50 text-rose-200 transition-colors cursor-pointer"
              title={isEn ? "Exit Animated Tour" : "إنهاء الشرح المتحرك"}
            >
              <X className="w-3.5 h-3.5" />
              <span>{isEn ? "Exit" : "إغلاق"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
