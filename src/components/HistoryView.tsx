import React, { useState } from "react";
import {
  Layers,
  Trash2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { DiagramAnalysis, HistoryItem, LanguageMode, ThemeMode } from "../types";

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onSelectHistoryItem: (diagram: DiagramAnalysis) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onBackToHome: () => void;
  languageMode?: LanguageMode;
  themeMode?: ThemeMode;
  historyPrivacy?: boolean;
  onToggleHistoryPrivacy?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyItems,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
  onBackToHome,
  languageMode = "ar",
  themeMode = "light",
  historyPrivacy = false,
  onToggleHistoryPrivacy,
}) => {
  const isEn = languageMode === "en";
  const isDark = themeMode === "dark";
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleRevealItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-in fade-in"
    >
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            isDark ? "text-slate-200 hover:text-blue-400" : "text-slate-800 hover:text-blue-600"
          }`}
        >
          {isEn ? <ArrowLeft className="w-4 h-4 text-blue-500" /> : <ArrowRight className="w-4 h-4 text-blue-500" />}
          <span>{isEn ? "Analysis History" : "سجل التحليلات"}</span>
        </button>

        <div className="flex items-center gap-2">
          {onToggleHistoryPrivacy && (
            <button
              onClick={onToggleHistoryPrivacy}
              title={isEn ? "Toggle history privacy" : "تبديل خصوصية السجل"}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                historyPrivacy
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {historyPrivacy ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>
                {historyPrivacy
                  ? (isEn ? "Privacy: Active" : "الخصوصية: مفعّلة")
                  : (isEn ? "Privacy: Off" : "الخصوصية: معطلة")}
              </span>
            </button>
          )}

          {historyItems.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isEn ? "Clear All" : "مسح الكل"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Isolation and Privacy Notice */}
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
          isDark
            ? "bg-[#101C33] border-slate-800 text-slate-300"
            : "bg-blue-50/70 border-blue-200/60 text-blue-950 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            {isEn
              ? "All files and analyses in this history are private and tied exclusively to your account."
              : "كافة الملفات والتحليلات في هذا السجل خاصة ومعزولة بحسابك فقط ولا يمكن لأحد غيرك رؤيتها."}
          </span>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
          {historyItems.length} {isEn ? "files" : "ملفات"}
        </span>
      </div>

      {/* History Grid / List */}
      {historyItems.length === 0 ? (
        <div
          className={`rounded-3xl border p-12 text-center shadow-xs space-y-3 ${
            isDark
              ? "bg-[#101C33] border-slate-800 text-slate-200"
              : "bg-white border-slate-100 text-slate-800"
          }`}
        >
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold">
            {isEn ? "No Saved Analyses Yet" : "لا توجد تحليلات محفوظة بعد"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isEn
              ? "Your history is reserved exclusively for diagrams you capture or upload yourself, or models you explore from 'Explore Educational Models'."
              : "سجلك مخصص حصرياً للمخططات التي تلتقطها أو ترفعها بنفسك، أو النماذج التي تقوم باستكشافها من قسم (استكشف النماذج التعليمية)."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 group ${
                isDark
                  ? "bg-[#101C33] border-slate-800 text-white"
                  : "bg-white border-slate-100 text-slate-900"
              }`}
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                onClick={() => onSelectHistoryItem(item.analysis)}
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                  <img
                    src={item.thumbnail}
                    alt={isEn ? item.titleEn || item.titleAr : item.titleAr}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                      historyPrivacy && !revealedIds[item.id] ? "blur-md scale-110 opacity-60" : ""
                    }`}
                  />
                  {historyPrivacy && !revealedIds[item.id] && (
                    <button
                      type="button"
                      onClick={(e) => toggleRevealItem(item.id, e)}
                      title={isEn ? "Show preview" : "إظهار المعاينة"}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 text-white backdrop-blur-[2px] transition-opacity hover:bg-slate-950/60"
                    >
                      <Lock className="w-4 h-4 mb-0.5 text-amber-300" />
                      <span className="text-[8px] font-bold tracking-tight">
                        {isEn ? "Locked" : "محمي"}
                      </span>
                    </button>
                  )}
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <h4
                    className={`text-xs font-bold truncate transition-colors ${
                      isDark
                        ? "text-slate-100 group-hover:text-blue-400"
                        : "text-slate-900 group-hover:text-blue-600"
                    }`}
                  >
                    {isEn ? item.titleEn || item.titleAr : item.titleAr}
                  </h4>
                  <p
                    className="text-[10px] font-semibold text-blue-500 font-sans truncate"
                    dir={isEn ? "rtl" : "ltr"}
                  >
                    {isEn ? item.titleAr : item.titleEn}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-0.5">
                      <Layers className="w-3 h-3" />
                      {item.partsCount} {isEn ? "parts" : "أجزاء"}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(
                        isEn ? "en-US" : "ar-SA"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteHistoryItem(item.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                title={isEn ? "Delete" : "حذف"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
