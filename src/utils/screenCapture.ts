/**
 * Cross-platform Screen & Display Capture utility
 * Supports:
 * - Desktop/Web Screen Capture (Entire Screen, Application Window, or Browser Tab via getDisplayMedia)
 * - Clipboard Paste Listener (Ctrl+V / Cmd+V anywhere in app)
 * - Mobile Camera / Gallery capture helpers
 */

export interface ScreenCaptureResult {
  dataUrl: string;
  width: number;
  height: number;
}

export async function captureScreen(): Promise<ScreenCaptureResult | null> {
  // Check if getDisplayMedia is supported
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw new Error(
      "ميزة التقاط الشاشة المباشرة غير مدعومة في هذا المتصفح أو بيئة العرض الحالية. يمكنك بدلاً من ذلك رفع لقطة الشاشة أو لصقها بواسطة (Ctrl+V)."
    );
  }

  let stream: MediaStream | null = null;
  try {
    // Attempt high quality capture with native dimensions
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "monitor",
        width: { ideal: 3840 },
        height: { ideal: 2160 },
        frameRate: { ideal: 30 },
      } as any,
      audio: false,
    });

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      throw new Error("لم يتم العثور على مسار فيديو للالتقاط.");
    }

    // Create offscreen video to capture the instantaneous frame
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => {
        video.play().then(() => resolve()).catch(reject);
      };
      video.onerror = () => reject(new Error("فشل تحميل دفق شاشة العرض."));
      // Timeout fallback
      setTimeout(() => resolve(), 1200);
    });

    // Small delay to ensure the video frame renders
    await new Promise((r) => setTimeout(r, 150));

    const width = video.videoWidth || 1920;
    const height = video.videoHeight || 1080;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("فشل إنشاء سياق الرسم.");
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/png");

    return {
      dataUrl,
      width,
      height,
    };
  } catch (err: any) {
    if (
      err.name === "NotAllowedError" ||
      err.message?.includes("Permission denied") ||
      err.message?.includes("User denied")
    ) {
      // User simply cancelled the picker dialog
      return null;
    }
    if (err.name === "SecurityError" || err.message?.includes("permission")) {
      throw new Error(
        "يتطلب التقاط الشاشة إذناً من المتصفح أو فتح التطبيق في تبويب جديد. يمكنك أيضاً لصق لقطة الشاشة مباشرة باستخدام (Ctrl+V) أو رفعها من جهازك."
      );
    }
    throw err;
  } finally {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
  }
}

/**
 * Extracts image data from a ClipboardEvent if user pasted an image
 */
export function extractImageFromClipboard(event: ClipboardEvent): Promise<string | null> {
  return new Promise((resolve) => {
    const items = event.clipboardData?.items;
    if (!items) {
      resolve(null);
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              resolve(null);
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
    resolve(null);
  });
}
