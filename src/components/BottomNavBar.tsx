import React from "react";
import {
  Home,
  Clock,
  Plus,
  Settings,
  Sparkles,
  User,
  Bookmark,
} from "lucide-react";
import { MainView, ThemeMode, LanguageMode, UserAccount } from "../types";
import { getTranslations } from "../utils/translations";
import { getAvatarById } from "../data/avatars";

interface BottomNavBarProps {
  currentView: MainView;
  onNavigate: (view: MainView) => void;
  onPlusClick: () => void;
  onToggleAiChat: () => void;
  onOpenNotes?: () => void;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentView,
  onNavigate,
  onPlusClick,
  onToggleAiChat,
  onOpenNotes,
  themeMode = "light",
  languageMode = "ar",
  currentUser,
  onOpenAuthModal,
}) => {
  const activeLang = (languageMode as LanguageMode) || "ar";
  const isDark = themeMode === "dark";
  const isEn = activeLang === "en";
  const t = getTranslations(activeLang);

  return (
    <>
      {/* Floating Sparkle AI Assistant FAB Button */}
      <button
        id="floating-ai-fab-btn"
        onClick={onToggleAiChat}
        className="fixed bottom-20 left-6 z-40 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title={t.fabAiTutor}
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {/* Main Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md transition-colors ${
          isDark
            ? "bg-[#0B1528]/98 border-t border-slate-800/90 shadow-2xl"
            : "bg-white/95 border-t border-slate-200/80 shadow-lg"
        }`}
      >
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between relative">
            {/* 1. Home */}
            <button
              id="bottom-nav-home"
              onClick={() => onNavigate("home")}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                currentView === "home"
                  ? "text-blue-500 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 font-medium"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">{t.navHome}</span>
            </button>

            {/* 2. History */}
            <button
              id="bottom-nav-history"
              onClick={() => onNavigate("history")}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                currentView === "history"
                  ? "text-blue-500 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 font-medium"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[10px]">{t.navHistory}</span>
            </button>

            {/* 2.5 Notes - 📝 ملاحظاتي */}
            <button
              id="bottom-nav-notes"
              onClick={() => {
                if (onOpenNotes) {
                  onOpenNotes();
                } else {
                  onNavigate("notes");
                }
              }}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                currentView === "notes"
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-indigo-400 font-medium"
                  : "text-slate-400 hover:text-indigo-600 font-medium"
              }`}
            >
              <Bookmark className={`w-5 h-5 ${currentView === "notes" ? "fill-current" : ""}`} />
              <span className="text-[10px] flex items-center gap-0.5">
                <span>📝</span>
                <span>{isEn ? "Notes" : "ملاحظاتي"}</span>
              </span>
            </button>

            {/* 3. Center Elevated Circular (+) Button */}
            <div className="relative -top-4">
              <button
                id="bottom-nav-plus"
                onClick={onPlusClick}
                className={`w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 ${
                  isDark ? "border-[#0B1528]" : "border-white"
                }`}
                title={t.uploadModalTitle}
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* 4. Settings */}
            <button
              id="bottom-nav-settings"
              onClick={() => onNavigate("settings")}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                currentView === "settings"
                  ? "text-blue-500 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 font-medium"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px]">{t.navSettings}</span>
            </button>

            {/* 5. Account / Profile */}
            {onOpenAuthModal && (
              <button
                id="bottom-nav-account"
                onClick={onOpenAuthModal}
                className="flex flex-col items-center gap-1 transition-colors cursor-pointer text-slate-400 hover:text-blue-500 font-medium"
              >
                {currentUser ? (
                  <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                    {currentUser.avatarUrl && currentUser.avatarUrl.startsWith("http") ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      getAvatarById(currentUser.avatarUrl || "cat").render(20)
                    )}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="text-[10px]">
                  {currentUser ? (isEn ? "Profile" : "الملف") : isEn ? "Sign In" : "الحساب"}
                </span>
              </button>
            )}
          </div>

          {/* School & Copyright Note */}
          <div
            className={`text-center pt-1.5 border-t ${
              isDark ? "border-slate-800/60" : "border-slate-100/80"
            }`}
          >
            <p
              className={`text-[9px] ${
                isDark ? "text-slate-400/80" : "text-slate-400"
              }`}
            >
              {isEn
                ? "EduGraphic Interactive Learning Platform • All Rights Reserved © 2026"
                : "منصة إديو-جرافيك للرسوم التعليمية التفاعلية • جميع الحقوق محفوظة © 2026"}
            </p>
          </div>
        </div>
      </nav>
    </>
  );
};
