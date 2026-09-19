import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Sparkles,
  Sliders,
  FileText,
  Layers,
} from "lucide-react";
import { DiagramAnalysis, LanguageMode } from "../types";
import { speechManager } from "../utils/speech";

interface AudioExplanationBarProps {
  diagram: DiagramAnalysis;
  languageMode?: LanguageMode;
}

export type AudioNarrativeType = "summary" | "parts" | "text";

export const AudioExplanationBar: React.FC<AudioExplanationBarProps> = ({
  diagram,
  languageMode = "ar",
}) => {
  const isEn = languageMode === "en";
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [narrativeType, setNarrativeType] = useState<AudioNarrativeType>("summary");
  const [speed, setSpeed] = useState<number>(1.0);

  // Stop audio on unmount or diagram change
  useEffect(() => {
    return () => {
      speechManager.stop();
    };
  }, [diagram.id]);

  const getSpeechScript = (type: AudioNarrativeType): string => {
    if (type === "summary") {
      const intro = isEn
        ? `Lesson summary for: ${diagram.titleEn}. ${diagram.directSummaryEn || diagram.summaryEn}`
        : `ملخص الدرس لـ ${diagram.titleAr}. في مادة ${diagram.subjectAr}. ${diagram.directSummaryAr || diagram.summaryAr}`;
      return intro;
    }

    if (type === "parts") {
      const partsIntro = isEn
        ? `Detailed components walkthrough for ${diagram.titleEn}.`
        : `الشرح الصوتي المتسلسل لمكونات ${diagram.titleAr}.`;
      const partsText = diagram.parts
        .map(
          (p, i) =>
            isEn
              ? `Component ${i + 1}: ${p.nameEn}. Function: ${p.functionEn}. ${p.descriptionEn}`
              : `المكون رقم ${i + 1}: ${p.nameAr}. وظيفته: ${p.functionAr}. ${p.descriptionAr}`
        )
        .join(". ");
      return `${partsIntro} ${partsText}`;
    }

    // "text"
    const textIntro = isEn
      ? `Explaining in-image text and scientific logic for ${diagram.titleEn}.`
      : `قراءة وتحليل نصوص ومفاهيم ${diagram.titleAr}.`;
    const details = diagram.parts.map((p) => `${p.nameAr}: ${p.functionAr}`).join("، ");
    const conclusion = diagram.keyTakeawaysAr?.join(". ") || "";
    return `${textIntro}. الأجزاء المحددة بالصورة: ${details}. النقاط الهامة: ${conclusion}`;
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      speechManager.stop();
      setIsPlaying(false);
      setIsPaused(false);
    } else {
      const script = getSpeechScript(narrativeType);
      setIsPlaying(true);
      setIsPaused(false);
      speechManager.speak(script, isEn ? "en" : "ar", () => {
        setIsPlaying(false);
        setIsPaused(false);
      });
    }
  };

  const handleStop = () => {
    speechManager.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="rounded-2xl p-3 sm:p-4 bg-slate-900/90 border border-slate-800 shadow-lg text-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 transition-all">
      {/* Left: Info & Mode selector */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
          <Volume2 className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              {isEn ? "Audio Explanation Controls" : "الشرح الصوتي التفاعلي الطبيعي"}
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                <span>{isEn ? "Playing..." : "جاري الاستماع..."}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {isEn ? "Select narration type and listen to high-clarity voice" : "اختر نمط الشرح واستمع بصوت واضح مع التحكم الكامل"}
          </p>
        </div>
      </div>

      {/* Middle: Narration Type Pills */}
      <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs w-full md:w-auto justify-center">
        <button
          onClick={() => {
            if (isPlaying) speechManager.stop();
            setIsPlaying(false);
            setNarrativeType("summary");
          }}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            narrativeType === "summary"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {isEn ? "Summary" : "شرح الملخص"}
        </button>
        <button
          onClick={() => {
            if (isPlaying) speechManager.stop();
            setIsPlaying(false);
            setNarrativeType("parts");
          }}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            narrativeType === "parts"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {isEn ? "All Components" : "شرح الأجزاء"}
        </button>
        <button
          onClick={() => {
            if (isPlaying) speechManager.stop();
            setIsPlaying(false);
            setNarrativeType("text");
          }}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            narrativeType === "text"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {isEn ? "In-Image Text" : "شرح نصوص الصورة"}
        </button>
      </div>

      {/* Right: Audio Controls */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Play/Stop Button */}
        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
            isPlaying
              ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? "Pause / Stop" : "إيقاف الصوت"}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? "Play Audio" : "تشغيل الشرح الصوتي"}</span>
            </>
          )}
        </button>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-1 rounded-lg text-[10px] font-bold text-slate-300">
          {[0.8, 1.0, 1.25].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                setSpeed(spd);
                speechManager.setRate(spd);
              }}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                speed === spd ? "bg-blue-600 text-white" : "hover:text-white"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
