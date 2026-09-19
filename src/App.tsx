import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Layers,
  GraduationCap,
  Volume2,
  VolumeX,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  X,
  Play,
  Sun,
  Moon,
  Globe,
  Compass,
  Bell,
  Video,
  Bookmark,
  FileText,
  ListChecks,
} from "lucide-react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { ExploreModelsGrid } from "./components/ExploreModelsGrid";
import { BottomNavBar } from "./components/BottomNavBar";
import { SettingsView } from "./components/SettingsView";
import { HistoryView } from "./components/HistoryView";
import { InteractiveDiagram } from "./components/InteractiveDiagram";
import { PartDetailsCard } from "./components/PartDetailsCard";
import { PartsList } from "./components/PartsList";
import { QuizSection } from "./components/QuizSection";
import { AiTutorChat } from "./components/AiTutorChat";
import { UploadModal } from "./components/UploadModal";
import { VisionAssistantView } from "./components/VisionAssistantView";
import { ExportShareModal } from "./components/ExportShareModal";
import { AppShareModal } from "./components/AppShareModal";
import { SmartAppInstallModal } from "./components/SmartAppInstallModal";
import { AuthModal } from "./components/AuthModal";
import { AIInteractiveBackground } from "./components/AIInteractiveBackground";
import { EduGraphicLogo } from "./components/EduGraphicLogo";
import { ImageTextExplanationModal } from "./components/ImageTextExplanationModal";
import { ExplainerVideoModal } from "./components/ExplainerVideoModal";
import { MyNotesModal } from "./components/MyNotesModal";
import { NotesView } from "./components/NotesView";
import { AudioExplanationBar } from "./components/AudioExplanationBar";
import { EducationalExplanationsSection } from "./components/EducationalExplanationsSection";
import { ModelActionToolbar } from "./components/ModelActionToolbar";
import { saveDiagramToNotes, isDiagramSavedInNotes } from "./utils/notesStorage";
import { saveVisionAnalysisAsNote } from "./utils/notesFirestore";
import { SAMPLE_DIAGRAMS } from "./data/sampleDiagrams";
import {
  DiagramAnalysis,
  DiagramPart,
  LanguageMode,
  ActiveTab,
  MainView,
  HistoryItem,
  ThemeMode,
  AppSettings,
  FontSizePreference,
  NavModePreference,
  HomePreference,
  AlertTypePreference,
  RenderQualityPreference,
  UserAccount,
  VisionSession,
} from "./types";
import { speechManager } from "./utils/speech";
import { playSound } from "./utils/soundEffects";
import {
  getCurrentSession,
  clearCurrentSession,
  syncUserDataToServer,
  saveUserScopedHistory,
} from "./utils/authStorage";

const THEME_STORAGE_KEY = "edugraphic_theme_v2";
const SETTINGS_STORAGE_KEY = "edugraphic_settings_v3";
const HISTORY_STORAGE_KEY = "edugraphic_history_all";

const DEFAULT_SETTINGS: AppSettings = {
  languageMode: "ar",
  themeMode: "light",
  fontSize: "medium",
  motionEffects: true,
  highContrast: false,
  navMode: "buttons",
  showNavDots: true,
  homePreference: "upload",
  historyPrivacy: false,
  enableNotifications: true,
  alertType: "both",
  renderQuality: "high",
  backgroundProcessing: true,
};

export default function App() {
  // Local History state with automatic persistence
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not load history", e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyItems));
    } catch (e) {
      console.warn("Could not save history", e);
    }
  }, [historyItems]);

  // Real Global App Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not read settings from storage", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Main view navigation: initialized according to Home Preference (upload or history)
  const [currentView, setCurrentView] = useState<MainView>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.homePreference === "history") return "history";
      }
    } catch (e) {}
    return "home";
  });

  // Theme mode & Language mode synchronized with settings
  const [themeMode, setThemeMode] = useState<ThemeMode>(settings.themeMode);
  const [languageMode, setLanguageMode] = useState<LanguageMode>(settings.languageMode);

  // In-app Toast Notification State
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning";
  } | null>(null);

  // Trigger notification respecting enableNotifications and alertType
  const triggerAppNotification = (
    title: string,
    message: string,
    type: "info" | "success" | "warning" = "info"
  ) => {
    if (!settings.enableNotifications) return;

    if (settings.alertType === "sound" || settings.alertType === "both") {
      playSound(type === "success" ? "success" : type === "warning" ? "error" : "click");
    }

    if (settings.alertType === "visual" || settings.alertType === "both") {
      const id = Date.now().toString();
      setToastNotification({ id, title, message, type });
      setTimeout(() => {
        setToastNotification((curr) => (curr?.id === id ? null : curr));
      }, 4000);
    }
  };

  // Synchronize full settings to DOM and LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}

    // 1. Language & Direction
    setLanguageMode(settings.languageMode);
    document.documentElement.lang = settings.languageMode;
    document.documentElement.dir = settings.languageMode === "en" ? "ltr" : "rtl";

    // 2. Theme
    setThemeMode(settings.themeMode);
    if (settings.themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 3. Font Size: small, medium, large
    document.documentElement.classList.remove("font-size-small", "font-size-medium", "font-size-large");
    document.documentElement.classList.add(`font-size-${settings.fontSize}`);

    // 4. Motion Effects: toggle all transitions & animations
    if (!settings.motionEffects) {
      document.documentElement.classList.add("disable-motion");
    } else {
      document.documentElement.classList.remove("disable-motion");
    }

    // 5. High Contrast Mode
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // 6. Image Render Quality
    document.documentElement.classList.remove("quality-low", "quality-medium", "quality-high");
    document.documentElement.classList.add(`quality-${settings.renderQuality}`);
  }, [settings]);

  // Check URL parameters for direct shared educational model or QR scan install
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedModelId = urlParams.get("model");
        if (sharedModelId) {
          const match = SAMPLE_DIAGRAMS.find((d) => d.id === sharedModelId);
          if (match) {
            setCurrentDiagram(match);
            setSelectedPartId(match.parts[0]?.id || null);
            setCurrentView("viewer");
          }
        }

        // Automatic device recognition & install trigger when scanned via QR code
        if (
          urlParams.get("install") === "1" ||
          urlParams.get("scan") === "qr" ||
          urlParams.get("ref") === "qr" ||
          urlParams.get("from") === "qr"
        ) {
          setIsFromQrScan(true);
          setIsInstallModalOpen(true);
        }
      } catch (err) {
        console.warn("Could not read URL params:", err);
      }
    }
  }, []);

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  // Current selected diagram
  const [currentDiagram, setCurrentDiagram] = useState<DiagramAnalysis>(
    SAMPLE_DIAGRAMS[0]
  );
  const [selectedPartId, setSelectedPartId] = useState<string | null>(
    SAMPLE_DIAGRAMS[0].parts[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("infographic");

  const toggleTheme = () => {
    handleUpdateSettings({
      themeMode: settings.themeMode === "dark" ? "light" : "dark",
    });
  };

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadInitialTab, setUploadInitialTab] = useState<
    "screen" | "upload" | "camera" | "samples"
  >("upload");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalInitialTab, setExportModalInitialTab] = useState<"export" | "share">("export");
  const [isAppShareModalOpen, setIsAppShareModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isFromQrScan, setIsFromQrScan] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // 1. نظام مشاركة البرنامج الرئيسي (Share EduGraphic Platform)
  const shareApp = () => {
    playSound("click");
    setIsAppShareModalOpen(true);
  };

  // 1.1 نظام تثبيت البرنامج والتعرف على الهاتف (Install App & Device Recognition)
  const openInstallAppModal = (fromQr: boolean = false) => {
    playSound("click");
    setIsFromQrScan(fromQr);
    setIsInstallModalOpen(true);
  };

  // 2. نظام مشاركة المحتوى التعليمي للنموذج (Share Educational Content / Diagram)
  const shareEducationalContent = (tab: "export" | "share" = "share") => {
    playSound("click");
    setExportModalInitialTab(tab);
    setIsExportModalOpen(true);
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    getCurrentSession()
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<
    "login" | "register" | "profile"
  >("login");

  const handleUserChange = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      if (user.history && Array.isArray(user.history) && user.history.length > 0) {
        setHistoryItems(user.history);
      }
      triggerAppNotification(
        settings.languageMode === "en" ? "Welcome!" : "أهلاً بك!",
        (settings.languageMode === "en" ? "Logged in as: " : "تم تسجيل الدخول بحساب: ") + (user.displayName || user.username),
        "success"
      );
    } else {
      clearCurrentSession();
      triggerAppNotification(
        settings.languageMode === "en" ? "Signed Out" : "تم تسجيل الخروج",
        settings.languageMode === "en" ? "You have been signed out" : "تم تسجيل الخروج بنجاح",
        "info"
      );
    }
  };

  const handleOpenAuthModal = (mode: "login" | "register" | "profile" = "login") => {
    if (currentUser && mode !== "profile") {
      setAuthModalInitialMode("profile");
    } else {
      setAuthModalInitialMode(mode);
    }
    setIsAuthModalOpen(true);
  };

  // Educational Vision Experience Modals
  const [isTextExplModalOpen, setIsTextExplModalOpen] = useState(false);
  const [isExplainerVideoOpen, setIsExplainerVideoOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const [isCurrentSavedInNotes, setIsCurrentSavedInNotes] = useState(() =>
    isDiagramSavedInNotes(currentDiagram.id, currentUser?.id)
  );

  useEffect(() => {
    setIsCurrentSavedInNotes(isDiagramSavedInNotes(currentDiagram.id, currentUser?.id));
  }, [currentDiagram.id, currentUser?.id]);

  const handleSaveCurrentToNotes = () => {
    saveDiagramToNotes(currentDiagram, undefined, currentUser?.id);
    setIsCurrentSavedInNotes(true);
    saveVisionAnalysisAsNote({
      title: currentDiagram.titleAr || currentDiagram.titleEn,
      imageUrl: currentDiagram.imageUrl,
      analysisText:
        currentDiagram.summaryAr ||
        currentDiagram.directSummaryAr ||
        currentDiagram.summaryEn ||
        currentDiagram.titleAr,
      diagramId: currentDiagram.id,
      userId: currentUser?.id || "guest",
      category: "📚 الدراسة",
    }).catch((err) => console.warn("Could not save to notesFirestore:", err));

    triggerAppNotification(
      settings.languageMode === "en" ? "Saved to My Notes" : "تم الحفظ في ملاحظاتي",
      settings.languageMode === "en"
        ? "Diagram, explanation, quiz, and walkthrough saved successfully to your notes library"
        : "تم حفظ الصورة، الشرح، مسرد الأجزاء والاختبار في قسم ملاحظاتي بنجاح للرجوع إليها في أي وقت",
      "success"
    );
  };

  // Active Multimodal Vision Session State
  const [activeVisionSession, setActiveVisionSession] = useState<VisionSession | null>(null);

  const handleVisionAnalysisStart = (session: VisionSession) => {
    setActiveVisionSession(session);
    setCurrentView("vision");
    setIsUploadModalOpen(false);
    triggerAppNotification(
      settings.languageMode === "en" ? "Vision Assistant" : "مساعد الرؤية وتحليل الشاشة",
      settings.languageMode === "en" ? "Interactive vision session ready" : "بدء جلسة التحليل الذكي للصورة",
      "success"
    );
  };

  // Synchronize history changes to server when user is logged in
  useEffect(() => {
    if (currentUser) {
      syncUserDataToServer(currentUser.id, { history: historyItems }).catch(() => {});
    }
  }, [historyItems, currentUser?.id]);

  // Chat prefill prompt
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(
    null
  );

  // Summary speech state
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  // Animated Walkthrough Tour state
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    const unsubscribe = speechManager.subscribe((speaking) => {
      if (!speaking) {
        setIsSpeakingSummary(false);
      }
    });
    return unsubscribe;
  }, []);

  const selectedPart =
    currentDiagram.parts.find((p) => p.id === selectedPartId) ||
    currentDiagram.parts[0] ||
    null;

  const currentPartIndex = selectedPart
    ? currentDiagram.parts.findIndex((p) => p.id === selectedPart.id)
    : 0;

  const handleSelectPart = (part: DiagramPart) => {
    setSelectedPartId(part.id);
  };

  const handleSelectNextPart = () => {
    if (currentDiagram.parts.length === 0) return;
    const nextIdx = (currentPartIndex + 1) % currentDiagram.parts.length;
    setSelectedPartId(currentDiagram.parts[nextIdx].id);
  };

  const handleSelectPrevPart = () => {
    if (currentDiagram.parts.length === 0) return;
    const prevIdx =
      (currentPartIndex - 1 + currentDiagram.parts.length) %
      currentDiagram.parts.length;
    setSelectedPartId(currentDiagram.parts[prevIdx].id);
  };

  const handleSelectDiagramFromGrid = (diagram: DiagramAnalysis) => {
    setCurrentDiagram(diagram);
    setIsTourActive(false);
    if (diagram.parts.length > 0) {
      setSelectedPartId(diagram.parts[0].id);
    }
    setCurrentView("viewer");
    setActiveTab("infographic");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // User explicitly explored this model from "استكشف النماذج التعليمية" -> record to history as requested
    const exploredHistoryItem: HistoryItem = {
      id: diagram.id,
      titleAr: diagram.titleAr,
      titleEn: diagram.titleEn,
      subjectAr: diagram.subjectAr,
      partsCount: diagram.parts.length,
      thumbnail: diagram.imageUrl,
      createdAt: new Date().toISOString(),
      analysis: diagram,
    };

    setHistoryItems((prev) => {
      const updated = [
        exploredHistoryItem,
        ...prev.filter((i) => i.id !== diagram.id),
      ];
      if (currentUser) {
        saveUserScopedHistory(currentUser.id, updated);
      }
      return updated;
    });
  };

  const handleAnalysisComplete = (newAnalysis: DiagramAnalysis) => {
    setCurrentDiagram(newAnalysis);
    setIsTourActive(false);
    if (newAnalysis.parts.length > 0) {
      setSelectedPartId(newAnalysis.parts[0].id);
    }
    setCurrentView("viewer");
    setActiveTab("infographic");

    // Add user uploaded/captured diagram to history
    const newHistoryItem: HistoryItem = {
      id: newAnalysis.id,
      titleAr: newAnalysis.titleAr,
      titleEn: newAnalysis.titleEn,
      subjectAr: newAnalysis.subjectAr,
      partsCount: newAnalysis.parts.length,
      thumbnail: newAnalysis.imageUrl,
      createdAt: newAnalysis.createdAt || new Date().toISOString(),
      analysis: newAnalysis,
    };

    setHistoryItems((prev) => {
      const updated = [
        newHistoryItem,
        ...prev.filter((i) => i.id !== newAnalysis.id),
      ];
      if (currentUser) {
        saveUserScopedHistory(currentUser.id, updated);
      }
      return updated;
    });
  };

  const handleAskAiAboutPart = (part: DiagramPart) => {
    const prompt = `اشرح لي بالتفصيل ما هي وظيفة (${part.nameAr} - ${part.nameEn}) في هذا المخطط، وماذا يحدث إذا حدث خلل أو تلف في هذا الجزء؟`;
    setChatInitialPrompt(prompt);
    setActiveTab("chat");
  };

  const handleSpeakSummary = () => {
    if (isSpeakingSummary) {
      speechManager.stop();
      setIsSpeakingSummary(false);
      return;
    }
    const text =
      languageMode === "en"
        ? `${currentDiagram.titleEn}. ${currentDiagram.summaryEn}`
        : `${currentDiagram.titleAr}. ${currentDiagram.summaryAr}`;
    setIsSpeakingSummary(true);
    speechManager.speak(
      text,
      languageMode === "en" ? "en" : "ar",
      undefined,
      () => setIsSpeakingSummary(false)
    );
  };

  const isDark = themeMode === "dark";
  const isEn = languageMode === "en";

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16 transition-colors duration-200 relative overflow-x-hidden ${
        isDark ? "bg-[#0B1528] text-white" : "bg-slate-50/50 text-slate-900"
      }`}
    >
      {/* Interactive AI & Computer Vision Modern Background */}
      <AIInteractiveBackground
        mode={currentView === "viewer" ? "viewer" : "ambient"}
        isAnalyzing={isAnalyzing}
        themeMode={themeMode}
      />

      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenExport={() => shareEducationalContent("export")}
        onShareApp={shareApp}
        onOpenInstallModal={() => openInstallAppModal(false)}
        onOpenNotes={() => {
          setCurrentView("notes");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        viewerTitle={isEn ? currentDiagram.titleEn || currentDiagram.titleAr : currentDiagram.titleAr}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        languageMode={languageMode}
        onToggleLanguage={() =>
          setLanguageMode((prev) => (prev === "en" ? "ar" : "en"))
        }
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal()}
      />

      {/* Main Views */}
      <main className="flex-1 w-full relative z-10">
        {/* VIEW 1: HOME (Exact match to Screenshot 1 and Dark Screenshot) */}
        {currentView === "home" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Section */}
            <HeroSection
              onUploadClick={() => {
                setUploadInitialTab("upload");
                setIsUploadModalOpen(true);
              }}
              onCameraClick={() => {
                setUploadInitialTab("camera");
                setIsUploadModalOpen(true);
              }}
              onScreenCaptureClick={() => {
                setUploadInitialTab("screen");
                setIsUploadModalOpen(true);
              }}
              onShareApp={shareApp}
              themeMode={themeMode}
              languageMode={languageMode}
            />

            {/* Explore 12 Models Grid */}
            <ExploreModelsGrid
              diagrams={SAMPLE_DIAGRAMS}
              onSelectDiagram={handleSelectDiagramFromGrid}
              themeMode={themeMode}
              languageMode={languageMode}
            />
          </div>
        )}

        {/* VIEW 2: SETTINGS (Exact match to Screenshot 2) */}
        {currentView === "settings" && (
          <SettingsView
            languageMode={settings.languageMode}
            onLanguageModeChange={(lang) => handleUpdateSettings({ languageMode: lang })}
            onBackToHome={() => setCurrentView(settings.homePreference === "history" ? "history" : "home")}
            themeMode={settings.themeMode}
            onThemeModeChange={(theme) => handleUpdateSettings({ themeMode: theme })}
            currentUser={currentUser}
            onUserChange={handleUserChange}
            onOpenAuthModal={() => handleOpenAuthModal("login")}
            fontSize={settings.fontSize}
            onFontSizeChange={(size) => handleUpdateSettings({ fontSize: size })}
            motionEffects={settings.motionEffects}
            onMotionEffectsChange={(enabled) => handleUpdateSettings({ motionEffects: enabled })}
            highContrast={settings.highContrast}
            onHighContrastChange={(enabled) => handleUpdateSettings({ highContrast: enabled })}
            navMode={settings.navMode}
            onNavModeChange={(mode) => handleUpdateSettings({ navMode: mode })}
            showNavDots={settings.showNavDots}
            onShowNavDotsChange={(show) => handleUpdateSettings({ showNavDots: show })}
            homePreference={settings.homePreference}
            onHomePreferenceChange={(pref) => handleUpdateSettings({ homePreference: pref })}
            historyPrivacy={settings.historyPrivacy}
            onHistoryPrivacyChange={(privacy) => handleUpdateSettings({ historyPrivacy: privacy })}
            enableNotifications={settings.enableNotifications}
            onEnableNotificationsChange={(enabled) => handleUpdateSettings({ enableNotifications: enabled })}
            alertType={settings.alertType}
            onAlertTypeChange={(type) => handleUpdateSettings({ alertType: type })}
            renderQuality={settings.renderQuality}
            onRenderQualityChange={(quality) => handleUpdateSettings({ renderQuality: quality })}
            backgroundProcessing={settings.backgroundProcessing}
            onBackgroundProcessingChange={(enabled) => handleUpdateSettings({ backgroundProcessing: enabled })}
            onTriggerTestNotification={triggerAppNotification}
          />
        )}

        {/* VIEW 3: HISTORY */}
        {currentView === "history" && (
          <HistoryView
            historyItems={historyItems}
            onSelectHistoryItem={(diagram) => {
              setCurrentDiagram(diagram);
              if (diagram.parts.length > 0) {
                setSelectedPartId(diagram.parts[0].id);
              }
              setCurrentView("viewer");
            }}
            onDeleteHistoryItem={(id) => {
              setHistoryItems((prev) => prev.filter((i) => i.id !== id));
            }}
            onClearHistory={() => {
              setHistoryItems([]);
            }}
            onBackToHome={() => setCurrentView("home")}
            languageMode={settings.languageMode}
            themeMode={settings.themeMode}
            historyPrivacy={settings.historyPrivacy}
            onToggleHistoryPrivacy={() =>
              handleUpdateSettings({ historyPrivacy: !settings.historyPrivacy })
            }
          />
        )}

        {/* VIEW 4: VISION ASSISTANT (Multimodal Vision & Screen Analysis) */}
        {currentView === "vision" && (
          <VisionAssistantView
            session={activeVisionSession}
            onBack={() => setCurrentView("home")}
            onNewAnalysis={() => {
              setUploadInitialTab("screen");
              setIsUploadModalOpen(true);
            }}
            languageMode={settings.languageMode}
            themeMode={settings.themeMode}
            userId={currentUser?.id}
            onOpenNotes={() => {
              setCurrentView("notes");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* VIEW 5: INTERACTIVE DIAGRAM VIEWER */}
        {currentView === "viewer" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 animate-in fade-in duration-200">
            {/* Top Navigation & Primary Educational Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <button
                onClick={() => setCurrentView("home")}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-300 hover:text-blue-400"
                    : "text-slate-700 hover:text-blue-600"
                }`}
              >
                <ArrowRight className={`w-4 h-4 text-blue-500 ${isEn ? "rotate-180" : ""}`} />
                <span>{isEn ? "Back to Home & Models" : "العودة للرئيسية ونماذج الكتب"}</span>
              </button>

              {/* High-Impact Educational Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. ابدأ الاختبار (Start Quiz) Button */}
                <button
                  id="viewer-start-quiz-btn"
                  onClick={() => {
                    setActiveTab("quiz");
                    const quizEl = document.getElementById("diagram-quiz-section");
                    if (quizEl) {
                      quizEl.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-102 active:scale-98"
                  title={isEn ? "Start Interactive Quiz" : "بدء الاختبار التفاعلي الذاتي"}
                >
                  <ListChecks className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isEn ? "Start Quiz" : "ابدأ الاختبار"}</span>
                </button>

                {/* 2. شرح النص (Explain In-Image Text) Button */}
                <button
                  id="viewer-explain-text-btn"
                  onClick={() => setIsTextExplModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-102 active:scale-98"
                  title={isEn ? "Read and Explain In-Image Text" : "قراءة وتوضيح النصوص والمعلومات داخل الصورة"}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isEn ? "Explain Text" : "شرح النص"}</span>
                </button>

                {/* 3. إنشاء فيديو توضيحي (Generate Explainer Video) Button */}
                <button
                  id="viewer-explainer-video-btn"
                  onClick={() => setIsExplainerVideoOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-102 active:scale-98"
                  title={isEn ? "Generate Animated Explainer Video" : "إنشاء فيديو توضيحي مع حركة وتكبير وتنقل بصري"}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{isEn ? "Explainer Video" : "إنشاء فيديو توضيحي"}</span>
                </button>

                {/* 4. حفظ في ملاحظاتي (Save to My Notes) Button */}
                <button
                  id="viewer-save-notes-btn"
                  onClick={handleSaveCurrentToNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-102 active:scale-98"
                  title={isEn ? "Save Diagram & Analysis to Notes" : "حفظ الصورة ومحتواها في ملاحظاتي للرجوع إليها لاحقاً"}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>{isEn ? "Save to Notes" : "حفظ في ملاحظاتي"}</span>
                </button>

                {/* 5. ملاحظاتي (Open My Notes Modal) Button */}
                <button
                  id="viewer-open-notes-btn"
                  onClick={() => setIsNotesModalOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    isDark
                      ? "bg-[#13233E] border-slate-700 hover:bg-[#1E345D] text-slate-200"
                      : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                  }`}
                  title={isEn ? "Open My Notes Library" : "فتح مكتبة ملاحظاتي"}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isEn ? "My Notes" : "ملاحظاتي"}</span>
                </button>

                {/* 6. تصدير ومشاركة محتوى النموذج (Export & Share Educational Model) Button */}
                <button
                  id="viewer-export-share-btn"
                  onClick={() => shareEducationalContent("share")}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors px-3 py-1.5 rounded-xl border cursor-pointer ${
                    isDark
                      ? "text-blue-400 hover:text-blue-300 bg-[#13233E] border-slate-700"
                      : "text-blue-600 hover:text-blue-700 bg-blue-50 border-blue-200/50"
                  }`}
                  title={isEn ? "Share this educational model or export as file" : "مشاركة هذا النموذج التعليمي أو تصديره كملف"}
                >
                  {isEn ? "Share / Export" : "مشاركة / تصدير"}
                </button>
              </div>
            </div>

            {/* Title & Metadata Banner */}
            <div
              className={`rounded-2xl p-5 sm:p-6 border transition-all ${
                isDark
                  ? "bg-[#101C33] border-slate-800 text-white shadow-lg"
                  : "bg-white border-slate-100 shadow-xs text-slate-900"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        isDark
                          ? "bg-[#13233E] text-blue-300 border-slate-700"
                          : "bg-blue-50 text-blue-700 border-blue-200/50"
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{isEn ? currentDiagram.subjectEn || currentDiagram.subjectAr : currentDiagram.subjectAr}</span>
                    </span>

                    {/* Recognized Content Type Badge */}
                    {currentDiagram.contentType && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          isDark
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>
                          {currentDiagram.contentType === "question"
                            ? isEn ? "Study Exercise / Question" : "سؤال / مسألة دراسية"
                            : currentDiagram.contentType === "table"
                            ? isEn ? "Comparison / Data Table" : "جدول مقارنة وبيانات"
                            : currentDiagram.contentType === "chart"
                            ? isEn ? "Scientific Chart" : "رسم بياني علمي"
                            : currentDiagram.contentType === "textbook_page"
                            ? isEn ? "Textbook Page" : "صفحة من الكتاب المدرسي"
                            : isEn ? "Scientific Diagram" : "مخطط ورسم توضيحي"}
                        </span>
                      </span>
                    )}

                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isDark
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isEn ? currentDiagram.gradeLevelEn || currentDiagram.gradeLevelAr : currentDiagram.gradeLevelAr}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        isDark
                          ? "bg-[#13233E] text-blue-400"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {currentDiagram.parts.length} {isEn ? "Interactive Elements" : "عناصر تفاعلية"}
                    </span>
                  </div>

                  <h2
                    className={`text-xl sm:text-2xl font-black tracking-tight leading-snug ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {isEn ? currentDiagram.titleEn || currentDiagram.titleAr : currentDiagram.titleAr}
                  </h2>
                  {isEn ? (
                    <p
                      className="text-sm font-semibold text-blue-400 tracking-wide font-sans"
                      dir="rtl"
                    >
                      {currentDiagram.titleAr}
                    </p>
                  ) : (
                    <p
                      className="text-sm font-semibold text-blue-400 tracking-wide font-sans"
                      dir="ltr"
                    >
                      {currentDiagram.titleEn}
                    </p>
                  )}

                  {/* Direct and Concise Explanation Box */}
                  <div
                    className={`mt-2.5 p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                      isDark
                        ? "bg-[#0B1528] border-blue-900/60 text-slate-200"
                        : "bg-blue-50/70 border-blue-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-blue-600 dark:text-blue-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>{isEn ? "Direct & Concise Explanation:" : "الشرح المباشر والمختصر:"}</span>
                    </div>
                    <p className="leading-relaxed">
                      {isEn
                        ? currentDiagram.directSummaryEn || currentDiagram.summaryEn || currentDiagram.summaryAr
                        : currentDiagram.directSummaryAr || currentDiagram.summaryAr}
                    </p>
                  </div>
                </div>

                {/* Interactive Tour & Voice Readout Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                  {/* Start Tour "Wow Effect" Hero Button */}
                  <button
                    id="header-start-tour-btn"
                    onClick={() => setIsTourActive((prev) => !prev)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer border ${
                      isTourActive
                        ? "bg-rose-600 hover:bg-rose-500 border-rose-400 shadow-rose-600/30"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 border-blue-400/50 shadow-blue-600/30 animate-pulse"
                    }`}
                    title={
                      isTourActive
                        ? isEn ? "End Tour" : "إنهاء الشرح التفاعلي"
                        : isEn ? "Turn static image into an animated interactive walkthrough" : "تحويل الصورة الجامدة إلى شرح متحرك متسلسل"
                    }
                  >
                    {isTourActive ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>{isEn ? "End Tour" : "إنهاء الشرح"}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isEn ? "Start Tour ▶️" : "بدء الشرح المتحرك ▶️"}</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </>
                    )}
                  </button>

                  {/* Summary Audio Readout */}
                  <button
                    id="speak-summary-btn"
                    onClick={handleSpeakSummary}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSpeakingSummary
                        ? "bg-blue-600 border-blue-500 text-white animate-pulse shadow-md"
                        : isDark
                        ? "bg-[#13233E] border-slate-700 hover:bg-[#1C3156] text-slate-200"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
                    }`}
                    title={isSpeakingSummary ? (isEn ? "Stop Audio" : "إيقاف الصوت") : (isEn ? "Listen to Lesson Summary" : "استماع لملخص الدرس")}
                  >
                    {isSpeakingSummary ? (
                      <>
                        <VolumeX className="w-4 h-4 text-white" />
                        <span>{isEn ? "Stop Audio" : "إيقاف الصوت"}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-blue-400" />
                        <span>{isEn ? "Listen to Summary" : "استماع للملخص"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Natural Audio Voice Readout & Educational Sound Controls Bar */}
            <AudioExplanationBar
              diagram={currentDiagram}
              languageMode={settings.languageMode}
            />

            {/* Interactive Model Action Toolbar: Quiz, Audio, Video, Export File, Notes, Share */}
            <ModelActionToolbar
              onStartQuiz={() => setActiveTab("quiz")}
              onToggleAudio={handleSpeakSummary}
              isAudioPlaying={isSpeakingSummary}
              onOpenExplainerVideo={() => setIsExplainerVideoOpen(true)}
              onSaveAsFile={() => shareEducationalContent("export")}
              onSaveToNotes={handleSaveCurrentToNotes}
              isSavedInNotes={isCurrentSavedInNotes}
              onShareModel={() => shareEducationalContent("share")}
              languageMode={settings.languageMode}
              themeMode={settings.themeMode}
            />

            {/* Primary Interactive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Diagram (8 cols on lg) */}
              <div className="lg:col-span-8 space-y-4">
                <InteractiveDiagram
                  imageUrl={currentDiagram.imageUrl}
                  parts={currentDiagram.parts}
                  selectedPartId={selectedPartId}
                  onSelectPart={handleSelectPart}
                  languageMode={settings.languageMode}
                  isTourActiveExternal={isTourActive}
                  onToggleTourExternal={setIsTourActive}
                  diagramTitleAr={currentDiagram.titleAr}
                  diagramTitleEn={currentDiagram.titleEn}
                  diagramSubjectAr={currentDiagram.subjectAr}
                  onAskAiTutor={() => {
                    setActiveTab("chat");
                  }}
                  navMode={settings.navMode}
                  showNavDots={settings.showNavDots}
                  renderQuality={settings.renderQuality}
                />

                {/* Key Takeaways & Study Points Strip */}
                {((isEn && currentDiagram.keyTakeawaysEn && currentDiagram.keyTakeawaysEn.length > 0) ||
                  (currentDiagram.keyTakeawaysAr && currentDiagram.keyTakeawaysAr.length > 0)) && (
                    <div
                      className={`rounded-2xl p-4 text-xs space-y-2 border ${
                        isDark
                          ? "bg-[#101C33] border-slate-800 text-slate-200"
                          : "bg-blue-50/70 border-blue-200/80 text-blue-950"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                        <span>{isEn ? "Key Study & Memory Takeaways:" : "ملاحظات سريعة للاستذكار والحفظ:"}</span>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {(isEn && currentDiagram.keyTakeawaysEn && currentDiagram.keyTakeawaysEn.length > 0
                          ? currentDiagram.keyTakeawaysEn
                          : currentDiagram.keyTakeawaysAr
                        ).map((point, idx) => (
                          <li
                            key={idx}
                            className={`rounded-xl p-2.5 border flex items-start gap-2 ${
                              isDark
                                ? "bg-[#13233E] border-slate-700 text-slate-200"
                                : "bg-white/80 border-blue-100 text-slate-700 shadow-2xs"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Right Column: Dynamic Exploratory Tools (4 cols on lg) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Tab Navigation Controls */}
                <div
                  className={`p-1 rounded-xl border grid grid-cols-4 gap-1 text-xs font-bold ${
                    isDark
                      ? "bg-[#101C33] border-slate-800 text-slate-300"
                      : "bg-white border-slate-200 text-slate-600 shadow-2xs"
                  }`}
                >
                  <button
                    id="tab-btn-infographic"
                    onClick={() => setActiveTab("infographic")}
                    className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      activeTab === "infographic"
                        ? "bg-blue-600 text-white shadow-xs"
                        : isDark
                        ? "hover:bg-[#13233E] text-slate-300"
                        : "hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isEn ? "Part Details" : "تفاصيل الجزء"}</span>
                  </button>

                  <button
                    id="tab-btn-parts"
                    onClick={() => setActiveTab("parts")}
                    className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      activeTab === "parts"
                        ? "bg-blue-600 text-white shadow-xs"
                        : isDark
                        ? "hover:bg-[#13233E] text-slate-300"
                        : "hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isEn ? "Parts Index" : "فهرس الأجزاء"}</span>
                  </button>

                  <button
                    id="tab-btn-quiz"
                    onClick={() => setActiveTab("quiz")}
                    className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      activeTab === "quiz"
                        ? "bg-blue-600 text-white shadow-xs"
                        : isDark
                        ? "hover:bg-[#13233E] text-slate-300"
                        : "hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isEn ? "Quiz" : "الاختبار"}</span>
                  </button>

                  <button
                    id="tab-btn-chat"
                    onClick={() => setActiveTab("chat")}
                    className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      activeTab === "chat"
                        ? "bg-blue-600 text-white shadow-xs"
                        : isDark
                        ? "hover:bg-[#13233E] text-slate-300"
                        : "hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isEn ? "AI Tutor" : "المعلم الذكي"}</span>
                  </button>
                </div>

                {/* Tab 1: Selected Part Details Card */}
                {activeTab === "infographic" && (
                  <PartDetailsCard
                    part={selectedPart}
                    totalParts={currentDiagram.parts.length}
                    currentIndex={currentPartIndex}
                    onSelectNext={handleSelectNextPart}
                    onSelectPrev={handleSelectPrevPart}
                    onAskAiAboutPart={handleAskAiAboutPart}
                    languageMode={languageMode}
                  />
                )}

                {/* Tab 2: Parts Search & Index List */}
                {activeTab === "parts" && (
                  <div className="h-[520px]">
                    <PartsList
                      parts={currentDiagram.parts}
                      selectedPartId={selectedPartId}
                      onSelectPart={handleSelectPart}
                      languageMode={languageMode}
                    />
                  </div>
                )}

                {/* Tab 3: Interactive Quiz */}
                {activeTab === "quiz" && (
                  <QuizSection
                    quiz={currentDiagram.quiz}
                    diagramTitle={isEn ? currentDiagram.titleEn || currentDiagram.titleAr : currentDiagram.titleAr}
                    diagramId={currentDiagram.id}
                    languageMode={languageMode}
                  />
                )}

                {/* Tab 4: AI Tutor Chat */}
                {activeTab === "chat" && (
                  <AiTutorChat
                    diagram={currentDiagram}
                    currentPart={selectedPart}
                    initialPrompt={chatInitialPrompt}
                    onClearInitialPrompt={() => setChatInitialPrompt(null)}
                    languageMode={languageMode}
                    userId={currentUser?.id}
                    onOpenNotes={() => {
                      setCurrentView("notes");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                )}
              </div>
            </div>

            {/* 3-Tier Educational Explanations Section (Structured, Simplified, Detailed) */}
            <EducationalExplanationsSection
              diagram={currentDiagram}
              languageMode={settings.languageMode}
              themeMode={settings.themeMode}
              onSaveToNotes={handleSaveCurrentToNotes}
              isSavedInNotes={isCurrentSavedInNotes}
            />
          </div>
        )}

        {/* VIEW 6: NOTES (📝 ملاحظاتي - نظام الملاحظات المتكامل) */}
        {currentView === "notes" && (
          <NotesView
            userId={currentUser?.id}
            languageMode={settings.languageMode}
            themeMode={settings.themeMode}
            onNavigateBack={() => {
              setCurrentView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar matching Screenshot 1 & 2 */}
      <BottomNavBar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onPlusClick={() => {
          setUploadInitialTab("upload");
          setIsUploadModalOpen(true);
        }}
        onToggleAiChat={() => setIsFloatingChatOpen(true)}
        onOpenNotes={() => {
          setCurrentView("notes");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        themeMode={themeMode}
        languageMode={languageMode}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal(currentUser ? "profile" : "login")}
      />

      {/* Authentication Modal (Sign in, Sign up, Profile Management) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        languageMode={languageMode}
        themeMode={themeMode}
        initialMode={authModalInitialMode}
      />

      {/* Floating AI Tutor Modal when FAB is clicked */}
      {isFloatingChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border flex flex-col ${
              isDark
                ? "bg-[#101C33] border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDark
                  ? "bg-[#0B1528] border-slate-800"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {isEn ? "EduGraphic AI Tutor" : "المعلم الذكي لإديو-جرافيك"}
                  </h3>
                  <p
                    className={`text-[11px] ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {isEn ? "Your smart assistant to explain textbook concepts" : "مساعدك الذكي لشرح أي مفهوم علمي في كتابك"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFloatingChatOpen(false)}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              <AiTutorChat
                diagram={currentDiagram}
                currentPart={selectedPart}
                initialPrompt={chatInitialPrompt}
                onClearInitialPrompt={() => setChatInitialPrompt(null)}
                languageMode={languageMode}
                userId={currentUser?.id}
                onOpenNotes={() => {
                  setIsFloatingChatOpen(false);
                  setCurrentView("notes");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload / Camera Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
        onVisionAnalysisStart={handleVisionAnalysisStart}
        isAnalyzing={isAnalyzing}
        setIsAnalyzing={setIsAnalyzing}
        initialTab={uploadInitialTab}
        languageMode={languageMode}
        themeMode={themeMode}
      />

      {/* 1. Main Platform App Share Modal (مشاركة برنامج إديو-جرافيك) */}
      <AppShareModal
        isOpen={isAppShareModalOpen}
        onClose={() => setIsAppShareModalOpen(false)}
        themeMode={themeMode}
        languageMode={languageMode}
        onOpenInstallModal={() => openInstallAppModal(false)}
      />

      {/* 1.1 Smart Device Recognition & PWA App Install Modal (التعرف على الهاتف وتثبيت البرنامج) */}
      <SmartAppInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        languageMode={languageMode}
        fromQrScan={isFromQrScan}
      />

      {/* 2. Educational Content & Model Share Modal (مشاركة النموذج التعليمي والتصدير) */}
      <ExportShareModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        diagram={currentDiagram}
        languageMode={languageMode}
        initialTab={exportModalInitialTab}
        userId={currentUser?.id}
        onSavedToNotesCallback={() => setIsCurrentSavedInNotes(true)}
      />

      {/* In-Image Text Reading & Explanation Modal */}
      <ImageTextExplanationModal
        isOpen={isTextExplModalOpen}
        onClose={() => setIsTextExplModalOpen(false)}
        diagram={currentDiagram}
        languageMode={languageMode}
        onSaveToNotes={handleSaveCurrentToNotes}
      />

      {/* Dynamic Animated Explainer Video Generator Modal */}
      <ExplainerVideoModal
        isOpen={isExplainerVideoOpen}
        onClose={() => setIsExplainerVideoOpen(false)}
        diagram={currentDiagram}
        languageMode={languageMode}
        onSaveToNotes={() => handleSaveCurrentToNotes()}
      />

      {/* My Saved Notes & Review Library Modal */}
      <MyNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onSelectDiagram={(diagram) => {
          setCurrentDiagram(diagram);
          setCurrentView("viewer");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        languageMode={languageMode}
        userId={currentUser?.id}
      />

      {/* Toast Notification Alert Overlay */}
      {toastNotification && (
        <div
          dir={languageMode === "en" ? "ltr" : "rtl"}
          className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 rounded-2xl bg-slate-900/95 text-white border border-blue-500/50 shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 backdrop-blur-md"
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              toastNotification.type === "success"
                ? "bg-emerald-500/20 text-emerald-400"
                : toastNotification.type === "warning"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-blue-600/20 text-blue-400"
            }`}
          >
            {toastNotification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : toastNotification.type === "warning" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">{toastNotification.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toastNotification.message}</p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
