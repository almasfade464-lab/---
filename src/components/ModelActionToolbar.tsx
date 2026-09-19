import React from "react";
import {
  HelpCircle,
  Volume2,
  VolumeX,
  Film,
  Download,
  Bookmark,
  BookmarkCheck,
  Share2,
  Sparkles,
} from "lucide-react";
import { LanguageMode, ThemeMode } from "../types";

interface ModelActionToolbarProps {
  onStartQuiz: () => void;
  onToggleAudio: () => void;
  isAudioPlaying: boolean;
  onOpenExplainerVideo: () => void;
  onSaveAsFile: () => void;
  onSaveToNotes: () => void;
  isSavedInNotes: boolean;
  onShareModel: () => void;
  languageMode: LanguageMode;
  themeMode: ThemeMode;
}

export const ModelActionToolbar: React.FC<ModelActionToolbarProps> = ({
  onStartQuiz,
  onToggleAudio,
  isAudioPlaying,
  onOpenExplainerVideo,
  onSaveAsFile,
  onSaveToNotes,
  isSavedInNotes,
  onShareModel,
  languageMode,
  themeMode,
}) => {
  const isEn = languageMode === "en";
  const isDark = themeMode === "dark";

  return (
    <div
      id="educational-model-actions-bar"
      className={`rounded-2xl border p-2.5 sm:p-3 shadow-sm transition-all ${
        isDark ? "bg-[#091224] border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>{isEn ? "Educational Model Actions:" : "إجراءات وأدوات النموذج التعليمي:"}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {isEn ? "Interactive Controls" : "أدوات تفاعلية جاهزة"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. ابدأ الاختبار */}
        <button
          id="action-btn-quiz"
          type="button"
          onClick={onStartQuiz}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border active:scale-[0.98] ${
            isDark
              ? "bg-blue-950/40 hover:bg-blue-900/50 border-blue-800/60 text-blue-300 shadow-sm"
              : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800 shadow-xs"
          }`}
          title={isEn ? "Take self-assessment interactive quiz" : "بدء اختبار التقييم الذاتي التفاعلي"}
        >
          <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">{isEn ? "Start Quiz" : "ابدأ الاختبار"}</span>
        </button>

        {/* 2. الشرح الصوتي */}
        <button
          id="action-btn-audio"
          type="button"
          onClick={onToggleAudio}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border active:scale-[0.98] ${
            isAudioPlaying
              ? "bg-emerald-600 border-emerald-500 text-white animate-pulse shadow-md"
              : isDark
              ? "bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/60 text-emerald-300 shadow-sm"
              : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 shadow-xs"
          }`}
          title={isEn ? "Listen to voice explanation" : "الاستماع إلى الشرح الصوتي للدرس"}
        >
          {isAudioPlaying ? (
            <VolumeX className="w-4 h-4 text-white shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span className="truncate">
            {isAudioPlaying
              ? isEn ? "Stop Audio" : "إيقاف الصوت"
              : isEn ? "Audio Explanation" : "الشرح الصوتي"}
          </span>
        </button>

        {/* 3. إنشاء فيديو توضيحي */}
        <button
          id="action-btn-video"
          type="button"
          onClick={onOpenExplainerVideo}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border active:scale-[0.98] ${
            isDark
              ? "bg-purple-950/40 hover:bg-purple-900/50 border-purple-800/60 text-purple-300 shadow-sm"
              : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800 shadow-xs"
          }`}
          title={isEn ? "Generate dynamic explainer animated video" : "توليد محاكاة فيديو توضيحي متحرك للرسم والأجزاء"}
        >
          <Film className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="truncate">{isEn ? "Explainer Video" : "إنشاء فيديو توضيحي"}</span>
        </button>

        {/* 4. حفظ كملف */}
        <button
          id="action-btn-export-file"
          type="button"
          onClick={onSaveAsFile}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border active:scale-[0.98] ${
            isDark
              ? "bg-teal-950/40 hover:bg-teal-900/50 border-teal-800/60 text-teal-300 shadow-sm"
              : "bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800 shadow-xs"
          }`}
          title={isEn ? "Export as Word doc, PDF print, or Text" : "تصدير المحتوى كملف وورد Word، طباعة PDF، أو نص"}
        >
          <Download className="w-4 h-4 text-teal-500 shrink-0" />
          <span className="truncate">{isEn ? "Save as File" : "حفظ كملف"}</span>
        </button>

        {/* 5. حفظ في ملاحظاتي */}
        <button
          id="action-btn-save-notes"
          type="button"
          onClick={onSaveToNotes}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border active:scale-[0.98] ${
            isSavedInNotes
              ? "bg-amber-500 text-white border-amber-400 font-bold shadow-md"
              : isDark
              ? "bg-amber-950/40 hover:bg-amber-900/50 border-amber-800/60 text-amber-300 shadow-sm"
              : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 shadow-xs"
          }`}
          title={isEn ? "Save this model to My Notes system" : "حفظ هذا النموذج التعليمي كاملاً في قسم ملاحظاتي"}
        >
          {isSavedInNotes ? (
            <BookmarkCheck className="w-4 h-4 text-white shrink-0" />
          ) : (
            <Bookmark className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="truncate">
            {isSavedInNotes
              ? isEn ? "Saved in Notes ✓" : "محفوظ في ملاحظاتي ✓"
              : isEn ? "Save in Notes" : "حفظ في ملاحظاتي"}
          </span>
        </button>

        {/* 6. مشاركة هذا النموذج التعليمي */}
        <button
          id="action-btn-share-model"
          type="button"
          onClick={onShareModel}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border active:scale-[0.98] ${
            isDark
              ? "bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-800/60 text-indigo-300 shadow-sm"
              : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800 shadow-xs"
          }`}
          title={isEn ? "Share this educational model, diagram and quiz" : "مشاركة هذا النموذج التعليمي مع الرسم والشرح والاختبار"}
        >
          <Share2 className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate">{isEn ? "Share This Model" : "مشاركة هذا النموذج"}</span>
        </button>
      </div>
    </div>
  );
};
