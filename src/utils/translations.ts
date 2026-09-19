import { LanguageMode } from "../types";

export interface AppTranslations {
  // Brand & School
  appName: string;
  appSubtitle: string;
  schoolName: string;
  schoolDirectorate: string;

  // Header & Navigation
  home: string;
  viewer: string;
  history: string;
  profile: string;
  settings: string;
  interactiveExplorer: string;
  backToHome: string;
  switchLanguage: string;
  languageBadge: string;
  enableDarkMode: string;
  enableLightMode: string;
  shareAndExport: string;
  shareApp: string;
  shareEducationalModel: string;

  // Hero Section
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroDescription: string;
  uploadFromDevice: string;
  captureWithCamera: string;
  exploreModelsTitle: string;
  viewAll: string;

  // Workspace Viewer Header
  interactivePartsCount: (count: number) => string;
  startAnimatedTour: string;
  endTour: string;
  tourActive: string;
  listenToSummary: string;
  stopAudio: string;
  keyTakeawaysTitle: string;

  // Tabs
  tabPartDetails: string;
  tabPartsIndex: string;
  tabInteractiveQuiz: string;
  tabAiTutor: string;

  // Part Details Card
  selectPartPromptTitle: string;
  selectPartPromptDesc: string;
  partIndexLabel: (current: number, total: number) => string;
  prevPart: string;
  nextPart: string;
  pronounceArabic: string;
  pronounceEnglish: string;
  functionTitle: string;
  descriptionTitle: string;
  didYouKnowTitle: string;
  askAiAboutPart: (partName: string) => string;

  // Parts List
  searchPartsPlaceholder: string;
  readAllSequentially: string;
  stopSequentialReading: string;
  noPartsFound: string;
  stepNumber: (step: number) => string;

  // Quiz
  quizTitle: string;
  noQuizAvailable: string;
  questionNumber: (current: number, total: number) => string;
  listenToQuestion: string;
  stopQuestionAudio: string;
  submitAnswerPrompt: string;
  correctFeedback: string;
  incorrectFeedback: string;
  explanationTitle: string;
  nextQuestion: string;
  prevQuestion: string;
  viewQuizResults: string;
  quizCompletedTitle: string;
  quizScoreSummary: (score: number, total: number) => string;
  quizScoreGreat: string;
  quizScoreGood: string;
  quizScoreNeedsPractice: string;
  restartQuiz: string;

  // AI Tutor Chat
  tutorWelcome: (diagramTitle: string) => string;
  tutorPlaceholder: string;
  send: string;
  suggestedQuestionsTitle: string;
  listening: string;
  copyAnswer: string;
  aiThinking: string;
  suggestedQuestion1: string;
  suggestedQuestion2: string;
  suggestedQuestion3: string;
  suggestedQuestion4: string;

  // Visual Search & Inspection
  visualSearch: string;
  visualSearchActive: string;
  visualSearchInstruction: string;
  regionRecognized: string;
  inspectAnother: string;
  askTutorAboutRegion: string;
  whatIsThisQ: string;
  whatIsFunctionQ: string;
  whereIsLocationQ: string;
  relationToOtherPartsQ: string;
  close: string;

  // Diagram Toolbar
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  fullscreen: string;
  showLabels: string;
  hideLabels: string;

  // Guided Tour
  stageOf: (current: number, total: number) => string;
  tourPlaying: string;
  tourPaused: string;
  autoAdvanceOn: string;
  autoAdvanceOff: string;
  speed: string;

  // Upload Modal
  uploadModalTitle: string;
  uploadModalSubtitle: string;
  tabUploadFile: string;
  tabCamera: string;
  tabSamples: string;
  dragDropTitle: string;
  browseFiles: string;
  supportedFormats: string;
  capturePhoto: string;
  startCamera: string;
  stopCamera: string;
  switchCamera: string;
  startAnalysis: string;
  cancel: string;
  analyzingStep1: string;
  analyzingStep2: string;

  // History
  historyTitle: string;
  clearAllHistory: string;
  noHistoryTitle: string;
  noHistoryDesc: string;
  openDiagram: string;
  deleteItem: string;

  // Export / Share Modal
  exportModalTitle: string;
  exportModalSubtitle: string;
  copySummaryText: string;
  copiedSuccess: string;
  printOrSavePdf: string;
  downloadStudyCard: string;

  // Settings View
  settingsTitle: string;
  tabLanguage: string;
  tabAccount: string;
  tabAppearance: string;
  tabNavigation: string;
  tabPrivacy: string;
  tabNotifications: string;
  tabPerformance: string;
  tabHelp: string;
  tabVision: string;

  // Settings Details
  languageSettingsDesc: string;
  langArabicName: string;
  langEnglishName: string;
  langBilingualName: string;
  langBilingualDesc: string;
  appearanceDesc: string;
  themeLabel: string;
  themeDark: string;
  themeLight: string;
  themeDarkDesc: string;
  themeLightDesc: string;
  fontSizeLabel: string;
  fontSizeSmall: string;
  fontSizeMedium: string;
  fontSizeLarge: string;
  highContrastLabel: string;
  motionEffectsLabel: string;
  accountDesc: string;
  studentNameLabel: string;
  schoolInfoTitle: string;
  saveChanges: string;
  savedSuccess: string;
  clearCache: string;
  cacheClearedSuccess: string;

  // Profile
  profileTitle: string;
  studentTitle: string;
  statsDiagramsAnalyzed: string;
  statsTestsPassed: string;
  statsDayStreak: string;
  badgesTitle: string;
  badgeExplorer: string;
  badgeScientist: string;
  badgeTopPerformer: string;
  recentActivityTitle: string;

  // Bottom Nav Bar
  navHome: string;
  navHistory: string;
  navPlus: string;
  navProfile: string;
  navSettings: string;
  fabAiTutor: string;
}

export const ARABIC_TRANSLATIONS: AppTranslations = {
  appName: "إديو-جرافيك",
  appSubtitle: "نظام تحويل الرسوم المدرسية إلى انفوجرافيك تفاعلي",
  schoolName: "منصة EduGraphic للرسوم التعليمية التفاعلية",
  schoolDirectorate: "التعليم التفاعلي الذكي والتعلم الذاتي",

  home: "الرئيسية",
  viewer: "المستكشف التفاعلي",
  history: "السجل",
  profile: "الملف الشخصي",
  settings: "الإعدادات",
  interactiveExplorer: "المستكشف التفاعلي",
  backToHome: "العودة للرئيسية",
  switchLanguage: "تغيير اللغة",
  languageBadge: "EN",
  enableDarkMode: "تفعيل الوضع الليلي",
  enableLightMode: "تفعيل الوضع المضيء",
  shareAndExport: "مشاركة وتصدير",
  shareApp: "مشاركة برنامج إديو-جرافيك",
  shareEducationalModel: "مشاركة هذا النموذج التعليمي",

  heroBadge: "نظام تعليمي ذكي قائم على الرسوم البيانية",
  heroTitlePrefix: "حول رسوماتك إلى",
  heroTitleHighlight: "تجارب تفاعلية",
  heroDescription:
    "التقط صورة لأي رسم توضيحي في كتابك المدرسي، وسيقوم نظامنا بتحليله وتحويله إلى انفوجرافيك تعليمي احترافي.",
  uploadFromDevice: "رفع من الجهاز",
  captureWithCamera: "التقاط بالكاميرا",
  exploreModelsTitle: "استكشف النماذج التعليمية",
  viewAll: "عرض الكل",

  interactivePartsCount: (count) => `${count} أجزاء تفاعلية`,
  startAnimatedTour: "بدء الشرح المتحرك ▶️",
  endTour: "إنهاء الشرح",
  tourActive: "جولة الشرح التفاعلي نشطة",
  listenToSummary: "استماع للملخص",
  stopAudio: "إيقاف الصوت",
  keyTakeawaysTitle: "ملاحظات سريعة للاستذكار والحفظ:",

  tabPartDetails: "تفاصيل الجزء",
  tabPartsIndex: "فهرس الأجزاء",
  tabInteractiveQuiz: "الاختبار الذكي",
  tabAiTutor: "المعلم الذكي",

  selectPartPromptTitle: "حدد جزءاً من المخطط للاستكشاف",
  selectPartPromptDesc:
    "انقر على أي نقطة رقمية على الرسم التخطيطي لعرض وظيفتها والشرح الصوتي والعلمي بالتفصيل.",
  partIndexLabel: (current, total) => `جزء ${current} من ${total}`,
  prevPart: "الجزء السابق",
  nextPart: "الجزء التالي",
  pronounceArabic: "نطق بالعربية",
  pronounceEnglish: "Pronounce (EN)",
  functionTitle: "الوظيفة والأهمية الحيوية (Function)",
  descriptionTitle: "الشرح والوصف المفصل (Description)",
  didYouKnowTitle: "هل تعلم؟ (Did you know?)",
  askAiAboutPart: (partName) => `اسأل المعلم الذكي عن (${partName})`,

  searchPartsPlaceholder: "ابحث عن أي عضو أو جزء أو وظيفة...",
  readAllSequentially: "قراءة صوتية متتالية لكل الأجزاء",
  stopSequentialReading: "إيقاف القراءة",
  noPartsFound: "لا توجد أجزاء مطابقة للبحث",
  stepNumber: (step) => `الخطوة ${step}`,

  quizTitle: "الاختبار التفاعلي الذكي",
  noQuizAvailable: "لا توجد أسئلة اختبار متوفرة لهذا الرسم حالياً",
  questionNumber: (current, total) => `السؤال ${current} من ${total}`,
  listenToQuestion: "استماع للسؤال",
  stopQuestionAudio: "إيقاف الصوت",
  submitAnswerPrompt: "اختر الإجابة الصحيحة للتحقق الفوري:",
  correctFeedback: "إجابة صحيحة! أحسنت 🎉",
  incorrectFeedback: "إجابة غير دقيقة! إليك التفسير العلمي:",
  explanationTitle: "التفسير العلمي:",
  nextQuestion: "السؤال التالي",
  prevQuestion: "السؤال السابق",
  viewQuizResults: "عرض النتيجة",
  quizCompletedTitle: "اكتمل الاختبار بنجاح!",
  quizScoreSummary: (score, total) => `حصلت على ${score} من أصل ${total} إجابات صحيحة`,
  quizScoreGreat: "ممتاز! لقد استوعبت أجزاء ووظائف هذا المخطط ببراعة.",
  quizScoreGood: "أداء جيد جداً! يمكنك مراجعة الشروحات لتحقيق الدرجة الكاملة.",
  quizScoreNeedsPractice: "تحتاج إلى مراجعة إضافية للمخطط وأجزائه. أعد المحاولة واستفد من المعلم الذكي.",
  restartQuiz: "إعادة الاختبار",

  tutorWelcome: (diagramTitle) =>
    `أهلاً بك! أنا "المعلم الذكي لإديو-جرافيك". يمكنك سؤالي عن أي جزء في رسم (${diagramTitle})، أو طلب شرح أعمق لكيفية عمله، أو نصائح للمذاكرة والاستعداد للاختبارات.`,
  tutorPlaceholder: "اسأل المعلم الذكي عن أي تفصيل في هذا المخطط...",
  send: "إرسال",
  suggestedQuestionsTitle: "أسئلة مقترحة للاستكشاف السريع:",
  listening: "استماع للإجابة",
  copyAnswer: "نسخ الإجابة",
  aiThinking: "جاري كتابة الإجابة التعليمية...",
  suggestedQuestion1: "ما هو المسار الرئيسي الذي يربط بين هذه الأجزاء؟",
  suggestedQuestion2: "كيف يأتي هذا الرسم في أسئلة الامتحانات الوزارية والمدرسية؟",
  suggestedQuestion3: "ماذا يحدث إذا تعطل أحد هذه الأعضاء أو المكونات؟",
  suggestedQuestion4: "لخص لي أهم 3 نقاط يجب حفظها في هذا المخطط.",

  visualSearch: "البحث البصري",
  visualSearchActive: "البحث البصري نشط 🎯",
  visualSearchInstruction: "انقر على أي جزء أو اسحب مستطيلاً لتحديد أي منطقة لفحصها بالذكاء الاصطناعي",
  regionRecognized: "تم التعرف على المنطقة بنجاح",
  inspectAnother: "فحص منطقة أخرى 🎯",
  askTutorAboutRegion: "اسأل المعلم الذكي عن هذا الجزء",
  whatIsThisQ: "١. ما هذا؟",
  whatIsFunctionQ: "٢. ما وظيفته؟",
  whereIsLocationQ: "٣. أين يوجد؟",
  relationToOtherPartsQ: "٤. ما علاقته بباقي الأجزاء؟",
  close: "إغلاق",

  zoomIn: "تكبير",
  zoomOut: "تصغير",
  resetZoom: "إعادة ضبط الحجم",
  fullscreen: "ملء الشاشة",
  showLabels: "إظهار الأسماء",
  hideLabels: "إخفاء الأسماء",

  stageOf: (current, total) => `المرحلة ${current} من ${total}`,
  tourPlaying: "إيقاف مؤقت",
  tourPaused: "تشغيل الجولة",
  autoAdvanceOn: "الانتقال التلقائي مفعّل",
  autoAdvanceOff: "الانتقال التلقائي متوقف",
  speed: "السرعة",

  uploadModalTitle: "تحليل رسم كتاب مدرسي جديد",
  uploadModalSubtitle: "ارفع صورة أو التقطها بالكاميرا لتحويلها إلى انفوجرافيك تفاعلي",
  tabUploadFile: "رفع ملف / صورة",
  tabCamera: "التقاط بالكاميرا",
  tabSamples: "نماذج جاهزة",
  dragDropTitle: "اسحب وأفلت صورة الرسم هنا، أو تصفح من جهازك",
  browseFiles: "تصفح الملفات",
  supportedFormats: "يدعم صيغ JPG, PNG, WEBP بدقة عالية حتى 20 ميجابايت",
  capturePhoto: "التقاط الصورة الآن",
  startCamera: "تشغيل الكاميرا",
  stopCamera: "إيقاف الكاميرا",
  switchCamera: "تبديل الكاميرا",
  startAnalysis: "بدء التحليل التفاعلي بالذكاء الاصطناعي",
  cancel: "إلغاء",
  analyzingStep1: "فحص الصورة وتحليل الأبعاد وتفكيك المكونات...",
  analyzingStep2: "توليد الشروحات العلمية والاختبار التفاعلي...",

  historyTitle: "سجل التحليلات والمخططات",
  clearAllHistory: "مسح الكل",
  noHistoryTitle: "لا توجد تحليلات محفوظة بعد",
  noHistoryDesc: "قم برفع أو التقاط رسم تخطيطي من كتابك المدرسي ليتم حفظه واستكشافه هنا دائماً.",
  openDiagram: "فتح المخطط",
  deleteItem: "حذف",

  exportModalTitle: "مشاركة وتصدير بطاقة الاستذكار",
  exportModalSubtitle: "احفظ هذا المخطط كملخص دراسي جاهز للطباعة أو شاركه مع زملائك",
  copySummaryText: "نسخ الملخص الدراسي كاملاً",
  copiedSuccess: "تم النسخ بنجاح!",
  printOrSavePdf: "طباعة أو حفظ بتنسيق PDF",
  downloadStudyCard: "تحميل بطاقة الاستذكار",

  settingsTitle: "الإعدادات",
  tabLanguage: "اللغة",
  tabAccount: "الحساب",
  tabAppearance: "المظهر",
  tabNavigation: "التنقل",
  tabPrivacy: "الخصوصية",
  tabNotifications: "الإشعارات",
  tabPerformance: "الأداء",
  tabHelp: "المساعدة",
  tabVision: "الرؤية التقنية",

  languageSettingsDesc: "اختر لغة واجهة النظام والشروحات العلمية:",
  langArabicName: "العربية (SA)",
  langEnglishName: "الإنجليزية (English - US)",
  langBilingualName: "ثنائي اللغة (Bilingual - موصى به للتعلم)",
  langBilingualDesc: "عرض الأسماء والمصطلحات باللغتين العربية والإنجليزية معاً لتعزيز الحصيلة اللغوية العلمية.",
  appearanceDesc: "تخصيص أنماط العرض والألوان وحجم الخطوط:",
  themeLabel: "السمة والألوان",
  themeDark: "الوضع الليلي (Dark Mode)",
  themeLight: "الوضع المضيء (Light Mode)",
  themeDarkDesc: "مريح للعين أثناء المذاكرة الليلية الطويلة وموفر للطاقة.",
  themeLightDesc: "مظهر كلاسيكي ناصع وواضح مناسب للاستخدام النهاري وغرف الصف.",
  fontSizeLabel: "حجم الخطوط",
  fontSizeSmall: "صغير",
  fontSizeMedium: "متوسط (افتراضي)",
  fontSizeLarge: "كبير وواضح",
  highContrastLabel: "تباين لوني عالي (سهولة الوصول)",
  motionEffectsLabel: "المؤثرات الحركية والانتقالات التفاعلية",
  accountDesc: "بيانات المستخدم والملف الشخصي:",
  studentNameLabel: "اسم المستخدم / الاسم المعروض",
  schoolInfoTitle: "بيانات الحساب والمنصة التعليمية",
  saveChanges: "حفظ الإعدادات",
  savedSuccess: "تم حفظ التفضيلات بنجاح!",
  clearCache: "مسح الذاكرة المؤقتة",
  cacheClearedSuccess: "تم مسح الذاكرة المؤقتة بنجاح",

  profileTitle: "الملف الشخصي للمستخدم",
  studentTitle: "مستخدم متميز",
  statsDiagramsAnalyzed: "مخططات تم تحليلها",
  statsTestsPassed: "اختبارات مجتازة",
  statsDayStreak: "أيام استمرارية",
  badgesTitle: "الأوسمة والإنجازات العلمية",
  badgeExplorer: "مستكشف الأحياء",
  badgeScientist: "عالم المستقبل",
  badgeTopPerformer: "المتفوق الذهبي",
  recentActivityTitle: "آخر المخططات المدروسة",

  navHome: "الرئيسية",
  navHistory: "السجل",
  navPlus: "إضافة",
  navProfile: "الملف الشخصي",
  navSettings: "الإعدادات",
  fabAiTutor: "المعلم الذكي لإديو-جرافيك",
};

export const ENGLISH_TRANSLATIONS: AppTranslations = {
  appName: "EduGraphic",
  appSubtitle: "Interactive Textbook Diagram & Infographic AI Learning System",
  schoolName: "EduGraphic Interactive Diagrams Platform",
  schoolDirectorate: "Smart Interactive Learning & Self-Study",

  home: "Home",
  viewer: "Interactive Explorer",
  history: "History",
  profile: "Profile",
  settings: "Settings",
  interactiveExplorer: "Interactive Explorer",
  backToHome: "Back to Home",
  switchLanguage: "Switch Language",
  languageBadge: "عربي",
  enableDarkMode: "Enable Dark Mode",
  enableLightMode: "Enable Light Mode",
  shareAndExport: "Share & Export",
  shareApp: "Share EduGraphic App",
  shareEducationalModel: "Share This Educational Model",

  heroBadge: "Smart Visual AI Diagram Learning Platform",
  heroTitlePrefix: "Transform Diagrams into",
  heroTitleHighlight: "Interactive Experiences",
  heroDescription:
    "Snap a photo of any diagram in your school textbook, and our AI system will analyze and convert it into a professional, interactive educational infographic.",
  uploadFromDevice: "Upload from Device",
  captureWithCamera: "Capture with Camera",
  exploreModelsTitle: "Explore Educational Models",
  viewAll: "View All",

  interactivePartsCount: (count) => `${count} Interactive Parts`,
  startAnimatedTour: "Start Animated Tour ▶️",
  endTour: "End Tour",
  tourActive: "Interactive Guided Tour Active",
  listenToSummary: "Listen to Summary",
  stopAudio: "Stop Audio",
  keyTakeawaysTitle: "Key Educational Study Takeaways:",

  tabPartDetails: "Part Details",
  tabPartsIndex: "Parts Index",
  tabInteractiveQuiz: "Smart Quiz",
  tabAiTutor: "AI Tutor",

  selectPartPromptTitle: "Select a Diagram Part to Explore",
  selectPartPromptDesc:
    "Click on any interactive hotspot or label on the diagram to see its biological function, audio pronunciation, and detailed explanation.",
  partIndexLabel: (current, total) => `Part ${current} of ${total}`,
  prevPart: "Previous Part",
  nextPart: "Next Part",
  pronounceArabic: "نطق بالعربية",
  pronounceEnglish: "Pronounce (EN)",
  functionTitle: "Biological Function & Role",
  descriptionTitle: "Detailed Structure & Description",
  didYouKnowTitle: "Did you know?",
  askAiAboutPart: (partName) => `Ask AI Tutor about (${partName})`,

  searchPartsPlaceholder: "Search parts, organs, or functions...",
  readAllSequentially: "Read All Parts Sequentially",
  stopSequentialReading: "Stop Reading",
  noPartsFound: "No parts match your search query",
  stepNumber: (step) => `Step ${step}`,

  quizTitle: "Interactive Smart Assessment",
  noQuizAvailable: "No quiz questions currently available for this diagram",
  questionNumber: (current, total) => `Question ${current} of ${total}`,
  listenToQuestion: "Listen to Question",
  stopQuestionAudio: "Stop Audio",
  submitAnswerPrompt: "Select the correct answer for instant verification:",
  correctFeedback: "Correct Answer! Well done 🎉",
  incorrectFeedback: "Incorrect! Here is the scientific explanation:",
  explanationTitle: "Scientific Explanation:",
  nextQuestion: "Next Question",
  prevQuestion: "Previous Question",
  viewQuizResults: "View Results",
  quizCompletedTitle: "Assessment Completed!",
  quizScoreSummary: (score, total) => `You scored ${score} out of ${total} correct answers`,
  quizScoreGreat: "Excellent! You have mastered the parts and functions of this diagram.",
  quizScoreGood: "Very good! Review the detailed descriptions to achieve full mastery.",
  quizScoreNeedsPractice: "Needs extra practice. Re-examine the interactive diagram and use the AI Tutor for assistance.",
  restartQuiz: "Retake Quiz",

  tutorWelcome: (diagramTitle) =>
    `Welcome! I am your "EduGraphic AI Tutor". You can ask me anything about (${diagramTitle}), request in-depth explanations of how components work, or ask for study and exam tips.`,
  tutorPlaceholder: "Ask the AI tutor anything about this diagram...",
  send: "Send",
  suggestedQuestionsTitle: "Suggested Questions for Quick Exploration:",
  listening: "Listening to Answer",
  copyAnswer: "Copy Answer",
  aiThinking: "Generating educational response...",
  suggestedQuestion1: "What is the primary flow connecting these components?",
  suggestedQuestion2: "How does this diagram commonly appear in ministerial and school exams?",
  suggestedQuestion3: "What happens if one of these organs or parts malfunctions?",
  suggestedQuestion4: "Summarize the top 3 critical points to memorize from this diagram.",

  visualSearch: "Visual Search",
  visualSearchActive: "Visual Search Active 🎯",
  visualSearchInstruction: "Click on any part or drag a box across any region to inspect it with AI",
  regionRecognized: "Region Recognized Successfully",
  inspectAnother: "Inspect Another Region 🎯",
  askTutorAboutRegion: "Ask AI Tutor About This Region",
  whatIsThisQ: "1. What is this?",
  whatIsFunctionQ: "2. What is its function?",
  whereIsLocationQ: "3. Where is it located?",
  relationToOtherPartsQ: "4. Relation to other parts?",
  close: "Close",

  zoomIn: "Zoom In",
  zoomOut: "Zoom Out",
  resetZoom: "Reset Zoom",
  fullscreen: "Fullscreen",
  showLabels: "Show Labels",
  hideLabels: "Hide Labels",

  stageOf: (current, total) => `Stage ${current} of ${total}`,
  tourPlaying: "Pause Tour",
  tourPaused: "Resume Tour",
  autoAdvanceOn: "Auto-advance ON",
  autoAdvanceOff: "Auto-advance OFF",
  speed: "Speed",

  uploadModalTitle: "Analyze New Textbook Diagram",
  uploadModalSubtitle: "Upload an image or take a photo with your camera to turn it into an interactive infographic",
  tabUploadFile: "Upload File / Image",
  tabCamera: "Camera Capture",
  tabSamples: "Preloaded Samples",
  dragDropTitle: "Drag and drop diagram image here, or click to browse",
  browseFiles: "Browse Files",
  supportedFormats: "Supports high-resolution JPG, PNG, WEBP up to 20MB",
  capturePhoto: "Capture Photo Now",
  startCamera: "Start Camera",
  stopCamera: "Stop Camera",
  switchCamera: "Switch Camera",
  startAnalysis: "Start AI Interactive Analysis",
  cancel: "Cancel",
  analyzingStep1: "Scanning image, analyzing dimensions and isolating components...",
  analyzingStep2: "Generating scientific explanations and interactive quiz...",

  historyTitle: "Diagram History & Archive",
  clearAllHistory: "Clear All",
  noHistoryTitle: "No Saved Analyses Yet",
  noHistoryDesc: "Upload or capture a diagram from your textbook to save and explore it here anytime.",
  openDiagram: "Open Diagram",
  deleteItem: "Delete",

  exportModalTitle: "Export & Share Study Card",
  exportModalSubtitle: "Save this diagram as a print-ready study summary or share it with classmates",
  copySummaryText: "Copy Full Study Summary",
  copiedSuccess: "Copied to Clipboard!",
  printOrSavePdf: "Print or Save as PDF",
  downloadStudyCard: "Download Study Card",

  settingsTitle: "Settings",
  tabLanguage: "Language",
  tabAccount: "Account",
  tabAppearance: "Appearance",
  tabNavigation: "Navigation",
  tabPrivacy: "Privacy",
  tabNotifications: "Notifications",
  tabPerformance: "Performance",
  tabHelp: "Help & FAQ",
  tabVision: "Technical Vision",

  languageSettingsDesc: "Select interface language and scientific content display:",
  langArabicName: "العربية (Arabic - SA)",
  langEnglishName: "English (US)",
  langBilingualName: "Bilingual (العربية & English - Recommended for Learning)",
  langBilingualDesc: "Display names and terms in both Arabic and English simultaneously to build scientific bilingual literacy.",
  appearanceDesc: "Customize display styles, theme colors, and typography:",
  themeLabel: "Theme & Palette",
  themeDark: "Dark Mode",
  themeLight: "Light Mode",
  themeDarkDesc: "Gentle on the eyes during nighttime study sessions and battery-saving.",
  themeLightDesc: "Clean, high-clarity daylight theme ideal for classrooms and daylight study.",
  fontSizeLabel: "Font Size",
  fontSizeSmall: "Small",
  fontSizeMedium: "Medium (Default)",
  fontSizeLarge: "Large & Clear",
  highContrastLabel: "High Contrast (Accessibility)",
  motionEffectsLabel: "Motion & Transition Effects",
  accountDesc: "User & Profile Details:",
  studentNameLabel: "Username / Display Name",
  schoolInfoTitle: "Account & Platform Details",
  saveChanges: "Save Settings",
  savedSuccess: "Preferences saved successfully!",
  clearCache: "Clear Cache",
  cacheClearedSuccess: "Cache cleared successfully",

  profileTitle: "User Profile",
  studentTitle: "Active Learner",
  statsDiagramsAnalyzed: "Diagrams Analyzed",
  statsTestsPassed: "Quizzes Passed",
  statsDayStreak: "Day Streak",
  badgesTitle: "Badges & Scientific Achievements",
  badgeExplorer: "Biology Explorer",
  badgeScientist: "Future Scientist",
  badgeTopPerformer: "Golden Achiever",
  recentActivityTitle: "Recently Studied Diagrams",

  navHome: "Home",
  navHistory: "History",
  navPlus: "Add",
  navProfile: "Profile",
  navSettings: "Settings",
  fabAiTutor: "EduGraphic AI Tutor",
};

/**
 * Returns active translations dictionary for the given language mode.
 */
export function getTranslations(lang: LanguageMode): AppTranslations {
  if (lang === "en") {
    return ENGLISH_TRANSLATIONS;
  }
  return ARABIC_TRANSLATIONS;
}
