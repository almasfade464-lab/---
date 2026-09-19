# إديو-جرافيك | EduGraphic (Production Ready)

منصة تعليمية تفاعلية فائقة الدقة والذكاء، تدعم الويب الكامل، تطبيقات الويب التقدمية (PWA)، وتطبيقات الأجهزة الذكية الأصلية (Android APK/AAB و iOS) عبر Capacitor.

---

## 🌟 نظرة عامة على المنصات المدعومة (Cross-Platform Support)

1. **Web App (SPA + Express Server)**:
   - واجهة مستخدم متجاوبة تمامًا (Responsive) لجميع الشاشات (الهواتف الذكية، الأجهزة اللوحية، الحواسيب المحمولة والشاشات الكبيرة).
   - واجهة عربية وإنجليزية كاملة مع دعم RTL/LTR.
   - خادم Express آمن لحماية مفاتيح API (Gemini API) دون تسريبها للمتصفح.

2. **Progressive Web App (PWA)**:
   - قابلة للتثبيت الفوري على Windows و macOS و ChromeOS و Linux و Android و iOS مباشرة من المتصفح بنقرة واحدة.
   - مزودة بـ Service Worker متطور ومخزن مؤقت (Workbox Offline Caching) لجميع الموارد والأيقونات.
   - ملف `manifest.webmanifest` متكامل مع أيقونات بجميع المقاسات ووضع العرض المستقل `standalone`.

3. **Android App (APK & AAB)**:
   - مشروع Android أصلي جاهز داخل مجلد `/android`.
   - معرف التطبيق: `com.edugraphic.app`.
   - مدعوم بأذونات الكاميرا، الصوت، والوسائط المتعددة في `AndroidManifest.xml`.
   - قابل للتصدير بصيغة APK للتجربة المباشرة و AAB للرفع على متجر Google Play.

4. **iOS App (Xcode)**:
   - مشروع iOS أصلي جاهز داخل مجلد `/ios`.
   - إعدادات `Info.plist` متضمنة كافة شروحات الخصوصية المطلوبة (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSMicrophoneUsageDescription`).
   - جاهز للفتح في Xcode وبنائه ونشره على Apple App Store.

---

## 🚀 التثبيت والتشغيل المحلي (Quickstart & Local Setup)

### 1. المتطلبات الأساسية
- **Node.js**: الإصدار 18 أو 20+
- **npm**: الإصدار 9+
- (لبناء الأندرويد محلياً): **Android Studio** مع Android SDK و JDK 17+.
- (لبناء iOS محلياً): جهاز **macOS** مع **Xcode 15+** و CocoaPods.

### 2. تثبيت الحزم
```bash
npm install
```

### 3. إعداد المتغيرات البيئية (Environment Variables)
انسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```
وقم بتعيين المفاتيح التالية:
```env
# بيئة التشغيل
NODE_ENV=production
PORT=3000

# مفتاح Gemini الذكاء الاصطناعي (يظل على الخادم الخلفي فقط)
GEMINI_API_KEY=your_gemini_api_key_here

# عنوان الخادم الخلفي (مهم عند تشغيل تطبيق Capacitor Android/iOS)
# اتركه فارغاً في الويب ليستخدم المسار النسبي، أو ضعه بعنوان الخادم المستضاف:
# VITE_API_BASE_URL=https://your-edugraphic-server.com
```

### 4. التشغيل في بيئة التطوير (Development)
```bash
npm run dev
```
يعمل التطبيق على: `http://localhost:3000`

---

## ⚡ التشغيل والرفع على Replit (Deploy & Run on Replit)

تم تجهيز هذا المشروع ليعمل بسلاسة فائقة على منصة **Replit**:

1. **إنشاء Repl جديد**:
   - توجه إلى [Replit](https://replit.com).
   - اضغط **Create Repl** واختر **Node.js** أو ارفع ملف ZIP مباشرة عبر زر Upload.
2. **فك الضغط والملفات**:
   - ضع كافة ملفات المشروع داخل مجلد المشروع في Replit.
3. **ضبط المفاتيح السرية (Secrets / Tools > Secrets)**:
   - اضغط على أيقونة **Secrets** (رمز القفل 🔒) في الشريط الجانبي في Replit.
   - أضف المتغيرات التالية:
     * `GEMINI_API_KEY`: مفتاح Google Gemini API الخاص بك من Google AI Studio.
     * `PORT`: `3000`
     * `NODE_ENV`: `production` (أو `development`)
4. **تثبيت الحزم (Console)**:
   ```bash
   npm install
   ```
5. **بدء التشغيل**:
   - اضغط على زر **Run** الأخضر، أو اكتب في وحدة التحكم:
   ```bash
   npm run dev
   ```
   - سيقوم Replit بفتح نافذة **Webview** تلقائياً على المنفذ 3000 وعرض تطبيق **إديو-جرافيك** بالكامل!

---

## 📁 بنية مجلدات وملفات المشروع (Project File Structure)

```
إديو-جرافيك/
├── src/                          # الشيفرة المصدرية الكاملة للواجهة الأمامية
│   ├── components/               # مكونات React (المخطط التفاعلي، المحادثة، الفيديو، الاختبارات، إلخ)
│   ├── data/                     # النماذج التوضيحية والصور التشريحية والبيانات التعليمية
│   ├── utils/                    # دوال الذكاء الاصطناعي، الكشف عن الأجهزة، معالجة الصوت، QR
│   ├── types.ts                  # تعريفات TypeScript الشاملة
│   ├── firebase.ts               # الاتصال بـ Firebase Firestore و Authentication
│   ├── main.tsx & App.tsx        # نقطة انطلاق التطبيق وإدارة الحالة الرئيسية
│   └── index.css                 # أنماط وتنسيقات Tailwind CSS
├── server.ts & server/           # خادم Express لحماية مفاتيح API وتحليل الصور والنصوص
├── public/                       # الأصول العامة، الأيقونات، Manifest، صور QR وبطاقة الطباعة
├── android/                      # مشروع Android Studio الأصلي الكامل (Java/Gradle/Manifest)
├── ios/                          # مشروع Apple Xcode الأصلي الكامل (Swift/CocoaPods)
├── capacitor.config.ts           # إعدادات Capacitor لتطبيقات الهواتف الذكية
├── firebase-applet-config.json   # إعدادات ربط Firebase
├── firebase-blueprint.json       # مخطط هيكل مجموعات Firestore
├── firestore.rules               # قواعد الأمان لقاعدة البيانات
├── package.json                  # الحزم وسكربتات التشغيل والبناء
├── package-lock.json             # قفل الإصدارات الدقيق لـ npm
├── bun.lock                      # قفل الإصدارات لـ bun
├── tsconfig.json                 # إعدادات مترجم TypeScript
├── vite.config.ts                # إعدادات حزمة Vite و Tailwind
├── .env.example                  # نموذج المتغيرات البيئية الخالي من الأسرار
├── README.md                     # دليل التثبيت، التشغيل، والتطوير الشامل
└── metadata.json                 # بيانات ووصف التطبيق
```

---

## 🛠️ البناء للإنتاج (Production Builds)

### 1. بناء نسخة الويب (Web Production Build)
```bash
npm run build
```
يقوم هذا الأمر بـ:
- بناء الواجهة الأمامية عبر Vite إلى المجلد `dist/`.
- تجميع خادم Node/Express إلى `dist/server.cjs` عبر esbuild لسرعة إقلاع قصوى.

لتشغيل خادم الإنتاج:
```bash
npm start
```

### 2. مزامنة Capacitor مع المنصات الأصلية
بعد أي تحديث للكود أو تعديل في الواجهة:
```bash
npm run cap:sync
```

---

## 📱 بناء تطبيقات الأجهزة المحمولة (Android & iOS)

### بناء نسخة أندرويد (Android APK & AAB)

1. **مزامنة ملفات الويب مع مجلد أندرويد**:
   ```bash
   npm run cap:sync:android
   ```

2. **بناء نسخة APK للتجربة المباشرة (Debug APK)**:
   ```bash
   npm run cap:build:android
   ```
   الملف الناتج سيكون في: `android/app/build/outputs/apk/debug/app-debug.apk`.

3. **بناء حزمة النشر لمتجر Google Play (Release AAB Bundle)**:
   ```bash
   npm run cap:build:android:bundle
   ```
   الملف الناتج سيكون في: `android/app/build/outputs/bundle/release/app-release.aab`.

4. **فتح المشروع في Android Studio**:
   ```bash
   npm run cap:open:android
   ```

### بناء نسخة آبل (iOS App Store)

1. **مزامنة ملفات الويب مع مجلد iOS**:
   ```bash
   npm run cap:sync:ios
   ```

2. **فتح المشروع في Xcode**:
   ```bash
   npm run cap:open:ios
   ```
3. من داخل Xcode:
   - اختر حساب المطور (Apple Developer Team) من Signing & Capabilities.
   - اختر الوجهة (Any iOS Device أو جهازك المتصل).
   - من قائمة Product اختر **Archive** لرفع التطبيق على TestFlight أو App Store.

---

## 🌐 النشر السحابي (Cloud & Server Deployment)

### النشر على Google Cloud Run / Docker
يحتوي المشروع على خادم مدمج يعمل على المنفذ `PORT=3000`.
- أمر البناء: `npm run build`
- أمر التشغيل: `npm start`
- بيئة التشغيل: Node.js 20+

### استضافة PWA الثابتة (Static / CDN)
إذا كنت تستضيف واجهة المتصفح بشكل منفصل على Vercel أو Netlify أو Firebase Hosting:
- قم بتوجيه متغير `VITE_API_BASE_URL` إلى عنوان خادم Express الذي يستضيف واجهات برمجة التطبيقات `/api/*`.
- انشر مجلد `dist/` مباشرة.

---

## 🔒 الأمان وحماية البيانات (Security Architecture)

- **حماية المفاتيح السرية**: جميع مفاتيح Google Gemini API و Firebase Admin تبقى في بيئة الخادم (`server.ts` ومجلد `server/`) ولا تظهر في كود العميل النهائي.
- **عزل أصول التطبيق**: يتم استدعاء جميع نقاط النهاية عبر أداة `getApiUrl()` الذكية، مما يتيح التوافق التلقائي بين المتصفح والتطبيقات الأصلية.
- **أذونات الهاتف**: تم إعداد أذونات الكاميرا والصوت بأعلى معايير الخصوصية للامتثال لسياسات Google Play و Apple App Store.
