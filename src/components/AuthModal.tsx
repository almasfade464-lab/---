import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  LogOut,
  Key,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Edit3,
  RefreshCw,
  Award,
  Calendar,
} from "lucide-react";
import { UserAccount, ThemeMode, LanguageMode } from "../types";
import { CARTOON_AVATARS, getAvatarById } from "../data/avatars";
import { AvatarSelector } from "./AvatarSelector";
import {
  registerUserAccount,
  loginWithUsername,
  loginWithGoogle,
  changeUsername,
  changePassword,
  changeAvatar,
  checkUsernameAvailability,
  validateUsername,
} from "../utils/authStorage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
  initialMode?: "login" | "register" | "profile";
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  initialMode = "login",
  themeMode = "light" as ThemeMode,
  languageMode = "ar" as LanguageMode,
}) => {
  const currentLang: LanguageMode = languageMode;
  const currentTheme: ThemeMode = themeMode;
  const isDark = currentTheme === "dark";
  const isEn = currentLang === "en";

  const [mode, setMode] = useState<"login" | "register" | "profile">(
    currentUser ? "profile" : initialMode
  );

  useEffect(() => {
    if (currentUser) {
      setMode("profile");
    } else {
      setMode(initialMode === "profile" ? "login" : initialMode);
    }
  }, [currentUser, initialMode, isOpen]);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState("cat");
  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Edit States
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [showChangeAvatar, setShowChangeAvatar] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameValidationWarning, setUsernameValidationWarning] = useState<string | null>(null);

  // Clear feedback messages when switching mode
  const switchMode = (newMode: "login" | "register" | "profile") => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUsernameValidationWarning(null);
  };

  // Live username validation for registration
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setErrorMsg(null);
    if (!val.trim()) {
      setUsernameValidationWarning(null);
      return;
    }
    const check = validateUsername(val, currentLang);
    if (!check.isValid) {
      setUsernameValidationWarning(check.error || null);
    } else {
      setUsernameValidationWarning(null);
    }
  };

  // Live validation for changing username in profile
  const handleNewUsernameChange = (val: string) => {
    setNewUsername(val);
    setErrorMsg(null);
    if (!val.trim()) {
      setUsernameValidationWarning(null);
      return;
    }
    const check = validateUsername(val, currentLang);
    if (!check.isValid) {
      setUsernameValidationWarning(check.error || null);
    } else {
      setUsernameValidationWarning(null);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Validate username format
    const check = validateUsername(username, currentLang);
    if (!check.isValid) {
      setErrorMsg(check.error || (isEn ? "Invalid username" : "اسم مستخدم غير صالح"));
      return;
    }

    // 2. Validate password
    if (!password) {
      setErrorMsg(isEn ? "Please enter a password" : "يرجى إدخال كلمة المرور");
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isEn ? "Password must be at least 6 characters" : "يجب ألا تقل كلمة المرور عن 6 خانات للأمان");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(isEn ? "Passwords do not match" : "كلمتا المرور غير متطابقتين");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUserAccount({
        username: username.trim(),
        password: password,
        displayName: username.trim(),
        avatarUrl: selectedAvatarId,
        languageMode: currentLang,
        themeMode: currentTheme,
      });

      if (res.success && res.user) {
        setSuccessMsg(isEn ? "Account created successfully!" : "تم إنشاء الحساب وتوثيقه بنجاح!");
        onUserChange(res.user);
        setTimeout(() => {
          setMode("profile");
          setSuccessMsg(null);
        }, 1200);
      } else {
        setErrorMsg(res.error || (isEn ? "Registration failed" : "فشل إنشاء الحساب"));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isEn ? "Registration failed" : "حدث خطأ أثناء التسجيل"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg(isEn ? "Please enter your username" : "يرجى إدخال اسم المستخدم");
      return;
    }
    if (!password) {
      setErrorMsg(isEn ? "Please enter your password" : "يرجى إدخال كلمة المرور");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithUsername(username.trim(), password, currentLang, rememberMe);
      if (res.success && res.user) {
        setSuccessMsg(isEn ? "Welcome back!" : "أهلاً بك مجدداً!");
        onUserChange(res.user);
        setTimeout(() => {
          setMode("profile");
          setSuccessMsg(null);
        }, 800);
      } else {
        setErrorMsg(
          res.error ||
            (isEn
              ? "Invalid username or password"
              : "اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مجدداً")
        );
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isEn ? "Login failed" : "فشل تسجيل الدخول"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await loginWithGoogle(currentLang);
      if (res.success && res.user) {
        setSuccessMsg(isEn ? "Signed in with Google successfully!" : "تم تسجيل الدخول بحساب Google بنجاح!");
        onUserChange(res.user);
        setTimeout(() => {
          setMode("profile");
          setSuccessMsg(null);
        }, 800);
      } else {
        setErrorMsg(res.error || (isEn ? "Google sign-in failed" : "فشل تسجيل الدخول عبر Google"));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isEn ? "Google sign-in error" : "تعذر الاتصال بـ Google"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Update Username in Profile
  const handleSaveUsername = async () => {
    if (!currentUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const check = validateUsername(newUsername, currentLang);
    if (!check.isValid) {
      setErrorMsg(check.error || "اسم المستخدم غير صالح");
      return;
    }

    setIsLoading(true);
    try {
      const res = await changeUsername(currentUser.id, newUsername.trim(), currentLang);
      if (res.success && res.user) {
        onUserChange(res.user);
        setEditingUsername(false);
        setNewUsername("");
        setSuccessMsg(isEn ? "Username updated successfully" : "تم تحديث اسم المستخدم بنجاح");
      } else {
        setErrorMsg(res.error || "فشل تحديث اسم المستخدم");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (!currentUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPass.length < 6) {
      setErrorMsg(isEn ? "New password must be at least 6 characters" : "يجب ألا تقل كلمة المرور الجديدة عن 6 خانات");
      return;
    }
    if (newPass !== confirmNewPass) {
      setErrorMsg(isEn ? "Passwords do not match" : "كلمتا المرور غير متطابقتين");
      return;
    }

    setIsLoading(true);
    try {
      const res = await changePassword(currentUser.id, currentPassword, newPass, currentLang);
      if (res.success) {
        setChangingPassword(false);
        setCurrentPassword("");
        setNewPass("");
        setConfirmNewPass("");
        setSuccessMsg(isEn ? "Password changed successfully" : "تم تغيير كلمة المرور بنجاح");
      } else {
        setErrorMsg(res.error || "فشل تغيير كلمة المرور");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Change Avatar
  const handleSelectNewAvatar = async (avatarId: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await changeAvatar(currentUser.id, avatarId);
      if (res.success && res.user) {
        onUserChange(res.user);
        setShowChangeAvatar(false);
        setSuccessMsg(isEn ? "Avatar updated!" : "تم تحديث الصورة الشخصية!");
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    onUserChange(null);
    switchMode("login");
    setSuccessMsg(isEn ? "Logged out successfully" : "تم تسجيل الخروج بنجاح");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-lg my-8 rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? "bg-[#0F1B30] border-slate-700/80 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
        dir={isEn ? "ltr" : "rtl"}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {mode === "profile" ? (
                <User className="w-5 h-5" />
              ) : mode === "register" ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black">
                {mode === "profile"
                  ? isEn
                    ? "My Account & Profile"
                    : "الملف الشخصي والحساب"
                  : mode === "register"
                  ? isEn
                    ? "Create New Account"
                    : "إنشاء حساب جديد"
                  : isEn
                  ? "Sign In"
                  : "تسجيل الدخول"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {mode === "profile"
                  ? isEn
                    ? "Manage your avatar, username, and account security"
                    : "إدارة بياناتك، الصورة الكرتونية، وحماية الحساب"
                  : mode === "register"
                  ? isEn
                    ? "Choose a unique username and a cute cartoon avatar"
                    : "اختر اسم مستخدم لطيف وأفاتار كرتوني مميز"
                  : isEn
                  ? "Access your saved diagrams and personalized learning"
                  : "الوصول إلى سجلاتك ومخططاتك المحفوظة بأمان"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alerts */}
        <div className="px-5 pt-3">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2"
            >
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <div className="flex-1 font-medium leading-relaxed">{successMsg}</div>
            </motion.div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* ========================================================================= */}
          {/* MODE: REGISTER (إنشاء حساب) */}
          {/* ========================================================================= */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Google Sign-in Option */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer ${
                  isDark
                    ? "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-white hover:border-slate-600"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs"
                }`}
              >
                {/* Official Google SVG Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isEn ? "Sign up with Google (Instant)" : "التسجيل المباشر بواسطة Google"}
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400">
                  {isEn ? "OR WITH USERNAME" : "أو باسم مستخدم وكلمة مرور"}
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "Username:" : "اسم المستخدم:"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder={isEn ? "e.g. Ahmed Ali" : "مثال: أحمد مصطفى أو Sarah"}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-hidden transition-all ${
                      usernameValidationWarning
                        ? "border-amber-400 bg-amber-50/20 dark:border-amber-500/50"
                        : isDark
                        ? "bg-slate-800/90 border-slate-700 focus:border-blue-500"
                        : "bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
                {/* Real-time username requirement helper */}
                <div className="text-[10px] space-y-0.5 pt-1">
                  {usernameValidationWarning ? (
                    <p className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{usernameValidationWarning}</span>
                    </p>
                  ) : (
                    <p className="text-slate-400 font-medium">
                      {isEn
                        ? "Letters and words only (Arabic or English). No numbers or symbols."
                        : "يسمح بالأحرف والكلمات فقط (عربية أو إنجليزية). يمنع استخدام الأرقام والرموز."}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "Password:" : "كلمة المرور:"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEn ? "Choose your password" : "اختر كلمة المرور التي تناسبك"}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-hidden transition-all ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700 focus:border-blue-500"
                        : "bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isEn
                    ? "Full freedom to choose your password (minimum 6 characters for safety)."
                    : "لك كامل الحرية في اختيار كلمة المرور (حد أدنى 6 خانات للأمان، بدون تعقيدات مزعجة)."}
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "Confirm Password:" : "تأكيد كلمة المرور:"}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isEn ? "Repeat password" : "أعد كتابة كلمة المرور"}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-hidden transition-all ${
                      confirmPassword && confirmPassword !== password
                        ? "border-rose-400 bg-rose-50/20"
                        : isDark
                        ? "bg-slate-800/90 border-slate-700 focus:border-blue-500"
                        : "bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Cartoon Avatar Picker */}
              <div className="pt-2">
                <AvatarSelector
                  selectedAvatarId={selectedAvatarId}
                  onSelect={(id) => setSelectedAvatarId(id)}
                  isDark={isDark}
                />
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{isEn ? "Create Account & Start Learning" : "إنشاء الحساب وبدء التعلم"}</span>
              </button>

              {/* Switch to Login */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? "Already have an account?" : "لديك حساب بالفعل؟"}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    {isEn ? "Sign In here" : "سجّل الدخول من هنا"}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE: LOGIN (تسجيل الدخول) */}
          {/* ========================================================================= */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Google Sign-in Option */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer ${
                  isDark
                    ? "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-white hover:border-slate-600"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isEn ? "Sign in with Google" : "تسجيل الدخول بواسطة Google"}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400">
                  {isEn ? "OR WITH USERNAME" : "أو باسم المستخدم"}
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "Username:" : "اسم المستخدم:"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isEn ? "Enter your username" : "اكتب اسم المستخدم المسجل به"}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-hidden transition-all ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700 focus:border-blue-500"
                        : "bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "Password:" : "كلمة المرور:"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEn ? "Enter your password" : "اكتب كلمة المرور"}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-hidden transition-all ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700 focus:border-blue-500"
                        : "bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{isEn ? "Remember me" : "تذكرني وحفظ الجلسة دائماً"}</span>
                </label>
              </div>

              {/* Submit Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>{isEn ? "Sign In to My Account" : "تسجيل الدخول إلى حسابي"}</span>
              </button>

              {/* Switch to Register */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? "Don't have an account yet?" : "ليس لديك حساب بعد؟"}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    {isEn ? "Create new account" : "أنشئ حساباً جديداً الآن"}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE: PROFILE (الملف الشخصي والحساب) */}
          {/* ========================================================================= */}
          {mode === "profile" && currentUser && (
            <div className="space-y-5">
              {/* Profile Card Header */}
              <div
                className={`p-4 rounded-3xl border flex items-center justify-between gap-4 ${
                  isDark ? "bg-[#13233E]/80 border-slate-700" : "bg-blue-50/60 border-blue-100"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Current Avatar */}
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
                        getAvatarById(currentUser.avatarUrl).render(52)
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowChangeAvatar(!showChangeAvatar)}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
                      title={isEn ? "Change Avatar" : "تغيير الأفاتار"}
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Name and Auth Provider */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {currentUser.displayName || currentUser.username}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                        @{currentUser.username}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          currentUser.authProvider === "google"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {currentUser.authProvider === "google" ? "Google" : isEn ? "Local" : "حساب مسجل"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Log Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isEn ? "Sign Out" : "خروج"}</span>
                </button>
              </div>

              {/* Avatar Chooser Drawer (Collapsible) */}
              {showChangeAvatar && (
                <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {isEn ? "Choose your cartoon avatar:" : "اختر صورة الأفاتار الكرتونية الجديدة:"}
                    </span>
                    <button
                      onClick={() => setShowChangeAvatar(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      {isEn ? "Cancel" : "إلغاء"}
                    </button>
                  </div>
                  <AvatarSelector
                    selectedAvatarId={currentUser.avatarUrl || "cat"}
                    onSelect={handleSelectNewAvatar}
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
                      {isEn ? "Edit Username" : "تعديل اسم المستخدم"}
                    </span>
                  </div>
                  {!editingUsername && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUsername(true);
                        setNewUsername(currentUser.username);
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {isEn ? "Change Name" : "تغيير الاسم"}
                    </button>
                  )}
                </div>

                {editingUsername ? (
                  <div className="space-y-2 pt-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => handleNewUsernameChange(e.target.value)}
                        placeholder={isEn ? "New username" : "اسم المستخدم الجديد"}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${
                          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                        }`}
                      />
                    </div>
                    {usernameValidationWarning && (
                      <p className="text-[10px] text-amber-500 font-medium">
                        {usernameValidationWarning}
                      </p>
                    )}
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingUsername(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        {isEn ? "Cancel" : "إلغاء"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveUsername}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                      >
                        {isEn ? "Save" : "حفظ التغيير"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isEn ? "Current username:" : "اسمك الحالي في المنصة هو"}{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {currentUser.username}
                    </strong>
                    .{" "}
                    {isEn
                      ? "Must follow rules: letters only, no numbers or symbols."
                      : "يخضع لشروط الأسماء (أحرف فقط، ممنوع الأرقام والرموز، وغير مكرر)."}
                  </p>
                )}
              </div>

              {/* Change Password Section (Local Accounts Only) */}
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
                        {isEn ? "Change Password" : "تغيير كلمة المرور"}
                      </span>
                    </div>
                    {!changingPassword && (
                      <button
                        type="button"
                        onClick={() => setChangingPassword(true)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {isEn ? "Update Password" : "تحديث كلمة المرور"}
                      </button>
                    )}
                  </div>

                  {changingPassword ? (
                    <div className="space-y-2.5 pt-1">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={isEn ? "Current password" : "كلمة المرور الحالية"}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${
                          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                        }`}
                      />
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder={isEn ? "New password (min 6 chars)" : "كلمة المرور الجديدة (6 خانات فأكثر)"}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${
                          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                        }`}
                      />
                      <input
                        type="password"
                        value={confirmNewPass}
                        onChange={(e) => setConfirmNewPass(e.target.value)}
                        placeholder={isEn ? "Confirm new password" : "تأكيد كلمة المرور الجديدة"}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-hidden ${
                          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                        }`}
                      />

                      <div className="flex items-center gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setChangingPassword(false)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          {isEn ? "Cancel" : "إلغاء"}
                        </button>
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          disabled={isLoading}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                        >
                          {isEn ? "Change Password" : "حفظ كلمة المرور"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isEn
                        ? "You can update your password anytime with full safety and encryption."
                        : "يمكنك تحديث كلمة المرور في أي وقت، مشفرة بأمان بتقنية التجزئة SHA-256."}
                    </p>
                  )}
                </div>
              )}

              {/* User Learning Stats Summary */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div
                  className={`p-3 rounded-2xl border text-center ${
                    isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-blue-500 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {isEn ? "Analyzed Diagrams" : "المخططات المحللة"}
                    </span>
                  </div>
                  <span className="text-xl font-black">
                    {currentUser.stats?.diagramsAnalyzed || currentUser.history?.length || 0}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border text-center ${
                    isDark ? "bg-[#0B1528] border-slate-800" : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {isEn ? "Completed Quizzes" : "الاختبارات المكتملة"}
                    </span>
                  </div>
                  <span className="text-xl font-black">
                    {currentUser.stats?.quizzesCompleted || currentUser.quizzes?.length || 0}
                  </span>
                </div>
              </div>

              {/* Account Date Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isEn ? "Member since:" : "تاريخ إنشاء الحساب:"}{" "}
                    {new Date(currentUser.createdAt || Date.now()).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <span>
                  {isEn ? "Cloud Database Synced" : "متزامن مع قاعدة البيانات الدائمة"}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
