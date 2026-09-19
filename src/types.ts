export interface DiagramPart {
  id: string;
  nameAr: string;
  nameEn: string;
  functionAr: string;
  functionEn: string;
  descriptionAr: string;
  descriptionEn: string;
  relationToOtherPartsAr?: string;
  relationToOtherPartsEn?: string;
  keyFactAr?: string;
  keyFactEn?: string;
  stepOrder?: number;
  stageTitleAr?: string;
  stageTitleEn?: string;
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
  layerId?: string; // For system decomposition mode
  subsystemAr?: string; // For whole-to-part grouping
  subsystemEn?: string;
}

export type AdaptiveExplanationMode =
  | "whole-to-part" // التدرج من الكل إلى الجزء
  | "timeline"      // تسلسل زمني ومراحل
  | "pathway-flow"  // توضيح مسار وحركة
  | "comparison"    // مقارنة بين العناصر
  | "decomposition";// تفكيك مكونات النظام

export type MultiLevelStage =
  | "macro" // المستوى 1: الصورة الكاملة والنظام العام
  | "meso"  // المستوى 2: الأجزاء والمسارات الحيوية
  | "micro"; // المستوى 3: التفاصيل الدقيقة والعمليات

export interface ComparisonPair {
  partAId: string;
  partBId: string;
  titleAr: string;
  titleEn: string;
  aspectAr: string;
  aspectEn: string;
  contrastPointsAr: string[];
  contrastPointsEn: string[];
}

export interface SystemDecompositionLayer {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  partIds: string[];
}

export interface AdaptiveExplanationData {
  primaryMode: AdaptiveExplanationMode;
  modeRationaleAr: string;
  modeRationaleEn: string;
  availableModes: AdaptiveExplanationMode[];
  macroOverviewAr: string;
  macroOverviewEn: string;
  flowDirectionAr?: string;
  flowDirectionEn?: string;
  comparisonPairs?: ComparisonPair[];
  systemLayers?: SystemDecompositionLayer[];
  realWorldApplicationAr?: string;
  realWorldApplicationEn?: string;
  commonMisconceptionsAr?: string[];
  commonMisconceptionsEn?: string[];
}

export interface QuizQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctAnswerIndex: number;
  explanationAr: string;
  explanationEn: string;
}

export interface DiagramAnalysis {
  id: string;
  titleAr: string;
  titleEn: string;
  subjectAr: string;
  subjectEn: string;
  gradeLevelAr: string;
  gradeLevelEn: string;
  summaryAr: string;
  summaryEn: string;
  simpleSummaryAr?: string;
  simpleSummaryEn?: string;
  detailedExplanationAr?: string;
  detailedExplanationEn?: string;
  modelType?:
    | "anatomy"
    | "botany"
    | "experiment"
    | "machine"
    | "device"
    | "geography_map"
    | "engineering"
    | "chemistry"
    | "physics"
    | "question"
    | "general_educational";
  contentType?: "diagram" | "question" | "table" | "chart" | "textbook_page" | "other";
  directSummaryAr?: string;
  directSummaryEn?: string;
  contentCategoryAr?: string;
  contentCategoryEn?: string;
  isRealVisionAnalysis?: boolean;
  nonEducationalReasonAr?: string;
  nonEducationalReasonEn?: string;
  parts: DiagramPart[];
  quiz: QuizQuestion[];
  keyTakeawaysAr?: string[];
  keyTakeawaysEn?: string[];
  suggestedQuestionsAr?: string[];
  suggestedQuestionsEn?: string[];
  imageUrl: string;
  originalFileName?: string;
  createdAt: string;
  adaptiveExplanation?: AdaptiveExplanationData;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  relatedPartId?: string;
}

export type LanguageMode = "ar" | "en" | "both";
export type ThemeMode = "light" | "dark";
export type ActiveTab = "infographic" | "parts" | "quiz" | "chat";
export type MainView = "home" | "viewer" | "vision" | "history" | "notes" | "settings";

export type NoteSourceType =
  | "manual"
  | "ai_chat"
  | "vision_analysis"
  | "diagram_viewer"
  | "selection";

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string; // e.g. "الدراسة" | "البرمجة" | "أفكار" | "شخصي" | "مهام" or custom
  isPinned: boolean;
  isFavorite: boolean;
  tags: string[];
  attachedImageUrl?: string;
  attachedDiagramId?: string;
  attachedQuestion?: string;
  attachedAnalysisSnippet?: string;
  source?: NoteSourceType;
  createdAt: string;
  updatedAt: string;
}

export type NoteAiAction =
  | "summarize"      // لخص ملاحظاتي
  | "generate_quiz"  // حول هذه الملاحظات إلى أسئلة
  | "explain"        // اشرح لي هذه الملاحظات
  | "structure"      // رتب هذه الملاحظات
  | "key_points";    // استخرج أهم النقاط

export type SettingsTab =
  | "language"
  | "account"
  | "appearance"
  | "navigation"
  | "privacy"
  | "notifications"
  | "performance"
  | "help"
  | "vision";

export interface HistoryItem {
  id: string;
  titleAr: string;
  titleEn: string;
  subjectAr: string;
  partsCount: number;
  thumbnail: string;
  createdAt: string;
  analysis: DiagramAnalysis;
}

export type FontSizePreference = "small" | "medium" | "large";
export type NavModePreference = "buttons" | "swipe";
export type HomePreference = "upload" | "history";
export type AlertTypePreference = "sound" | "visual" | "both";
export type RenderQualityPreference = "low" | "medium" | "high";

export interface AppSettings {
  languageMode: LanguageMode;
  themeMode: ThemeMode;
  fontSize: FontSizePreference;
  motionEffects: boolean;
  highContrast: boolean;
  navMode: NavModePreference;
  showNavDots: boolean;
  homePreference: HomePreference;
  historyPrivacy: boolean;
  enableNotifications: boolean;
  alertType: AlertTypePreference;
  renderQuality: RenderQualityPreference;
  backgroundProcessing: boolean;
}

export interface UserPreferences {
  languageMode: LanguageMode;
  themeMode: ThemeMode;
  fontSize: "sm" | "md" | "lg";
  soundEffects: boolean;
  highContrast: boolean;
}

export interface UserStats {
  diagramsAnalyzed: number;
  quizzesCompleted: number;
  studyStreakDays: number;
  earnedBadges: string[];
}

export interface UserQuizRecord {
  id: string;
  diagramId: string;
  diagramTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export interface UserAccount {
  id: string;
  username: string; // Registered username
  usernameNormalized?: string; // Lowercase normalized username for uniqueness
  displayName: string;
  email?: string;
  avatarUrl?: string;
  password?: string;
  passwordHash?: string;
  authProvider: "google" | "local";
  userCategory?: string; // e.g. متعلم عام (كافة الأعمار), طالب جامعي, طالب مدرسي, باحث/متخصص
  ageGroup?: string; // مفتوح لجميع الأعمار
  schoolName?: string; // Optional for users wishing to specify institution
  gradeLevel?: string; // Optional for users wishing to specify grade/level
  createdAt: string;
  updatedAt?: string;
  lastLoginAt: string;
  preferences: UserPreferences;
  history: HistoryItem[];
  quizzes?: UserQuizRecord[];
  chats?: Record<string, ChatMessage[]>;
  stats: UserStats;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  token?: string;
}

export interface VisualSearchRegion {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width?: number; // percentage
  height?: number; // percentage
}

export interface VisualSearchInspection {
  recognized: boolean;
  nameAr: string;
  nameEn: string;
  whatIsThisAr: string; // ما هذا؟
  whatIsThisEn: string;
  functionAr: string; // ما وظيفته؟
  functionEn: string;
  locationAr: string; // أين يوجد؟
  locationEn: string;
  relationToOtherPartsAr: string; // ما علاقته بباقي الأجزاء؟
  relationToOtherPartsEn: string;
  keyFactAr?: string;
  keyFactEn?: string;
  matchedPartId?: string;
  region: VisualSearchRegion;
}

export type VisionAnalysisIntent =
  | "analyze"           // 🔍 تحليل الصورة
  | "explain"           // 📖 شرح المحتوى
  | "explain_detailed"  // 🧠 شرح بالتفصيل
  | "summarize"         // ⚡ شرح مختصر
  | "extract_text"      // 📝 استخراج النص
  | "translate"         // 🌐 ترجمة
  | "solve_question"    // ➗ حل السؤال
  | "analyze_code"      // 💻 تحليل الكود
  | "find_bugs"         // 🐛 اكتشاف الأخطاء
  | "analyze_table"     // 📊 تحليل الجدول أو البيانات
  | "step_by_step"      // 📚 شرح تعليمي خطوة بخطوة
  | "simplify"          // ✨ تبسيط المحتوى
  | "generate_quiz"     // ❓ طرح أسئلة على الصورة
  | "custom";           // طلب مخصص

export interface VisionChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  intent?: VisionAnalysisIntent;
  detectedType?: "code" | "math_question" | "diagram" | "textbook" | "table" | "screenshot" | "general";
  clarityStatus?: "clear" | "partially_unclear" | "unclear";
  suggestedFollowUps?: string[];
  isRealVisionAnalysis?: boolean;
}

export interface VisionSession {
  id: string;
  title?: string;
  imageUrl: string;
  originalFileName?: string;
  imageDimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
    isTall: boolean;
    orientation: string;
  };
  prompt: string;
  initialIntent: VisionAnalysisIntent;
  messages: VisionChatMessage[];
  createdAt: string;
}

