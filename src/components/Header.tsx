import React from "react";
import {
  Settings,
  Share2,
  Globe,
  ArrowRight,
  ArrowLeft,
  Moon,
  Sun,
  User,
  Bookmark,
  Smartphone,
} from "lucide-react";
import { MainView, ThemeMode, LanguageMode, UserAccount } from "../types";
import { EduGraphicLogo } from "./EduGraphicLogo";
import { getTranslations } from "../utils/translations";
import { getAvatarById } from "../data/avatars";

interface HeaderProps {
  currentView: MainView;
  onNavigate: (view: MainView) => void;
  onOpenExport: () => void;
  onShareApp?: () => void;
  onOpenNotes?: () => void;
  onOpenInstallModal?: () => void;
  viewerTitle?: string;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  languageMode?: LanguageMode;
  onToggleLanguage?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenExport,
  onShareApp,
  onOpenNotes,
  onOpenInstallModal,
  viewerTitle,
  themeMode = "light",
  onToggleTheme,
  languageMode = "ar",
  onToggleLanguage,
  currentUser,
  onOpenAuthModal,
}) => {
  const activeLang = (languageMode as LanguageMode) || "ar";
  const isDark = themeMode === "dark";
  const isEn = activeLang === "en";
  const t = getTranslations(activeLang);

  // Title to display in center
  const getCenterTitle = () => {
    switch (currentView) {
      case "home":
        return t.home;
      case "settings":
        return t.settings;
      case "history":
        return t.history;
      case "vision":
        return isEn ? "Vision Assistant" : "مساعد الرؤية الذكي وتحليل الشاشة";
      case "notes":
        return isEn ? "My Notes & Insights" : "📝 ملاحظاتي المعرفية";
      case "viewer":
        return viewerTitle || t.viewer;
      default:
        return t.home;
    }
  };

  const btnBaseClass = isDark
    ? "bg-[#15233E] hover:bg-[#1E3156] border-slate-700/70 text-slate-300 hover:text-white"
    : "bg-slate-100 hover:bg-slate-200 border-slate-200/80 text-slate-700";

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark
          ? "bg-[#0B1528]/95 border-b border-slate-800/80"
          : "bg-white/95 border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Circular Action Buttons (Settings, Share, Language, Theme) */}
        <div className="flex items-center gap-2">
          {/* Settings button */}
          <button
            id="nav-settings-btn"
            onClick={() => onNavigate("settings")}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
              currentView === "settings"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : btnBaseClass
            }`}
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Main App Share button */}
          <button
            id="nav-share-app-btn"
            onClick={onShareApp || onOpenExport}
            className={`h-9 px-3 rounded-full flex items-center gap-1.5 border transition-all cursor-pointer font-bold ${
              isDark
                ? "bg-blue-950/50 hover:bg-blue-900/60 border-blue-800/60 text-blue-300 shadow-2xs"
                : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 shadow-2xs"
            }`}
            title={t.shareApp}
          >
            <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-xs hidden md:inline whitespace-nowrap">
              {t.shareApp}
            </span>
          </button>

          {/* Smart Install & Phone Detect button */}
          {onOpenInstallModal && (
            <button
              id="nav-install-app-btn"
              onClick={onOpenInstallModal}
              className={`h-9 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 border transition-all cursor-pointer font-bold ${
                isDark
                  ? "bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-700/60 text-emerald-300 shadow-2xs"
                  : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 shadow-2xs"
              }`}
              title={isEn ? "Install App on Phone" : "تنزيل وتثبيت البرنامج على الهاتف"}
            >
              <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs hidden lg:inline whitespace-nowrap">
                {isEn ? "Install App" : "تنزيل البرنامج"}
              </span>
            </button>
          )}

          {/* My Notes button */}
          {onOpenNotes && (
            <button
              id="nav-notes-btn"
              onClick={onOpenNotes}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                currentView === "notes"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : btnBaseClass
              }`}
              title={isEn ? "My Educational Notes" : "ملاحظاتي التعليمية"}
            >
              <Bookmark className={`w-4 h-4 ${currentView === "notes" ? "fill-current text-white" : "text-amber-500"}`} />
            </button>
          )}

          {/* Quick Language toggle button */}
          <button
            id="nav-language-btn"
            onClick={onToggleLanguage ? onToggleLanguage : () => onNavigate("settings")}
            className={`h-9 px-2.5 rounded-full flex items-center justify-center gap-1.5 border transition-all font-bold cursor-pointer ${
              isEn
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : btnBaseClass
            }`}
            title={isEn ? "التبديل إلى اللغة العربية" : "Switch to English"}
          >
            <Globe className="w-4 h-4" />
            <span className="text-[11px] font-mono tracking-wider font-bold">
              {isEn ? "AR" : "EN"}
            </span>
          </button>

          {/* Quick Theme Toggle button (Moon / Sun) */}
          {onToggleTheme && (
            <button
              id="nav-theme-toggle-btn"
              onClick={onToggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isDark
                  ? "bg-[#1C2C4E] hover:bg-[#253966] border-blue-500/50 text-amber-400"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200/80 text-slate-700"
              }`}
              title={isDark ? t.enableLightMode : t.enableDarkMode}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          )}

          {/* User Account / Avatar Button */}
          {onOpenAuthModal && (
            <button
              id="nav-user-account-btn"
              onClick={onOpenAuthModal}
              className={`h-9 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                currentUser
                  ? isDark
                    ? "bg-[#162744] hover:bg-[#1F3660] border-blue-500/40 text-blue-300"
                    : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 shadow-2xs"
                  : btnBaseClass
              }`}
              title={currentUser ? (isEn ? "My Account" : "حسابي الشخصي") : (isEn ? "Sign In" : "تسجيل الدخول")}
            >
              {currentUser ? (
                <>
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {currentUser.avatarUrl && currentUser.avatarUrl.startsWith("http") ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      getAvatarById(currentUser.avatarUrl || "cat").render(24)
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold truncate max-w-[85px]">
                    {currentUser.displayName || currentUser.username}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="hidden sm:inline text-xs font-bold">
                    {isEn ? "Sign In" : "تسجيل الدخول"}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Center: Current View Title (with back arrow if in viewer) */}
        <div className="flex items-center gap-2">
          {currentView !== "home" && (
            <button
              onClick={() => onNavigate("home")}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              }`}
              title={t.backToHome}
            >
              {isEn ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          )}
          <h1
            className={`text-base sm:text-lg font-bold tracking-tight font-sans truncate max-w-xs sm:max-w-md ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {getCenterTitle()}
          </h1>
        </div>

        {/* Brand Logo */}
        <div
          onClick={() => onNavigate("home")}
          className="cursor-pointer group flex items-center gap-2.5"
          title={`${t.appName} | ${t.home}`}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center p-1 border transition-transform group-hover:scale-105 shadow-sm ${
              isDark
                ? "bg-[#101C33] border-slate-700/80 shadow-blue-900/20"
                : "bg-white border-slate-200/80 shadow-slate-200/60"
            }`}
          >
            <EduGraphicLogo size="sm" isDark={isDark} />
          </div>
          <div className="hidden sm:flex flex-col text-start">
            <span
              className={`font-black text-xs leading-none tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {t.appName}
            </span>
            <span
              className={`text-[9px] leading-tight mt-0.5 font-medium line-clamp-1 max-w-[150px] ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {isEn ? "Interactive Diagrams" : "منصة الرسوم التفاعلية"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
