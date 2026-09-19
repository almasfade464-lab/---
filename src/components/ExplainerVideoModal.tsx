import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Film,
  Maximize2,
  Minimize2,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Download,
  Layers,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import { DiagramAnalysis, DiagramPart, LanguageMode } from "../types";
import { speechManager } from "../utils/speech";

interface VideoScene {
  id: string;
  sceneIndex: number;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  narrativeAr: string;
  narrativeEn: string;
  partId?: string;
  targetPart?: DiagramPart;
  zoomLevel: number; // 1.0 to 2.2
  focusX: number; // 0 to 100 percentage
  focusY: number; // 0 to 100 percentage
  durationSeconds: number;
}

interface ExplainerVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: DiagramAnalysis;
  languageMode?: LanguageMode;
  isSavedInNotes?: boolean;
  onSaveToNotes?: (videoScenes: any[]) => void;
}

export const ExplainerVideoModal: React.FC<ExplainerVideoModalProps> = ({
  isOpen,
  onClose,
  diagram,
  languageMode = "ar",
  isSavedInNotes = false,
  onSaveToNotes,
}) => {
  const isEn = languageMode === "en";

  // Build sequential scenes from the diagram
  const scenes: VideoScene[] = React.useMemo(() => {
    const list: VideoScene[] = [];

    // 1. Intro scene
    list.push({
      id: "scene-intro",
      sceneIndex: 0,
      titleAr: `مقدمة: ${diagram.titleAr}`,
      titleEn: `Introduction: ${diagram.titleEn}`,
      subtitleAr: `${diagram.subjectAr} - ${diagram.gradeLevelAr}`,
      subtitleEn: `${diagram.subjectEn} - ${diagram.gradeLevelEn}`,
      narrativeAr: `أهلاً بك في هذا العرض التعليمي المرئي التفاعلي. سنستكشف معاً اليوم بالتفصيل ${diagram.titleAr}. ${diagram.directSummaryAr || diagram.summaryAr}`,
      narrativeEn: `Welcome to this interactive visual explanation. Today we explore ${diagram.titleEn}. ${diagram.directSummaryEn || diagram.summaryEn}`,
      zoomLevel: 1.0,
      focusX: 50,
      focusY: 50,
      durationSeconds: 8,
    });

    // 2. An individual scene for each part
    const maxPartsToInclude = Math.min(diagram.parts.length, 8);
    for (let i = 0; i < maxPartsToInclude; i++) {
      const part = diagram.parts[i];
      list.push({
        id: `scene-part-${part.id}`,
        sceneIndex: i + 1,
        titleAr: part.nameAr,
        titleEn: part.nameEn,
        subtitleAr: `الوظيفة: ${part.functionAr}`,
        subtitleEn: `Function: ${part.functionEn}`,
        narrativeAr: `ننتقل الآن إلى ${part.nameAr}. وظيفته الأساسية هي ${part.functionAr}. ${part.descriptionAr} ${part.keyFactAr ? `ومعلومة هامة: ${part.keyFactAr}` : ""}`,
        narrativeEn: `Now looking at ${part.nameEn}. Its primary function is ${part.functionEn}. ${part.descriptionEn}`,
        partId: part.id,
        targetPart: part,
        zoomLevel: 1.6,
        focusX: part.x,
        focusY: part.y,
        durationSeconds: 7,
      });
    }

    // 3. Conclusion & Takeaways scene
    list.push({
      id: "scene-conclusion",
      sceneIndex: list.length,
      titleAr: "الخلاصة والتكامل الوظيفي",
      titleEn: "Summary & Synthesis",
      subtitleAr: "مفاهيم الاستذكار الرئيسية",
      subtitleEn: "Key Educational Takeaways",
      narrativeAr: `في الختام، تتكامل هذه الأجزاء جميعاً لتشكل منظومة ${diagram.titleAr} المتوازنة. يمكنك الآن اختبار معلوماتك بالضغط على ابدأ الاختبار.`,
      narrativeEn: `In conclusion, all these components coordinate harmoniously to form ${diagram.titleEn}. You can now test your understanding with the quiz.`,
      zoomLevel: 1.1,
      focusX: 50,
      focusY: 50,
      durationSeconds: 7,
    });

    return list;
  }, [diagram]);

  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const currentScene = scenes[currentSceneIdx] || scenes[0];
  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  // Time elapsed before current scene
  const elapsedBeforeScene = scenes
    .slice(0, currentSceneIdx)
    .reduce((acc, s) => acc + s.durationSeconds, 0);

  const currentSceneProgress = Math.max(0, progressSeconds - elapsedBeforeScene);

  // Stop speech on close
  useEffect(() => {
    if (!isOpen) {
      speechManager.stop();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Handle scene change and voice narration
  const playCurrentSceneNarration = (scene: VideoScene) => {
    if (!isVoiceEnabled) return;
    speechManager.stop();
    const textToSpeak = isEn ? scene.narrativeEn : scene.narrativeAr;
    speechManager.speak(textToSpeak, isEn ? "en" : "ar", () => {
      // Speech finished
    });
  };

  const handleNextScene = () => {
    if (currentSceneIdx < scenes.length - 1) {
      const nextIdx = currentSceneIdx + 1;
      setCurrentSceneIdx(nextIdx);
      const newElapsed = scenes.slice(0, nextIdx).reduce((acc, s) => acc + s.durationSeconds, 0);
      setProgressSeconds(newElapsed);
      if (isPlaying && isVoiceEnabled) {
        playCurrentSceneNarration(scenes[nextIdx]);
      }
    } else {
      // Finished all scenes
      setIsPlaying(false);
      speechManager.stop();
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      const prevIdx = currentSceneIdx - 1;
      setCurrentSceneIdx(prevIdx);
      const newElapsed = scenes.slice(0, prevIdx).reduce((acc, s) => acc + s.durationSeconds, 0);
      setProgressSeconds(newElapsed);
      if (isPlaying && isVoiceEnabled) {
        playCurrentSceneNarration(scenes[prevIdx]);
      }
    }
  };

  const handleJumpToScene = (idx: number) => {
    setCurrentSceneIdx(idx);
    const newElapsed = scenes.slice(0, idx).reduce((acc, s) => acc + s.durationSeconds, 0);
    setProgressSeconds(newElapsed);
    if (isPlaying && isVoiceEnabled) {
      playCurrentSceneNarration(scenes[idx]);
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      speechManager.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsPlaying(true);
      if (isVoiceEnabled) {
        playCurrentSceneNarration(currentScene);
      }
    }
  };

  // Timer loop when isPlaying
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgressSeconds((prev) => {
          const next = prev + 0.25 * playbackSpeed;
          // Check if we passed the current scene's duration
          const currentSceneEnd = scenes
            .slice(0, currentSceneIdx + 1)
            .reduce((acc, s) => acc + s.durationSeconds, 0);

          if (next >= currentSceneEnd) {
            if (currentSceneIdx < scenes.length - 1) {
              const nextIdx = currentSceneIdx + 1;
              setCurrentSceneIdx(nextIdx);
              if (isVoiceEnabled) {
                playCurrentSceneNarration(scenes[nextIdx]);
              }
            } else {
              // Reached end of video
              setIsPlaying(false);
              speechManager.stop();
              return totalDuration;
            }
          }
          return next;
        });
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIdx, scenes, isVoiceEnabled, playbackSpeed, totalDuration]);

  const handleRestart = () => {
    speechManager.stop();
    setCurrentSceneIdx(0);
    setProgressSeconds(0);
    setIsPlaying(true);
    if (isVoiceEnabled) {
      playCurrentSceneNarration(scenes[0]);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className={`relative w-full ${
          isFullscreen ? "h-screen max-h-screen rounded-none" : "max-w-5xl max-h-[92vh] rounded-2xl"
        } bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all`}
      >
        {/* Top Header */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-400 flex items-center justify-center shadow-xs">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isEn ? "Educational Explainer Video" : "فيديو وعرض تعليمي توضيحي"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentSceneIdx + 1} / {scenes.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {isEn ? currentScene.titleEn : currentScene.titleAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Save to notes */}
            {onSaveToNotes && (
              <button
                onClick={() => onSaveToNotes(scenes)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                  isSavedInNotes
                    ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/30"
                }`}
                title={isEn ? "Save Video to My Notes" : "حفظ الفيديو والمشاهد في ملاحظاتي"}
              >
                {isSavedInNotes ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSavedInNotes ? (isEn ? "Saved" : "محفوظ") : (isEn ? "Save to Notes" : "حفظ في ملاحظاتي")}</span>
              </button>
            )}

            {/* Toggle voice */}
            <button
              onClick={() => {
                const next = !isVoiceEnabled;
                setIsVoiceEnabled(next);
                if (!next) speechManager.stop();
                else if (isPlaying) playCurrentSceneNarration(currentScene);
              }}
              className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isVoiceEnabled
                  ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title={isVoiceEnabled ? (isEn ? "Mute Voice" : "كتم الصوت") : (isEn ? "Enable Voice" : "تفعيل الصوت")}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title={isFullscreen ? (isEn ? "Exit Fullscreen" : "تصغير") : (isEn ? "Fullscreen" : "شاشة كاملة")}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                speechManager.stop();
                setIsPlaying(false);
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative flex-1 bg-[#060D1A] overflow-hidden flex items-center justify-center min-h-[320px] sm:min-h-[420px]">
          {/* Main Diagram Image with Animated Zoom & Pan according to currentScene */}
          <div
            className="w-full h-full flex items-center justify-center p-4 transition-transform duration-1000 ease-out"
            style={{
              transform: `scale(${currentScene.zoomLevel}) translate(${50 - currentScene.focusX}%, ${
                50 - currentScene.focusY
              }%)`,
            }}
          >
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img
                src={diagram.imageUrl}
                alt={diagram.titleAr}
                className="max-h-[60vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-slate-800"
                referrerPolicy="no-referrer"
              />

              {/* Pinpoint Highlight on Target Part if active */}
              {currentScene.targetPart && (
                <div
                  className="absolute pointer-events-none transition-all duration-700"
                  style={{
                    left: `${currentScene.targetPart.x}%`,
                    top: `${currentScene.targetPart.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-400 bg-indigo-500/20 animate-ping absolute" />
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-indigo-600 shadow-lg flex items-center justify-center text-white text-xs font-bold">
                      {currentScene.sceneIndex}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subtitles & Educational Overlay HUD at the bottom */}
          <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-10">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex flex-col gap-1.5 transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-black text-white">
                    {isEn ? currentScene.titleEn : currentScene.titleAr}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {formatTime(progressSeconds)} / {formatTime(totalDuration)}
                </span>
              </div>

              {/* Subtitle / Narrative */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {isEn ? currentScene.narrativeEn : currentScene.narrativeAr}
              </p>
            </div>
          </div>
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 space-y-2.5 z-20">
          {/* Progress Timeline Bar */}
          <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer group">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (progressSeconds / totalDuration) * 100)}%` }}
            />
          </div>

          {/* Controls Strip */}
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Left: Previous / Play / Next / Restart */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleRestart}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title={isEn ? "Restart Video" : "إعادة التشغيل من البداية"}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrevScene}
                disabled={currentSceneIdx === 0}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
                title={isEn ? "Previous Scene" : "المشهد السابق"}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md cursor-pointer transition-transform active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>{isEn ? "Pause" : "إيقاف مؤقت"}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isEn ? "Play" : "تشغيل الفيديو"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextScene}
                disabled={currentSceneIdx === scenes.length - 1}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors cursor-pointer"
                title={isEn ? "Next Scene" : "المشهد التالي"}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Scene Thumbnails / Speed selector */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
                {[0.8, 1.0, 1.25].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      playbackSpeed === spd
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Scene Counter Badge */}
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                {isEn ? `Scene ${currentSceneIdx + 1} of ${scenes.length}` : `مشهد ${currentSceneIdx + 1} من ${scenes.length}`}
              </span>
            </div>
          </div>

          {/* Quick Scene Jump Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => handleJumpToScene(idx)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                  idx === currentSceneIdx
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-xs"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {idx + 1}. {isEn ? scene.titleEn : scene.titleAr}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
