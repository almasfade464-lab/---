import React, { useState } from "react";
import {
  Globe,
  Palette,
  Compass,
  Shield,
  Bell,
  Zap,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Moon,
  Sun,
  Sparkles,
  Smartphone,
  Upload,
  History,
  Check,
  Award,
  AlertTriangle,
  X,
  Volume2,
  Cpu,
  Sliders,
  Eye,
  EyeOff,
  Camera,
  User,
  Key,
  LogOut,
  Edit3,
  Lock,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  LanguageMode,
  SettingsTab,
  ThemeMode,
  FontSizePreference,
  NavModePreference,
  HomePreference,
  AlertTypePreference,
  RenderQualityPreference,
  UserAccount,
} from "../types";
import { EduGraphicLogo } from "./EduGraphicLogo";
import { getAvatarById } from "../data/avatars";
import { AvatarSelector } from "./AvatarSelector";
import {
  changeUsername,
  changePassword,
  changeAvatar,
  validateUsername,
} from "../utils/authStorage";

interface SettingsViewProps {
  languageMode: LanguageMode;
  onLanguageModeChange: (mode: LanguageMode) => void;
  onBackToHome: () => void;
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  currentUser?: UserAccount | null;
  onUserChange?: (user: UserAccount | null) => void;
  onOpenAuthModal?: () => void;
  // Functional Settings
  fontSize?: FontSizePreference;
  onFontSizeChange?: (size: FontSizePreference) => void;
  motionEffects?: boolean;
  onMotionEffectsChange?: (enabled: boolean) => void;
  highContrast?: boolean;
  onHighContrastChange?: (enabled: boolean) => void;
  navMode?: NavModePreference;
  onNavModeChange?: (mode: NavModePreference) => void;
  showNavDots?: boolean;
  onShowNavDotsChange?: (show: boolean) => void;
  homePreference?: HomePreference;
  onHomePreferenceChange?: (pref: HomePreference) => void;
  historyPrivacy?: boolean;
  onHistoryPrivacyChange?: (privacy: boolean) => void;
  enableNotifications?: boolean;
  onEnableNotificationsChange?: (enabled: boolean) => void;
  alertType?: AlertTypePreference;
  onAlertTypeChange?: (type: AlertTypePreference) => void;
  renderQuality?: RenderQualityPreference;
  onRenderQualityChange?: (quality: RenderQualityPreference) => void;
  backgroundProcessing?: boolean;
  onBackgroundProcessingChange?: (enabled: boolean) => void;
  onTriggerTestNotification?: (title: string, message: string, type?: "info" | "success" | "warning") => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  languageMode,
  onLanguageModeChange,
  onBackToHome,
  themeMode = "light",
  onThemeModeChange,
  currentUser,
  onUserChange,
  onOpenAuthModal,
  fontSize = "medium",
  onFontSizeChange,
  motionEffects = true,
  onMotionEffectsChange,
  highContrast = false,
  onHighContrastChange,
  navMode = "buttons",
  onNavModeChange,
  showNavDots = true,
  onShowNavDotsChange,
  homePreference = "upload",
  onHomePreferenceChange,
  historyPrivacy = false,
  onHistoryPrivacyChange,
  enableNotifications = true,
  onEnableNotificationsChange,
  alertType = "both",
  onAlertTypeChange,
  renderQuality = "high",
  onRenderQualityChange,
  backgroundProcessing = true,
  onBackgroundProcessingChange,
  onTriggerTestNotification,
}) => {
  const isEn = languageMode === "en";
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Account editing states inside settings
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currPassInput, setCurrPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmPassInput, setConfirmPassInput] = useState("");
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [accountActionLoading, setAccountActionLoading] = useState(false);

  // Appearance state handlers
  const handleSetFontSize = (sz: FontSizePreference) => {
    onFontSizeChange?.(sz);
  };
  const handleToggleMotion = () => {
    onMotionEffectsChange?.(!motionEffects);
  };
  const handleToggleContrast = () => {
    onHighContrastChange?.(!highContrast);
  };

  // Navigation state handlers
  const handleSetNavMode = (mode: NavModePreference) => {
    onNavModeChange?.(mode);
  };
  const handleToggleNavDots = () => {
    onShowNavDotsChange?.(!showNavDots);
  };
  const handleSetHomePreference = (pref: HomePreference) => {
    onHomePreferenceChange?.(pref);
  };

  // Privacy state handlers
  const handleTogglePrivacy = () => {
    onHistoryPrivacyChange?.(!historyPrivacy);
  };

  // Notifications state handlers
  const handleToggleNotifications = () => {
    onEnableNotificationsChange?.(!enableNotifications);
  };
  const handleSetAlertType = (type: AlertTypePreference) => {
    onAlertTypeChange?.(type);
  };

  // Performance state handlers
  const handleSetRenderQuality = (quality: RenderQualityPreference) => {
    onRenderQualityChange?.(quality);
  };
  const handleToggleBackgroundProcessing = () => {
    onBackgroundProcessingChange?.(!backgroundProcessing);
  };

  const [cacheCleared, setCacheCleared] = useState(false);

  // Help FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isDark = themeMode === "dark";

  const menuItems = [
    {
      id: "account" as SettingsTab,
      label: isEn ? "Account & Profile" : "الحساب والملف الشخصي",
      icon: User,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30",
    },
    {
      id: "language" as SettingsTab,
      label: "اللغة",
      icon: Globe,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-900/30",
    },
    {
      id: "appearance" as SettingsTab,
      label: "المظهر",
      icon: Palette,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-900/30",
    },
    {
      id: "navigation" as SettingsTab,
      label: "التنقل",
      icon: Compass,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-900/30",
    },
    {
      id: "privacy" as SettingsTab,
      label: "الخصوصية",
      icon: Shield,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-900/30",
    },
    {
      id: "notifications" as SettingsTab,
      label: "الإشعارات",
      icon: Bell,
      color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30",
    },
    {
      id: "performance" as SettingsTab,
      label: "الأداء",
      icon: Zap,
      color: "text-sky-500 bg-sky-50 dark:bg-sky-900/30",
    },
    {
      id: "help" as SettingsTab,
      label: "المساعدة",
      icon: HelpCircle,
      color: "text-slate-500 bg-slate-100 dark:bg-slate-800",
    },
    {
      id: "vision" as SettingsTab,
      label: "الرؤية التقنية",
      icon: Sparkles,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30",
    },
  ];

  // 10 Help questions focused on Computer Vision and EduGraphic Platform
  const faqList = [
    {
      question: "ما هي تقنية الرؤية الحاسوبية (Computer Vision) المعتمدة في المنصة؟",
      answer:
        "تعتمد منصة EduGraphic على أحدث نماذج الرؤية الحاسوبية متعددة الوسائط (Multimodal Vision Models) القادرة على مسح وتحليل الصور والمخططات المعقدة، وتحويل البكسلات الهندسية إلى كائنات رقمية تفاعلية ذات دلالة علمية وفيزيائية فائقة الدقة.",
    },
    {
      question: "كيف يكتشف محرك الرؤية أجزاء المخططات ويفككها (Object Detection & Segmentation)؟",
      answer:
        "يقوم المحرك بمسح بصري وتجزئة دقيقة للحدود والأسهم التوجيهية، مع تمييز النصوص التوضيحية وتحديد النقاط الحارة (Hotspots) لكل مكون فيزيائي أو ميكانيكي أو حيوي بدقة إحداثية تصل إلى مستوى البكسل.",
    },
    {
      question: "ما هي أنواع المخططات والرسوم التي يتعرف عليها النظام؟",
      answer:
        "يدعم النظام طيفاً واسعاً من الرسوم التوضيحية: المخططات الهندسية والميكانيكية، الدوائر الكهربائية والإلكترونية، الرسوم التشريحية والبيولوجية، المخططات الانسيابية (Flowcharts)، والخرائط الذهنية والرسوم البيانية.",
    },
    {
      question: "كيف أحصل على أعلى دقة تحليل بالرؤية الحاسوبية؟",
      answer:
        "لتحقيق أعلى دقة: التقط الصورة بزاوية مستقيمة (90 درجة)، وتأكد من جودة الإضاءة وتساويها دون ظلال أو انعكاسات فلاشية قوية، واحرص على شمول كامل المخطط مع عناوينه وأسهمه الإرشادية.",
    },
    {
      question: "كيف يستخرج النظام المصطلحات والنصوص من المخطط (OCR & Text Parsing)؟",
      answer:
        "يستخدم محرك الرؤية تقنيات التعرف الضوئي المتقدم على الحروف والرموز (OCR) ثنائي اللغة (العربية والإنجليزية)، مع ربط كل مصطلح تلقائياً بموضعه في الرسم لتمكين النقر التفاعلي والترجمة الفورية.",
    },
    {
      question: "ما دور الذكاء الاصطناعي التوليدي بعد إتمام تحليل الرؤية الحاسوبية؟",
      answer:
        "بمجرد انتهاء مرحلة الرؤية الحاسوبية من تحديد الأجزاء، يتولى المحرك التوليدي صياغة شروحات ذكية متدرجة الصعوبة (مبتدئ، متقدم)، وتوليد اختبارات ذاتية التقييم، وتوفير معلم ذكي للإجابة عن الاستفسارات المتعمقة.",
    },
    {
      question: "هل يدعم النظام المخططات التخطيطية اليدوية (Hand-drawn Sketches)؟",
      answer:
        "نعم، يمتاز محرك الرؤية بالقدرة على استيعاب الرسوم التخطيطية والاسكتشات اليدوية، واستنتاج بنيتها المنطقية وتحويلها إلى نموذج رقمي تعليمي منظم ومفصل.",
    },
    {
      question: "ما هي ميزة الفاحص البصري الذكي 🎯 داخل المخطط؟",
      answer:
        "تتيح لك أداة الفاحص البصري النقر على أي جزء غير محدد مسبقاً في الصورة، ليقوم نموذج الرؤية فوراً بتركيز العدسة الرقمية عليه، وتكبيره، وفحصه تفصيلياً مع تقديم وصف وظيفي مباشر.",
    },
    {
      question: "كيف تؤثر خيارات 'جودة العرض' و'المعالجة الخلفية' على سرعة الرؤية؟",
      answer:
        "تتيح خيارات الأداء موازنة استهلاك الذاكرة وسرعة المعالجة وفق قدرات جهازك؛ فالمعالجة الخلفية تسمح بالاستمرار في التصفح أثناء عمل خوارزميات الرؤية، بينما تضمن الجودة العالية دقة تفاصيل لا تضاهى.",
    },
    {
      question: "هل يمكن تصدير المخطط المحلل ومشاركته كبطاقة استذكار رقمية؟",
      answer:
        "نعم، يمكنك بنقرة واحدة تصدير المخطط التفاعلي الكامل مع شروحاته وأجزائه بصيغة بطاقة رقمية للمراجعة أو مشاركتها كتقرير علمي تفاعلي مدعوم بتقنيات الرؤية.",
    },
  ];

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* Top Header matching Screenshots: "الإعدادات" with back arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1
            className={`text-xl font-black tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            الإعدادات
          </h1>
          <button
            onClick={onBackToHome}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isDark
                ? "bg-[#13233E] hover:bg-[#1C3156] text-blue-400 border border-slate-700"
                : "bg-blue-50 hover:bg-blue-100 text-blue-600"
            }`}
            title="العودة للرئيسية"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two-Column Split Layout matching Screenshot 1 exactly */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Right Menu List (md:col-span-4) in RTL */}
        <div className="md:col-span-4 space-y-2 order-1 md:order-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`settings-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between text-right cursor-pointer ${
                  isActive
                    ? isDark
                      ? "bg-[#101C33] border border-blue-500/50 text-white font-bold shadow-md ring-1 ring-blue-500/20"
                      : "bg-white shadow-sm border border-slate-200/80 text-slate-900 font-bold"
                    : isDark
                    ? "hover:bg-[#101C33]/60 text-slate-400 font-medium"
                    : "hover:bg-slate-100/60 text-slate-600 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                      item.color
                    } ${isActive ? "scale-105" : ""}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Left Detail Content Card (md:col-span-8) in RTL */}
        <div className="md:col-span-8 order-2 md:order-1">
          <div
            className={`rounded-3xl p-6 sm:p-8 space-y-6 min-h-[440px] transition-all border ${
              isDark
                ? "bg-[#101C33] border-slate-800 text-white shadow-xl"
                : "bg-white border-slate-100 shadow-sm text-slate-900"
            }`}
          >
            {/* ============================================================ */}
            {/* 0. الحساب والملف الشخصي (Account & Profile) */}
            {/* ============================================================ */}
            {activeTab === "account" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-base font-black ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {isEn ? "Account & Profile" : "الحساب والملف الشخصي"}
                  </h3>
                  {currentUser && (
                    <button
                      onClick={() => onUserChange?.(null)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isEn ? "Sign Out" : "تسجيل الخروج"}</span>
                    </button>
                  )}
                </div>

                {currentUser ? (
                  <div className="space-y-5">
                    {/* User Profile Overview Card */}
                    <div
                      className={`p-4 rounded-3xl border flex items-center justify-between gap-4 ${
                        isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Avatar */}
                        <div className="relative group">
                          <div className="w-16 h-16 rounded-2xl p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                            {currentUser.avatarUrl && currentUser.avatarUrl.startsWith("http") ? (
                              <img
                                src={currentUser.avatarUrl}
                                alt={currentUser.displayName}
                                className="w-14 h-14 rounded-xl object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              getAvatarById(currentUser.avatarUrl || "cat").render(50)
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                            title={isEn ? "Change Avatar" : "تغيير الأفاتار الكرتوني"}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Name & Badge */}
                        <div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            {currentUser.displayName || currentUser.username}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                              @{currentUser.username}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                currentUser.authProvider === "google"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                              }`}
                            >
                              {currentUser.authProvider === "google" ? "Google" : isEn ? "Registered" : "حساب معتمد"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Avatar Picker Drawer */}
                    {showAvatarPicker && (
                      <div className="p-4 rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {isEn ? "Pick your cartoon avatar:" : "اختر صورة الأفاتار الكرتونية الجديدة:"}
                          </span>
                          <button
                            onClick={() => setShowAvatarPicker(false)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isEn ? "Close" : "إغلاق"}
                          </button>
                        </div>
                        <AvatarSelector
                          selectedAvatarId={currentUser.avatarUrl || "cat"}
                          onSelect={async (newId) => {
                            setAccountActionLoading(true);
                            try {
                              const res = await changeAvatar(currentUser.id, newId);
                              if (res.success && res.user) {
                                onUserChange?.(res.user);
                                setShowAvatarPicker(false);
                              }
                            } finally {
                              setAccountActionLoading(false);
                            }
                          }}
                          isDark={isDark}
                        />
                      </div>
                    )}

                    {/* Edit Username Section */}
                    <div
                      className={`p-4 rounded-2xl border space-y-3 ${
                        isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-bold">
                            {isEn ? "Username" : "اسم المستخدم"}
                          </span>
                        </div>
                        {!isEditingUsername && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingUsername(true);
                              setUsernameInput(currentUser.username);
                              setUsernameError(null);
                            }}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            {isEn ? "Edit" : "تعديل الاسم"}
                          </button>
                        )}
                      </div>

                      {isEditingUsername ? (
                        <div className="space-y-2 pt-1">
                          <input
                            type="text"
                            value={usernameInput}
                            onChange={(e) => {
                              setUsernameInput(e.target.value);
                              const c = validateUsername(e.target.value, languageMode);
                              setUsernameError(c.isValid ? null : c.error || null);
                            }}
                            placeholder={isEn ? "New username" : "اسم المستخدم الجديد"}
                            className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${
                              isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                            }`}
                          />
                          {usernameError && (
                            <p className="text-[10px] text-amber-500 font-bold">
                              {usernameError}
                            </p>
                          )}
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setIsEditingUsername(false)}
                              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              {isEn ? "Cancel" : "إلغاء"}
                            </button>
                            <button
                              type="button"
                              disabled={accountActionLoading}
                              onClick={async () => {
                                const c = validateUsername(usernameInput, languageMode);
                                if (!c.isValid) {
                                  setUsernameError(c.error || "اسم غير صالح");
                                  return;
                                }
                                setAccountActionLoading(true);
                                try {
                                  const res = await changeUsername(currentUser.id, usernameInput.trim(), languageMode);
                                  if (res.success && res.user) {
                                    onUserChange?.(res.user);
                                    setIsEditingUsername(false);
                                  } else {
                                    setUsernameError(res.error || "تعذر التعديل");
                                  }
                                } finally {
                                  setAccountActionLoading(false);
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                            >
                              {isEn ? "Save" : "حفظ التغيير"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isEn ? "Current:" : "اسمك المسجل:"} <strong className="text-slate-900 dark:text-white">{currentUser.username}</strong>{" "}
                          ({isEn ? "Letters and words only, no digits or symbols" : "أحرف وكلمات فقط دون أرقام أو رموز"})
                        </p>
                      )}
                    </div>

                    {/* Change Password Section (Local Only) */}
                    {currentUser.authProvider !== "google" && (
                      <div
                        className={`p-4 rounded-2xl border space-y-3 ${
                          isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-200/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold">
                              {isEn ? "Password Security" : "أمان كلمة المرور"}
                            </span>
                          </div>
                          {!isChangingPass && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsChangingPass(true);
                                setPassError(null);
                                setPassSuccess(null);
                              }}
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              {isEn ? "Change Password" : "تغيير كلمة المرور"}
                            </button>
                          )}
                        </div>

                        {isChangingPass ? (
                          <div className="space-y-2 pt-1">
                            <input
                              type="password"
                              value={currPassInput}
                              onChange={(e) => setCurrPassInput(e.target.value)}
                              placeholder={isEn ? "Current password" : "كلمة المرور الحالية"}
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${
                                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                              }`}
                            />
                            <input
                              type="password"
                              value={newPassInput}
                              onChange={(e) => setNewPassInput(e.target.value)}
                              placeholder={isEn ? "New password (min 6 chars)" : "كلمة المرور الجديدة (6 خانات فأكثر)"}
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${
                                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                              }`}
                            />
                            <input
                              type="password"
                              value={confirmPassInput}
                              onChange={(e) => setConfirmPassInput(e.target.value)}
                              placeholder={isEn ? "Confirm new password" : "تأكيد كلمة المرور الجديدة"}
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${
                                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                              }`}
                            />

                            {passError && (
                              <p className="text-[10px] text-rose-500 font-bold">{passError}</p>
                            )}
                            {passSuccess && (
                              <p className="text-[10px] text-emerald-500 font-bold">{passSuccess}</p>
                            )}

                            <div className="flex items-center gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setIsChangingPass(false)}
                                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                              >
                                {isEn ? "Cancel" : "إلغاء"}
                              </button>
                              <button
                                type="button"
                                disabled={accountActionLoading}
                                onClick={async () => {
                                  if (newPassInput.length < 6) {
                                    setPassError("يجب ألا تقل كلمة المرور عن 6 خانات");
                                    return;
                                  }
                                  if (newPassInput !== confirmPassInput) {
                                    setPassError("كلمتا المرور غير متطابقتين");
                                    return;
                                  }
                                  setAccountActionLoading(true);
                                  try {
                                    const res = await changePassword(currentUser.id, currPassInput, newPassInput, languageMode);
                                    if (res.success) {
                                      setPassSuccess("تم تغيير كلمة المرور بنجاح!");
                                      setPassError(null);
                                      setTimeout(() => {
                                        setIsChangingPass(false);
                                        setCurrPassInput("");
                                        setNewPassInput("");
                                        setConfirmPassInput("");
                                      }, 1200);
                                    } else {
                                      setPassError(res.error || "فشل تغيير كلمة المرور");
                                    }
                                  } finally {
                                    setAccountActionLoading(false);
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                              >
                                {isEn ? "Save Password" : "حفظ كلمة المرور"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isEn
                              ? "Encrypted with SHA-256 password hash for maximum security."
                              : "كلمة المرور مشفرة ومحمية بـ SHA-256 ولا تحفظ كنص صريح."}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-3 rounded-2xl border text-center ${
                          isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-200/80"
                        }`}
                      >
                        <span className="text-[11px] text-slate-400 block font-bold">
                          {isEn ? "Diagrams Analyzed" : "المخططات المحللة"}
                        </span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                          {currentUser.stats?.diagramsAnalyzed || currentUser.history?.length || 0}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl border text-center ${
                          isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-200/80"
                        }`}
                      >
                        <span className="text-[11px] text-slate-400 block font-bold">
                          {isEn ? "Quizzes Completed" : "الاختبارات المنجزة"}
                        </span>
                        <span className="text-xl font-black text-amber-500">
                          {currentUser.stats?.quizzesCompleted || currentUser.quizzes?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Not Logged In State */
                  <div
                    className={`p-8 rounded-3xl border text-center space-y-4 ${
                      isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <div className="w-14 h-14 mx-auto rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <User className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black">
                        {isEn ? "Personal Account & Cloud Sync" : "حسابك الشخصي والحفظ السحابي"}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        {isEn
                          ? "Sign in or create an account to save your analyzed diagrams, customized avatars, and learning progress permanently."
                          : "سجّل الدخول أو أنشئ حساباً جديداً لحفظ مخططاتك واختباراتك وأفاتارك الكرتوني في السحابة واستعادتها في أي وقت ومن أي جهاز."}
                      </p>
                    </div>
                    <button
                      onClick={onOpenAuthModal}
                      className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isEn ? "Sign In / Create Account" : "تسجيل الدخول / إنشاء حساب جديد"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* 1. اللغة (Language) - Exact Match to Screenshot 1 & 9 */}
            {/* ============================================================ */}
            {activeTab === "language" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-base font-black ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    اللغة
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Option 1: SA العربية (Active / Selected) */}
                  <button
                    id="lang-option-ar"
                    onClick={() => onLanguageModeChange("ar")}
                    className={`w-full p-4 rounded-2xl border text-right flex items-center justify-between transition-all cursor-pointer ${
                      languageMode === "ar"
                        ? isDark
                          ? "border-blue-500 bg-[#13233E] text-white font-bold"
                          : "border-2 border-blue-400 bg-blue-50/20 text-slate-900 font-bold"
                        : isDark
                        ? "border-slate-800 bg-[#0B1528] text-slate-300 hover:bg-[#13233E]"
                        : "border-slate-200 bg-slate-100/70 text-slate-700 hover:bg-slate-200/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {languageMode === "ar" ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                      <span className="text-xs sm:text-sm font-bold">
                        العربية
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">SA</span>
                  </button>

                  {/* Option 2: US الإنجليزية */}
                  <button
                    id="lang-option-en"
                    onClick={() => onLanguageModeChange("en")}
                    className={`w-full p-4 rounded-2xl border text-right flex items-center justify-between transition-all cursor-pointer ${
                      languageMode === "en"
                        ? isDark
                          ? "border-blue-500 bg-[#13233E] text-white font-bold"
                          : "border-2 border-blue-400 bg-blue-50/20 text-slate-900 font-bold"
                        : isDark
                        ? "border-slate-800 bg-[#0B1528] text-slate-300 hover:bg-[#13233E]"
                        : "border-transparent bg-slate-200/60 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {languageMode === "en" ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                      <span className="text-xs sm:text-sm font-bold">
                        الإنجليزية
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-bold">US</span>
                  </button>

                  {/* Option 3: ثنائي اللغة (موصى به للتعلم) */}
                  <button
                    id="lang-option-both"
                    onClick={() => onLanguageModeChange("both")}
                    className={`w-full p-4 rounded-2xl border text-right flex items-center justify-between transition-all cursor-pointer ${
                      languageMode === "both"
                        ? isDark
                          ? "border-blue-500 bg-[#13233E] text-white font-bold"
                          : "border-2 border-blue-400 bg-blue-50/20 text-slate-900 font-bold"
                        : isDark
                        ? "border-slate-800 bg-[#0B1528] text-slate-300 hover:bg-[#13233E]"
                        : "border-transparent bg-slate-100/70 text-slate-700 hover:bg-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {languageMode === "both" ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                      <span className="text-xs sm:text-sm font-bold">
                        ثنائي اللغة (العربية والإنجليزية)
                      </span>
                    </div>
                    <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                      موصى به
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 2. المظهر (Appearance) - Exact Match to Screenshot 7 */}
            {/* ============================================================ */}
            {activeTab === "appearance" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <h3
                  className={`text-base font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  المظهر
                </h3>

                {/* Dark / Light Toggle Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 text-right">
                    المظهر
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Dark mode button */}
                    <button
                      onClick={() => onThemeModeChange?.("dark")}
                      className={`py-4 px-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        themeMode === "dark"
                          ? "bg-[#1E293B] text-white shadow-md ring-2 ring-blue-500/50"
                          : "bg-[#1E293B] text-slate-300 hover:text-white"
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                      <span>الوضع الداكن</span>
                    </button>

                    {/* Light mode button */}
                    <button
                      onClick={() => onThemeModeChange?.("light")}
                      className={`py-4 px-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        themeMode === "light"
                          ? "bg-slate-200/90 text-slate-900 shadow-xs ring-2 ring-blue-500/50"
                          : "bg-slate-200/60 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span>الوضع الفاتح</span>
                    </button>
                  </div>
                </div>

                {/* Font Size Segment */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 text-right">
                    {isEn ? "Font Size" : "حجم الخط"}
                  </label>
                  <div
                    className={`p-1 rounded-2xl grid grid-cols-3 gap-1 text-xs font-bold ${
                      isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100"
                    }`}
                  >
                    <button
                      onClick={() => handleSetFontSize("large")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        fontSize === "large"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "Large" : "كبير"}
                    </button>
                    <button
                      onClick={() => handleSetFontSize("medium")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        fontSize === "medium"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "Medium" : "متوسط"}
                    </button>
                    <button
                      onClick={() => handleSetFontSize("small")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        fontSize === "small"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "Small" : "صغير"}
                    </button>
                  </div>
                </div>

                {/* Motion Effects */}
                <div
                  className={`p-3.5 rounded-2xl flex items-center justify-between ${
                    isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100/80"
                  }`}
                >
                  <button
                    onClick={handleToggleMotion}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      motionEffects ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        motionEffects ? "-translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {isEn ? "Motion Effects" : "تأثيرات الحركة"}
                    </span>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </div>
                </div>

                {/* High Contrast */}
                <div
                  className={`p-3.5 rounded-2xl flex items-center justify-between ${
                    isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100/80"
                  }`}
                >
                  <button
                    onClick={handleToggleContrast}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      highContrast ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        highContrast ? "-translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {isEn ? "High Contrast" : "تباين عالٍ"}
                    </span>
                    <Sliders className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 4. التنقل (Navigation) - Exact Match to Screenshot 6 */}
            {/* ============================================================ */}
            {activeTab === "navigation" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <h3
                  className={`text-base font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {isEn ? "Navigation" : "التنقل"}
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 text-right">
                    {isEn ? "Navigation Style" : "طريقة التنقل"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSetNavMode("buttons")}
                      className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        navMode === "buttons"
                          ? "border-2 border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs"
                          : isDark
                          ? "border border-slate-800 bg-[#0B1528] text-slate-300 hover:bg-slate-800"
                          : "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{isEn ? "Buttons (Next/Prev)" : "أزرار (التالي/السابق)"}</span>
                      <span>&gt;</span>
                    </button>
                    <button
                      onClick={() => handleSetNavMode("swipe")}
                      className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        navMode === "swipe"
                          ? "border-2 border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs"
                          : isDark
                          ? "border border-slate-800 bg-[#0B1528] text-slate-300 hover:bg-slate-800"
                          : "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-blue-500" />
                      <span>{isEn ? "Swipe Gestures" : "التمرير (Swipe)"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 text-right">
                    {navMode === "swipe"
                      ? (isEn ? "Swipe left/right to move between diagrams, views and parts." : "اسحب يميناً ويساراً للتنقل المباشر بين المخططات والصفحات والأجزاء.")
                      : (isEn ? "Use dedicated on-screen arrow buttons to step through parts." : "استخدم أزرار الأسهم على الشاشة للتقدم والرجوع بين أجزاء المخطط.")}
                  </p>
                </div>

                {/* Show Nav Dots */}
                <div className={`p-3.5 rounded-2xl flex items-center justify-between ${
                  isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100/80"
                }`}>
                  <button
                    onClick={handleToggleNavDots}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      showNavDots ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        showNavDots ? "-translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    {isEn ? "Show Navigation Dots" : "إظهار نقاط التنقل"}
                  </span>
                </div>

                {/* Home Preference */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-semibold text-slate-400 text-right">
                    {isEn ? "Default Home Preference" : "تفضيل الصفحة الرئيسية"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSetHomePreference("history")}
                      className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        homePreference === "history"
                          ? "bg-blue-600 text-white shadow-xs"
                          : isDark
                          ? "bg-[#0B1528] border border-slate-800 text-slate-300 hover:bg-slate-800"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <History className="w-4 h-4" />
                      <span>{isEn ? "Open History First" : "عرض السجل أولاً"}</span>
                    </button>
                    <button
                      onClick={() => handleSetHomePreference("upload")}
                      className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        homePreference === "upload"
                          ? "bg-blue-600 text-white shadow-xs"
                          : isDark
                          ? "bg-[#0B1528] border border-slate-800 text-slate-300 hover:bg-slate-800"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isEn ? "Direct Upload First" : "رفع مباشر أولاً"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 5. الخصوصية (Privacy) - Exact Match to Screenshot 5 */}
            {/* ============================================================ */}
            {activeTab === "privacy" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <h3
                  className={`text-base font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {isEn ? "Privacy" : "الخصوصية"}
                </h3>

                {/* History Visibility Row */}
                <div
                  className={`p-3.5 rounded-2xl flex items-center justify-between ${
                    isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100/80"
                  }`}
                >
                  <button
                    onClick={handleTogglePrivacy}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      historyPrivacy
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        historyPrivacy ? "-translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-2 text-right">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {isEn ? "History Privacy Protection" : "خصوصية السجل وحجب المعاينات"}
                    </span>
                    <EyeOff className="w-4 h-4 text-rose-500" />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-right space-y-1">
                  <p>
                    {historyPrivacy
                      ? (isEn ? "Active: Diagrams in history are masked and blurred until clicked." : "مفعّل: يتم تمويه وحجب صور المخططات في السجل كإجراء خصوصية إضافي.")
                      : (isEn ? "Inactive: Normal thumbnail previews shown in history." : "معطّل: تظهر معاينات الصور في السجل بصورة اعتيادية.")}
                  </p>
                </div>

                {/* Data Encryption Card */}
                <div
                  className={`p-4 rounded-2xl space-y-1.5 text-right ${
                    isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-2 justify-end">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {isEn ? "Data Isolation & Security" : "عزل البيانات والتشفير"}
                    </span>
                    <Shield className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isEn
                      ? "All diagrams, vision extractions and analysis history are isolated to your authenticated account session and encrypted in transit."
                      : "يتم عزل كافة تحليلات الرؤية الحاسوبية وسجل المخططات ضمن حسابك الموثق فقط وتشفير الاتصالات لضمان أقصى درجات الأمان والخصوصية."}
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 6. الإشعارات (Notifications) - Exact Match to Screenshot 4 */}
            {/* ============================================================ */}
            {activeTab === "notifications" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <h3
                  className={`text-base font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {isEn ? "Notifications" : "الإشعارات"}
                </h3>

                {/* Enable Notifications Row */}
                <div
                  className={`p-3.5 rounded-2xl flex items-center justify-between ${
                    isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100/80"
                  }`}
                >
                  <button
                    onClick={handleToggleNotifications}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      enableNotifications
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enableNotifications ? "-translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-2 text-right">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {isEn ? "Enable Notifications" : "تمكين الإشعارات"}
                    </span>
                    <Bell className="w-4 h-4 text-amber-500" />
                  </div>
                </div>

                {/* Notification Type Segment */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 text-right">
                    {isEn ? "Alert Type" : "نوع التنبيه"}
                  </label>
                  <div
                    className={`p-1 rounded-2xl grid grid-cols-3 gap-1 text-xs font-bold ${
                      isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100"
                    }`}
                  >
                    <button
                      onClick={() => handleSetAlertType("both")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        alertType === "both"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "Both" : "كلاهما"}
                    </button>
                    <button
                      onClick={() => handleSetAlertType("visual")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        alertType === "visual"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "Visual" : "بصري"}
                    </button>
                    <button
                      onClick={() => handleSetAlertType("sound")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        alertType === "sound"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "Sound" : "صوت"}
                    </button>
                  </div>
                </div>

                {/* Test Alert Button */}
                <button
                  onClick={() =>
                    onTriggerTestNotification?.(
                      isEn ? "Test Notification" : "تجربة التنبيه الفعلي",
                      isEn
                        ? `Notifications configured: ${alertType} mode active`
                        : `تم ضبط الإشعارات: وضع [${alertType === "both" ? "كلاهما" : alertType === "sound" ? "صوت" : "بصري"}] نشط بنجاح`,
                      "success"
                    )
                  }
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isDark
                      ? "border-slate-800 bg-[#0B1528] hover:bg-slate-800 text-slate-200"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span>{isEn ? "Test Audio & Visual Alert" : "اختبار التنبيه (صوت / بصري)"}</span>
                </button>
              </div>
            )}

            {/* ============================================================ */}
            {/* 7. الأداء (Performance) - Exact Match to Screenshot 3 */}
            {/* ============================================================ */}
            {activeTab === "performance" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <h3
                  className={`text-base font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {isEn ? "Performance" : "الأداء"}
                </h3>

                {/* Render Quality Segment */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 text-right">
                    {isEn ? "Render Quality" : "جودة العرض"}
                  </label>
                  <div
                    className={`p-1 rounded-2xl grid grid-cols-3 gap-1 text-xs font-bold ${
                      isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100"
                    }`}
                  >
                    <button
                      onClick={() => handleSetRenderQuality("high")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        renderQuality === "high"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "High Quality" : "جودة عالية"}
                    </button>
                    <button
                      onClick={() => handleSetRenderQuality("medium")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        renderQuality === "medium"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "Medium Quality" : "جودة متوسطة"}
                    </button>
                    <button
                      onClick={() => handleSetRenderQuality("low")}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        renderQuality === "low"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      {isEn ? "Low Quality" : "جودة منخفضة"}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 text-right">
                    {renderQuality === "high"
                      ? (isEn ? "Full resolution canvas, crisp line detection and sharp rendering." : "دقة عرض كاملة، تباين خطوط فائق، ودقة تفاصيل هندسية قصوى.")
                      : renderQuality === "medium"
                      ? (isEn ? "Balanced memory usage and sharp visuals." : "موازنة مثالية بين استهلاك الذاكرة وسرعة المعالجة البصرية.")
                      : (isEn ? "Fast rendering optimized for battery saving and lower memory devices." : "معالجة خفيفة موفرة لطاقة البطارية والأجهزة محدودة الذاكرة.")}
                  </p>
                </div>

                {/* Background Processing */}
                <div
                  className={`p-3.5 rounded-2xl flex items-center justify-between ${
                    isDark ? "bg-[#0B1528] border border-slate-800" : "bg-slate-100/80"
                  }`}
                >
                  <button
                    onClick={handleToggleBackgroundProcessing}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      backgroundProcessing
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        backgroundProcessing ? "-translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {isEn ? "Background Processing" : "المعالجة الخلفية"}
                    </span>
                    <Cpu className="w-4 h-4 text-sky-500" />
                  </div>
                </div>

                {/* Live Engine Status Card */}
                <div
                  className={`p-4 rounded-2xl border text-right space-y-2 ${
                    isDark ? "bg-[#0B1528] border-slate-800" : "bg-sky-50/50 border-sky-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {backgroundProcessing ? (isEn ? "Active Worker" : "المعالج نشط") : (isEn ? "Synchronous" : "مباشر")}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isEn ? "Computer Vision Pipeline" : "مسار معالجة الرؤية الحاسوبية"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {backgroundProcessing
                      ? (isEn
                          ? "Vision models run in non-blocking background queue, allowing seamless navigation while diagrams decompose."
                          : "تعمل خوارزميات الرؤية الحاسوبية في مسار خلفي غير حاجب للشاشة، مما يتيح لك حرية التصفح الكاملة أثناء تحليل وتجزئة الصور.")
                      : (isEn
                          ? "Direct blocking processing mode active."
                          : "وضع المعالجة المباشرة الموقفة للواجهة حتى اكتمال التحليل.")}
                  </p>
                </div>

                {/* Clear Cache Button */}
                <button
                  onClick={handleClearCache}
                  className={`w-full py-3 rounded-2xl text-xs font-bold text-center transition-all cursor-pointer ${
                    cacheCleared
                      ? "bg-emerald-600 text-white"
                      : isDark
                      ? "bg-[#0B1528] hover:bg-[#13233E] border border-slate-800 text-slate-200"
                      : "bg-slate-200/70 hover:bg-slate-300 text-slate-800"
                  }`}
                >
                  {cacheCleared
                    ? (isEn ? "Temporary Cache Cleared ✓" : "تم مسح التخزين المؤقت بنجاح ✓")
                    : (isEn ? "Clear Cache" : "مسح التخزين المؤقت")}
                </button>
              </div>
            )}

            {/* ============================================================ */}
            {/* 8. المساعدة (Help / FAQ) - Exact Match to Screenshot 2 */}
            {/* ============================================================ */}
            {activeTab === "help" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Header with back link */}
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <h3
                    className={`text-base font-black ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    المساعدة
                  </h3>
                  <button
                    onClick={() => setActiveTab("language")}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <span>رجوع</span>
                    <span>&gt;</span>
                  </button>
                </div>

                {/* 10 Accordion Items */}
                <div className="space-y-2">
                  {faqList.map((item, idx) => {
                    const isOpen = openFaqIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isOpen
                            ? isDark
                              ? "bg-[#13233E] border-blue-500/50"
                              : "bg-white border-blue-400 shadow-2xs"
                            : isDark
                            ? "bg-[#0B1528] border-slate-800 hover:border-slate-700"
                            : "bg-slate-100/80 border-slate-200/80 hover:bg-slate-200/60"
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-3.5 flex items-center justify-between text-right cursor-pointer"
                        >
                          <span
                            className={`text-xs font-bold ${
                              isDark ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {item.question}
                          </span>
                          <span className="text-slate-400 shrink-0 mr-2">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-blue-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        </button>

                        {isOpen && (
                          <div
                            className={`px-3.5 pb-3.5 text-[11px] leading-relaxed border-t pt-2.5 ${
                              isDark
                                ? "border-slate-700/60 text-slate-300"
                                : "border-blue-100 text-slate-600"
                            }`}
                          >
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 9. الرؤية التقنية للمشروع (Technical Vision) - User Requested */}
            {/* ============================================================ */}
            {activeTab === "vision" && (
              <div className="space-y-6 animate-in fade-in duration-200 text-right">
                {/* Brand Header Banner */}
                <div
                  className={`p-6 rounded-3xl border space-y-4 text-center ${
                    isDark
                      ? "bg-gradient-to-b from-[#13233E] to-[#0B1528] border-slate-700 shadow-xl"
                      : "bg-gradient-to-b from-blue-50/80 to-white border-blue-100 shadow-sm"
                  }`}
                >
                  <div className="flex justify-center">
                    <div
                      className={`p-3 rounded-2xl border ${
                        isDark ? "bg-[#101C33] border-slate-700" : "bg-white border-slate-200"
                      }`}
                    >
                      <EduGraphicLogo size="lg" isDark={isDark} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2
                      className={`text-2xl sm:text-3xl font-black tracking-tight font-sans ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                      dir="ltr"
                    >
                      Edu-Graphic
                    </h2>
                    <h3 className="text-base sm:text-lg font-bold text-blue-600">
                      من صورة تعليمية جامدة... إلى درس ذكي تفاعلي.
                    </h3>
                  </div>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    منصة تعليمية تعتمد على الرؤية الحاسوبية والذكاء الاصطناعي التوليدي لفهم المخططات التعليمية، تحليل عناصرها وعلاقاتها، وتحويلها تلقائيًا إلى شروحات مرئية تفاعلية وتجارب تعلم ذكية.
                  </p>

                  {/* Flow Steps Banner */}
                  <div
                    className={`inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-black ${
                      isDark
                        ? "bg-[#101C33] border-blue-500/40 text-blue-400"
                        : "bg-white border-blue-200 text-blue-700 shadow-xs"
                    }`}
                  >
                    <span>صوّر أو ارفع</span>
                    <span>←</span>
                    <span>حلّل بالذكاء الاصطناعي</span>
                    <span>←</span>
                    <span>استكشف</span>
                    <span>←</span>
                    <span>تعلّم</span>
                  </div>

                  {/* Project Attribution Footer as requested */}
                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <p
                      className={`text-xs font-bold ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      منصة إديو-جرافيك للرسوم التعليمية التفاعلية • جميع الحقوق محفوظة © 2026
                    </p>
                  </div>
                </div>

                {/* Functional Highlights Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                      <Camera className="w-4 h-4" />
                      <span>١. الإدخال والرؤية الحاسوبية</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      التقاط سريع لأي رسم في المنهاج عبر كاميرا الهاتف مع تحسين المعالجة وتباين الإضاءة.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>٢. التفكيك المعرفي بالذكاء الاصطناعي</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      تحديد مواقع الأعضاء بدقة، استخراج الوظائف الحيوية، وتوليد أسئلة تقييم ذاتية فورية.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-purple-500 font-bold text-xs">
                      <Globe className="w-4 h-4" />
                      <span>٣. ثنائية اللغة والنطق الصوتي</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      دعم المصطلحات العلمية باللغتين العربية والإنجليزية مع محرك نطق فوري لتعزيز الاستيعاب.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                      <Award className="w-4 h-4" />
                      <span>٤. المعلم الذكي والبطاقات التعليمية</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      مساعد تفاعلي يشرح ويوضح المفاهيم، مع إمكانية تصدير بطاقات المراجعة والطباعة.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
