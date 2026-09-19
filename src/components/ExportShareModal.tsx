import React, { useState } from "react";
import {
  X,
  Printer,
  Copy,
  Download,
  Share2,
  Check,
  FileText,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Bookmark,
  BookmarkCheck,
  Send,
  HelpCircle,
  Layers,
  FileCode,
  Mail,
  QrCode,
} from "lucide-react";
import { DiagramAnalysis, LanguageMode } from "../types";
import { EduGraphicLogo } from "./EduGraphicLogo";
import { saveDiagramToNotes, isDiagramSavedInNotes } from "../utils/notesStorage";
import {
  generateQrDataUrl,
  downloadQrAsPng,
  downloadQrAsSvg,
} from "../utils/qrHelper";

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: DiagramAnalysis;
  languageMode: LanguageMode;
  userId?: string;
  onSavedToNotesCallback?: () => void;
  initialTab?: "export" | "share";
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  diagram,
  languageMode,
  userId,
  onSavedToNotesCallback,
  initialTab = "export",
}) => {
  const isEn = languageMode === "en";
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(() => isDiagramSavedInNotes(diagram.id, userId));
  const [activeTab, setActiveTab] = useState<"export" | "share">(initialTab);
  const [lessonQrUrl, setLessonQrUrl] = useState<string>("");
  const [isQrDownloading, setIsQrDownloading] = useState(false);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Specific Direct Link for this Educational Model
  const origin = typeof window !== "undefined" ? window.location.origin : "https://edugraphic.ai";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const educationalContentUrl = `${origin}${pathname}?model=${encodeURIComponent(diagram.id)}`;
  const currentUrl = educationalContentUrl;

  React.useEffect(() => {
    let isMounted = true;
    if (isOpen && currentUrl) {
      generateQrDataUrl(currentUrl, 700)
        .then((url) => {
          if (isMounted) setLessonQrUrl(url);
        })
        .catch(() => {
          if (isMounted) setLessonQrUrl("/edugraphic-qr.png");
        });
    }
    return () => {
      isMounted = false;
    };
  }, [currentUrl, isOpen]);

  const handleDownloadLessonQrPng = async () => {
    try {
      setIsQrDownloading(true);
      const safeTitle = (diagram.titleEn || diagram.titleAr || "lesson").replace(/[^a-zA-Z0-9_-]/g, "_");
      await downloadQrAsPng(currentUrl, `edugraphic-${safeTitle}-qr.png`);
    } finally {
      setIsQrDownloading(false);
    }
  };

  const handleDownloadLessonQrSvg = async () => {
    try {
      setIsQrDownloading(true);
      const safeTitle = (diagram.titleEn || diagram.titleAr || "lesson").replace(/[^a-zA-Z0-9_-]/g, "_");
      await downloadQrAsSvg(currentUrl, `edugraphic-${safeTitle}-qr.svg`);
    } finally {
      setIsQrDownloading(false);
    }
  };

  const generateFormattedText = () => {
    let text = `📚 ملخص درس إديو-جرافيك: ${diagram.titleAr} (${diagram.titleEn})\n`;
    text += `المادة: ${diagram.subjectAr} | المرحلة: ${diagram.gradeLevelAr}\n\n`;
    text += `📝 نظرة عامة والشرح المنظم:\n${diagram.directSummaryAr || diagram.summaryAr}\n\n`;
    
    if (diagram.simpleSummaryAr) {
      text += `🌱 شرح مبسط للطالب:\n${diagram.simpleSummaryAr}\n\n`;
    }
    if (diagram.detailedExplanationAr && diagram.detailedExplanationAr !== diagram.summaryAr) {
      text += `🔬 شرح بالتفصيل (متعمق):\n${diagram.detailedExplanationAr}\n\n`;
    }

    text += `🔬 أجزاء ومكونات الرسم:\n`;
    diagram.parts.forEach((p, idx) => {
      text += `${idx + 1}. ${p.nameAr} (${p.nameEn})\n`;
      text += `   - الوظيفة: ${p.functionAr}\n`;
      text += `   - الوصف: ${p.descriptionAr}\n`;
      if (p.relationToOtherPartsAr) text += `   - علاقته بباقي الأجزاء: ${p.relationToOtherPartsAr}\n`;
      if (p.keyFactAr) text += `   - معلومة هامة: ${p.keyFactAr}\n`;
      text += `\n`;
    });

    if (diagram.quiz && diagram.quiz.length > 0) {
      text += `❓ أسئلة الاختبار النموذجي:\n`;
      diagram.quiz.forEach((q, idx) => {
        text += `س ${idx + 1}: ${q.questionAr}\n`;
        q.optionsAr.forEach((opt, optIdx) => {
          text += `   ${optIdx === q.correctAnswerIndex ? "✓" : "•"} ${opt}\n`;
        });
        text += `   تفسير الإجابة: ${q.explanationAr}\n\n`;
      });
    }

    if (diagram.keyTakeawaysAr && diagram.keyTakeawaysAr.length > 0) {
      text += `💡 نقاط رئيسية للمذاكرة:\n`;
      diagram.keyTakeawaysAr.forEach((point) => {
        text += `• ${point}\n`;
      });
      text += `\n`;
    }

    text += `رابط الدرس التفاعلي: ${currentUrl}\n`;
    text += `تم إنشاء هذا المحتوى التعليمي بواسطة منصة إديو-جرافيك (EduGraphic)`;
    return text;
  };

  const handleCopyNotes = async () => {
    const text = generateFormattedText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn("Copy link failed:", err);
    }
  };

  const handleSaveToNotes = () => {
    saveDiagramToNotes(diagram, undefined, userId);
    setIsSaved(true);
    if (onSavedToNotesCallback) onSavedToNotesCallback();
  };

  // 1. PDF / Printable Export
  const handlePrintPdf = () => {
    window.print();
  };

  // 2. Word Document (.doc) Export
  const handleDownloadWord = () => {
    const title = diagram.titleAr;
    const partsRows = diagram.parts
      .map(
        (p, idx) => `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold;">${p.nameAr} (${p.nameEn})</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${p.functionAr}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${p.descriptionAr}</td>
        </tr>
      `
      )
      .join("");

    const quizRows = diagram.quiz
      .map(
        (q, idx) => `
        <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <p style="font-weight: bold; margin: 0 0 8px 0;">س ${idx + 1}: ${q.questionAr}</p>
          <ul style="margin: 0 0 8px 0; padding-right: 20px;">
            ${q.optionsAr
              .map(
                (opt, oIdx) =>
                  `<li style="${oIdx === q.correctAnswerIndex ? 'color: #059669; font-weight: bold;' : ''}">${opt} ${oIdx === q.correctAnswerIndex ? '(الإجابة الصحيحة)' : ''}</li>`
              )
              .join("")}
          </ul>
          <p style="font-size: 11pt; color: #475569; margin: 0;"><b>التعليل:</b> ${q.explanationAr}</p>
        </div>
      `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, 'Cairo', sans-serif; line-height: 1.6; color: #0f172a; padding: 20px; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
          h2 { color: #0f766e; margin-top: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .meta { color: #64748b; font-size: 11pt; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; text-align: right; }
          .badge { background: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>📚 منصة إديو-جرافيك | ${diagram.titleAr}</h1>
        <div class="meta">
          <span class="badge">${diagram.subjectAr}</span> | 
          <span>المرحلة: ${diagram.gradeLevelAr}</span> | 
          <span>تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")}</span>
        </div>

        <h2>📖 ملخص المحتوى والشرح العلمي</h2>
        <p>${diagram.directSummaryAr || diagram.summaryAr}</p>

        <h2>🔬 جدول المكونات والأجزاء (${diagram.parts.length} عناصر)</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>الجزء والمصطلح</th>
              <th>الوظيفة والمسؤولية</th>
              <th>الشرح العلمي</th>
            </tr>
          </thead>
          <tbody>
            ${partsRows}
          </tbody>
        </table>

        <h2>❓ أسئلة الاختبار الذاتي ونموذج الإجابة</h2>
        ${quizRows}

        <p style="margin-top: 30px; font-size: 10pt; color: #94a3b8; text-align: center;">
          تم إنشاء هذا الملف التعليمي عبر منصة EduGraphic للرسوم التعليمية التفاعلية
        </p>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + htmlContent], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EduGraphic_${diagram.titleEn.replace(/\s+/g, "_")}_Notes.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 3. Separate Image Download
  const handleDownloadImage = () => {
    const a = document.createElement("a");
    a.href = diagram.imageUrl;
    a.download = `EduGraphic_${diagram.titleEn.replace(/\s+/g, "_")}_image.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 4. Separate Text / Markdown Download
  const handleDownloadMarkdown = () => {
    const text = generateFormattedText();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EduGraphic_${diagram.titleEn.replace(/\s+/g, "_")}_summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Social Sharing Official URLs
  const shareText = isEn
    ? `📚 Explore this interactive study model (${diagram.titleEn || diagram.titleAr}) in ${diagram.subjectEn || diagram.subjectAr} with parts exploration, quiz & study guide on EduGraphic:`
    : `📚 اكتشف هذا الشرح التفاعلي الرائع لـ (${diagram.titleAr}) في مادة ${diagram.subjectAr} مع استكشاف الأجزاء والاختبار التفاعلي عبر منصة إديو-جرافيك:`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + currentUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareX = () => {
    const text = isEn
      ? `Interactive study model: ${diagram.titleEn || diagram.titleAr} (${diagram.subjectEn || diagram.subjectAr}) on EduGraphic:`
      : `نموذج دراسي تفاعلي: ${diagram.titleAr} (${diagram.subjectAr}) عبر منصة إديو-جرافيك:`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(
      isEn
        ? `Educational Model: ${diagram.titleEn || diagram.titleAr} (${diagram.subjectEn || diagram.subjectAr})`
        : `نموذج تعليمي: ${diagram.titleAr} (${diagram.subjectAr})`
    );
    const body = encodeURIComponent(
      `${shareText}\n\n${isEn ? "Direct Model Link:" : "رابط النموذج التعليمي المباشر:"}\n${currentUrl}\n\nEduGraphic Platform`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareSnapchat = () => {
    const url = `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareInstagram = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `إديو-جرافيك: ${diagram.titleAr}`,
          text: shareText,
          url: currentUrl,
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
      alert(
        isEn
          ? "Link copied! You can now paste it into your Instagram Story or direct message."
          : "تم نسخ الرابط! يمكنك الآن لصقه في ستوري إنستغرام أو مشاركته مع زملائك في الرسائل الخاصة."
      );
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `إديو-جرافيك: ${diagram.titleAr}`,
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        console.warn("Share cancelled:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center p-1 shadow-xs">
              <EduGraphicLogo size="sm" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {activeTab === "share"
                  ? isEn
                    ? "Share This Educational Model"
                    : "مشاركة هذا النموذج التعليمي"
                  : isEn
                  ? "Export & Download Study Card"
                  : "تصدير وتحميل البطاقة التعليمية"}
              </h2>
              <p className="text-xs text-slate-400">
                {activeTab === "share"
                  ? isEn
                    ? `Share "${diagram.titleEn || diagram.titleAr}" (${diagram.subjectEn || diagram.subjectAr}) with notes, quiz & parts`
                    : `مشاركة "${diagram.titleAr}" (مادة ${diagram.subjectAr}) والشرح والاختبار التفاعلي`
                  : isEn
                  ? "Save complete result as PDF, Word, or download diagram assets"
                  : "حفظ النتيجة كاملة كملف PDF أو Word أو تنزيل الصورة والشرح"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Export vs Social Share */}
        <div className="px-5 pt-3 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("export")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "export"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isEn ? "Save & Export Files" : "حفظ وتصدير الملفات"}</span>
          </button>
          <button
            onClick={() => setActiveTab("share")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "share"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>{isEn ? "Social Media Sharing" : "المشاركة عبر المنصات"}</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === "export" ? (
            <div className="space-y-4">
              {/* Primary Formats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PDF Export */}
                <button
                  onClick={handlePrintPdf}
                  className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:border-blue-500 text-slate-100 transition-all shadow-md text-start flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">
                      {isEn ? "Save as PDF (Printable)" : "حفظ كملف PDF منظم للطباعة"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isEn ? "Includes image, analysis & full quiz" : "يتضمن الصورة، الشرح، وجدول الأجزاء والاختبار"}
                    </div>
                  </div>
                </button>

                {/* Word Document Export */}
                <button
                  onClick={handleDownloadWord}
                  className="p-3.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:border-emerald-500 text-slate-100 transition-all shadow-md text-start flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">
                      {isEn ? "Download Word Doc (.doc)" : "تنزيل مستند Word (.doc)"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isEn ? "Editable document for Microsoft Word" : "ملف قابل للتعديل يحتوي على الجداول والأسئلة"}
                    </div>
                  </div>
                </button>
              </div>

              {/* Secondary Downloads: Image & Text Separately */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isEn ? "Download Elements Separately:" : "تنزيل المحتويات بشكل منفصل:"}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {/* Image only */}
                  <button
                    onClick={handleDownloadImage}
                    className="p-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>{isEn ? "Download Image" : "تنزيل الصورة"}</span>
                  </button>

                  {/* Markdown Text only */}
                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span>{isEn ? "Download Notes (.md)" : "تنزيل الشرح (.md)"}</span>
                  </button>

                  {/* Copy all text */}
                  <button
                    onClick={handleCopyNotes}
                    className="p-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                    <span>{copied ? (isEn ? "Copied!" : "تم النسخ!") : (isEn ? "Copy Text" : "نسخ الشرح")}</span>
                  </button>

                  {/* QR Code (PNG) */}
                  <button
                    onClick={handleDownloadLessonQrPng}
                    disabled={isQrDownloading}
                    className="p-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors flex items-center gap-2 cursor-pointer font-medium disabled:opacity-50"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>{isEn ? "Lesson QR (PNG)" : "رمز QR للدرس (PNG)"}</span>
                  </button>
                </div>
              </div>

              {/* Save to My Notes Action */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isEn ? "Save in My Notes" : "حفظ في قسم ملاحظاتي"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isEn ? "Keep this lesson, quiz, and video accessible anytime" : "احتفظ بالصورة والشرح والاختبار في حسابك للرجوع إليها لاحقاً"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveToNotes}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSaved
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                      : "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isSaved ? (isEn ? "Saved" : "تم الحفظ") : (isEn ? "Save to Notes" : "حفظ في ملاحظاتي")}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Context Banner distinguishing educational content sharing */}
              <div className="p-3 rounded-xl border border-indigo-800/60 bg-indigo-950/40 text-indigo-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">
                    {isEn ? "Educational Model Sharing:" : "مشاركة محتوى هذا النموذج التعليمي:"}
                  </div>
                  <p className="text-indigo-300/90 leading-relaxed">
                    {isEn
                      ? `You are sharing the full educational content of "${diagram.titleEn || diagram.titleAr}" (${diagram.subjectEn || diagram.subjectAr}), including its diagram parts, quiz, notes, and study guide.`
                      : `أنت تشارك المحتوى التعليمي الكامل لدرس "${diagram.titleAr}" (${diagram.subjectAr})، بما يشمل أجزاء الرسم والشرح النصي والاختبار التفاعلي.`}
                  </p>
                </div>
              </div>

              {/* Official Social Sharing Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="p-2.5 rounded-xl border border-emerald-800/80 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                    WA
                  </div>
                  <span className="truncate">واتساب</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleShareTelegram}
                  className="p-2.5 rounded-xl border border-sky-800/80 bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                    TG
                  </div>
                  <span className="truncate">تليجرام</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleShareFacebook}
                  className="p-2.5 rounded-xl border border-blue-800/80 bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    FB
                  </div>
                  <span className="truncate">فيسبوك</span>
                </button>

                {/* X (Twitter) */}
                <button
                  onClick={handleShareX}
                  className="p-2.5 rounded-xl border border-slate-700 bg-slate-950/60 hover:bg-slate-850 text-slate-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-black border border-slate-750 text-white flex items-center justify-center font-black text-xs shrink-0">
                    𝕏
                  </div>
                  <span className="truncate">منصة 𝕏</span>
                </button>

                {/* Email */}
                <button
                  onClick={handleShareEmail}
                  className="p-2.5 rounded-xl border border-violet-800/80 bg-violet-950/40 hover:bg-violet-900/60 text-violet-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">البريد الإلكتروني</span>
                </button>

                {/* Instagram */}
                <button
                  onClick={handleShareInstagram}
                  className="p-2.5 rounded-xl border border-pink-800/80 bg-pink-950/40 hover:bg-pink-900/60 text-pink-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    IG
                  </div>
                  <span className="truncate">إنستغرام</span>
                </button>

                {/* Snapchat */}
                <button
                  onClick={handleShareSnapchat}
                  className="p-2.5 rounded-xl border border-yellow-800/80 bg-yellow-950/40 hover:bg-yellow-900/60 text-yellow-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-yellow-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">
                    SC
                  </div>
                  <span className="truncate">سناب شات</span>
                </button>

                {/* System Native Share */}
                <button
                  onClick={handleNativeShare}
                  className="p-2.5 rounded-xl border border-indigo-800/80 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">مشاركة الجهاز</span>
                </button>
              </div>

              {/* Direct Model Link Copy Strip */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                  <span>{isEn ? "Direct Educational Model Link:" : "رابط هذا النموذج التعليمي المباشر:"}</span>
                  <span className="text-[10px] text-blue-400 font-normal">
                    {isEn ? "Opens this specific lesson directly" : "يفتح هذا الدرس المحدد مباشرة"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 focus:outline-hidden font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (isEn ? "Copied" : "تم النسخ") : (isEn ? "Copy Model Link" : "نسخ رابط النموذج")}</span>
                  </button>
                </div>
              </div>

              {/* Clear High-Resolution Lesson QR Code & Ready File Section */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <QrCode className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {isEn ? "Lesson QR Code" : "رمز QR المباشر لهذا الدرس"}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {isEn ? "High Resolution" : "جاهز وعالي الدقة"}
                  </span>
                </div>

                {/* QR Display Frame */}
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center">
                  <img
                    src={lessonQrUrl || "/edugraphic-qr.png"}
                    alt="Lesson QR Code"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="mt-2 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <EduGraphicLogo size="sm" />
                    <span className="truncate max-w-[180px]">{diagram.titleAr}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center max-w-xs leading-relaxed">
                  {isEn
                    ? "Scan with your camera to open this lesson directly, or download the ready QR image file below."
                    : "امسح الرمز لفتح هذا الدرس مباشرة بكاميرا الهاتف، أو حمّل ملف الرمز الجاهز للمشاركة والطباعة."}
                </p>

                {/* File Download Buttons */}
                <div className="w-full grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadLessonQrPng}
                    disabled={isQrDownloading}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEn ? "Save QR (PNG)" : "تحميل ملف صورة (PNG)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadLessonQrSvg}
                    disabled={isQrDownloading}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isEn ? "Vector (SVG)" : "ملف متجهي (SVG)"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Printable Sheet View for Instant Preview */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/70 space-y-3 print:border-none print:p-0">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-bold text-blue-400">
                  {diagram.subjectAr} • {diagram.gradeLevelAr}
                </span>
                <h4 className="text-sm font-bold text-white">{diagram.titleAr}</h4>
              </div>
              <EduGraphicLogo size="sm" />
            </div>

            <div className="flex gap-3 items-center justify-between">
              <div className="flex gap-3 items-center flex-1">
                <img
                  src={diagram.imageUrl}
                  alt="Thumbnail"
                  className="w-20 h-20 rounded-lg object-contain bg-black border border-slate-800 shrink-0"
                />
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {diagram.directSummaryAr || diagram.summaryAr}
                </p>
              </div>
              {lessonQrUrl && (
                <div className="p-1.5 bg-white rounded-lg shrink-0 border border-slate-700 text-center">
                  <img
                    src={lessonQrUrl}
                    alt="Lesson QR"
                    className="w-16 h-16 object-contain"
                  />
                  <div className="text-[8px] text-slate-800 font-bold">QR الدرس</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isEn ? "Close" : "إغلاق"}
          </button>
        </div>
      </div>
    </div>
  );
};
