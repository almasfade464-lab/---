/**
 * Speech Manager for EduGraphic
 * Provides high-quality Arabic and English audio playback with dual-engine support:
 * 1. Primary Engine: Server-side high-clarity TTS stream (/api/tts)
 * 2. Fallback Engine: Web Speech API (window.speechSynthesis) with auto-voice selection
 */

// Helper to clean markdown formatting so TTS reads clean, natural text
function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";
  return rawText
    // Remove markdown bold/italic (**text**, *text*, __text__)
    .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
    .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
    // Remove markdown headers (#, ##, etc.)
    .replace(/^#+\s+/gm, "")
    // Remove markdown links [title](url) -> title
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    // Remove code blocks and backticks
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    // Remove bullet points / dashes at start of lines
    .replace(/^[-*•]\s+/gm, "")
    // Remove duplicate whitespace and trim
    .replace(/\s+/g, " ")
    .trim();
}

class SpeechManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState: boolean = false;
  private onStateChangeListeners: Array<(speaking: boolean) => void> = [];
  private voicesLoaded: boolean = false;
  private playbackRate: number = 1.0;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voicesLoaded = true;
      };
      if (window.speechSynthesis.getVoices().length > 0) {
        this.voicesLoaded = true;
      }
    }
  }

  public setRate(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.playbackRate;
    }
  }

  public isSupported(): boolean {
    return true; // We support HTML5 audio + Web Speech API fallback
  }

  public subscribe(listener: (speaking: boolean) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(
        (l) => l !== listener
      );
    };
  }

  private notify(speaking: boolean) {
    this.isSpeakingState = speaking;
    this.onStateChangeListeners.forEach((l) => {
      try {
        l(speaking);
      } catch (err) {
        console.error("Error in speech listener:", err);
      }
    });
  }

  public stop() {
    // 1. Stop HTML5 Audio if playing
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = "";
        this.currentAudio.onplay = null;
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
      } catch (e) {
        // ignore
      }
      this.currentAudio = null;
    }

    // 2. Stop Web Speech Synthesis if playing
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
      this.currentUtterance = null;
    }

    this.notify(false);
  }

  public speak(
    rawText: string,
    lang: "ar" | "en" = "ar",
    onStart?: () => void,
    onEnd?: () => void
  ) {
    const text = cleanTextForSpeech(rawText);
    if (!text) {
      if (onEnd) onEnd();
      return;
    }

    // Stop any existing speech before starting new one
    this.stop();

    // Strategy 1: High-fidelity Server-side TTS endpoint
    const ttsUrl = `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
    const audio = new Audio();
    this.currentAudio = audio;

    let started = false;

    audio.onplay = () => {
      started = true;
      this.notify(true);
      if (onStart) onStart();
    };

    audio.onended = () => {
      this.currentAudio = null;
      this.notify(false);
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.warn("Server TTS playback failed, falling back to Web Speech API", e);
      this.currentAudio = null;
      // Fall back to Web Speech API
      this.speakWithWebSpeech(text, lang, onStart, onEnd);
    };

    audio.src = ttsUrl;
    audio.playbackRate = this.playbackRate;
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio play() was interrupted or rejected:", err);
        // If browser blocked audio or network failed, fallback to Web Speech
        if (!started) {
          this.currentAudio = null;
          this.speakWithWebSpeech(text, lang, onStart, onEnd);
        }
      });
    }
  }

  /**
   * Fallback engine using browser SpeechSynthesis
   */
  private speakWithWebSpeech(
    text: string,
    lang: "ar" | "en",
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis not available in this environment.");
      this.notify(false);
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Resume if paused (Chrome bug workaround)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
      utterance.rate = (lang === "ar" ? 0.92 : 0.95) * this.playbackRate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) =>
        lang === "ar"
          ? v.lang.startsWith("ar")
          : v.lang.startsWith("en")
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        this.notify(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        this.notify(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.error("Web Speech synthesis error:", e);
        this.currentUtterance = null;
        this.notify(false);
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      // Delay speak slightly after cancel to bypass Chrome cancel-then-speak glitch
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (e) {
      console.error("Failed to execute Web Speech:", e);
      this.notify(false);
      if (onEnd) onEnd();
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }
}

export const speechManager = new SpeechManager();
