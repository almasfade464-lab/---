import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Camera,
  BookOpen,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Crop,
  ZoomIn,
  ZoomOut,
  Sliders,
  Sparkles,
  ArrowRight,
  Eye,
  ScanLine,
  Cpu,
  Monitor,
  Clipboard,
  FileCode,
  HelpCircle,
  Layers,
} from "lucide-react";
import { compressImage, CompressionResult } from "../utils/imageCompressor";
import { captureScreen, extractImageFromClipboard } from "../utils/screenCapture";
import { SAMPLE_DIAGRAMS } from "../data/sampleDiagrams";
import {
  DiagramAnalysis,
  LanguageMode,
  ThemeMode,
  VisionSession,
  VisionAnalysisIntent,
} from "../types";
import { ImageCropper } from "./ImageCropper";
import { getApiUrl } from "../utils/apiConfig";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: DiagramAnalysis) => void;
  onVisionAnalysisStart?: (session: VisionSession) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  initialTab?: "screen" | "upload" | "camera" | "samples";
  languageMode?: LanguageMode;
  themeMode?: ThemeMode;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  onVisionAnalysisStart,
  isAnalyzing,
  setIsAnalyzing,
  initialTab = "screen",
  languageMode = "ar",
  themeMode = "light",
}) => {
  const isEn = languageMode === "en";
  const isDark = themeMode === "dark";
  const [activeTab, setActiveTab] = useState<"screen" | "upload" | "camera" | "samples">(
    initialTab
  );
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rawCapturedImage, setRawCapturedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [compressionInfo, setCompressionInfo] =
    useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [activeScanStage, setActiveScanStage] = useState<number>(1);

  // Camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">(
    "environment"
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [zoomCaps, setZoomCaps] = useState<{ min: number; max: number; step: number }>({
    min: 1,
    max: 3,
    step: 0.1,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Start / stop camera stream based on activeTab
  useEffect(() => {
    if (isOpen && activeTab === "camera" && !previewImage && !isCropping) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, cameraFacing, previewImage, isCropping]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);

      // Inspect zoom capabilities if device camera supports hardware zoom
      const track = stream.getVideoTracks()[0];
      if (track && (track as any).getCapabilities) {
        const caps = (track as any).getCapabilities();
        if (caps && caps.zoom) {
          setZoomCaps({
            min: caps.zoom.min || 1,
            max: caps.zoom.max || 3,
            step: caps.zoom.step || 0.1,
          });
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        isEn
          ? "Unable to access device camera. Please grant camera permissions or choose to upload a file."
          : "تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الإذن للمتصفح أو استخدام خيار رفع ملف."
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Hardware and digital zoom handler
  const handleZoomChange = async (newZoom: number) => {
    setZoomLevel(newZoom);
    if (cameraStream) {
      const track = cameraStream.getVideoTracks()[0];
      if (track && (track as any).applyConstraints) {
        try {
          await (track as any).applyConstraints({
            advanced: [{ zoom: newZoom }],
          });
        } catch (e) {
          // Digital zoom fallback handles the view via CSS scale
        }
      }
    }
  };

  // Shutter capture -> transition directly to Crop & Preview step
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply digital zoom crop if zoomed in
    if (zoomLevel > 1) {
      const cropW = vw / zoomLevel;
      const cropH = vh / zoomLevel;
      const cropX = (vw - cropW) / 2;
      const cropY = (vh - cropH) / 2;
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, vw, vh);
    } else {
      ctx.drawImage(video, 0, 0, vw, vh);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    stopCamera();

    // Directly open Crop & Preview mode
    setRawCapturedImage(dataUrl);
    setIsCropping(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Automatically process and analyze the uploaded file
      await processSelectedImage(file, true);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Automatically process and analyze dropped image
      await processSelectedImage(file, true);
    }
  };

  // Global clipboard paste listener for screenshots (PrtScn / Cmd+Shift+4 / Snip tool)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!isOpen || isAnalyzing) return;
      const dataUrl = await extractImageFromClipboard(e);
      if (dataUrl) {
        e.preventDefault();
        setRawCapturedImage(dataUrl);
        await processSelectedImage(dataUrl, true);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, isAnalyzing]);

  const handleScreenCaptureClick = async () => {
    setError(null);
    try {
      const captureResult = await captureScreen();
      if (captureResult && captureResult.dataUrl) {
        setRawCapturedImage(captureResult.dataUrl);
        await processSelectedImage(captureResult.dataUrl, true);
      }
    } catch (err: any) {
      console.error("Screen capture error:", err);
      setError(
        isEn
          ? "Screen capture cancelled or not supported by browser. Try pasting with Ctrl+V or uploading a file."
          : "تم إلغاء التقاط الشاشة أو غير مدعوم في المتصفح. يمكنك لصق لقطة الشاشة بالضغط على Ctrl+V أو رفع ملف."
      );
    }
  };

  const handleCropConfirmed = async (croppedDataUrl: string) => {
    setIsCropping(false);
    await processSelectedImage(croppedDataUrl, true);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    if (!previewImage && rawCapturedImage) {
      // User cancelled crop without previous preview: analyze full image
      processSelectedImage(rawCapturedImage, true);
    }
  };

  const processSelectedImage = async (
    fileOrDataUrl: File | string,
    autoAnalyze: boolean = true
  ) => {
    setError(null);
    try {
      setAnalysisStep(
        isEn ? "Analyzing image..." : "جاري تحليل الصورة..."
      );
      const compressed = await compressImage(fileOrDataUrl, 1400, 1400, 0.88);
      setCompressionInfo(compressed);
      setPreviewImage(compressed.base64);

      if (autoAnalyze) {
        await runGeminiAnalysis(compressed);
      }
    } catch (err: any) {
      console.error("Image processing error:", err);
      setError(
        isEn
          ? "Unable to analyze the image at this time. Please try again."
          : "تعذر تحليل الصورة حاليًا. حاول مرة أخرى."
      );
    }
  };

  const runGeminiAnalysis = async (overrideInfo?: CompressionResult) => {
    const targetInfo = overrideInfo || compressionInfo;
    if (!targetInfo) return;

    setIsAnalyzing(true);
    setError(null);
    setActiveScanStage(1);
    setAnalysisStep(isEn ? "Analyzing image..." : "جاري تحليل الصورة...");

    try {
      const response = await fetch(getApiUrl("/api/analyze-diagram"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: targetInfo.base64,
          mimeType: targetInfo.mimeType,
        }),
      });

      const result = await response.json();

      // Check if image was rejected by AI as unclear, dark, or analysis failed
      if (!result.success || result.isValid === false || result.status === "unclear") {
        const rejectionMsg = isEn
          ? result.rejectionReasonEn || result.messageEn || result.error || "Unable to analyze the image at this time. Please try again."
          : result.rejectionReasonAr || result.messageAr || result.error || "تعذر تحليل الصورة حاليًا. حاول مرة أخرى.";
        setError(rejectionMsg);
        setIsAnalyzing(false);
        setAnalysisStep("");
        return;
      }

      setAnalysisStep(
        isEn ? "Image analyzed" : "تم تحليل الصورة"
      );

      const data = result.data;
      if (!data) {
        throw new Error(isEn ? "No analysis data returned" : "لم يتم استرجاع بيانات صالحة");
      }

      const completedAnalysis: DiagramAnalysis = {
        id: "analysis-" + Date.now(),
        titleAr: data.titleAr || (isEn ? "Educational Content Analysis" : "تحليل المحتوى التعليمي"),
        titleEn: data.titleEn || "Educational Content Analysis",
        subjectAr: data.subjectAr || (isEn ? "General Science" : "العلوم العامة"),
        subjectEn: data.subjectEn || "General Science",
        gradeLevelAr: data.gradeLevelAr || (isEn ? "School Level" : "المرحلة الدراسية"),
        gradeLevelEn: data.gradeLevelEn || "School Level",
        summaryAr: data.summaryAr || "",
        summaryEn: data.summaryEn || "",
        simpleSummaryAr: data.simpleSummaryAr || data.summaryAr || "",
        simpleSummaryEn: data.simpleSummaryEn || data.summaryEn || "",
        detailedExplanationAr: data.detailedExplanationAr || data.summaryAr || "",
        detailedExplanationEn: data.detailedExplanationEn || data.summaryEn || "",
        modelType: data.modelType || "general_educational",
        contentType: data.contentType || "diagram",
        directSummaryAr: data.directSummaryAr || data.summaryAr || "",
        directSummaryEn: data.directSummaryEn || data.summaryEn || "",
        isRealVisionAnalysis: true,
        parts: data.parts || [],
        quiz: data.quiz || [],
        keyTakeawaysAr: data.keyTakeawaysAr || [],
        keyTakeawaysEn: data.keyTakeawaysEn || [],
        suggestedQuestionsAr: data.suggestedQuestionsAr || [],
        adaptiveExplanation: data.adaptiveExplanation,
        imageUrl: targetInfo.base64,
        createdAt: new Date().toISOString(),
      };

      onAnalysisComplete(completedAnalysis);
      onClose();
    } catch (err: any) {
      console.error("Image analysis error:", err);
      setError(
        isEn
          ? "Unable to analyze the image at this time. Please try again."
          : "تعذر تحليل الصورة حاليًا. حاول مرة أخرى."
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleSelectSample = (sample: DiagramAnalysis) => {
    onAnalysisComplete(sample);
    onClose();
  };

  if (!isOpen) return null;

  // Determine current pipeline active step
  const currentPipelineStep = isAnalyzing
    ? 4
    : previewImage
    ? 3
    : isCropping
    ? 2
    : 1;

  const pipelineSteps = [
    { id: 1, labelAr: "التصوير / الرفع", labelEn: "Capture / Upload" },
    { id: 2, labelAr: "المعاينة والقص", labelEn: "Preview & Crop" },
    { id: 3, labelAr: "معالجة الصورة", labelEn: "Process Image" },
    { id: 4, labelAr: "الفهم والتحليل بالذكاء الاصطناعي", labelEn: "Visual AI Analysis" },
    { id: 5, labelAr: "إنفوجرافيك تفاعلي", labelEn: "Interactive Infographic" },
  ];

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        className={`rounded-2xl max-w-2xl w-full shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? "bg-[#101C33] border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50/70 border-slate-100"
          }`}
        >
          <div>
            <h2 className="text-lg font-bold font-sans flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-500" />
              <span>{isEn ? "Textbook Camera & Diagram Analysis" : "التصوير والتحليل عبر الكاميرا"}</span>
            </h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isEn
                ? "Capture textbook diagrams directly, crop precisely, and transform into interactive infographics"
                : "التقط صور الكتب والمخططات مباشرة، عاين وقص الجزء المطلوب، وحولها إلى إنفوجرافيك تفاعلي"}
            </p>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            disabled={isAnalyzing}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Step Visual Educational Pipeline Banner */}
        <div
          className={`px-4 py-2 border-b text-[11px] overflow-x-auto whitespace-nowrap flex items-center justify-between gap-1.5 ${
            isDark ? "bg-[#080E1B] border-slate-800" : "bg-slate-100/70 border-slate-200"
          }`}
        >
          {pipelineSteps.map((step, idx) => {
            const isCompleted = currentPipelineStep > step.id;
            const isCurrent = currentPipelineStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold transition-all ${
                    isCurrent
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isCompleted
                      ? "text-emerald-500 font-bold"
                      : isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                      isCurrent
                        ? "bg-white text-emerald-700"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : isDark
                        ? "bg-slate-800 text-slate-400"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? "✓" : step.id}
                  </span>
                  <span>{isEn ? step.labelEn : step.labelAr}</span>
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <span className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-300"}`}>
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tabs Selection (Hidden when actively cropping or previewing) */}
        {!isCropping && !previewImage && !isAnalyzing && (
          <div
            className={`flex border-b px-4 sm:px-6 gap-2 sm:gap-6 overflow-x-auto ${
              isDark ? "bg-[#101C33] border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <button
              id="tab-screen"
              onClick={() => setActiveTab("screen")}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "screen"
                  ? "border-blue-500 text-blue-500 font-bold"
                  : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-200"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Monitor className="w-4 h-4 text-blue-500" />
              <span>{isEn ? "Screen Capture 🖥️" : "التقاط الشاشة 🖥️"}</span>
            </button>
            <button
              id="tab-upload"
              onClick={() => setActiveTab("upload")}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "upload"
                  ? "border-emerald-500 text-emerald-500 font-bold"
                  : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-200"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isEn ? "Upload / Paste 📁" : "رفع ملف / لصق 📁"}</span>
            </button>
            <button
              id="tab-camera"
              onClick={() => setActiveTab("camera")}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "camera"
                  ? "border-emerald-500 text-emerald-500 font-bold"
                  : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-200"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isEn ? "Live Camera 📷" : "الكاميرا المباشرة 📷"}</span>
            </button>
            <button
              id="tab-samples"
              onClick={() => setActiveTab("samples")}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "samples"
                  ? "border-emerald-500 text-emerald-500 font-bold"
                  : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-200"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isEn ? "Ready Samples" : "نماذج جاهزة"}</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {error && (
            <div className={`mb-5 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs ${
              isDark
                ? "bg-rose-950/40 border-rose-800 text-rose-200"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-0.5 text-rose-600">
                    {isEn ? "Notice" : "تنبيه"}
                  </h4>
                  <p className="leading-relaxed">{error}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    runGeminiAnalysis();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isEn ? "Retry" : "إعادة المحاولة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setPreviewImage(null);
                    setRawCapturedImage(null);
                    setCompressionInfo(null);
                    setActiveTab("upload");
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-semibold cursor-pointer text-xs transition-colors ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                      : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {isEn ? "New Image" : "صورة جديدة"}
                </button>
              </div>
            </div>
          )}

          {/* STEP: Active Image Cropping Interface */}
          {isCropping && (rawCapturedImage || previewImage) ? (
            <ImageCropper
              imageSrc={rawCapturedImage || previewImage || ""}
              onConfirmCrop={handleCropConfirmed}
              onCancel={handleCropCancel}
              languageMode={languageMode}
              themeMode={themeMode}
            />
          ) : isAnalyzing ? (
            /* Automatic Educational Model Generation Scanner */
            <div className="py-4 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
              {/* Image Preview with Interactive Laser Scanning Beam */}
              <div className="relative w-full max-w-sm h-52 rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-[#070E1A] shadow-2xl mb-5 flex items-center justify-center group">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Scanning"
                    className="w-full h-full object-contain filter contrast-110 opacity-75"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ScanLine className="w-8 h-8 animate-spin" />
                  </div>
                )}

                {/* Animated Horizontal Laser Scan Beam */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse pointer-events-none top-1/2 -translate-y-1/2" />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

                {/* CV Corner Targeting Brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

                {/* Live Processing Badge */}
                <div className="absolute top-2.5 inset-x-0 flex justify-center pointer-events-none">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {isEn ? "Synthesizing Interactive Model" : "تحويل الصورة إلى نموذج تعليمي تفاعلي"}
                  </span>
                </div>
              </div>

              {/* Header Title */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                  {isEn
                    ? "Generating Interactive Educational Model..."
                    : "جاري بناء النموذج التعليمي التفاعلي بالذكاء الاصطناعي..."}
                </h3>
              </div>

              {/* Dynamic Step Status */}
              <p className={`text-xs max-w-md mb-4 font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                {analysisStep || (isEn ? "Analyzing visual context and components..." : "المسح الضوئي والفهم البصري لمحتوى الصورة...")}
              </p>

              {/* 4-Stage Live Educational Generation Checklist */}
              <div className="w-full space-y-1.5 text-xs text-right max-w-md mb-4" dir={isEn ? "ltr" : "rtl"}>
                <div className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                  activeScanStage >= 1
                    ? isDark
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-semibold"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                    : isDark ? "bg-[#091224] border-slate-800/60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${activeScanStage >= 1 ? "text-emerald-500" : "text-slate-400"}`} />
                    <span>{isEn ? "1. Visual clarity & optical detection" : "1. المسح البصري والتعرف على العناصر"}</span>
                  </div>
                  {activeScanStage === 1 && <span className="text-[10px] font-mono animate-pulse">{isEn ? "Scanning..." : "جارٍ الفحص..."}</span>}
                </div>

                <div className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                  activeScanStage >= 2
                    ? isDark
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-semibold"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                    : isDark ? "bg-[#091224] border-slate-800/60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${activeScanStage >= 2 ? "text-emerald-500" : "text-slate-400"}`} />
                    <span>{isEn ? "2. Model classification (Anatomy, Cycle, Lab, Map, Book)" : "2. تصنيف النموذج وتحديد نوعه ومجاله"}</span>
                  </div>
                  {activeScanStage === 2 && <span className="text-[10px] font-mono animate-pulse">{isEn ? "Classifying..." : "جارٍ التصنيف..."}</span>}
                </div>

                <div className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                  activeScanStage >= 3
                    ? isDark
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-semibold"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                    : isDark ? "bg-[#091224] border-slate-800/60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${activeScanStage >= 3 ? "text-emerald-500" : "text-slate-400"}`} />
                    <span>{isEn ? "3. Interactive pins & 3-tier explanations" : "3. تثبيت العلامات التفاعلية والشرح ثلاثي المستويات"}</span>
                  </div>
                  {activeScanStage === 3 && <span className="text-[10px] font-mono animate-pulse">{isEn ? "Generating..." : "جارٍ التوليد..."}</span>}
                </div>

                <div className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                  activeScanStage >= 4
                    ? isDark
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-semibold"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                    : isDark ? "bg-[#091224] border-slate-800/60 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${activeScanStage >= 4 ? "text-emerald-500" : "text-slate-400"}`} />
                    <span>{isEn ? "4. Assessment quiz & study audio summary" : "4. صياغة الاختبار التفاعلي والملخص الصوتي"}</span>
                  </div>
                  {activeScanStage === 4 && <span className="text-[10px] font-mono animate-pulse">{isEn ? "Finalizing..." : "اللمسات الأخيرة..."}</span>}
                </div>
              </div>

              {/* Abort / Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  setIsAnalyzing(false);
                  setAnalysisStep("");
                }}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? "border-slate-800 hover:bg-slate-800 text-slate-400"
                    : "border-slate-200 hover:bg-slate-100 text-slate-600"
                }`}
              >
                {isEn ? "Cancel Analysis" : "إلغاء التحليل"}
              </button>
            </div>
          ) : (
            <>
              {/* Tab 1: Screen Capture */}
              {activeTab === "screen" && !previewImage && (
                <div className="space-y-4">
                  <div
                    className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center flex flex-col items-center justify-center transition-all ${
                      isDark
                        ? "bg-[#0B1528] border-blue-500/30 hover:border-blue-500 hover:bg-[#101C33]"
                        : "bg-blue-50/50 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                      <Monitor className="w-8 h-8" />
                    </div>

                    <h3 className="text-base font-bold mb-1.5">
                      {isEn
                        ? "Capture Screen, Window, or Browser Tab"
                        : "التقاط فوري للشاشة أو نافذة برنامج أو تبويب متصفح"}
                    </h3>

                    <p className={`text-xs max-w-md mb-5 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {isEn
                        ? "Accepts arbitrary dimensions and resolutions — tall screenshots, code editors, diagrams, PDF pages, tables, and questions."
                        : "يقبل كافة أنواع وأحجام الصور بدون فرض أي أبعاد أو قيود. يدعم لقطات الشاشة الطويلة، محررات الأكواد، الكتب والملازم، المسائل الرياضية، والجداول."}
                    </p>

                    <button
                      id="trigger-screen-capture-btn"
                      onClick={handleScreenCaptureClick}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Monitor className="w-4 h-4" />
                      <span>{isEn ? "Select Window / Screen to Capture 📸" : "اختيار شاشة أو نافذة للالتقاط 📸"}</span>
                    </button>

                    <div className={`mt-5 pt-4 border-t w-full flex items-center justify-center gap-2 text-xs font-medium ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}>
                      <Clipboard className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        {isEn
                          ? "Tip: You can also copy any screenshot and press Ctrl+V anywhere to paste it instantly!"
                          : "نصيحة: يمكنك أيضاً الضغط على Ctrl+V للصق أي لقطة شاشة منسوجة فوراً!"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Direct Camera Capture with Rear Support and Zoom Controls */}
              {activeTab === "camera" && !previewImage && (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className={`p-6 rounded-2xl border text-center ${
                      isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
                    }`}>
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
                        {isEn ? "Unable to start camera" : "تعذر تشغيل الكاميرا"}
                      </p>
                      <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {cameraError}
                      </p>
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        {isEn ? "Retry" : "إعادة المحاولة"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Video Viewport with Live Zoom & Framing Grid */}
                      <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-700 shadow-inner">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "center center",
                            transition: "transform 0.15s ease-out",
                          }}
                          className="w-full h-full object-cover"
                        />

                        {/* Framing Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-white/40">
                          <div className="border border-white/40" />
                          <div className="border border-white/40" />
                          <div className="border border-white/40" />
                          <div className="border border-white/40" />
                          <div className="border border-white/40" />
                          <div className="border border-white/40" />
                          <div className="border border-white/40" />
                          <div className="border border-white/40" />
                          <div className="border border-white/40" />
                        </div>

                        {/* Top Controls: Facing Mode Badge & Switch */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                          <span className="px-2.5 py-1 rounded-full bg-slate-900/70 text-white text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-white/10">
                            <Camera className="w-3 h-3 text-emerald-400" />
                            <span>
                              {cameraFacing === "environment"
                                ? isEn
                                  ? "Rear Camera (Textbook Mode)"
                                  : "الكاميرا الخلفية (لتصوير الكتاب)"
                                : isEn
                                ? "Front Camera"
                                : "الكاميرا الأمامية"}
                            </span>
                          </span>

                          <button
                            id="toggle-camera-facing-btn"
                            onClick={() =>
                              setCameraFacing((prev) =>
                                prev === "environment" ? "user" : "environment"
                              )
                            }
                            className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                            title={isEn ? "Switch to front/rear camera" : "تبديل الكاميرا الخلفية / الأمامية"}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Center focus frame indicator */}
                        <div className="absolute inset-12 pointer-events-none border-2 border-dashed border-emerald-400/40 rounded-xl flex items-center justify-center">
                          <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {isEn ? "Align Diagram Here" : "وجّه الرسم هنا"}
                          </span>
                        </div>

                        {/* Zoom Indicator Badge */}
                        {zoomLevel > 1 && (
                          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-xs">
                            {zoomLevel.toFixed(1)}x
                          </div>
                        )}
                      </div>

                      {/* Zoom Controls Bar */}
                      <div
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isDark
                            ? "bg-[#0B1528] border-slate-800 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] font-bold">
                            {isEn ? "Zoom Level:" : "مستوى التكبير:"}
                          </span>
                        </div>

                        {/* Quick Zoom Pills */}
                        <div className="flex items-center gap-1">
                          {[1.0, 1.5, 2.0, 3.0].map((level) => (
                            <button
                              key={level}
                              onClick={() => handleZoomChange(level)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                Math.abs(zoomLevel - level) < 0.1
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : isDark
                                  ? "bg-[#13233E] text-slate-300 hover:bg-slate-800"
                                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {level}x
                            </button>
                          ))}
                        </div>

                        {/* Zoom Slider */}
                        <div className="flex items-center gap-1.5 flex-1 max-w-[140px]">
                          <input
                            type="range"
                            min={zoomCaps.min}
                            max={zoomCaps.max}
                            step={zoomCaps.step}
                            value={zoomLevel}
                            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                          <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>

                      {/* Shutter Capture Button */}
                      <div className="flex justify-center pt-1">
                        <button
                          id="capture-shutter-btn"
                          onClick={handleCaptureSnapshot}
                          className="px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 active:scale-95 transition-all cursor-pointer"
                        >
                          <Camera className="w-5 h-5" />
                          <span>{isEn ? "Capture & Crop Diagram 📸" : "التقاط وقص الرسم الآن 📸"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Upload File / Drag & Drop */}
              {activeTab === "upload" && !previewImage && (
                <div>
                  <div
                    id="drop-zone"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
                        : isDark
                        ? "border-slate-700 hover:border-emerald-500 hover:bg-[#13233E]"
                        : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-xs">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h3 className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
                      {isEn
                        ? "Click to select diagram image or drag and drop here"
                        : "انقر لاختيار صورة الرسم المدرسي أو اسحبها هنا"}
                    </h3>
                    <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {isEn
                        ? "Supports textbook diagrams in PNG, JPG, WebP formats (with crop support)"
                        : "يدعم صور الكتب والملازم (PNG, JPG, WebP) مع إمكانية القص والتحديد"}
                    </p>
                    <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition-colors">
                      {isEn ? "Browse from Device" : "تصفح من جهازك"}
                    </span>
                  </div>
                </div>
              )}

              {/* Processed & Cropped Preview Screen */}
              {previewImage && (
                <div className="space-y-4">
                  <div className={`relative rounded-xl overflow-hidden border max-h-72 flex items-center justify-center ${
                    isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-100"
                  }`}>
                    <img
                      src={previewImage}
                      alt="Cropped Preview"
                      className="max-h-72 w-auto object-contain mx-auto"
                    />

                    {/* Quick action buttons overlay */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <button
                        id="re-crop-btn"
                        onClick={() => setIsCropping(true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1 shadow-sm cursor-pointer"
                        title={isEn ? "Re-crop image" : "إعادة القص والتحديد"}
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>{isEn ? "Re-crop" : "تعديل القص"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setPreviewImage(null);
                          setRawCapturedImage(null);
                          setCompressionInfo(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/75 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isEn ? "Change Photo" : "صورة أخرى"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Optimization & Dimension Metrics Badge */}
                  {compressionInfo && (
                    <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                      isDark ? "bg-[#0B1528] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold">
                          {isEn ? "Image Ready:" : "الصورة جاهزة:"}
                        </span>
                        <span className="font-mono text-[11px] bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {compressionInfo.width} × {compressionInfo.height} px
                        </span>
                        {compressionInfo.dimensions?.isTall && (
                          <span className="bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded text-[10px]">
                            {isEn ? "Tall Screenshot" : "لقطة شاشة طولية"}
                          </span>
                        )}
                        <span className="text-slate-400 text-[11px]">
                          ({(compressionInfo.compressedSize / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <span className="text-emerald-500 text-[11px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        {isEn ? "No limits on dimensions" : "مفتوحة الأبعاد والدقة"}
                      </span>
                    </div>
                  )}

                  {/* Automatic Interactive Educational Model Synthesis Card */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${
                    isDark ? "bg-[#091224] border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{isEn ? "Generate Interactive Educational Model" : "تحويل إلى نموذج تعليمي تفاعلي جاهز"}</span>
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-500 font-extrabold px-2 py-0.5 rounded-full">
                              {isEn ? "AI-Powered" : "تلقائي بالذكاء الاصطناعي"}
                            </span>
                          </h4>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {isEn
                              ? "Will analyze content, detect model type, add interactive pins, structured explanations, and self-quizzes."
                              : "سيقوم الذكاء الاصطناعي بتحليل الصورة فوراً، وتحديد نوع النموذج، وتثبيت العلامات التفاعلية، والشرح ثلاثي المستويات، والاختبار."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Features overview pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isDark ? "bg-[#0B1528] border-slate-800/80 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{isEn ? "Pins & Relationships" : "علامات تفاعلية وعلاقة الأجزاء"}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isDark ? "bg-[#0B1528] border-slate-800/80 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}>
                        <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{isEn ? "3-Tier Explanations" : "شرح منظم، مبسط، وبالتفصيل"}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isDark ? "bg-[#0B1528] border-slate-800/80 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}>
                        <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                        <span>{isEn ? "Quiz & Audio Narration" : "اختبار ذاتي وشرح صوتي وفيديو"}</span>
                      </div>
                    </div>

                    <button
                      id="create-interactive-model-btn"
                      type="button"
                      onClick={() => runGeminiAnalysis()}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                      <span>{isEn ? "Create Interactive Educational Model Now ⚡" : "⚡ إنشاء النموذج التعليمي التفاعلي الآن"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Ready Educational Samples */}
              {activeTab === "samples" && !previewImage && (
                <div className="space-y-3">
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {isEn
                      ? "Select one of the prepared educational models for an instant trial without needing to capture an image:"
                      : "اختر أحد النماذج التعليمية الجاهزة للتجربة الفورية دون الحاجة للتصوير الآن:"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SAMPLE_DIAGRAMS.map((sample) => (
                      <div
                        key={sample.id}
                        id={`sample-card-${sample.id}`}
                        onClick={() => handleSelectSample(sample)}
                        className={`group p-3 rounded-xl border cursor-pointer transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                          isDark
                            ? "border-slate-800 bg-[#0B1528] hover:border-emerald-500 hover:bg-[#13233E]"
                            : "border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40"
                        }`}
                      >
                        <div>
                          <div className={`aspect-4/3 rounded-lg overflow-hidden mb-2 border flex items-center justify-center ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-100"
                          }`}>
                            <img
                              src={sample.imageUrl}
                              alt={isEn ? sample.titleEn || sample.titleAr : sample.titleAr}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <h4 className={`text-xs font-bold line-clamp-1 mb-0.5 ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}>
                            {isEn ? sample.titleEn || sample.titleAr : sample.titleAr}
                          </h4>
                          <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isDark ? "text-emerald-400 bg-emerald-950/60" : "text-emerald-700 bg-emerald-100/60"
                          }`}>
                            {isEn ? sample.subjectEn || sample.subjectAr : sample.subjectAr}
                          </span>
                        </div>
                        <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
                          isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
                        }`}>
                          <span>
                            {sample.parts.length} {isEn ? "parts" : "أجزاء تفاعلية"}
                          </span>
                          <span className="text-emerald-500 font-bold group-hover:translate-x-0.5 transition-transform">
                            {isEn ? "Start →" : "ابدأ ←"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions: Start AI Analysis */}
        {previewImage && !isAnalyzing && !isCropping && (
          <div className={`px-4 sm:px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50/70 border-slate-100"
          }`}>
            <button
              onClick={() => {
                setPreviewImage(null);
                setRawCapturedImage(null);
                setCompressionInfo(null);
              }}
              className={`px-3 py-2 text-xs font-semibold cursor-pointer rounded-lg transition-colors ${
                isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {isEn ? "Cancel" : "إلغاء"}
            </button>

            <div className="flex items-center gap-2">
              <button
                id="footer-create-model-btn"
                type="button"
                onClick={() => runGeminiAnalysis()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-600/30 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? "Generate Educational Model ⚡" : "إنشاء النموذج التعليمي ⚡"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

