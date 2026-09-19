import React, { useState } from "react";
import {
  Sparkles,
  Maximize2,
  Clock,
  Route,
  GitCompare,
  Layers,
  ChevronDown,
  Info,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  ZoomIn,
  Eye,
  Zap,
} from "lucide-react";
import {
  AdaptiveExplanationMode,
  MultiLevelStage,
  AdaptiveExplanationData,
  LanguageMode,
  ThemeMode,
  DiagramPart,
  ComparisonPair,
  SystemDecompositionLayer,
} from "../types";
import { ADAPTIVE_MODES_META } from "../utils/adaptivePedagogy";

interface AdaptiveExplanationBarProps {
  adaptiveData: AdaptiveExplanationData;
  activeMode: AdaptiveExplanationMode;
  onChangeMode: (mode: AdaptiveExplanationMode) => void;
  activeStage: MultiLevelStage;
  onChangeStage: (stage: MultiLevelStage) => void;
  parts: DiagramPart[];
  selectedPart: DiagramPart | null;
  onSelectPart: (part: DiagramPart) => void;
  isSimulatingFlow: boolean;
  onToggleSimulateFlow: () => void;
  activeLayerId: string | null;
  onSelectLayerId: (layerId: string | null) => void;
  selectedComparisonPair: ComparisonPair | null;
  onSelectComparisonPair: (pair: ComparisonPair) => void;
  languageMode: LanguageMode;
  themeMode: ThemeMode;
}

export const AdaptiveExplanationBar: React.FC<AdaptiveExplanationBarProps> = ({
  adaptiveData,
  activeMode,
  onChangeMode,
  activeStage,
  onChangeStage,
  parts,
  selectedPart,
  onSelectPart,
  isSimulatingFlow,
  onToggleSimulateFlow,
  activeLayerId,
  onSelectLayerId,
  selectedComparisonPair,
  onSelectComparisonPair,
  languageMode,
  themeMode,
}) => {
  const [showRationale, setShowRationale] = useState<boolean>(false);
  const isDark = themeMode === "dark";
  const isEn = languageMode === "en";

  const currentMeta = ADAPTIVE_MODES_META[activeMode];
  const isAiRecommended = activeMode === adaptiveData.primaryMode;

  // Icon selector helper
  const renderModeIcon = (mode: AdaptiveExplanationMode, className = "w-4 h-4") => {
    switch (mode) {
      case "whole-to-part":
        return <Maximize2 className={className} />;
      case "timeline":
        return <Clock className={className} />;
      case "pathway-flow":
        return <Route className={className} />;
      case "comparison":
        return <GitCompare className={className} />;
      case "decomposition":
        return <Layers className={className} />;
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all shadow-sm overflow-hidden ${
        isDark
          ? "bg-[#101C33] border-slate-800 text-white"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Top Banner: AI Selected Presentation Mode Badge & Selector */}
      <div
        className={`p-3.5 sm:p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isDark ? "bg-[#13233E]/60 border-slate-800" : "bg-slate-50/80 border-slate-100"
        }`}
      >
        {/* Left: Active Mode Pill & AI Recommendation Callout */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-gradient-to-br ${currentMeta.badgeColor} text-white`}
          >
            {renderModeIcon(activeMode, "w-4 h-4")}
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {isEn ? "Adaptive AI Visual Engine" : "الشرح البصري التكيفي بالذكاء الاصطناعي"}
              </span>

              {isAiRecommended && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {isEn ? "Optimal AI Recommendation" : "الأسلوب الأنسب المقترح تلقائياً"}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <span>{isEn ? currentMeta.nameEn : currentMeta.nameAr}</span>
              <button
                onClick={() => setShowRationale((prev) => !prev)}
                className="text-xs text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                title={isEn ? "Why AI picked this style" : "لماذا اختار الذكاء الاصطناعي هذه الطريقة؟"}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </h3>
          </div>
        </div>

        {/* Right: Mode Switching Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              "whole-to-part",
              "timeline",
              "pathway-flow",
              "comparison",
              "decomposition",
            ] as AdaptiveExplanationMode[]
          ).map((m) => {
            const meta = ADAPTIVE_MODES_META[m];
            const isActive = activeMode === m;
            const isRecommended = m === adaptiveData.primaryMode;

            return (
              <button
                key={m}
                onClick={() => onChangeMode(m)}
                className={`relative px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-500 shadow-xs"
                    : isDark
                    ? "bg-[#101C33] border-slate-700/80 text-slate-300 hover:bg-[#1A2C4C] hover:text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {renderModeIcon(m, "w-3.5 h-3.5")}
                <span className="hidden sm:inline">{isEn ? meta.nameEn : meta.nameAr}</span>
                {isRecommended && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable AI Pedagogical Rationale Banner */}
      {showRationale && (
        <div
          className={`p-3.5 text-xs border-b space-y-1.5 animate-in fade-in duration-150 ${
            isDark
              ? "bg-[#0B1528] border-slate-800 text-slate-300"
              : "bg-blue-50/60 border-blue-100 text-blue-950"
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>
                {isEn
                  ? "Pedagogical Rationale Behind AI Presentation Selection:"
                  : "المسوغ التربوي للذكاء الاصطناعي في اختيار طريقة العرض:"}
              </span>
            </div>
            <button
              onClick={() => setShowRationale(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
            >
              {isEn ? "Close" : "إغلاق"}
            </button>
          </div>
          <p className="leading-relaxed">
            {isEn ? adaptiveData.modeRationaleEn : adaptiveData.modeRationaleAr}
          </p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            💡 {isEn ? currentMeta.pedagogicalBenefitEn : currentMeta.pedagogicalBenefitAr}
          </p>
        </div>
      )}

      {/* Multi-Level Visual Hierarchy Controller (Macro -> Meso -> Micro) */}
      <div className="p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isEn ? "Visual Zoom & Depth Level:" : "مستوى العمق والاستكشاف البصري:"}
            </span>
          </div>

          {/* Multi-Level Pills */}
          <div
            className={`p-1 rounded-xl border flex items-center gap-1 text-xs font-bold ${
              isDark
                ? "bg-[#091120] border-slate-800"
                : "bg-slate-100/90 border-slate-200"
            }`}
          >
            {/* Level 1: Macro */}
            <button
              onClick={() => onChangeStage("macro")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStage === "macro"
                  ? "bg-blue-600 text-white shadow-xs"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-900"
              }`}
              title={
                isEn
                  ? "Level 1: Overall System View (Full Scope)"
                  : "المستوى 1: الصورة الكاملة والنظام العام"
              }
            >
              <span>🌐</span>
              <span>{isEn ? "1. Macro System" : "1. النظام الشامل"}</span>
            </button>

            {/* Level 2: Meso */}
            <button
              onClick={() => onChangeStage("meso")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStage === "meso"
                  ? "bg-blue-600 text-white shadow-xs"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-900"
              }`}
              title={
                isEn
                  ? "Level 2: Major Components & Functional Routes"
                  : "المستوى 2: الأجهزة والمسارات الحيوية"
              }
            >
              <span>🧩</span>
              <span>{isEn ? "2. Pathways & Parts" : "2. المسارات والأجزاء"}</span>
            </button>

            {/* Level 3: Micro */}
            <button
              onClick={() => onChangeStage("micro")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStage === "micro"
                  ? "bg-blue-600 text-white shadow-xs"
                  : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-900"
              }`}
              title={
                isEn
                  ? "Level 3: Micro Details, Secretions & Active Functions"
                  : "المستوى 3: التفاصيل الدقيقة والعمليات"
              }
            >
              <span>🔬</span>
              <span>{isEn ? "3. Micro Details" : "3. التفاصيل والعمليات"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mode-Specific Interactive Controls */}
        <div
          className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? "bg-[#13233E]/50 border-slate-800" : "bg-slate-50 border-slate-200/80"
          }`}
        >
          {/* MODE 1: Whole-to-Part progression */}
          {activeMode === "whole-to-part" && (
            <div className="flex items-center gap-3 flex-wrap w-full justify-between">
              <p className="text-slate-500 dark:text-slate-300 leading-relaxed max-w-xl">
                {activeStage === "macro"
                  ? isEn
                    ? "Viewing the holistic diagram. Focus on overall boundaries and organism role."
                    : "استعراض الهيكل الشامل للنظام كاملاً قبل البدء بفحص الأجهزة المستقلة."
                  : activeStage === "meso"
                  ? isEn
                    ? "Examining major functional organs and their connective distribution."
                    : "دراسة الأعضاء والأجهزة المحورية وتوزيعها الفسيولوجي المترابط."
                  : isEn
                  ? "Focused on micro-mechanisms, cellular structures, and chemical reactions."
                  : "التركيز على الآليات الدقيقة والتراكيب الخلوية والوظائف المجهرية."}
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20 text-[11px]">
                  {parts.length} {isEn ? "Identified Nodes" : "مكونات مسجلة"}
                </span>
              </div>
            </div>
          )}

          {/* MODE 2: Timeline Sequence */}
          {activeMode === "timeline" && (
            <div className="flex items-center gap-2 flex-wrap w-full justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {isEn ? "Timeline Progression:" : "التسلسل الزمني للخطوات:"}
                </span>
                <span className="text-slate-500 dark:text-slate-300">
                  {selectedPart?.stageTitleAr ||
                    (isEn ? `Step ${(parts.indexOf(selectedPart || parts[0]) + 1)} of ${parts.length}` : `الخطوة ${(parts.indexOf(selectedPart || parts[0]) + 1)} من ${parts.length}`)}
                </span>
              </div>

              {/* Step pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {parts.map((part, idx) => (
                  <button
                    key={part.id}
                    onClick={() => onSelectPart(part)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
                      selectedPart?.id === part.id
                        ? "bg-amber-500 text-white border-amber-400 shadow-xs scale-105"
                        : isDark
                        ? "bg-[#101C33] border-slate-700 text-slate-300 hover:bg-[#1C3156]"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-amber-50"
                    }`}
                    title={isEn ? part.nameEn : part.nameAr}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODE 3: Pathway & Flow Simulation */}
          {activeMode === "pathway-flow" && (
            <div className="flex items-center gap-3 flex-wrap w-full justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-emerald-500">
                  {isEn ? "Active Flow & Transport Simulation:" : "محاكاة التدفق والمسار الحيوي:"}
                </span>
                <span className="text-slate-500 dark:text-slate-300 hidden md:inline">
                  {isEn ? adaptiveData.flowDirectionEn : adaptiveData.flowDirectionAr}
                </span>
              </div>

              <button
                onClick={onToggleSimulateFlow}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer border ${
                  isSimulatingFlow
                    ? "bg-emerald-600 text-white border-emerald-500 animate-pulse"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {isSimulatingFlow
                    ? isEn
                      ? "Stop Flow Simulation"
                      : "إيقاف المحاكاة الحركية"
                    : isEn
                    ? "Start Dynamic Flow ▶"
                    : "بدء محاكاة التدفق ▶"}
                </span>
              </button>
            </div>
          )}

          {/* MODE 4: Comparison Analysis */}
          {activeMode === "comparison" && (
            <div className="flex items-center gap-2 flex-wrap w-full justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-purple-500" />
                <span className="font-bold text-purple-500">
                  {isEn ? "Comparative Analysis Pairs:" : "ثنائيات المقارنة والتمايز:"}
                </span>
              </div>

              {adaptiveData.comparisonPairs && adaptiveData.comparisonPairs.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {adaptiveData.comparisonPairs.map((pair, idx) => {
                    const isSelected = selectedComparisonPair?.titleAr === pair.titleAr;
                    return (
                      <button
                        key={idx}
                        onClick={() => onSelectComparisonPair(pair)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                            : isDark
                            ? "bg-[#101C33] border-slate-700 text-slate-300 hover:bg-[#1C3156]"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-purple-50"
                        }`}
                      >
                        {isEn ? pair.titleEn : pair.titleAr}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-slate-400">
                  {isEn ? "Select two pins on the diagram to contrast." : "اختر عنصرين لمقارنتهما مباشرة."}
                </span>
              )}
            </div>
          )}

          {/* MODE 5: System Decomposition Layers */}
          {activeMode === "decomposition" && (
            <div className="flex items-center gap-3 flex-wrap w-full justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-cyan-500">
                  {isEn ? "Filter By System Layer:" : "تفكيك وعزل طبقات النظام:"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onSelectLayerId(null)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    activeLayerId === null
                      ? "bg-cyan-600 text-white border-cyan-500 shadow-xs"
                      : isDark
                      ? "bg-[#101C33] border-slate-700 text-slate-300"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  {isEn ? "All Layers" : "جميع الطبقات"}
                </button>

                {adaptiveData.systemLayers?.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => onSelectLayerId(layer.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                      activeLayerId === layer.id
                        ? "bg-cyan-600 text-white border-cyan-500 shadow-xs"
                        : isDark
                        ? "bg-[#101C33] border-slate-700 text-slate-300 hover:bg-[#1C3156]"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-cyan-50"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span>{isEn ? layer.nameEn : layer.nameAr}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
