import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Crop,
  Check,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { LanguageMode, ThemeMode } from "../types";

interface CropRect {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

interface ImageCropperProps {
  imageSrc: string;
  onConfirmCrop: (croppedDataUrl: string) => void;
  onCancel: () => void;
  languageMode?: LanguageMode;
  themeMode?: ThemeMode;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onConfirmCrop,
  onCancel,
  languageMode = "ar",
  themeMode = "light",
}) => {
  const isEn = languageMode === "en";
  const isDark = themeMode === "dark";

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Normalized crop rectangle: 10% margin initially
  const [crop, setCrop] = useState<CropRect>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<"free" | "1:1" | "4:3" | "16:9">("free");

  // Dragging state
  const [isDragging, setIsDragging] = useState<string | null>(null); // 'move' or 'nw', 'ne', 'se', 'sw'
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    startCrop: CropRect;
  }>({ startX: 0, startY: 0, startCrop: crop });

  // Handle pointer down on crop box or handles
  const handlePointerDown = (e: React.PointerEvent, handleType: string) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setIsDragging(handleType);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
    };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();

      const container = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartRef.current.startX) / container.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.startY) / container.height) * 100;
      const initial = dragStartRef.current.startCrop;

      let newCrop = { ...initial };

      if (isDragging === "move") {
        newCrop.x = Math.max(0, Math.min(100 - initial.width, initial.x + deltaX));
        newCrop.y = Math.max(0, Math.min(100 - initial.height, initial.y + deltaY));
      } else if (isDragging === "se") {
        let newW = Math.max(15, Math.min(100 - initial.x, initial.width + deltaX));
        let newH = Math.max(15, Math.min(100 - initial.y, initial.height + deltaY));

        if (aspectRatio === "1:1") {
          const side = Math.min(newW, newH);
          newW = side;
          newH = side;
        } else if (aspectRatio === "4:3") {
          newH = (newW * 3) / 4;
        } else if (aspectRatio === "16:9") {
          newH = (newW * 9) / 16;
        }

        newCrop.width = newW;
        newCrop.height = newH;
      } else if (isDragging === "sw") {
        let newX = Math.max(0, Math.min(initial.x + initial.width - 15, initial.x + deltaX));
        let newW = initial.x + initial.width - newX;
        let newH = Math.max(15, Math.min(100 - initial.y, initial.height + deltaY));

        if (aspectRatio === "1:1") {
          const side = Math.min(newW, newH);
          newW = side;
          newH = side;
          newX = initial.x + initial.width - side;
        }

        newCrop.x = newX;
        newCrop.width = newW;
        newCrop.height = newH;
      } else if (isDragging === "ne") {
        let newY = Math.max(0, Math.min(initial.y + initial.height - 15, initial.y + deltaY));
        let newH = initial.y + initial.height - newY;
        let newW = Math.max(15, Math.min(100 - initial.x, initial.width + deltaX));

        if (aspectRatio === "1:1") {
          const side = Math.min(newW, newH);
          newW = side;
          newH = side;
          newY = initial.y + initial.height - side;
        }

        newCrop.y = newY;
        newCrop.width = newW;
        newCrop.height = newH;
      } else if (isDragging === "nw") {
        let newX = Math.max(0, Math.min(initial.x + initial.width - 15, initial.x + deltaX));
        let newY = Math.max(0, Math.min(initial.y + initial.height - 15, initial.y + deltaY));
        let newW = initial.x + initial.width - newX;
        let newH = initial.y + initial.height - newY;

        if (aspectRatio === "1:1") {
          const side = Math.min(newW, newH);
          newW = side;
          newH = side;
          newX = initial.x + initial.width - side;
          newY = initial.y + initial.height - side;
        }

        newCrop.x = newX;
        newCrop.y = newY;
        newCrop.width = newW;
        newCrop.height = newH;
      }

      setCrop(newCrop);
    },
    [isDragging, aspectRatio]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Preset aspect ratio handler
  const handleSetRatio = (ratio: "free" | "1:1" | "4:3" | "16:9") => {
    setAspectRatio(ratio);
    if (ratio === "1:1") {
      const minDim = Math.min(crop.width, crop.height);
      setCrop((prev) => ({
        ...prev,
        width: minDim,
        height: minDim,
      }));
    } else if (ratio === "4:3") {
      setCrop((prev) => ({
        ...prev,
        height: Math.min(100 - prev.y, (prev.width * 3) / 4),
      }));
    } else if (ratio === "16:9") {
      setCrop((prev) => ({
        ...prev,
        height: Math.min(100 - prev.y, (prev.width * 9) / 16),
      }));
    }
  };

  // Reset to full image
  const handleReset = () => {
    setCrop({ x: 5, y: 5, width: 90, height: 90 });
    setRotation(0);
    setZoom(1);
    setAspectRatio("free");
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Execute crop on canvas and return dataURL
  const handleConfirm = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // 1. Create canvas for rotation if needed
      const rotatedCanvas = document.createElement("canvas");
      const isRotated90or270 = rotation === 90 || rotation === 270;
      rotatedCanvas.width = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      rotatedCanvas.height = isRotated90or270 ? img.naturalWidth : img.naturalHeight;
      const rotCtx = rotatedCanvas.getContext("2d");
      if (!rotCtx) return;

      rotCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      rotCtx.rotate((rotation * Math.PI) / 180);
      rotCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      // 2. Crop from the rotated canvas according to normalized crop percentages
      const cropX = (crop.x / 100) * rotatedCanvas.width;
      const cropY = (crop.y / 100) * rotatedCanvas.height;
      const cropW = (crop.width / 100) * rotatedCanvas.width;
      const cropH = (crop.height / 100) * rotatedCanvas.height;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = Math.max(1, Math.round(cropW));
      cropCanvas.height = Math.max(1, Math.round(cropH));
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) return;

      cropCtx.drawImage(
        rotatedCanvas,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );

      const croppedUrl = cropCanvas.toDataURL("image/jpeg", 0.92);
      onConfirmCrop(croppedUrl);
    };
    img.src = imageSrc;
  };

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className="space-y-4 animate-in fade-in duration-200"
    >
      {/* Instructions header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Crop className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold">
            {isEn
              ? "Crop & Frame Diagram: Drag corners to focus on the textbook drawing"
              : "قص ومعاينة الرسم: اسحب الزوايا لتحديد الجزء التعليمي المطلوب بدقة"}
          </span>
        </div>
        <button
          onClick={handleReset}
          className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? "border-slate-700 hover:bg-slate-800 text-slate-300"
              : "border-slate-200 hover:bg-slate-100 text-slate-600"
          }`}
        >
          {isEn ? "Reset" : "إعادة الضبط"}
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full aspect-4/3 max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden select-none touch-none flex items-center justify-center border border-slate-700/60 shadow-inner"
      >
        {/* Base Image */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Cropper Target"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          className="max-h-full max-w-full object-contain pointer-events-none"
        />

        {/* Semi-transparent dark overlay over entire image */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top dark band */}
          <div
            className="absolute left-0 right-0 top-0 bg-black/65 backdrop-blur-[0.5px]"
            style={{ height: `${crop.y}%` }}
          />
          {/* Bottom dark band */}
          <div
            className="absolute left-0 right-0 bottom-0 bg-black/65 backdrop-blur-[0.5px]"
            style={{ height: `${100 - (crop.y + crop.height)}%` }}
          />
          {/* Left dark band */}
          <div
            className="absolute top-0 bottom-0 bg-black/65 backdrop-blur-[0.5px]"
            style={{
              top: `${crop.y}%`,
              height: `${crop.height}%`,
              left: 0,
              width: `${crop.x}%`,
            }}
          />
          {/* Right dark band */}
          <div
            className="absolute top-0 bottom-0 bg-black/65 backdrop-blur-[0.5px]"
            style={{
              top: `${crop.y}%`,
              height: `${crop.height}%`,
              right: 0,
              width: `${100 - (crop.x + crop.width)}%`,
            }}
          />
        </div>

        {/* Active Crop Box */}
        <div
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.width}%`,
            height: `${crop.height}%`,
          }}
          onPointerDown={(e) => handlePointerDown(e, "move")}
          className={`absolute border-2 border-emerald-400 cursor-move rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.5)] transition-shadow ${
            isDragging === "move" ? "border-emerald-300 shadow-lg" : ""
          }`}
        >
          {/* Rule of thirds grid lines */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>

          {/* Center drag badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
            <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
              <Crop className="w-3 h-3 text-emerald-400" />
              <span>{isEn ? "Drag to move" : "اسحب للتحريك"}</span>
            </span>
          </div>

          {/* 4 Corner Handles (Touch targets with generous 32px hit area) */}
          {/* NW */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "nw")}
            className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize z-20"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow-md" />
          </div>

          {/* NE */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "ne")}
            className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize z-20"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow-md" />
          </div>

          {/* SW */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "sw")}
            className="absolute -bottom-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize z-20"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow-md" />
          </div>

          {/* SE */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "se")}
            className="absolute -bottom-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize z-20"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow-md" />
          </div>
        </div>
      </div>

      {/* Toolbar: Aspect Ratios, Rotation & Zoom */}
      <div
        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark
            ? "bg-[#0B1528] border-slate-800 text-slate-300"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}
      >
        {/* Aspect Ratio Presets */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold text-slate-400 ml-1">
            {isEn ? "Ratio:" : "النسبة:"}
          </span>
          {(["free", "1:1", "4:3", "16:9"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleSetRatio(r)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                aspectRatio === r
                  ? "bg-emerald-600 text-white"
                  : isDark
                  ? "bg-[#13233E] hover:bg-slate-800 text-slate-300"
                  : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              {r === "free" ? (isEn ? "Free" : "حر") : r}
            </button>
          ))}
        </div>

        {/* Rotate and Zoom buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRotate}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              isDark
                ? "bg-[#13233E] border-slate-700 hover:bg-slate-800 text-slate-200"
                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            title={isEn ? "Rotate 90° Clockwise" : "تدوير 90 درجة مع عقارب الساعة"}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">90°</span>
          </button>

          <button
            onClick={() => setZoom((prev) => Math.max(0.8, prev - 0.2))}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? "bg-[#13233E] border-slate-700 hover:bg-slate-800 text-slate-200"
                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            title={isEn ? "Zoom Out" : "تصغير"}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono px-1">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.2))}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? "bg-[#13233E] border-slate-700 hover:bg-slate-800 text-slate-200"
                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
            title={isEn ? "Zoom In" : "تكبير"}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action confirmation buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          onClick={onCancel}
          className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
            isDark
              ? "text-slate-400 hover:text-white"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {isEn ? "Cancel" : "إلغاء"}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="use-full-image-btn"
            onClick={() => onConfirmCrop(imageSrc)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark
                ? "bg-[#13233E] border-slate-700 hover:bg-[#1C3156] text-slate-200"
                : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs"
            }`}
            title={isEn ? "Analyze full uncropped image" : "تحليل الصورة كاملة دون قص"}
          >
            <span>{isEn ? "Use Full Image" : "استخدام الصورة كاملة"}</span>
          </button>

          <button
            id="confirm-crop-btn"
            onClick={handleConfirm}
            className="px-4 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? "Crop & Analyze ⚡" : "تأكيد القص ومتابعة التحليل ⚡"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
