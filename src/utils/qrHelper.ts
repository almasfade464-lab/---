import QRCode from "qrcode";

/**
 * Generate a high-resolution base64 PNG data URL for any text/URL
 */
export async function generateQrDataUrl(
  text: string,
  size: number = 600
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });
  } catch (error) {
    console.error("Error generating QR data URL:", error);
    // Fallback to online service if needed
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      text
    )}`;
  }
}

/**
 * Download QR code as a PNG file directly to user's device
 */
export async function downloadQrAsPng(
  text: string,
  fileName: string = "edugraphic-qr.png"
): Promise<void> {
  try {
    const dataUrl = await generateQrDataUrl(text, 800);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Failed to download QR PNG:", err);
  }
}

/**
 * Download QR code as an SVG vector file directly to user's device
 */
export async function downloadQrAsSvg(
  text: string,
  fileName: string = "edugraphic-qr.svg"
): Promise<void> {
  try {
    const svgString = await QRCode.toString(text, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(".svg") ? fileName : `${fileName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download QR SVG:", err);
  }
}
