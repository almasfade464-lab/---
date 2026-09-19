import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  Sparkles,
  ExternalLink,
  Laptop,
  Check,
  Zap,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { detectDevice, DeviceInfo } from "../utils/deviceDetector";
import {
  triggerPwaInstall,
  canTriggerNativePrompt,
  subscribePwaInstallAvailability,
} from "../utils/pwaInstallManager";
import { EduGraphicLogo } from "./EduGraphicLogo";
import { LanguageMode } from "../types";

interface SmartAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageMode?: LanguageMode;
  fromQrScan?: boolean;
}

export const SmartAppInstallModal: React.FC<SmartAppInstallModalProps> = ({
  isOpen,
  onClose,
  languageMode = "ar",
  fromQrScan = false,
}) => {
  const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());
  const [canInstallNative, setCanInstallNative] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  const isEn = languageMode === "en";

  useEffect(() => {
    setDevice(detectDevice());
    const unsub = subscribePwaInstallAvailability((canInstall) => {
      setCanInstallNative(canInstall);
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const accepted = await triggerPwaInstall();
      if (accepted) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div
      id="smart-app-install-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      dir={isEn ? "ltr" : "rtl"}
    >
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="relative px-5 py-4 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <EduGraphicLogo size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {isEn ? "Install EduGraphic App" : "تنزيل وتثبيت إديو-جرافيك"}
                </h3>
                {fromQrScan && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {isEn ? "Scanned via QR" : "مسح عبر QR"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isEn
                  ? "Use it as a full standalone app on your phone"
                  : "استعمل المنصة كبرنامج كامل وسريع على هاتفك"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. Phone Detection Pill ("يتعرف شو هو التلفون") */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-950 border border-blue-500/30 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                {device.platform === "desktop" ? (
                  <Laptop className="w-4 h-4" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-[11px] text-blue-400 font-bold">
                  {isEn ? "Device Automatically Detected:" : "تم التعرف على جهازك تلقائياً:"}
                </div>
                <div className="text-xs font-black text-white flex items-center gap-1.5 mt-0.5">
                  <span>{isEn ? device.titleEn : device.titleAr}</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{isEn ? "PWA Ready" : "متوافق 100%"}</span>
              </span>
            </div>
          </div>

          {/* 2. Visual App Preview Mockup ("صوره للبرنامج") */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            {/* Phone Mockup Screen with real App elements */}
            <div className="relative w-36 sm:w-40 shrink-0 bg-slate-900 rounded-2xl p-2 border-2 border-slate-700 shadow-xl overflow-hidden aspect-[9/16] flex flex-col justify-between">
              {/* Phone Speaker & Camera notch */}
              <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-1 shrink-0" />

              {/* Mockup Header */}
              <div className="bg-slate-950/90 rounded-lg p-1.5 flex items-center justify-between border border-slate-800">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                    EG
                  </div>
                  <span className="text-[9px] font-bold text-white truncate max-w-[65px]">
                    EduGraphic
                  </span>
                </div>
                <span className="text-[7px] px-1 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-bold">
                  AI Live
                </span>
              </div>

              {/* Mockup Diagram Canvas with Part Pins */}
              <div className="my-1.5 relative flex-1 bg-slate-950 rounded-lg border border-slate-800/80 p-1 flex flex-col items-center justify-center overflow-hidden">
                <img
                  src="/pwa-512x512.png"
                  alt="EduGraphic Icon"
                  className="w-12 h-12 rounded-xl shadow-md mb-1 object-contain"
                />
                <div className="text-[8px] font-extrabold text-white text-center">
                  إديو-جرافيك | AI
                </div>
                <div className="text-[7px] text-slate-400 text-center scale-90">
                  تحليل الرسوم والمخططات
                </div>

                {/* Floating Pin tags */}
                <div className="mt-2 w-full space-y-1">
                  <div className="h-1.5 bg-blue-500/30 rounded-full w-3/4 mx-auto" />
                  <div className="h-1.5 bg-emerald-500/30 rounded-full w-1/2 mx-auto" />
                </div>
              </div>

              {/* Mockup Bottom Navigation */}
              <div className="bg-slate-950/90 rounded-lg p-1 flex items-center justify-around border border-slate-800 text-[8px] text-slate-400">
                <span className="text-blue-400 font-bold">● فحص</span>
                <span>● درس</span>
                <span>● ملاحظات</span>
              </div>
            </div>

            {/* App Highlights & Specs */}
            <div className="flex-1 space-y-2.5 text-slate-300">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-[11px] font-bold text-white">4.9 / 5.0</span>
                <span className="text-[10px] text-slate-400">
                  ({isEn ? "High Speed PWA" : "تطبيق ويب تقدمي خفيف"})
                </span>
              </div>

              <h4 className="text-sm font-bold text-white leading-tight">
                {isEn
                  ? "Experience EduGraphic as a Real Mobile App"
                  : "استخدم إديو-جرافيك كبرنامج أصلي على هاتفك"}
              </h4>

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center gap-1 text-slate-300">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{isEn ? "Instant launch" : "تشغيل فوري"}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{isEn ? "No App Store needed" : "بدون متجر تطبيقات"}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{isEn ? "Camera & AI ready" : "يدعم الكاميرا والذكاء"}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>{isEn ? "Offline notes" : "حفظ الملاحظات محلياً"}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {isEn
                  ? "Adding it to your Home Screen removes browser bars, loads faster, and gives you a direct app icon."
                  : "تنزيل البرنامج يزيل أشرطة المتصفح، ويضع أيقونة المنصة على شاشة هاتفك لتفتحه كأي تطبيق محمل."}
              </p>
            </div>
          </div>

          {/* 3. In-App Browser Warning (if opened inside WhatsApp / Instagram) */}
          {device.isInAppBrowser && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>
                  {isEn
                    ? "Opened via in-app browser (e.g. WhatsApp / Instagram)"
                    : "تم الفتح داخل متصفح التطبيقات الداخلي"}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                {isEn
                  ? "To install properly, tap the menu (⋮ or ⋯) and choose 'Open in Safari' or 'Open in Chrome'."
                  : "لتتمكن من التثبيت كبرنامج، اضغط على خيارات المتصفح (⋮ أو ⋯) واختر «فتح في Safari» أو «فتح في Chrome»."}
              </p>
            </div>
          )}

          {/* 4. Platform-Specific Installation Guide ("ع شان انزلو ع الهاتف") */}

          {/* A. Android Flow */}
          {device.platform === "android" && (
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isEn ? "Android Installation Steps:" : "طريقة التثبيت على هاتف أندرويد:"}</span>
                </span>
                <span className="text-[10px] text-blue-400 font-semibold">
                  {device.browserName}
                </span>
              </div>

              {/* Direct One-Click Install Button if Prompt is Ready */}
              {canInstallNative && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={isInstalling || installSuccess}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {installSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      <span>{isEn ? "App Installed Successfully!" : "تم تثبيت التطبيق بنجاح!"}</span>
                    </>
                  ) : isInstalling ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isEn ? "Installing..." : "جاري التثبيت..."}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-white animate-bounce" />
                      <span>{isEn ? "Install App on Phone Now" : "تثبيت البرنامج الآن على هاتفك"}</span>
                    </>
                  )}
                </button>
              )}

              {/* Step-by-Step Visual Instruction for Android */}
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white">
                      {isEn ? "Tap the browser menu:" : "اضغط على زر خيارات المتصفح:"}
                    </span>{" "}
                    <span className="text-slate-300">
                      {isEn
                        ? "Look for the 3 vertical dots (⋮) at the top or bottom corner of Chrome / Samsung Internet."
                        : "ابحث عن أيقونة (⋮ ثلاث نقاط) في أعلى أو أسفل شاشة المتصفح."}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white">
                      {isEn ? "Select 'Install app' or 'Add to Home screen':" : "اختر «تثبيت التطبيق» أو «إضافة للشاشة الرئيسية»:"}
                    </span>{" "}
                    <span className="text-slate-300">
                      {isEn
                        ? "Confirm the install dialog. The EduGraphic icon will appear on your home screen like any native app."
                        : "أكّد التثبيت، وسيظهر تطبيق إديو-جرافيك فوراً مع تطبيقات هاتفك كبرنامج رسمي مستقل!"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. iOS (iPhone / iPad) Flow */}
          {(device.platform === "ios" || device.platform === "tablet") && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-blue-950/30 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {isEn ? "How to Install on Apple iPhone (Safari):" : "طريقة التنزيل والتثبيت على الآيفون (iPhone):"}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Safari</span>
              </div>

              {/* iOS Step 1 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{isEn ? "Tap the Share button" : "اضغط على زر المشاركة (Share)"}</span>
                    <span className="p-1 rounded bg-blue-600/30 text-blue-400 border border-blue-500/40 inline-flex">
                      <Share className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isEn
                      ? "Located at the bottom toolbar in Safari."
                      : "الموجود في الشريط السفلي لمتصفح سفاري (Safari)."}
                  </p>
                </div>
              </div>

              {/* iOS Step 2 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>
                      {isEn ? "Choose 'Add to Home Screen'" : "اختر «إضافة إلى الصفحة الرئيسية»"}
                    </span>
                    <span className="p-1 rounded bg-slate-800 text-slate-200 border border-slate-700 inline-flex">
                      <PlusSquare className="w-3.5 h-3.5 text-blue-400" />
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isEn
                      ? "Scroll down the share sheet until you see the plus icon."
                      : "مرر قائمة المشاركة للأعلى حتى تجد علامة الزائد (+)."}
                  </p>
                </div>
              </div>

              {/* iOS Step 3 */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white">
                    {isEn ? "Tap 'Add' in the top right" : "اضغط على كلمة «إضافة» (Add) في أعلى الشاشة"}
                  </div>
                  <p className="text-[11px] text-emerald-400/90 mt-0.5 font-medium">
                    {isEn
                      ? "Done! EduGraphic will appear on your Home Screen as a native app."
                      : "مبروك! سيظهر تطبيق إديو-جرافيك فوراً على شاشة هاتفك الرئيسية ويعمل كبرنامج كامل."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* C. Desktop Flow (PC / Mac) */}
          {device.platform === "desktop" && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isEn ? "Desktop Installation:" : "التثبيت على أجهزة الكمبيوتر والمكتبي:"}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isEn
                  ? "Click the install icon in your browser's address bar (Chrome, Edge) to run EduGraphic as a fast desktop app on Windows or Mac."
                  : "انقر على رمز التثبيت (🖥️) الموجود في شريط عنوان المتصفح (Chrome أو Edge) لتشغيل إديو-جرافيك كتطبيق مكتبي سريع ومستقل."}
              </p>
              {canInstallNative && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={isInstalling || installSuccess}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{isEn ? "Install Desktop App" : "تثبيت البرنامج على الكمبيوتر الآن"}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {isEn ? "EduGraphic AI • Free & Instant" : "إديو-جرافيك • خفيف ومجاني بالكامل"}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer text-center"
            >
              {isEn ? "Continue in Browser" : "استخدام البرنامج في المتصفح الآن"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
