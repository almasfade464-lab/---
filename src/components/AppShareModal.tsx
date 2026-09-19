import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Mail,
  Smartphone,
  QrCode,
  Sparkles,
  Info,
  Download,
  Printer,
  ExternalLink,
  Package,
} from "lucide-react";
import { EduGraphicLogo } from "./EduGraphicLogo";
import { ThemeMode, LanguageMode } from "../types";
import {
  generateQrDataUrl,
  downloadQrAsPng,
  downloadQrAsSvg,
} from "../utils/qrHelper";

interface AppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
  onOpenInstallModal?: () => void;
}

export const AppShareModal: React.FC<AppShareModalProps> = ({
  isOpen,
  onClose,
  themeMode = "light",
  languageMode = "ar",
  onOpenInstallModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const [localQrUrl, setLocalQrUrl] = useState<string>("/edugraphic-qr.png");
  const [isDownloading, setIsDownloading] = useState(false);

  const isDark = themeMode === "dark";
  const isEn = languageMode === "en";

  // Base platform URL (strictly root domain / origin)
  const appUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://edugraphic.ai";

  // QR code URL tailored to auto-detect phone & offer app install
  const qrInstallUrl = `${appUrl}/?scan=qr&install=1`;

  const appTitle = isEn
    ? "EduGraphic – AI Platform for Learning & Image Analysis"
    : "إديو-جرافيك – منصة الذكاء الاصطناعي للتعلم وتحليل الصور";

  const appDescription = isEn
    ? "A smart AI-powered platform for screen capture, textbook & diagram analysis, interactive quizzes, and visual study guides."
    : "منصة تعليمية ذكية لالتقاط الشاشة وتحليل الصور والمخططات والكتب المدرسية بالذكاء الاصطناعي، وتحويلها لشروحات تفاعلية واختبارات وملخصات صوتية.";

  const fullShareText = `${appTitle}\n${appDescription}\n`;

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      generateQrDataUrl(qrInstallUrl, 700)
        .then((url) => {
          if (isMounted && url) {
            setLocalQrUrl(url);
          }
        })
        .catch(() => {
          if (isMounted) setLocalQrUrl("/edugraphic-qr.png");
        });
    }
    return () => {
      isMounted = false;
    };
  }, [qrInstallUrl, isOpen]);

  const handleDownloadPng = async () => {
    try {
      setIsDownloading(true);
      await downloadQrAsPng(qrInstallUrl, "edugraphic-app-qr.png");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSvg = async () => {
    try {
      setIsDownloading(true);
      await downloadQrAsSvg(qrInstallUrl, "edugraphic-app-qr.svg");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenPrintableCard = () => {
    window.open("/edugraphic-qr-card.html", "_blank");
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const input = document.createElement("input");
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: appTitle,
          text: fullShareText,
          url: appUrl,
        });
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      fullShareText + "\n" + appUrl
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      appUrl
    )}&text=${encodeURIComponent(fullShareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      appUrl
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleXTwitter = () => {
    const text = isEn
      ? `Discover EduGraphic – AI Platform for Visual Learning & Diagram Understanding:`
      : `اكتشف منصة إديو-جرافيك الرائدة للتعلم الذكي وتحليل الصور والمخططات:`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      appUrl
    )}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(appTitle);
    const body = encodeURIComponent(
      `${fullShareText}\n\n${isEn ? "Visit platform:" : "زيارة المنصة:"} ${appUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Safe QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    appUrl
  )}`;

  if (!isOpen) return null;

  return (
    <div
      id="app-share-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isDark
            ? "bg-[#0B1528] border-slate-800 text-slate-100 shadow-blue-950/40"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? "bg-[#08101E] border-slate-800/90" : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center p-1.5 shadow-xs">
              <EduGraphicLogo size="sm" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>{isEn ? "Share EduGraphic Platform" : "مشاركة منصة إديو-جرافيك"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                  {isEn ? "App Only" : "البرنامج فقط"}
                </span>
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isEn
                  ? "Share the EduGraphic app link and invite others"
                  : "مشاركة رابط المنصة ودعوة الأصدقاء والزملاء"}
              </p>
            </div>
          </div>
          <button
            id="close-app-share-modal-btn"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title={isEn ? "Close" : "إغلاق"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4.5 overflow-y-auto">
          {/* Distinct Distinction Banner: No diagram or photo is attached */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
              isDark
                ? "bg-blue-950/30 border-blue-800/50 text-blue-200"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
            <div>
              <span className="font-bold">
                {isEn ? "Main App Share:" : "مشاركة التطبيق الأساسية:"}
              </span>{" "}
              {isEn
                ? "You are sharing the EduGraphic platform itself. No current diagram, image, or study notes will be attached."
                : "أنت تشارك رابط برنامج إديو-جرافيك الرئيسي للآخرين، ولن يتم إرفاق أي صورة أو شرح تعليمي حالي."}
            </div>
          </div>

          {/* Platform Preview Card */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              isDark
                ? "bg-slate-900/70 border-slate-800"
                : "bg-slate-50 border-slate-200/80"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                {appTitle}
              </h3>
            </div>
            <p
              className={`text-xs line-clamp-2 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {appDescription}
            </p>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-1.5">
            <label
              className={`text-xs font-bold block ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {isEn ? "Direct App Link:" : "رابط المنصة المباشر:"}
            </label>
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono select-all overflow-hidden ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{appUrl}</span>
              </div>
              <button
                id="copy-app-link-btn"
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEn ? "Copied!" : "تم النسخ!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{isEn ? "Copy Link" : "نسخ الرابط"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Platforms Grid */}
          <div className="space-y-2">
            <label
              className={`text-xs font-bold block ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {isEn ? "Share via Social Networks:" : "مشاركة عبر شبكات التواصل:"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* WhatsApp */}
              <button
                id="share-app-whatsapp"
                onClick={handleWhatsApp}
                className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                  WA
                </div>
                <div className="truncate">
                  <div>واتساب</div>
                  <div className="text-[10px] opacity-75 font-normal">WhatsApp</div>
                </div>
              </button>

              {/* Telegram */}
              <button
                id="share-app-telegram"
                onClick={handleTelegram}
                className="p-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                  TG
                </div>
                <div className="truncate">
                  <div>تليجرام</div>
                  <div className="text-[10px] opacity-75 font-normal">Telegram</div>
                </div>
              </button>

              {/* Facebook */}
              <button
                id="share-app-facebook"
                onClick={handleFacebook}
                className="p-2.5 rounded-xl border border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  FB
                </div>
                <div className="truncate">
                  <div>فيسبوك</div>
                  <div className="text-[10px] opacity-75 font-normal">Facebook</div>
                </div>
              </button>

              {/* X (Twitter) */}
              <button
                id="share-app-x"
                onClick={handleXTwitter}
                className="p-2.5 rounded-xl border border-slate-500/30 bg-slate-500/10 hover:bg-slate-500/20 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs shrink-0">
                  𝕏
                </div>
                <div className="truncate">
                  <div>منصة 𝕏</div>
                  <div className="text-[10px] opacity-75 font-normal">Twitter / X</div>
                </div>
              </button>

              {/* Email */}
              <button
                id="share-app-email"
                onClick={handleEmail}
                className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div>البريد</div>
                  <div className="text-[10px] opacity-75 font-normal">Email</div>
                </div>
              </button>

              {/* Native Share (Phone / OS) */}
              <button
                id="share-app-native"
                onClick={handleNativeShare}
                className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div>تطبيقات الجهاز</div>
                  <div className="text-[10px] opacity-75 font-normal">Web Share</div>
                </div>
              </button>
            </div>
          </div>

          {/* Clear High-Resolution QR Code & Ready File Section */}
          <div
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-colors ${
              isDark
                ? "bg-slate-950/80 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isEn ? "Ready QR Code" : "رمز الاستجابة السريعة (QR) الجاهز"}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {isEn ? "Ultra Clear 600dpi" : "عالي الدقة والوضوح"}
              </span>
            </div>

            {/* Clear QR Frame */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/80 flex flex-col items-center">
              <img
                src={localQrUrl}
                alt="EduGraphic App QR Code"
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="mt-2 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <EduGraphicLogo size="sm" />
                <span>EduGraphic AI</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 text-center w-full max-w-sm space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-blue-300 font-bold text-xs">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>
                  {isEn
                    ? "Smart Phone Detection on QR Scan"
                    : "التعرف الذكي على الهاتف عند مسح الرمز"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isEn
                  ? "Scanning automatically detects whether the phone is an iPhone or Android, shows an app mockup image, and provides 1-tap installation to use it like a real native app!"
                  : "عند مسح الرمز بكاميرا الهاتف، يتعرف النظام تلقائياً على نوع جهازك (iPhone أو Android) ويعطيك تنزيل وتثبيت البرنامج مع صورة ومعاينة كاملة ليعمل كبرنامج أصلي على الشاشة الرئيسية!"}
              </p>
              {onOpenInstallModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInstallModal();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>
                    {isEn
                      ? "Test Phone Detection & Install Screen"
                      : "معاينة شاشة تثبيت وتعرف الهاتف الآن"}
                  </span>
                </button>
              )}
            </div>

            {/* Ready File Download Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* Download PNG */}
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isDownloading}
                className="py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                title={isEn ? "Download as PNG image file" : "تنزيل الرمز كملف صورة PNG"}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isEn ? "Save PNG File" : "تحميل ملف PNG"}</span>
              </button>

              {/* Download SVG */}
              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={isDownloading}
                className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                }`}
                title={isEn ? "Download as vector SVG file" : "تنزيل الرمز كملف متجهي SVG"}
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>{isEn ? "Vector SVG" : "ملف متجهي SVG"}</span>
              </button>

              {/* Open Printable Card */}
              <button
                type="button"
                onClick={handleOpenPrintableCard}
                className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                }`}
                title={isEn ? "Open printable flyer card" : "فتح بطاقة الطباعة والملصق"}
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isEn ? "Print Card" : "بطاقة للطباعة"}</span>
              </button>
            </div>

            {/* Direct Full Source Code ZIP Download */}
            <div className="w-full pt-1">
              <a
                href="/edugraphic-source.zip"
                download="إديو-جرافيك.zip"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-center"
                title={
                  isEn
                    ? "Download Complete Project Source Code (إديو-جرافيك.zip)"
                    : "تنزيل الكود المصدري للمشروع كاملًا (إديو-جرافيك.zip)"
                }
              >
                <Package className="w-4 h-4 shrink-0" />
                <span>
                  {isEn
                    ? "Download Full Source Code (إديو-جرافيك.zip)"
                    : "تنزيل الكود المصدري للمشروع كاملًا (إديو-جرافيك.zip)"}
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-end ${
            isDark ? "bg-[#08101E] border-slate-800/90" : "bg-slate-50 border-slate-100"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
          >
            {isEn ? "Close" : "إغلاق"}
          </button>
        </div>
      </div>
    </div>
  );
};
