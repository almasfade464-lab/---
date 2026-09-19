/**
 * PWA Install Event Manager
 * Captures beforeinstallprompt and manages install state across platforms
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners: Array<(canInstall: boolean) => void> = [];

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    // Prevent standard browser mini-infobar
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    installListeners.forEach((fn) => fn(true));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installListeners.forEach((fn) => fn(false));
  });
}

export function subscribePwaInstallAvailability(
  callback: (canInstall: boolean) => void
): () => void {
  installListeners.push(callback);
  callback(deferredPrompt !== null);
  return () => {
    const idx = installListeners.indexOf(callback);
    if (idx !== -1) installListeners.splice(idx, 1);
  };
}

export function canTriggerNativePrompt(): boolean {
  return deferredPrompt !== null;
}

export async function triggerPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installListeners.forEach((fn) => fn(false));
    return choice.outcome === "accepted";
  } catch (err) {
    console.error("PWA install error:", err);
    return false;
  }
}
