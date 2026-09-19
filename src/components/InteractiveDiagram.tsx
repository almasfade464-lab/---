import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Eye,
  Volume2,
  Info,
  Play,
  Sparkles,
  Zap,
  Crosshair,
  Loader2,
  Scan,
  CheckCircle2,
  X,
  Route,
  GitCompare,
  Layers,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DiagramPart,
  LanguageMode,
  VisualSearchInspection,
  AdaptiveExplanationMode,
  MultiLevelStage,
  ComparisonPair,
  NavModePreference,
  RenderQualityPreference,
} from "../types";
import { speechManager } from "../utils/speech";
import { TourStageHUD } from "./TourStageHUD";
import { GuidedTourTimeline } from "./GuidedTourTimeline";
import { VisualInspectorCard } from "./VisualInspectorCard";
import { getApiUrl } from "../utils/apiConfig";

interface InteractiveDiagramProps {
  imageUrl: string;
  parts: DiagramPart[];
  selectedPartId: string | null;
  onSelectPart: (part: DiagramPart) => void;
  languageMode: LanguageMode;
  isTourActiveExternal?: boolean;
  onToggleTourExternal?: (active: boolean) => void;
  diagramTitleAr?: string;
  diagramTitleEn?: string;
  diagramSubjectAr?: string;
  onAskAiTutor?: (prompt: string) => void;
  // Adaptive Pedagogy Props
  activeMode?: AdaptiveExplanationMode;
  activeStage?: MultiLevelStage;
  isSimulatingFlow?: boolean;
  activeLayerId?: string | null;
  selectedComparisonPair?: ComparisonPair | null;
  // Dynamic functional settings
  navMode?: NavModePreference;
  showNavDots?: boolean;
  renderQuality?: RenderQualityPreference;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  imageUrl,
  parts,
  selectedPartId,
  onSelectPart,
  languageMode,
  isTourActiveExternal,
  onToggleTourExternal,
  diagramTitleAr,
  diagramTitleEn,
  diagramSubjectAr,
  onAskAiTutor,
  activeMode = "whole-to-part",
  activeStage = "macro",
  isSimulatingFlow = false,
  activeLayerId = null,
  selectedComparisonPair = null,
  navMode = "buttons",
  showNavDots = true,
  renderQuality = "high",
}) => {
  const isEn = languageMode === "en";
  const [zoom, setZoom] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);

  // Guided Animated Tour State
  const [isTourActiveInternal, setIsTourActiveInternal] = useState<boolean>(false);
  const isTourActive =
    isTourActiveExternal !== undefined ? isTourActiveExternal : isTourActiveInternal;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const [isSpeakingTour, setIsSpeakingTour] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [tourSpeed, setTourSpeed] = useState<number>(1);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTourPlayingRef = useRef<boolean>(false);

  // Multi-level zoom synchronization
  useEffect(() => {
    if (activeStage === "macro") {
      setZoom(1);
    } else if (activeStage === "meso") {
      setZoom(1.35);
    } else if (activeStage === "micro") {
      setZoom(1.85);
    }
  }, [activeStage]);

  // Visual Search & Area Inspection State
  const [isVisualSearchMode, setIsVisualSearchMode] = useState<boolean>(false);
  const [isSelectingBox, setIsSelectingBox] = useState<boolean>(false);
  const [boxSelection, setBoxSelection] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [inspectedSpot, setInspectedSpot] = useState<{
    x: number;
    y: number;
    width?: number;
    height?: number;
  } | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectionResult, setInspectionResult] =
    useState<VisualSearchInspection | null>(null);

  // Sorted parts by educational step order
  const sortedParts = useMemo(() => {
    return [...parts].sort((a, b) => {
      const orderA = a.stepOrder ?? 999;
      const orderB = b.stepOrder ?? 999;
      return orderA - orderB;
    });
  }, [parts]);

  // Current selected part index for navigation
  const currentPartIndex = useMemo(() => {
    return parts.findIndex((p) => p.id === selectedPartId);
  }, [parts, selectedPartId]);

  const handleNextPart = () => {
    if (parts.length === 0) return;
    const nextIdx = currentPartIndex < parts.length - 1 ? currentPartIndex + 1 : 0;
    onSelectPart(parts[nextIdx]);
  };

  const handlePrevPart = () => {
    if (parts.length === 0) return;
    const prevIdx = currentPartIndex > 0 ? currentPartIndex - 1 : parts.length - 1;
    onSelectPart(parts[prevIdx]);
  };

  // Touch Swipe handlers for swipe navigation mode
  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (navMode !== "swipe") return;
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (navMode !== "swipe" || touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handlePrevPart();
      } else {
        handleNextPart();
      }
    }
    touchStartXRef.current = null;
  };

  // Render Quality class computation
  const qualityClass = useMemo(() => {
    if (renderQuality === "low") return "quality-low filter brightness-95";
    if (renderQuality === "medium") return "quality-medium";
    return "quality-high filter contrast-105 saturate-105";
  }, [renderQuality]);

  // Keep ref in sync
  useEffect(() => {
    isTourPlayingRef.current = isTourPlaying;
  }, [isTourPlaying]);

  // Listen to speech manager state to reset speech flag if interrupted
  useEffect(() => {
    const unsub = speechManager.subscribe((speaking) => {
      if (!speaking) {
        setIsSpeakingTour(false);
      }
    });
    return unsub;
  }, []);

  // Cleanup auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      speechManager.stop();
    };
  }, []);

  // Sync external tour state toggle
  const setTourActive = (active: boolean) => {
    if (onToggleTourExternal) {
      onToggleTourExternal(active);
    } else {
      setIsTourActiveInternal(active);
    }
  };

  // Speak a specific step and schedule auto-advance
  const speakStep = (index: number) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    const targetPart = sortedParts[index];
    if (!targetPart) return;

    const isEn = languageMode === "en";
    const stageNum = index + 1;
    const stageTitle = isEn
      ? targetPart.stageTitleEn || `Stage ${stageNum}: ${targetPart.nameEn}`
      : targetPart.stageTitleAr || `المرحلة ${stageNum}: ${targetPart.nameAr}`;

    const textToSpeak = isEn
      ? `${stageTitle}. ${targetPart.functionEn}. ${
          targetPart.keyFactEn ? "Key takeaway: " + targetPart.keyFactEn : ""
        }`
      : `${stageTitle}. ${targetPart.functionAr}. ${
          targetPart.keyFactAr ? "معلومة هامة: " + targetPart.keyFactAr : ""
        }`;

    setIsSpeakingTour(true);
    speechManager.speak(textToSpeak, isEn ? "en" : "ar", undefined, () => {
      setIsSpeakingTour(false);
      if (isTourPlayingRef.current && autoAdvance) {
        if (index < sortedParts.length - 1) {
          const delay = Math.round(1400 / tourSpeed);
          autoAdvanceTimerRef.current = setTimeout(() => {
            if (isTourPlayingRef.current) {
              goToStep(index + 1);
            }
          }, delay);
        } else {
          setIsTourPlaying(false);
          isTourPlayingRef.current = false;
        }
      }
    });
  };

  const goToStep = (index: number) => {
    if (index < 0 || index >= sortedParts.length) return;
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    speechManager.stop();
    setCurrentStepIndex(index);
    onSelectPart(sortedParts[index]);
    speakStep(index);
  };

  const handleStartTour = () => {
    setIsVisualSearchMode(false);
    setTourActive(true);
    setCurrentStepIndex(0);
    setIsTourPlaying(true);
    isTourPlayingRef.current = true;
    onSelectPart(sortedParts[0]);
    speakStep(0);
  };

  const handleCloseTour = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    speechManager.stop();
    setIsSpeakingTour(false);
    setIsTourPlaying(false);
    isTourPlayingRef.current = false;
    setTourActive(false);
  };

  const handleTogglePlay = () => {
    if (isTourPlaying) {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      speechManager.stop();
      setIsSpeakingTour(false);
      setIsTourPlaying(false);
      isTourPlayingRef.current = false;
    } else {
      setIsTourPlaying(true);
      isTourPlayingRef.current = true;
      speakStep(currentStepIndex);
    }
  };

  // Visual Search Execution
  const executeVisualSearch = async (
    x: number,
    y: number,
    width?: number,
    height?: number
  ) => {
    setInspectedSpot({ x, y, width, height });
    setIsInspecting(true);

    try {
      const response = await fetch(getApiUrl("/api/inspect-region"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageUrl.startsWith("data:") ? imageUrl : undefined,
          region: { x, y, width, height },
          diagramContext: {
            titleAr: diagramTitleAr,
            titleEn: diagramTitleEn,
            subjectAr: diagramSubjectAr,
            existingParts: parts,
          },
        }),
      });

      if (response.ok) {
        const data: VisualSearchInspection = await response.json();
        setInspectionResult(data);
      } else {
        throw new Error("Server returned non-ok status");
      }
    } catch (err) {
      console.warn("API inspect region failed, activating smart local matcher:", err);

      // Match closest part based on Euclidean distance
      let bestPart = parts[0];
      let minDistance = Infinity;

      for (const part of parts) {
        const dx = part.x - x;
        const dy = part.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          bestPart = part;
        }
      }

      const fallback: VisualSearchInspection = {
        recognized: true,
        nameAr: bestPart ? bestPart.nameAr : "عضو / مكون في المخطط",
        nameEn: bestPart ? bestPart.nameEn : "Diagram Component",
        whatIsThisAr: bestPart
          ? `${bestPart.descriptionAr}`
          : "عنصر ومكون تشريحي أساسي في هذا المخطط التعليمي.",
        whatIsThisEn: bestPart
          ? `${bestPart.descriptionEn}`
          : "An essential anatomical and structural element identified within this scientific diagram.",
        functionAr: bestPart
          ? `${bestPart.functionAr}`
          : "يقوم بدور حيوي أساسي يسهم في توازن وأداء النظام ككل.",
        functionEn: bestPart
          ? `${bestPart.functionEn}`
          : "Plays a vital physiological role contributing to the systemic homeostasis and functioning.",
        locationAr: bestPart
          ? `يقع في موضع تشريحي محدد داخل ${diagramTitleAr || "النظام"} متصلاً بالمكونات الحيوية المجاورة له.`
          : "Located strategically within this biological structure.",
        locationEn: bestPart
          ? `Strategically positioned within the anatomy, interacting directly with surrounding structural tissues.`
          : "Located strategically within this biological structure.",
        relationToOtherPartsAr: bestPart
          ? `يعمل بتناغم تكاملي تام مع باقي أجزاء المخطط؛ يستقبل المدخلات الحيوية وينفذ وظائفه ثم ينسق مع باقي الأعضاء لضمان تدفق الدورة الحيوية.`
          : "Functions in full integration with adjacent parts to maintain structural continuity.",
        relationToOtherPartsEn: bestPart
          ? `Acts in full harmony with adjacent parts, receiving biological inputs and relaying processed outputs across the physiological pathway.`
          : "Acts in full harmony with adjacent parts.",
        keyFactAr:
          bestPart?.keyFactAr ||
          "عنصر ذو أهمية فائقة في الفهم العلمي والدراسات المدرسية.",
        keyFactEn:
          bestPart?.keyFactEn ||
          "A vital component frequently highlighted in science textbooks.",
        matchedPartId: bestPart?.id,
        region: { x, y, width, height },
      };

      setInspectionResult(fallback);
    } finally {
      setIsInspecting(false);
    }
  };

  // Image Drag/Click Selection Handlers
  const handleImageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVisualSearchMode) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const clickY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setIsSelectingBox(true);
    setBoxSelection({
      startX: clickX,
      startY: clickY,
      currentX: clickX,
      currentY: clickY,
    });
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVisualSearchMode || !isSelectingBox || !boxSelection) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const currY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setBoxSelection((prev) =>
      prev ? { ...prev, currentX: currX, currentY: currY } : null
    );
  };

  const handleImageMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isVisualSearchMode || !isSelectingBox || !boxSelection) return;
    setIsSelectingBox(false);

    const x1 = Math.min(boxSelection.startX, boxSelection.currentX);
    const y1 = Math.min(boxSelection.startY, boxSelection.currentY);
    const width = Math.abs(boxSelection.currentX - boxSelection.startX);
    const height = Math.abs(boxSelection.currentY - boxSelection.startY);

    const centerX = x1 + width / 2;
    const centerY = y1 + height / 2;

    executeVisualSearch(
      centerX,
      centerY,
      width > 3 ? width : undefined,
      height > 3 ? height : undefined
    );
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleManualSpeak = (e: React.MouseEvent, part: DiagramPart) => {
    e.stopPropagation();
    const textToSpeak =
      languageMode === "en"
        ? `${part.nameEn}. ${part.functionEn}`
        : `${part.nameAr}. ${part.functionAr}`;
    const lang = languageMode === "en" ? "en" : "ar";
    speechManager.speak(textToSpeak, lang);
  };

  const currentTourPart = sortedParts[currentStepIndex] || sortedParts[0];

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-900 rounded-2xl overflow-hidden border shadow-xl flex flex-col select-none group transition-all duration-300 ${
        isVisualSearchMode
          ? "border-amber-500/80 ring-2 ring-amber-500/30 shadow-amber-950/40"
          : isTourActive
          ? "border-blue-500/70 shadow-blue-900/30 ring-2 ring-blue-500/20"
          : "border-slate-700"
      }`}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-25 flex items-center justify-between pointer-events-none gap-2">
        {/* Left: View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-white shadow-lg pointer-events-auto">
          <button
            id="zoom-in-btn"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-slate-200 hover:text-white cursor-pointer"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold px-1.5 min-w-[3rem] text-center text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            id="zoom-out-btn"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-slate-200 hover:text-white cursor-pointer"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="zoom-reset-btn"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-slate-200 hover:text-white cursor-pointer"
            title="إعادة ضبط الحجم"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <button
            id="fullscreen-btn"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-slate-200 hover:text-white cursor-pointer"
            title="ملء الشاشة"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center/Right: Feature Buttons */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Visual Search Mode Toggle */}
          <button
            id="toggle-visual-search-btn"
            onClick={() => {
              if (isTourActive) handleCloseTour();
              setIsVisualSearchMode(!isVisualSearchMode);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border ${
              isVisualSearchMode
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-500/30 animate-pulse"
                : "bg-slate-900/85 hover:bg-slate-800 text-amber-300 border-amber-500/40 hover:border-amber-400 shadow-md"
            }`}
            title="البحث البصري وتحديد منطقة معينة بالذكاء الاصطناعي"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isVisualSearchMode ? "البحث البصري نشط 🎯" : "البحث البصري"}</span>
          </button>

          {/* Start Animated Explanation Tour */}
          {!isTourActive ? (
            <button
              id="start-animated-tour-btn"
              onClick={handleStartTour}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 shadow-xl shadow-blue-500/30 border border-blue-400/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title="تحويل الصورة إلى شرح تفاعلي متسلسل خطوة بخطوة"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>بدء الشرح المتحرك ▶️</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-blue-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/40 text-blue-200 text-xs font-bold shadow-lg">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>جولة الشرح التفاعلي نشطة</span>
            </div>
          )}

          {/* Toggle Labels Chips Button */}
          <button
            id="toggle-labels-btn"
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors border shadow-lg cursor-pointer ${
              showLabels
                ? "bg-emerald-600/90 text-white border-emerald-500/50 hover:bg-emerald-600"
                : "bg-slate-900/80 text-slate-300 border-white/10 hover:bg-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {showLabels ? "إخفاء الأسماء" : "إظهار الأسماء"}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Prompt Bar during Visual Search Mode */}
      {isVisualSearchMode && (
        <div className="absolute top-16 left-4 right-4 z-25 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-2">
          <div className="bg-amber-950/90 border border-amber-500/70 backdrop-blur-md text-amber-200 px-4 py-2 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 pointer-events-auto">
            <Scan className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>انقر على أي جزء أو اسحب مستطيلاً لتحديد أي منطقة لفحصها بالذكاء الاصطناعي</span>
            <button
              onClick={() => setIsVisualSearchMode(false)}
              className="mr-2 p-1 rounded-lg hover:bg-white/10 text-amber-300 cursor-pointer"
              title="إلغاء البحث البصري"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Loading Indicator during Inspection */}
      {isInspecting && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-amber-500/60 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl text-white flex items-center gap-3 animate-in fade-in zoom-in-95 pointer-events-none">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-amber-300">جاري الفحص البصري والتعرف على المنطقة...</p>
            <p className="text-slate-400 text-[11px]">تحليل الماهية والوظيفة والموقع والروابط</p>
          </div>
        </div>
      )}

      {/* Floating HUD Card during Tour */}
      {isTourActive && currentTourPart && (
        <TourStageHUD
          currentPart={currentTourPart}
          currentIndex={currentStepIndex}
          totalSteps={sortedParts.length}
          isSpeaking={isSpeakingTour}
          languageMode={languageMode}
          onReplayAudio={() => speakStep(currentStepIndex)}
          onNextStep={() => goToStep(currentStepIndex + 1)}
          onPrevStep={() => goToStep(currentStepIndex - 1)}
          hasNext={currentStepIndex < sortedParts.length - 1}
          hasPrev={currentStepIndex > 0}
        />
      )}

      {/* Main Visual Stage */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full h-[470px] sm:h-[570px] lg:h-[620px] overflow-auto flex items-center justify-center p-4 transition-colors duration-500 ${
          isVisualSearchMode
            ? "bg-slate-950 cursor-crosshair"
            : isTourActive
            ? "bg-radial from-slate-900 via-slate-950 to-black"
            : "bg-radial from-slate-800 to-slate-950"
        }`}
      >
        {/* Floating Part Navigation Bar for 'buttons' Mode */}
        {navMode === "buttons" && parts.length > 1 && !isTourActive && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-white/10 shadow-xl text-white">
            <button
              onClick={handlePrevPart}
              className="p-1 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-300 hover:text-white"
              title={isEn ? "Previous Part" : "الجزء السابق"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold px-1 text-slate-200 min-w-[50px] text-center">
              {currentPartIndex >= 0 ? currentPartIndex + 1 : 1} / {parts.length}
            </span>
            <button
              onClick={handleNextPart}
              className="p-1 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-300 hover:text-white"
              title={isEn ? "Next Part" : "الجزء التالي"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Swipe Mode Hint Pill */}
        {navMode === "swipe" && parts.length > 1 && !isTourActive && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg text-[10px] font-semibold text-slate-300 pointer-events-none">
            <span>⇄ {isEn ? "Swipe to browse parts" : "اسحب يميناً ويساراً للتنقل"}</span>
          </div>
        )}

        {/* Dynamic Navigation Dots */}
        {showNavDots && parts.length > 1 && !isTourActive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl max-w-[90%] overflow-x-auto">
            {parts.map((p, idx) => {
              const isSelected = p.id === selectedPartId;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPart(p)}
                  title={`${idx + 1}. ${isEn ? p.nameEn : p.nameAr}`}
                  className={`transition-all rounded-full cursor-pointer shrink-0 ${
                    isSelected
                      ? "w-5 h-2 bg-blue-500 shadow-sm"
                      : "w-2 h-2 bg-white/35 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>
        )}

        <div
          ref={imageWrapperRef}
          className="relative transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
          onMouseDown={handleImageMouseDown}
          onMouseMove={handleImageMouseMove}
          onMouseUp={handleImageMouseUp}
        >
          {/* Base Diagram Image with Render Quality Filter */}
          <img
            src={imageUrl}
            alt="Textbook Diagram"
            className={`max-h-[420px] sm:max-h-[520px] lg:max-h-[560px] w-auto rounded-xl shadow-2xl pointer-events-none block transition-all duration-500 ${qualityClass} ${
              isTourActive ? "brightness-95 contrast-105" : ""
            } ${isVisualSearchMode ? "ring-2 ring-amber-500/50" : ""}`}
            draggable={false}
          />

          {/* Visual Search: Active Dragging Box Overlay */}
          {isVisualSearchMode && isSelectingBox && boxSelection && (
            <div
              className="absolute border-2 border-dashed border-amber-400 bg-amber-400/25 rounded-lg pointer-events-none z-35 backdrop-blur-2xs"
              style={{
                left: `${Math.min(boxSelection.startX, boxSelection.currentX)}%`,
                top: `${Math.min(boxSelection.startY, boxSelection.currentY)}%`,
                width: `${Math.abs(boxSelection.currentX - boxSelection.startX)}%`,
                height: `${Math.abs(boxSelection.currentY - boxSelection.startY)}%`,
              }}
            >
              <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-[9px] font-bold text-slate-950">
                منطقة الفحص
              </div>
            </div>
          )}

          {/* Visual Search: Target Spot Radar Indicator */}
          {inspectedSpot && (
            <div
              className="absolute z-35 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${inspectedSpot.x}%`, top: `${inspectedSpot.y}%` }}
            >
              <span className="absolute -inset-6 rounded-full bg-amber-400/40 animate-ping" />
              <span className="absolute -inset-3 rounded-full bg-amber-500/60 blur-xs animate-pulse" />
              <div className="relative w-8 h-8 rounded-full border-2 border-amber-300 flex items-center justify-center bg-amber-500/40 text-amber-200 shadow-xl">
                <Crosshair className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}

          {/* SVG Animated Flow Paths Layer during Tour OR Flow Simulation */}
          {(isTourActive || isSimulatingFlow || activeMode === "pathway-flow") && sortedParts.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-15"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id="activeFlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#10b981" opacity="0.9" />
                </marker>
              </defs>

              {/* In Tour mode: draw up to current step */}
              {isTourActive &&
                sortedParts.slice(0, currentStepIndex).map((p, i) => {
                  const nextP = sortedParts[i + 1];
                  if (!nextP) return null;
                  return (
                    <g key={`flow-tour-${p.id}-${nextP.id}`}>
                      <line
                        x1={p.x}
                        y1={p.y}
                        x2={nextP.x}
                        y2={nextP.y}
                        stroke="#38bdf8"
                        strokeWidth="3.5"
                        strokeOpacity="0.3"
                        strokeLinecap="round"
                      />
                      <line
                        x1={p.x}
                        y1={p.y}
                        x2={nextP.x}
                        y2={nextP.y}
                        stroke="url(#flowGradient)"
                        strokeWidth="2.2"
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                        className="animate-flow-dash"
                      />
                    </g>
                  );
                })}

              {/* In Continuous Flow simulation mode or Pathway mode: draw complete circulating pathway between all parts */}
              {(isSimulatingFlow || activeMode === "pathway-flow") &&
                !isTourActive &&
                sortedParts.map((p, i) => {
                  const nextP = sortedParts[(i + 1) % sortedParts.length];
                  if (!nextP || (sortedParts.length <= 2 && i === sortedParts.length - 1)) return null;
                  return (
                    <g key={`flow-sim-${p.id}-${nextP.id}`}>
                      <line
                        x1={p.x}
                        y1={p.y}
                        x2={nextP.x}
                        y2={nextP.y}
                        stroke="#059669"
                        strokeWidth="3.5"
                        strokeOpacity="0.25"
                        strokeLinecap="round"
                      />
                      <line
                        x1={p.x}
                        y1={p.y}
                        x2={nextP.x}
                        y2={nextP.y}
                        stroke="url(#activeFlowGradient)"
                        strokeWidth="2.5"
                        strokeDasharray="5 4"
                        strokeLinecap="round"
                        markerEnd="url(#arrowhead)"
                        className="animate-flow-dash"
                      />
                      <circle
                        cx={(p.x + nextP.x) / 2}
                        cy={(p.y + nextP.y) / 2}
                        r="1.8"
                        fill="#10b981"
                        className="animate-ping"
                      />
                    </g>
                  );
                })}

              {isTourActive && sortedParts[currentStepIndex] && (
                <circle
                  cx={sortedParts[currentStepIndex].x}
                  cy={sortedParts[currentStepIndex].y}
                  r="2.2"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              )}
            </svg>
          )}

          {/* Hotspot Pins Overlay */}
          {sortedParts.map((part, index) => {
            const isTourTarget = isTourActive && currentStepIndex === index;
            const isTourVisited = isTourActive && index < currentStepIndex;
            const isTourUpcoming = isTourActive && index > currentStepIndex;

            const isSelected = selectedPartId === part.id;
            const isHovered = hoveredPartId === part.id;

            // Comparison mode highlighting
            const isComparisonA =
              activeMode === "comparison" && selectedComparisonPair?.partAId === part.id;
            const isComparisonB =
              activeMode === "comparison" && selectedComparisonPair?.partBId === part.id;

            // Decomposition layer filtering
            const isLayerFilteredOut =
              activeMode === "decomposition" &&
              activeLayerId !== null &&
              part.layerId !== activeLayerId &&
              !activeLayerId.includes(part.id);

            return (
              <div
                key={part.id}
                id={`pin-wrapper-${part.id}`}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 ${
                  isTourUpcoming
                    ? "opacity-40 hover:opacity-100 scale-90"
                    : isLayerFilteredOut
                    ? "opacity-25 scale-75 filter grayscale"
                    : "opacity-100"
                } ${isVisualSearchMode ? "pointer-events-none opacity-60" : ""}`}
                style={{ left: `${part.x}%`, top: `${part.y}%` }}
                onClick={() => {
                  if (isTourActive) {
                    goToStep(index);
                  } else {
                    onSelectPart(part);
                  }
                }}
                onMouseEnter={() => setHoveredPartId(part.id)}
                onMouseLeave={() => setHoveredPartId(null)}
              >
                {/* Pin Button */}
                <div className="relative flex items-center justify-center">
                  {isTourTarget && (
                    <>
                      <span className="absolute -inset-5 rounded-full bg-blue-500/40 animate-ping pointer-events-none" />
                      <span className="absolute -inset-3 rounded-full bg-indigo-500/60 blur-xs pointer-events-none animate-pulse" />
                    </>
                  )}

                  {/* Comparison Pulse Halos */}
                  {isComparisonA && (
                    <span className="absolute -inset-4 rounded-full bg-blue-500/40 animate-ping pointer-events-none" />
                  )}
                  {isComparisonB && (
                    <span className="absolute -inset-4 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
                  )}

                  {!isTourActive && !isComparisonA && !isComparisonB && (isSelected || isHovered) && (
                    <span className="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
                  )}

                  <div
                    className={`relative rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-all duration-300 ${
                      isTourTarget
                        ? "w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white ring-4 ring-white scale-125 z-30 shadow-2xl shadow-blue-500/60"
                        : isTourVisited
                        ? "w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 text-white ring-2 ring-emerald-300 scale-100 z-20"
                        : isComparisonA
                        ? "w-8 h-8 sm:w-9 sm:h-9 bg-purple-600 text-white ring-4 ring-purple-300 scale-125 z-30 shadow-xl"
                        : isComparisonB
                        ? "w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600 text-white ring-4 ring-emerald-300 scale-125 z-30 shadow-xl"
                        : isSelected
                        ? "w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 text-white ring-4 ring-white scale-125 z-30 shadow-emerald-500/50"
                        : isHovered
                        ? "w-7 h-7 sm:w-8 sm:h-8 bg-emerald-400 text-slate-900 ring-2 ring-white scale-110 z-20"
                        : "w-7 h-7 sm:w-8 sm:h-8 bg-slate-900/90 text-emerald-400 ring-2 ring-emerald-400/80 hover:bg-emerald-600 hover:text-white"
                    }`}
                  >
                    {isTourTarget ? (
                      <span className="animate-pulse">{index + 1}</span>
                    ) : isComparisonA ? (
                      "A"
                    ) : isComparisonB ? (
                      "B"
                    ) : (
                      index + 1
                    )}
                  </div>

                  {(showLabels || isTourTarget || isComparisonA || isComparisonB) && (
                    <div
                      className={`absolute top-1/2 left-full mr-2 ml-2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-md backdrop-blur-md pointer-events-none z-10 ${
                        isTourTarget
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-2 ring-white/80 shadow-xl shadow-blue-600/40 scale-110"
                          : isComparisonA
                          ? "bg-purple-600 text-white ring-2 ring-purple-300 shadow-lg"
                          : isComparisonB
                          ? "bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-lg"
                          : isSelected
                          ? "bg-emerald-600 text-white ring-1 ring-emerald-400"
                          : "bg-slate-900/85 text-slate-100 border border-white/10"
                      }`}
                    >
                      {isComparisonA && (
                        <span className="text-[10px] bg-white/20 px-1 rounded ml-1.5 font-normal">
                          {languageMode === "en" ? "Part A" : "طرف أ"}
                        </span>
                      )}
                      {isComparisonB && (
                        <span className="text-[10px] bg-white/20 px-1 rounded ml-1.5 font-normal">
                          {languageMode === "en" ? "Part B" : "طرف ب"}
                        </span>
                      )}
                      {languageMode === "en"
                        ? part.nameEn
                        : languageMode === "both"
                        ? `${part.nameAr} | ${part.nameEn}`
                        : part.nameAr}
                    </div>
                  )}
                </div>

                {!isTourActive && !isVisualSearchMode && isHovered && !isSelected && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 rounded-xl bg-slate-900/95 text-white shadow-2xl border border-white/15 backdrop-blur-md pointer-events-auto z-40 text-right animate-in fade-in zoom-in-95">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        <span>جزء رقم {index + 1}</span>
                      </div>
                      <button
                        onClick={(e) => handleManualSpeak(e, part)}
                        className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-emerald-300 transition-colors cursor-pointer"
                        title="استماع للنطق"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-0.5">
                      {part.nameAr}
                    </h4>
                    <p
                      className="text-[11px] font-medium text-slate-300 mb-1.5 font-sans"
                      dir="ltr"
                    >
                      {part.nameEn}
                    </p>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {part.functionAr}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                      <span>انقر للاستكشاف الكامل ←</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Guided Tour Timeline Player Docked at Bottom */}
      {isTourActive && (
        <GuidedTourTimeline
          parts={sortedParts}
          currentStepIndex={currentStepIndex}
          isPlaying={isTourPlaying}
          isSpeaking={isSpeakingTour}
          autoAdvance={autoAdvance}
          speed={tourSpeed}
          languageMode={languageMode}
          onSelectStep={goToStep}
          onTogglePlay={handleTogglePlay}
          onPrevStep={() => goToStep(currentStepIndex - 1)}
          onNextStep={() => goToStep(currentStepIndex + 1)}
          onToggleAutoAdvance={() => setAutoAdvance(!autoAdvance)}
          onChangeSpeed={setTourSpeed}
          onReplayStep={() => speakStep(currentStepIndex)}
          onCloseTour={handleCloseTour}
        />
      )}

      {/* Footer Info Hint (when tour and visual search are not active) */}
      {!isTourActive && !isVisualSearchMode && (
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-white/10 text-slate-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              انقر على أي نقطة، أو استخدم{" "}
              <strong className="text-amber-400 font-semibold">البحث البصري 🎯</strong> لتحديد أي منطقة لفحصها
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
            {parts.length} أجزاء مستخرجة
          </span>
        </div>
      )}

      {/* Visual Inspector Result Card Modal */}
      {inspectionResult && (
        <VisualInspectorCard
          inspection={inspectionResult}
          languageMode={languageMode}
          onClose={() => {
            setInspectionResult(null);
            setInspectedSpot(null);
            setIsVisualSearchMode(false);
          }}
          onInspectAnother={() => {
            setInspectionResult(null);
            setInspectedSpot(null);
            setIsVisualSearchMode(true);
          }}
          onAskAiTutor={(prompt) => {
            setInspectionResult(null);
            setInspectedSpot(null);
            setIsVisualSearchMode(false);
            if (onAskAiTutor) {
              onAskAiTutor(prompt);
            }
          }}
        />
      )}
    </div>
  );
};
