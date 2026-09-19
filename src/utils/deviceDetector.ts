/**
 * Device and Platform Detection Utility
 * Automatically detects phone type, operating system, and browser
 * to provide tailored PWA installation instructions.
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: "ios" | "android" | "desktop" | "tablet";
  phoneBrand: string;
  osName: string;
  osVersion: string;
  browserName: string;
  isIosSafari: boolean;
  isStandalone: boolean;
  isInAppBrowser: boolean;
  titleAr: string;
  titleEn: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      platform: "desktop",
      phoneBrand: "حاسوب مكتبي",
      osName: "Desktop OS",
      osVersion: "",
      browserName: "Browser",
      isIosSafari: false,
      isStandalone: false,
      isInAppBrowser: false,
      titleAr: "جهاز حاسوب / مكتبي",
      titleEn: "Desktop PC / Mac",
    };
  }

  const ua = navigator.userAgent || "";
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // Standalone mode check (already installed as PWA)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://");

  // In-app browsers (WhatsApp, Instagram, Facebook, TikTok, Line, etc.)
  const isInAppBrowser =
    /FBAN|FBAV|Instagram|Line|WhatsApp|TikTok|Snapchat|Twitter|MicroMessenger/i.test(ua);

  // iOS Detection (iPhone, iPod, iPad)
  const isIPhone = /iPhone|iPod/i.test(ua);
  const isIPad =
    /iPad/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1 && !/iPhone/i.test(ua));
  const isIOS = isIPhone || isIPad;

  // Android Detection
  const isAndroid = /Android/i.test(ua);

  // Browser detection
  let browserName = "المتصفح";
  if (/SamsungBrowser/i.test(ua)) {
    browserName = "Samsung Internet";
  } else if (/Chrome|CriOS/i.test(ua) && !/Edg/i.test(ua)) {
    browserName = "Google Chrome";
  } else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) {
    browserName = "Safari";
  } else if (/Edg|Edge/i.test(ua)) {
    browserName = "Microsoft Edge";
  } else if (/Firefox|FxiOS/i.test(ua)) {
    browserName = "Mozilla Firefox";
  }

  const isIosSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);

  // Determine Brand and Details
  let phoneBrand = "هاتف ذكي";
  let osName = "نظام التشغيل";
  let titleAr = "هاتف محمول";
  let titleEn = "Mobile Phone";

  if (isIPhone) {
    phoneBrand = "Apple iPhone";
    osName = "Apple iOS";
    titleAr = "هاتف آيفون (Apple iPhone)";
    titleEn = "Apple iPhone (iOS)";
  } else if (isIPad) {
    phoneBrand = "Apple iPad";
    osName = "iPadOS";
    titleAr = "جهاز آيباد (Apple iPad)";
    titleEn = "Apple iPad (iPadOS)";
  } else if (isAndroid) {
    if (/SM-|Samsung/i.test(ua)) {
      phoneBrand = "Samsung Galaxy";
    } else if (/Pixel/i.test(ua)) {
      phoneBrand = "Google Pixel";
    } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
      phoneBrand = "Xiaomi / Redmi";
    } else if (/Huawei|HONOR/i.test(ua)) {
      phoneBrand = "Huawei / Honor";
    } else {
      phoneBrand = "Android Phone";
    }
    osName = "Android OS";
    titleAr = `هاتف أندرويد (${phoneBrand})`;
    titleEn = `${phoneBrand} (Android)`;
  } else {
    // Desktop or laptop
    if (/Macintosh|Mac OS X/i.test(ua)) {
      phoneBrand = "Apple Mac";
      osName = "macOS";
      titleAr = "جهاز ماك (Apple Mac)";
      titleEn = "Apple Mac (macOS)";
    } else if (/Windows/i.test(ua)) {
      phoneBrand = "Windows PC";
      osName = "Windows";
      titleAr = "كمبيوتر ويندوز (Windows PC)";
      titleEn = "Windows PC";
    } else {
      phoneBrand = "حاسوب";
      osName = "Desktop";
      titleAr = "جهاز كمبيوتر مكتبي";
      titleEn = "Desktop Computer";
    }
  }

  const isMobile = isIPhone || (isAndroid && !/Tablet/i.test(ua));
  const isTablet = isIPad || (isAndroid && /Tablet/i.test(ua));
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    platform: isIOS ? (isIPad ? "tablet" : "ios") : isAndroid ? "android" : "desktop",
    phoneBrand,
    osName,
    osVersion: "",
    browserName,
    isIosSafari,
    isStandalone,
    isInAppBrowser,
    titleAr,
    titleEn,
  };
}
