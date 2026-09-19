export interface ImageQualityMetrics {
  avgBrightness: number;
  contrast: number;
  isDark: boolean;
  isBlankOrUniform: boolean;
  clarityStatus: "clear" | "dark" | "blank" | "low_contrast";
  diagnosticMessageAr?: string;
  diagnosticMessageEn?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: "portrait" | "landscape" | "square" | "tall_screenshot" | "ultrawide";
  isTall: boolean;
}

export interface CompressionResult {
  base64: string;
  originalSize: number;
  compressedSize: number;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: "portrait" | "landscape" | "square" | "tall_screenshot" | "ultrawide";
  isTall: boolean;
  dimensions?: ImageDimensions;
  qualityMetrics: ImageQualityMetrics;
}

export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 2048,
  maxHeight = 2048,
  quality = 0.88
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const origW = img.width;
      const origH = img.height;
      const aspectRatio = origW / Math.max(1, origH);
      const isTall = origH / origW >= 2.0;
      const isUltrawide = origW / origH >= 2.2;

      let orientation: "portrait" | "landscape" | "square" | "tall_screenshot" | "ultrawide" = "portrait";
      if (isTall) {
        orientation = "tall_screenshot";
      } else if (isUltrawide) {
        orientation = "ultrawide";
      } else if (Math.abs(origW - origH) < 40) {
        orientation = "square";
      } else if (origW > origH) {
        orientation = "landscape";
      }

      let width = origW;
      let height = origH;

      // Smart Dimension Calculation:
      // We do NOT blindly clamp tall screenshots to a small square or 1400px height.
      // Doing that crushes a 1080x6000 screenshot down to 250px width, ruining text readability!
      if (isTall) {
        // For long screenshots (e.g. phone scroll capture), preserve readable width (target ~1080-1200px)
        const targetWidth = Math.min(origW, 1200);
        width = Math.max(720, targetWidth); // ensure text is sharp
        height = Math.round(width / aspectRatio);

        // Cap height only if extreme (e.g. > 8000px) to prevent GPU canvas limits
        const MAX_TALL_HEIGHT = 7000;
        if (height > MAX_TALL_HEIGHT) {
          height = MAX_TALL_HEIGHT;
          width = Math.round(height * aspectRatio);
        }
      } else {
        // Standard high-resolution scaling preserving aspect ratio
        const MAX_PIXELS = 4_000_000; // ~4 Megapixels is optimal for Gemini Vision
        const currentPixels = width * height;
        if (currentPixels > MAX_PIXELS) {
          const scale = Math.sqrt(MAX_PIXELS / currentPixels);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        } else if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to create canvas 2D context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Perform real mathematical pixel inspection for clarity, darkness, and uniformity
      let avgBrightness = 128;
      let contrast = 50;
      let isDark = false;
      let isBlankOrUniform = false;
      let clarityStatus: "clear" | "dark" | "blank" | "low_contrast" = "clear";
      let diagnosticMessageAr = "";
      let diagnosticMessageEn = "";

      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const totalPixels = data.length / 4;
        // Sample up to 10,000 pixels across the image for sub-millisecond efficiency
        const step = Math.max(1, Math.floor(totalPixels / 10000));
        let totalLum = 0;
        let samples = 0;

        for (let i = 0; i < data.length; i += step * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Standard Perceived Luminance formula (ITU-R BT.601)
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLum += lum;
          samples++;
        }

        if (samples > 0) {
          avgBrightness = totalLum / samples;
          let varianceSum = 0;
          for (let i = 0; i < data.length; i += step * 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            const diff = lum - avgBrightness;
            varianceSum += diff * diff;
          }
          contrast = Math.sqrt(varianceSum / samples);
        }

        // Detect dark, black, or completely underexposed images
        if (avgBrightness < 18) {
          isDark = true;
          clarityStatus = "dark";
          diagnosticMessageAr = "الصورة مظلمة جداً أو سوداء ولا تظهر أي تفاصيل واضحة. يرجى التقاط صورة بإضاءة جيدة أو تشغيل فلاش الكاميرا.";
          diagnosticMessageEn = "The image is too dark or black. Please capture in good lighting or turn on camera flash.";
        } else if (contrast < 6 && (avgBrightness < 35 || avgBrightness > 230)) {
          isBlankOrUniform = true;
          clarityStatus = "blank";
          diagnosticMessageAr = "الصورة تبدو فارغة أو بلون واحد مصمت دون أي رسم أو نصوص مقروءة. يرجى رفع صورة لمخطط أو مسألة أو جدول.";
          diagnosticMessageEn = "The image appears blank or uniform without readable diagram or text content. Please upload a diagram or study table.";
        } else if (contrast < 10) {
          clarityStatus = "low_contrast";
          diagnosticMessageAr = "الصورة منخفضة التباين وقد يصعب قراءتها بوضوح. يرجى التأكد من وضوح الصورة.";
          diagnosticMessageEn = "The image has low contrast. Please ensure good readability.";
        }
      } catch (inspectErr) {
        console.warn("Pixel inspection note:", inspectErr);
      }

      const mimeType = "image/jpeg";
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);

      const originalSize =
        typeof fileOrDataUrl === "string"
          ? Math.round((fileOrDataUrl.length * 3) / 4)
          : fileOrDataUrl.size;

      const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);

      resolve({
        base64: compressedDataUrl,
        originalSize,
        compressedSize,
        mimeType,
        width,
        height,
        aspectRatio,
        orientation,
        isTall,
        dimensions: {
          width,
          height,
          aspectRatio,
          orientation,
          isTall,
        },
        qualityMetrics: {
          avgBrightness,
          contrast,
          isDark,
          isBlankOrUniform,
          clarityStatus,
          diagnosticMessageAr,
          diagnosticMessageEn,
        },
      });
    };

    img.onerror = (err) => {
      reject(new Error("Failed to load image for compression"));
    };

    if (typeof fileOrDataUrl === "string") {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
