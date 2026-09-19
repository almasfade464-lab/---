import React from "react";
import { GitCompare, ArrowRight, CheckCircle2, X } from "lucide-react";
import { ComparisonPair, DiagramPart, LanguageMode, ThemeMode } from "../types";

interface ComparisonCardProps {
  pair: ComparisonPair;
  partA?: DiagramPart;
  partB?: DiagramPart;
  onClose: () => void;
  languageMode: LanguageMode;
  themeMode: ThemeMode;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  pair,
  partA,
  partB,
  onClose,
  languageMode,
  themeMode,
}) => {
  const isDark = themeMode === "dark";
  const isEn = languageMode === "en";

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-md animate-in fade-in duration-200 ${
        isDark
          ? "bg-[#101C33] border-purple-500/30 text-white"
          : "bg-purple-50/70 border-purple-200 text-slate-900"
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-purple-200/40 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-purple-600 dark:text-purple-400">
          <GitCompare className="w-5 h-5" />
          <span>{isEn ? pair.titleEn : pair.titleAr}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column A */}
        <div
          className={`p-3.5 rounded-xl border ${
            isDark
              ? "bg-[#13233E] border-slate-700"
              : "bg-white border-purple-100 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400">
              {partA ? (isEn ? partA.nameEn : partA.nameAr) : "العنصر الأول"}
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
            {partA ? (isEn ? partA.functionEn : partA.functionAr) : ""}
          </p>
          {partA?.keyFactAr && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg">
              💡 {isEn ? partA.keyFactEn || partA.keyFactAr : partA.keyFactAr}
            </div>
          )}
        </div>

        {/* Column B */}
        <div
          className={`p-3.5 rounded-xl border ${
            isDark
              ? "bg-[#13233E] border-slate-700"
              : "bg-white border-purple-100 shadow-2xs"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {partB ? (isEn ? partB.nameEn : partB.nameAr) : "العنصر الثاني"}
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
            {partB ? (isEn ? partB.functionEn : partB.functionAr) : ""}
          </p>
          {partB?.keyFactAr && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg">
              💡 {isEn ? partB.keyFactEn || partB.keyFactAr : partB.keyFactAr}
            </div>
          )}
        </div>
      </div>

      {/* Contrast & Complementary Points */}
      <div className="mt-4 pt-3 border-t border-purple-200/30 dark:border-slate-800 space-y-1.5">
        <h5 className="text-xs font-bold text-purple-700 dark:text-purple-300">
          {isEn ? "Key Contrast & Complementary Insights:" : "نقاط التمايز والتكامل الفسيولوجي:"}
        </h5>
        <ul className="space-y-1">
          {(isEn ? pair.contrastPointsEn : pair.contrastPointsAr).map((pt, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
