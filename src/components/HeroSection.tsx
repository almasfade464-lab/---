import React from "react";
import { Upload, Camera, Sparkles, Monitor, Share2 } from "lucide-react";
import { ThemeMode, LanguageMode } from "../types";
import { EduGraphicLogo } from "./EduGraphicLogo";

interface HeroSectionProps {
  onUploadClick: () => void;
  onCameraClick: () => void;
  onScreenCaptureClick?: () => void;
  onShareApp?: () => void;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onUploadClick,
  onCameraClick,
  onScreenCaptureClick,
  onShareApp,
  themeMode = "light",
  languageMode = "ar",
}) => {
  const isDark = themeMode === "dark";
  const isEn = languageMode === "en";

  return (
    <section
      dir={isEn ? "ltr" : "rtl"}
      className="py-8 sm:py-12 text-center max-w-4xl mx-auto px-4 space-y-6"
    >
      {/* Official Approved Brand Logo Badge */}
      <div className="flex justify-center mb-2">
        <div
          className={`p-3 sm:p-4 rounded-3xl border transition-all shadow-lg hover:scale-105 duration-300 ${
            isDark
              ? "bg-[#101C33]/90 border-slate-700/80 shadow-blue-950/50 ring-1 ring-blue-500/20"
              : "bg-white border-slate-200/80 shadow-slate-200/80 ring-1 ring-blue-100"
          }`}
        >
          <EduGraphicLogo size="xl" isDark={isDark} />
        </div>
      </div>

      {/* Top Pill Badge matching screenshot */}
      <div
        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          isDark
            ? "bg-[#101C33]/90 text-blue-300 border-slate-700/80 shadow-inner"
            : "bg-blue-50/90 text-blue-600 border-blue-100 shadow-2xs"
        }`}
      >
        <Sparkles
          className={`w-3.5 h-3.5 ${isDark ? "text-blue-400" : "text-blue-500"}`}
        />
        <span>
          {isEn
            ? "Multi-Modal Visual AI & Arbitrary Screen Capture"
            : "رؤية حاسوبية فائقة • التقاط وتحليل حر لكافة أبعاد الشاشة والصور"}
        </span>
      </div>

      {/* Main Headline */}
      <div className="space-y-1">
        <h2
          className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {isEn ? "Transform Your Screenshots & Images Into" : "حول لقطات الشاشة والصور إلى"}
        </h2>
        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 tracking-tight leading-tight">
          {isEn ? "Intelligent Understanding" : "فهم ذكي وشرح تفاعلي متكامل"}
        </h2>
      </div>

      {/* Subtitle */}
      <p
        className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-medium ${
          isDark ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {isEn
          ? "No restrictions on size, resolution, or aspect ratio — capture full screens, tall webpages, code, diagrams, tables, and questions. AI understands the visual context and chats interactively with your image."
          : "بدون أي قيود على الحجم أو الدقة أو الأبعاد — التقط لقطات شاشة كاملة، صفحات طويلة، أكواد، مخططات، مسائل، وجداول. يفهم الذكاء الاصطناعي الصورة بصرياً ويجيب عن كافة تساؤلاتك بحوار مستمر."}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {/* Screen Capture Primary CTA */}
        {onScreenCaptureClick && (
          <button
            id="hero-screen-capture-btn"
            onClick={onScreenCaptureClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/30 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Monitor className="w-4 h-4" />
            <span>{isEn ? "Capture Screen 🖥️" : "التقاط الشاشة 🖥️"}</span>
          </button>
        )}

        {/* Upload from Device */}
        <button
          id="hero-upload-btn"
          onClick={onUploadClick}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>{isEn ? "Upload / Paste File 📁" : "رفع صورة أو لصق 📁"}</span>
        </button>

        {/* Camera Capture */}
        <button
          id="hero-camera-btn"
          onClick={onCameraClick}
          className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border ${
            isDark
              ? "bg-[#13233E] hover:bg-[#1C3156] text-white border-slate-700/80"
              : "bg-slate-900 hover:bg-slate-800 text-white border-transparent"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{isEn ? "Live Camera 📷" : "الكاميرا المباشرة 📷"}</span>
        </button>

        {/* Dedicated Main App Share Button */}
        {onShareApp && (
          <button
            id="hero-share-app-btn"
            onClick={onShareApp}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 ${
              isDark
                ? "bg-blue-950/40 hover:bg-blue-900/50 border-blue-800/60 text-blue-300"
                : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            }`}
            title={isEn ? "Share EduGraphic Platform Link" : "مشاركة رابط منصة إديو-جرافيك"}
          >
            <Share2 className="w-4 h-4 text-blue-500" />
            <span>{isEn ? "Share EduGraphic" : "مشاركة إديو-جرافيك"}</span>
          </button>
        )}
      </div>
    </section>
  );
};
