import { UserAccount, LanguageMode, ThemeMode, HistoryItem, ChatMessage, UserQuizRecord } from "../types";
import { getApiUrl } from "./apiConfig";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "../firebase";

const USERS_DB_KEY = "edugraphic_users_db_v4";
const SESSION_KEY = "edugraphic_session_v4";
const REMEMBER_ME_KEY = "edugraphic_remember_me_v4";
const SYSTEM_RESET_KEY = "edugraphic_fresh_state_v4";

// Ensure clean slate on initial start: purge all old test mock accounts/sessions
try {
  if (typeof window !== "undefined" && !localStorage.getItem(SYSTEM_RESET_KEY)) {
    localStorage.removeItem("edugraphic_users_db_v3");
    localStorage.removeItem("edugraphic_session_v3");
    localStorage.removeItem("edugraphic_remember_me_v3");
    localStorage.removeItem("edugraphic_users_db_v2");
    localStorage.removeItem("edugraphic_session_v2");
    localStorage.removeItem("edugraphic_remember_me_v2");
    localStorage.removeItem("edugraphic_users_db_v1");
    localStorage.removeItem("edugraphic_session_v1");
    sessionStorage.clear();

    const oldKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith("edugraphic_history_") ||
          k.startsWith("edugraphic_chats_") ||
          k.startsWith("edugraphic_quizzes_") ||
          k.startsWith("edugraphic_users_"))
      ) {
        oldKeys.push(k);
      }
    }
    oldKeys.forEach((k) => localStorage.removeItem(k));

    localStorage.setItem(SYSTEM_RESET_KEY, "true");
    localStorage.setItem(USERS_DB_KEY, JSON.stringify([]));
  }
} catch (e) {
  console.warn("Storage reset check:", e);
}

/**
 * Helper to encode Arabic or English username into a safe, valid email format for Firebase Auth:
 * e.g. "أحمد الحسبان" -> "ar_d8a3d8add985d8af_20_d8a7d984d8add8b3d8a8d8a7d986@edu-app.local"
 * e.g. "omar" -> "omar@edu-app.local"
 */
export function usernameToInternalEmail(username: string): string {
  const clean = username.trim().toLowerCase();
  // If pure ASCII alphanumeric, use directly
  if (/^[a-z0-9._-]+$/.test(clean)) {
    return `${clean}@edu-app.local`;
  }
  // Otherwise hex-encode UTF-8 bytes to guarantee 100% valid RFC compliant email for Firebase Auth
  const utf8Bytes = new TextEncoder().encode(clean);
  let hex = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    hex += utf8Bytes[i].toString(16).padStart(2, "0");
  }
  return `u_${hex}@edu-app.local`;
}

/**
 * Validates a username according to user rules:
 * - Accepts Arabic and English letters only
 * - Can have spaces between words
 * - Strictly NO numbers (0-9, ٠-٩) and NO symbols/punctuation
 * - Length: 2 to 35 characters
 */
export function validateUsername(
  username: string,
  lang: LanguageMode = "ar"
): {
  isValid: boolean;
  error: string | null;
  hasNumbers: boolean;
  hasSymbols: boolean;
} {
  const trimmed = username.trim();
  const isEn = lang === "en";

  if (!trimmed) {
    return {
      isValid: false,
      error: isEn ? "Please enter a username" : "يرجى إدخال اسم المستخدم",
      hasNumbers: false,
      hasSymbols: false,
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: isEn
        ? "Username must be at least 2 characters long"
        : "يجب أن يتكون اسم المستخدم من حرفين على الأقل",
      hasNumbers: false,
      hasSymbols: false,
    };
  }

  if (trimmed.length > 35) {
    return {
      isValid: false,
      error: isEn
        ? "Username cannot exceed 35 characters"
        : "يجب ألا يتجاوز اسم المستخدم 35 حرفاً",
      hasNumbers: false,
      hasSymbols: false,
    };
  }

  // Check for numbers: Western (0-9), Arabic-Indic (٠-٩), Persian (۰-۹)
  const numbersRegex = /[0-9\u0660-\u0669\u06F0-\u06F9]/;
  if (numbersRegex.test(trimmed)) {
    return {
      isValid: false,
      error: isEn
        ? "Username must contain Arabic or English letters only, without any numbers."
        : "اسم المستخدم يقبل الأحرف العربية والإنجليزية فقط، بدون أرقام.",
      hasNumbers: true,
      hasSymbols: false,
    };
  }

  // Check that every character is an Arabic or English letter or space
  // Arabic Unicode range: \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF, \uFB50-\uFDFF, \uFE70-\uFEFF
  // English: a-zA-Z
  // Spaces: \s
  const allowedLettersOnlyRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]+$/;
  if (!allowedLettersOnlyRegex.test(trimmed)) {
    return {
      isValid: false,
      error: isEn
        ? "Username must contain Arabic or English letters only, without symbols or special characters."
        : "اسم المستخدم يقبل الأحرف العربية والإنجليزية فقط، بدون رموز أو علامات ترقيم.",
      hasNumbers: false,
      hasSymbols: true,
    };
  }

  return {
    isValid: true,
    error: null,
    hasNumbers: false,
    hasSymbols: false,
  };
}

/**
 * Retrieves all cached users from device storage
 */
export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not parse users database", e);
  }
  return [];
}

/**
 * Saves users cache to local device
 */
export function saveUsers(users: UserAccount[]) {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn("Could not save users to localStorage", e);
  }
}

/**
 * Gets currently active session
 */
export function getCurrentSession(): UserAccount | null {
  try {
    const sessionRaw = sessionStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed && parsed.id && parsed.username) {
        return parsed;
      }
    }

    const localRaw = localStorage.getItem(SESSION_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (parsed && parsed.id && parsed.username) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not load current session", e);
  }
  return null;
}

/**
 * Saves current user session
 */
export function saveCurrentSession(user: UserAccount, rememberMe: boolean = true) {
  try {
    // SECURITY: NEVER store password in session or cache
    const safeUser: UserAccount = { ...user };
    delete safeUser.password;

    const serialized = JSON.stringify(safeUser);
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, serialized);
      localStorage.setItem(REMEMBER_ME_KEY, "true");
      sessionStorage.setItem(SESSION_KEY, serialized);
    } else {
      sessionStorage.setItem(SESSION_KEY, serialized);
      localStorage.removeItem(SESSION_KEY);
      localStorage.setItem(REMEMBER_ME_KEY, "false");
    }
  } catch (e) {
    console.warn("Could not save session", e);
  }
}

/**
 * Completes logout, clears active credentials and sessions
 */
export function completeLogout() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    // Sign out from Firebase Auth
    signOut(auth).catch(() => {});
  } catch (e) {
    console.warn("Logout error:", e);
  }
}

export const clearCurrentSession = completeLogout;

/**
 * Synchronizes user data to Cloud Firestore and local store
 */
export async function syncUserDataToServer(
  userOrId: UserAccount | string,
  partial?: Partial<UserAccount>
): Promise<boolean> {
  const userId = typeof userOrId === "string" ? userOrId : userOrId.id;
  const dataToSync: Partial<UserAccount> =
    typeof userOrId === "string" ? partial || {} : userOrId;

  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(
      userDocRef,
      {
        ...dataToSync,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {}

  // Also sync locally
  const allUsers = getAllUsers();
  const idx = allUsers.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    allUsers[idx] = { ...allUsers[idx], ...dataToSync };
    saveUsers(allUsers);
    const curr = getCurrentSession();
    if (curr && curr.id === userId) {
      saveCurrentSession(allUsers[idx]);
    }
  }

  return true;
}

/**
 * Helper to check in Firestore if a username is already registered
 */
export async function checkUsernameExistsInFirestore(username: string): Promise<boolean> {
  try {
    const clean = username.trim().toLowerCase();
    const q = query(
      collection(db, "users"),
      where("usernameLower", "==", clean),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    console.warn("Firestore username check error:", e);
    return false;
  }
}

/**
 * Helper to fetch user document from Firestore by UID
 */
export async function fetchUserFromFirestore(userId: string): Promise<UserAccount | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
  } catch (e) {
    console.warn("Error fetching user from Firestore:", e);
  }
  return null;
}

/**
 * Hashes password securely using Web Crypto API SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_edugraphic_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Saves/updates user profile in Firestore
 */
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    // SECURITY: strictly strip plaintext password before writing to Firestore
    const safeUser: any = { ...user };
    delete safeUser.password;
    safeUser.usernameLower = user.username.toLowerCase();
    safeUser.updatedAt = new Date().toISOString();

    const userDocRef = doc(db, "users", user.id);
    await setDoc(userDocRef, safeUser, { merge: true });
  } catch (e) {
    console.warn("Error saving user to Firestore:", e);
  }
}

/**
 * Registers a new user account with Cloud Firestore & Firebase Auth:
 * 1. Validates username (Arabic & English letters only, no numbers or symbols)
 * 2. Enforces password length and hashes with SHA-256
 * 3. Checks username uniqueness across Firestore & local cache
 * 4. Tries Firebase Authentication; if auth provider throws operation-not-allowed,
 *    gracefully falls back to direct Firestore account provisioning
 * 5. Saves user settings & profile to Cloud Firestore and local storage
 */
export async function registerUserAccount(data: {
  username: string;
  password?: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  userCategory?: string;
  ageGroup?: string;
  gradeLevel?: string;
  schoolName?: string;
  languageMode?: LanguageMode;
  themeMode?: ThemeMode;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const isEn = data.languageMode === "en";
  const validation = validateUsername(data.username, data.languageMode || "ar");
  if (!validation.isValid) {
    return { success: false, error: validation.error || "اسم مستخدم غير صالح" };
  }

  if (!data.password || data.password.length < 6) {
    return {
      success: false,
      error: isEn
        ? "Password must be at least 6 characters"
        : "يجب ألا تقل كلمة المرور عن 6 خانات للأمان",
    };
  }

  const cleanUsername = data.username.trim();
  const cleanNormalized = cleanUsername.toLowerCase();

  // 1. Check if username is already taken in Firestore
  const alreadyTaken = await checkUsernameExistsInFirestore(cleanUsername);
  if (alreadyTaken) {
    return {
      success: false,
      error: isEn
        ? "This username is already taken. Please choose another username."
        : "اسم المستخدم هذا مسجل بالفعل. يرجى اختيار اسم آخر.",
    };
  }

  // Check local cache
  const localTaken = getAllUsers().some(
    (u) =>
      (u.usernameNormalized || u.username?.toLowerCase()) === cleanNormalized
  );
  if (localTaken) {
    return {
      success: false,
      error: isEn
        ? "This username is already taken. Please choose another username."
        : "اسم المستخدم هذا مسجل بالفعل. يرجى اختيار اسم آخر.",
    };
  }

  // Check backend server availability
  try {
    const checkRes = await fetch(getApiUrl("/api/auth/check-username"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUsername }),
    });
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.available === false) {
        return {
          success: false,
          error: isEn
            ? "This username is already taken. Please choose another username."
            : "اسم المستخدم هذا مسجل بالفعل على الخادم. يرجى اختيار اسم آخر.",
        };
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }

  // 2. Compute secure password hash & internal email
  const authEmail = data.email?.trim() || usernameToInternalEmail(cleanUsername);
  const passwordHash = await hashPassword(data.password);

  let userId = "u_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);

  // 3. Attempt Firebase Authentication (if provider enabled in console)
  try {
    const credential = await createUserWithEmailAndPassword(auth, authEmail, data.password);
    if (credential?.user?.uid) {
      userId = credential.user.uid;
    }
  } catch (err: any) {
    console.info("Firebase Auth provider notice (handled gracefully):", err?.code || err?.message);
    if (err.code === "auth/email-already-in-use") {
      return {
        success: false,
        error: isEn
          ? "This username or email is already registered."
          : "اسم المستخدم أو البريد هذا مسجل مسبقاً.",
      };
    }
  }

  // 4. Construct user profile for Firestore
  const newUser: UserAccount = {
    id: userId,
    username: cleanUsername,
    usernameNormalized: cleanNormalized,
    displayName: data.displayName?.trim() || cleanUsername,
    avatarUrl: data.avatarUrl || "cat",
    email: data.email?.trim() || `${cleanUsername}@edu-app.local`,
    passwordHash: passwordHash,
    authProvider: "local",
    userCategory: data.userCategory || "متعلم عام (كافة الأعمار)",
    ageGroup: data.ageGroup || "جميع الأعمار",
    schoolName: data.schoolName || "التعليم المفتوح والذاتي",
    gradeLevel: data.gradeLevel || "المستوى العام",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferences: {
      languageMode: data.languageMode || "ar",
      themeMode: data.themeMode || "light",
      fontSize: "md",
      soundEffects: true,
      highContrast: false,
    },
    history: [],
    quizzes: [],
    chats: {},
    stats: {
      diagramsAnalyzed: 0,
      quizzesCompleted: 0,
      studyStreakDays: 1,
      earnedBadges: ["مستكشف المعرفة"],
    },
  };

  // 5. Persist to Cloud Firestore
  await saveUserToFirestore(newUser);

  // Sync with server API
  try {
    await fetch(getApiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: newUser, password: data.password }),
    });
  } catch (e) {
    // Handled gracefully
  }

  // 6. Cache locally for fast access
  const allUsers = getAllUsers();
  allUsers.push(newUser);
  saveUsers(allUsers);
  saveCurrentSession(newUser, true);

  return { success: true, user: newUser };
}

/**
 * Logs in with username & password:
 * 1. Queries Cloud Firestore for matching username or email
 * 2. Verifies SHA-256 password hash securely
 * 3. Updates session and user settings
 */
export async function loginWithUsername(
  usernameOrEmail: string,
  password?: string,
  lang: LanguageMode = "ar",
  rememberMe: boolean = true
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanInput = usernameOrEmail.trim();
  const isEn = lang === "en";

  if (!cleanInput) {
    return {
      success: false,
      error: isEn ? "Please enter your username" : "يرجى كتابة اسم المستخدم",
    };
  }

  if (!password) {
    return {
      success: false,
      error: isEn ? "Please enter your password" : "يرجى كتابة كلمة المرور",
    };
  }

  const cleanLower = cleanInput.toLowerCase();
  let userAccount: UserAccount | null = null;

  // 1. Search for user in Cloud Firestore
  try {
    const q1 = query(
      collection(db, "users"),
      where("usernameLower", "==", cleanLower),
      limit(1)
    );
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      userAccount = snap1.docs[0].data() as UserAccount;
    } else if (cleanLower.includes("@")) {
      const q2 = query(
        collection(db, "users"),
        where("email", "==", cleanLower),
        limit(1)
      );
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        userAccount = snap2.docs[0].data() as UserAccount;
      }
    }
  } catch (fsErr) {
    console.warn("Firestore query error (falling back to cache):", fsErr);
  }

  // 2. If not found in Firestore, check local storage database
  if (!userAccount) {
    const localUsers = getAllUsers();
    const foundLocal = localUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanLower ||
        (u.email && u.email.toLowerCase() === cleanLower)
    );
    if (foundLocal) {
      userAccount = foundLocal;
    }
  }

  // 3. If user found, verify password
  if (userAccount) {
    const inputHash = await hashPassword(password);
    const isPasswordValid =
      (userAccount.passwordHash && userAccount.passwordHash === inputHash) ||
      (userAccount.password && userAccount.password === password);

    if (!isPasswordValid) {
      return {
        success: false,
        error: isEn
          ? "Incorrect password. Please try again."
          : "كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.",
      };
    }

    // Password verified! Update lastLoginAt
    userAccount.lastLoginAt = new Date().toISOString();
    await updateDoc(doc(db, "users", userAccount.id), {
      lastLoginAt: userAccount.lastLoginAt,
    }).catch(() => {});

    // Try background Firebase Auth sign in silently (ignoring operation-not-allowed)
    const targetEmail = userAccount.email || usernameToInternalEmail(userAccount.username);
    signInWithEmailAndPassword(auth, targetEmail, password).catch(() => {});

    // Update local cache & session
    const allUsers = getAllUsers();
    const existingIdx = allUsers.findIndex((u) => u.id === userAccount!.id);
    if (existingIdx >= 0) {
      allUsers[existingIdx] = userAccount;
    } else {
      allUsers.push(userAccount);
    }
    saveUsers(allUsers);
    saveCurrentSession(userAccount, rememberMe);

    return { success: true, user: userAccount };
  }

  // 4. If user was not found by username in Firestore or local storage,
  // try Firebase Auth directly just in case user exists in Auth backend
  const targetEmail = cleanLower.includes("@") ? cleanLower : usernameToInternalEmail(cleanInput);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
    const firebaseUser = userCredential.user;
    let authUser = await fetchUserFromFirestore(firebaseUser.uid);
    if (!authUser) {
      authUser = {
        id: firebaseUser.uid,
        username: cleanInput.includes("@") ? cleanInput.split("@")[0] : cleanInput,
        displayName: firebaseUser.displayName || cleanInput,
        email: firebaseUser.email || targetEmail,
        avatarUrl: firebaseUser.photoURL || undefined,
        authProvider: "local",
        schoolName: "منصة EduGraphic التعليمية",
        gradeLevel: "المستوى العام",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          languageMode: lang,
          themeMode: "light",
          fontSize: "md",
          soundEffects: true,
          highContrast: false,
        },
        history: [],
        quizzes: [],
        chats: {},
        stats: {
          diagramsAnalyzed: 0,
          quizzesCompleted: 0,
          studyStreakDays: 1,
          earnedBadges: ["مستكشف المعرفة"],
        },
      };
      await saveUserToFirestore(authUser);
    }

    const allUsers = getAllUsers();
    const existingIdx = allUsers.findIndex((u) => u.id === authUser!.id);
    if (existingIdx >= 0) {
      allUsers[existingIdx] = authUser;
    } else {
      allUsers.push(authUser);
    }
    saveUsers(allUsers);
    saveCurrentSession(authUser, rememberMe);
    return { success: true, user: authUser };
  } catch (err: any) {
    console.info("Sign in error check:", err?.code || err?.message);
    if (err.code === "auth/wrong-password") {
      return {
        success: false,
        error: isEn
          ? "Incorrect password. Please try again."
          : "كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.",
      };
    }
    return {
      success: false,
      error: isEn
        ? "No account found with this username. Please check the name or register a new account."
        : "لم يتم العثور على حساب بهذا الاسم. يرجى التأكد من الاسم أو إنشاء حساب جديد.",
    };
  }
}

/**
 * Signs in or registers with Google:
 * 1. Tries Firebase Authentication Google popup
 * 2. If provider is disabled or blocked in iframe, uses Google profile smoothly
 * 3. Persists profile in Cloud Firestore and local storage
 */
export async function loginWithGoogle(
  lang: LanguageMode = "ar"
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const isEn = lang === "en";

  try {
    let firebaseUser: any = null;

    try {
      const result = await signInWithPopup(auth, googleProvider);
      firebaseUser = result.user;
    } catch (popupError: any) {
      console.warn("Firebase Google popup notice:", popupError?.code || popupError?.message);
      if (popupError?.code === "auth/popup-closed-by-user") {
        return {
          success: false,
          error: isEn ? "Google sign-in popup was closed." : "تم إغلاق نافذة تسجيل الدخول عبر Google.",
        };
      }
      if (popupError?.code === "auth/cancelled-popup-request") {
        return {
          success: false,
          error: isEn ? "Sign-in was cancelled." : "تم إلغاء عملية تسجيل الدخول.",
        };
      }
      return {
        success: false,
        error: popupError?.message || (isEn ? "Failed to sign in with Google" : "فشل تسجيل الدخول عبر Google"),
      };
    }

    if (!firebaseUser || !firebaseUser.email) {
      return {
        success: false,
        error: isEn ? "Failed to obtain Google user information" : "تعذر جلب معلومات حساب Google",
      };
    }

    const email = firebaseUser.email;
    const name = firebaseUser.displayName || email.split("@")[0] || (isEn ? "Learner" : "طالب العلم");
    const photo = firebaseUser.photoURL || "";

    // Sanitize username from Google name: letters only
    let sanitizedUsername = name
      .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, "")
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]/g, "")
      .trim();

    if (sanitizedUsername.length < 2) {
      sanitizedUsername = isEn ? "Learner Student" : "طالب العلم";
    }

    const userId = firebaseUser.uid;

    // Check if user already exists in Firestore
    let userAccount = await fetchUserFromFirestore(userId);

    if (!userAccount) {
      // Also check by email
      try {
        const q = query(
          collection(db, "users"),
          where("email", "==", email.toLowerCase()),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          userAccount = snap.docs[0].data() as UserAccount;
        }
      } catch (e) {}
    }

    if (!userAccount) {
      userAccount = {
        id: userId,
        username: sanitizedUsername,
        usernameNormalized: sanitizedUsername.toLowerCase(),
        displayName: name,
        email: email,
        avatarUrl: photo || "cat",
        authProvider: "google",
        schoolName: "التعليم المفتوح والذاتي",
        gradeLevel: "المستوى العام",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: {
          languageMode: lang,
          themeMode: "light",
          fontSize: "md",
          soundEffects: true,
          highContrast: false,
        },
        history: [],
        quizzes: [],
        chats: {},
        stats: {
          diagramsAnalyzed: 0,
          quizzesCompleted: 0,
          studyStreakDays: 1,
          earnedBadges: ["مستكشف المعرفة", "حساب موثق من Google"],
        },
      };
      await saveUserToFirestore(userAccount);
    } else {
      userAccount.lastLoginAt = new Date().toISOString();
      if (photo && (!userAccount.avatarUrl || userAccount.avatarUrl === "cat")) {
        userAccount.avatarUrl = photo;
      }
      await updateDoc(doc(db, "users", userAccount.id), {
        lastLoginAt: userAccount.lastLoginAt,
        avatarUrl: userAccount.avatarUrl || "",
      }).catch(() => {});
    }

    // Sync with server API
    try {
      await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userAccount }),
      });
    } catch (e) {}

    // Cache locally & save session
    const allUsers = getAllUsers();
    const existingIdx = allUsers.findIndex((u) => u.id === userAccount!.id);
    if (existingIdx >= 0) {
      allUsers[existingIdx] = userAccount;
    } else {
      allUsers.push(userAccount);
    }
    saveUsers(allUsers);
    saveCurrentSession(userAccount, true);

    return { success: true, user: userAccount };
  } catch (error: any) {
    console.error("Google authentication error:", error);
    return {
      success: false,
      error: error?.message || (isEn ? "Google sign-in failed" : "فشل تسجيل الدخول بحساب Google"),
    };
  }
}

/**
 * Fast / Direct Email Sign-In (Convenience shortcut)
 */
export async function loginWithDirectEmail(
  email: string,
  displayName?: string,
  lang: LanguageMode = "ar",
  rememberMe: boolean = true
): Promise<{ success: boolean; user?: UserAccount; isNew?: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const isEn = lang === "en";

  if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length < 5) {
    return {
      success: false,
      error: isEn ? "Please enter a valid email address" : "يرجى إدخال عنوان بريد إلكتروني صحيح",
    };
  }

  // Derive username: strip numbers and non-letters to adhere strictly to rules
  const prefix = cleanEmail.split("@")[0];
  let cleanUsername = prefix
    .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, "")
    .replace(/[^a-zA-Z\u0600-\u06FF\s]/g, " ")
    .trim();

  if (cleanUsername.length < 2) {
    cleanUsername = isEn ? "Student Learner" : "طالب متعلم";
  }

  // Check in Firestore
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", cleanEmail),
      limit(1)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const user = snap.docs[0].data() as UserAccount;
      user.lastLoginAt = new Date().toISOString();
      await saveUserToFirestore(user);
      saveCurrentSession(user, rememberMe);
      return { success: true, user, isNew: false };
    }
  } catch (e) {}

  // Create new user record
  const newUser: UserAccount = {
    id: "email-" + Date.now(),
    username: cleanUsername,
    displayName: displayName?.trim() || cleanUsername,
    email: cleanEmail,
    authProvider: "local",
    schoolName: "منصة EduGraphic التعليمية",
    gradeLevel: "المستوى العام",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferences: {
      languageMode: lang,
      themeMode: "light",
      fontSize: "md",
      soundEffects: true,
      highContrast: false,
    },
    history: [],
    quizzes: [],
    chats: {},
    stats: {
      diagramsAnalyzed: 0,
      quizzesCompleted: 0,
      studyStreakDays: 1,
      earnedBadges: ["مستكشف المعرفة"],
    },
  };

  await saveUserToFirestore(newUser);
  const allUsers = getAllUsers();
  allUsers.push(newUser);
  saveUsers(allUsers);
  saveCurrentSession(newUser, rememberMe);

  return { success: true, user: newUser, isNew: true };
}

/**
 * Resets account password
 */
export async function resetAccountPassword(
  identifier: string,
  newPassword?: string,
  lang: LanguageMode = "ar"
): Promise<{ success: boolean; message?: string; error?: string }> {
  const isEn = lang === "en";
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: isEn
        ? "Password must be at least 6 characters"
        : "يجب ألا تقل كلمة المرور عن 6 خانات",
    };
  }

  const cleanLower = identifier.trim().toLowerCase();
  const newHash = await hashPassword(newPassword);

  // Update in Cloud Firestore
  try {
    const q1 = query(
      collection(db, "users"),
      where("usernameLower", "==", cleanLower),
      limit(1)
    );
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const userDoc = snap1.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        passwordHash: newHash,
        updatedAt: new Date().toISOString(),
      });
    } else if (cleanLower.includes("@")) {
      const q2 = query(
        collection(db, "users"),
        where("email", "==", cleanLower),
        limit(1)
      );
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const userDoc = snap2.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), {
          passwordHash: newHash,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (e) {
    console.warn("Password reset firestore update note:", e);
  }

  // Update locally
  const allUsers = getAllUsers();
  const found = allUsers.find(
    (u) =>
      u.username.toLowerCase() === cleanLower ||
      (u.email && u.email.toLowerCase() === cleanLower)
  );
  if (found) {
    found.passwordHash = newHash;
    delete found.password;
    saveUsers(allUsers);
  }

  return {
    success: true,
    message: isEn
      ? "Password updated successfully. Please sign in with your new password."
      : "تم تحديث كلمة المرور بنجاح. يرجى تسجيل الدخول بها الآن.",
  };
}

/**
 * User Scoped Data Isolation: History
 */
export function getUserScopedHistory(userId: string): HistoryItem[] {
  try {
    const raw = localStorage.getItem(`edugraphic_history_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  const allUsers = getAllUsers();
  const found = allUsers.find((u) => u.id === userId);
  if (found && Array.isArray(found.history) && found.history.length > 0) {
    return found.history;
  }
  return [];
}

export function saveUserScopedHistory(userId: string, history: HistoryItem[]): void {
  try {
    localStorage.setItem(`edugraphic_history_${userId}`, JSON.stringify(history));
  } catch (e) {}

  const allUsers = getAllUsers();
  const found = allUsers.find((u) => u.id === userId);
  if (found) {
    found.history = history;
    found.stats.diagramsAnalyzed = history.length;
    saveUsers(allUsers);
    saveUserToFirestore(found);
  }
}

/**
 * User Scoped Data Isolation: Chats
 */
export function getUserScopedChats(userId: string, diagramId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`edugraphic_chats_${userId}_${diagramId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  const allUsers = getAllUsers();
  const found = allUsers.find((u) => u.id === userId);
  if (found && found.chats && Array.isArray(found.chats[diagramId])) {
    return found.chats[diagramId];
  }
  return [];
}

export function saveUserScopedChats(
  userId: string,
  diagramId: string,
  messages: ChatMessage[]
): void {
  try {
    localStorage.setItem(`edugraphic_chats_${userId}_${diagramId}`, JSON.stringify(messages));
  } catch (e) {}

  const allUsers = getAllUsers();
  const found = allUsers.find((u) => u.id === userId);
  if (found) {
    if (!found.chats) found.chats = {};
    found.chats[diagramId] = messages;
    saveUsers(allUsers);
    saveUserToFirestore(found);
  }
}

/**
 * User Scoped Data Isolation: Quizzes
 */
export function getUserScopedQuizzes(userId: string): UserQuizRecord[] {
  try {
    const raw = localStorage.getItem(`edugraphic_quizzes_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  const allUsers = getAllUsers();
  const found = allUsers.find((u) => u.id === userId);
  if (found && Array.isArray(found.quizzes)) {
    return found.quizzes;
  }
  return [];
}

export function saveUserScopedQuiz(userId: string, record: UserQuizRecord): void {
  const existing = getUserScopedQuizzes(userId);
  const updated = [record, ...existing.filter((q) => q.id !== record.id)];

  try {
    localStorage.setItem(`edugraphic_quizzes_${userId}`, JSON.stringify(updated));
  } catch (e) {}

  const allUsers = getAllUsers();
  const found = allUsers.find((u) => u.id === userId);
  if (found) {
    found.quizzes = updated;
    found.stats.quizzesCompleted = updated.length;
    saveUsers(allUsers);
    saveUserToFirestore(found);
  }
}

/**
 * Updates user profile details
 */
export function updateUserProfile(
  userId: string,
  updates: {
    username?: string;
    displayName?: string;
    userCategory?: string;
    ageGroup?: string;
    gradeLevel?: string;
    schoolName?: string;
    avatarUrl?: string;
  }
): UserAccount {
  const allUsers = getAllUsers();
  const index = allUsers.findIndex((u) => u.id === userId);
  const current = getCurrentSession();

  const target = index >= 0 ? allUsers[index] : (current || ({} as UserAccount));
  if (updates.username) target.username = updates.username.trim();
  if (updates.displayName) target.displayName = updates.displayName.trim();
  if (updates.userCategory) target.userCategory = updates.userCategory.trim();
  if (updates.ageGroup) target.ageGroup = updates.ageGroup.trim();
  if (updates.gradeLevel) target.gradeLevel = updates.gradeLevel.trim();
  if (updates.schoolName) target.schoolName = updates.schoolName.trim();
  if (updates.avatarUrl !== undefined) target.avatarUrl = updates.avatarUrl;

  if (index >= 0) {
    allUsers[index] = target;
    saveUsers(allUsers);
  }
  saveCurrentSession(target);
  saveUserToFirestore(target);

  return target;
}

/**
 * Updates user preferences
 */
export function updateUserPreferences(
  userId: string,
  updatedPrefs: Partial<UserAccount["preferences"]>
): UserAccount {
  const allUsers = getAllUsers();
  const index = allUsers.findIndex((u) => u.id === userId);
  const current = getCurrentSession();

  const target = index >= 0 ? allUsers[index] : (current || ({} as UserAccount));
  target.preferences = {
    ...target.preferences,
    ...updatedPrefs,
  };

  if (index >= 0) {
    allUsers[index] = target;
    saveUsers(allUsers);
  }
  saveCurrentSession(target);
  saveUserToFirestore(target);

  return target;
}

/**
 * Permanently deletes a user account and ALL associated data from Firestore and device
 * This action is completely irreversible.
 */
export async function deleteUserAccount(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete user document from Cloud Firestore
    try {
      const userDocRef = doc(db, "users", userId);
      await deleteDoc(userDocRef);
    } catch (fsErr) {
      console.warn("Firestore delete document error:", fsErr);
    }

    // 2. Remove from local device users database
    const allUsers = getAllUsers();
    const updatedUsers = allUsers.filter((u) => u.id !== userId);
    saveUsers(updatedUsers);

    // 3. If current session matches this user, complete logout
    const current = getCurrentSession();
    if (current && current.id === userId) {
      completeLogout();
    }

    // 4. Wipe all user-scoped files, history, quizzes, assistant chats, and preferences
    localStorage.removeItem(`edugraphic_history_${userId}`);
    localStorage.removeItem(`edugraphic_quizzes_${userId}`);

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.includes(`_${userId}`) || k.includes(`${userId}_`) || k.endsWith(userId))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // 5. Notify server endpoint if needed
    try {
      await fetch(getApiUrl("/api/auth/delete-account"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).catch(() => {});
    } catch (e) {}

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user account:", error);
    return { success: false, error: error?.message || "فشل حذف الحساب" };
  }
}

/**
 * Resets entire system to fresh factory state (clears all accounts and data)
 */
export async function resetEntireSystem(): Promise<void> {
  try {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(SYSTEM_RESET_KEY, "true");
    localStorage.setItem(USERS_DB_KEY, JSON.stringify([]));
    await signOut(auth).catch(() => {});
    await fetch(getApiUrl("/api/auth/reset-all"), { method: "POST" }).catch(() => {});
  } catch (e) {
    console.warn("System reset notice:", e);
  }
}

/**
 * Checks if a username is available (not taken by another account)
 */
export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string
): Promise<{ available: boolean; error?: string }> {
  const clean = (username || "").trim();
  const validation = validateUsername(clean);
  if (!validation.isValid) {
    return { available: false, error: validation.error };
  }

  const cleanLower = clean.toLowerCase();

  // 1. Check local users
  const localConflict = getAllUsers().some(
    (u) =>
      (u.usernameNormalized === cleanLower || u.username?.toLowerCase() === cleanLower) &&
      u.id !== currentUserId
  );
  if (localConflict) {
    return { available: false, error: "اسم المستخدم هذا مسجل بالفعل، يرجى اختيار اسم آخر" };
  }

  // 2. Check Firestore
  try {
    const q = query(
      collection(db, "users"),
      where("usernameLower", "==", cleanLower),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty && snap.docs[0].id !== currentUserId) {
      return { available: false, error: "اسم المستخدم هذا مسجل بالفعل في قاعدة البيانات" };
    }
  } catch (e) {}

  // 3. Check Server API
  try {
    const res = await fetch(getApiUrl("/api/auth/check-username"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: clean, currentUserId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.available === false) {
        return { available: false, error: "اسم المستخدم هذا مسجل بالفعل على الخادم" };
      }
    }
  } catch (e) {}

  return { available: true };
}

/**
 * Changes username for an account, with full validation and uniqueness enforcement
 */
export async function changeUsername(
  userId: string,
  newUsername: string,
  lang: LanguageMode = "ar"
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const isEn = lang === "en";
  const clean = (newUsername || "").trim();
  const check = await checkUsernameAvailability(clean, userId);
  if (!check.available) {
    return { success: false, error: check.error };
  }

  const allUsers = getAllUsers();
  const index = allUsers.findIndex((u) => u.id === userId);
  const current = getCurrentSession();
  const user = index >= 0 ? allUsers[index] : current;

  if (!user) {
    return { success: false, error: isEn ? "User not found" : "لم يتم العثور على المستخدم" };
  }

  user.username = clean;
  user.usernameNormalized = clean.toLowerCase();
  user.displayName = clean;
  user.updatedAt = new Date().toISOString();

  if (index >= 0) {
    allUsers[index] = user;
    saveUsers(allUsers);
  }
  saveCurrentSession(user);
  await saveUserToFirestore(user);

  // Sync with server
  try {
    await fetch(getApiUrl("/api/auth/update-username"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newUsername: clean }),
    });
  } catch (e) {}

  return { success: true, user };
}

/**
 * Changes password securely with verification of current password and SHA-256 hashing
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  lang: LanguageMode = "ar"
): Promise<{ success: boolean; error?: string }> {
  const isEn = lang === "en";

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: isEn
        ? "New password must be at least 6 characters"
        : "يجب ألا تقل كلمة المرور الجديدة عن 6 خانات للأمان",
    };
  }

  const allUsers = getAllUsers();
  const index = allUsers.findIndex((u) => u.id === userId);
  const current = getCurrentSession();
  const user = index >= 0 ? allUsers[index] : current;

  if (!user) {
    return { success: false, error: isEn ? "User not found" : "لم يتم العثور على المستخدم" };
  }

  if (user.authProvider === "google") {
    return {
      success: false,
      error: isEn
        ? "This account was signed in via Google and has no local password."
        : "هذا الحساب مسجل عبر Google ولا يحتاج إلى كلمة مرور محلية.",
    };
  }

  // Verify current password if user has password set
  if (user.passwordHash || user.password) {
    const currentHash = await hashPassword(currentPassword || "");
    const isMatch =
      user.passwordHash === currentHash ||
      (user.password && user.password === currentPassword);

    if (!isMatch) {
      return {
        success: false,
        error: isEn ? "Current password is incorrect" : "كلمة المرور الحالية غير صحيحة",
      };
    }
  }

  const newHash = await hashPassword(newPassword);
  user.passwordHash = newHash;
  delete user.password;
  user.updatedAt = new Date().toISOString();

  if (index >= 0) {
    allUsers[index] = user;
    saveUsers(allUsers);
  }
  saveCurrentSession(user);
  await saveUserToFirestore(user);

  // Sync with server
  try {
    await fetch(getApiUrl("/api/auth/update-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
  } catch (e) {}

  return { success: true };
}

/**
 * Changes avatar for user
 */
export async function changeAvatar(
  userId: string,
  avatarUrl: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const allUsers = getAllUsers();
  const index = allUsers.findIndex((u) => u.id === userId);
  const current = getCurrentSession();
  const user = index >= 0 ? allUsers[index] : current;

  if (!user) {
    return { success: false, error: "المستخدم غير موجود" };
  }

  user.avatarUrl = avatarUrl;
  user.updatedAt = new Date().toISOString();

  if (index >= 0) {
    allUsers[index] = user;
    saveUsers(allUsers);
  }
  saveCurrentSession(user);
  await saveUserToFirestore(user);

  // Sync with server
  try {
    await fetch(getApiUrl("/api/auth/update-avatar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, avatarUrl }),
    });
  } catch (e) {}

  return { success: true, user };
}
