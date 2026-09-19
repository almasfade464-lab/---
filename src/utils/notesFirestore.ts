/**
 * EduGraphic Notes Service with Cloud Firestore & Smart Offline Caching
 * 
 * Features:
 * - Direct Firestore sync to /users/{userId}/notes/{noteId}
 * - Strict multi-tenant Zero-Trust security (only current user has access)
 * - Automatic offline detection & queueing (changes synced upon reconnect)
 * - Realtime live snapshot updates
 * - Full metadata support: categories, pinned, favorite, attachments, source
 */

import {
  db,
  doc,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "../firebase";
import { NoteItem, NoteSourceType } from "../types";

export const DEFAULT_NOTE_CATEGORIES = [
  "📚 الدراسة",
  "💻 البرمجة",
  "💡 أفكار",
  "📝 شخصي",
  "📋 مهام",
];

const LOCAL_NOTES_PREFIX = "edugraphic_notes_cache_";
const PENDING_SYNC_PREFIX = "edugraphic_pending_sync_";
const USER_CATEGORIES_PREFIX = "edugraphic_custom_categories_";

function getCacheKey(userId: string): string {
  return `${LOCAL_NOTES_PREFIX}${userId || "guest"}`;
}

function getSyncQueueKey(userId: string): string {
  return `${PENDING_SYNC_PREFIX}${userId || "guest"}`;
}

function getCategoriesKey(userId: string): string {
  return `${USER_CATEGORIES_PREFIX}${userId || "guest"}`;
}

/**
 * Get cached notes synchronously for instant UI responsiveness
 */
export function getCachedNotes(userId: string): NoteItem[] {
  try {
    const raw = localStorage.getItem(getCacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to parse cached notes:", err);
    return [];
  }
}

/**
 * Save notes into local cache
 */
export function setCachedNotes(userId: string, notes: NoteItem[]): void {
  try {
    localStorage.setItem(getCacheKey(userId), JSON.stringify(notes));
  } catch (err) {
    console.warn("Failed to set cached notes:", err);
  }
}

/**
 * Load user custom categories
 */
export function getUserCategories(userId: string): string[] {
  try {
    const raw = localStorage.getItem(getCategoriesKey(userId));
    if (!raw) return DEFAULT_NOTE_CATEGORIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with defaults to prevent losing base folders
      const merged = Array.from(new Set([...DEFAULT_NOTE_CATEGORIES, ...parsed]));
      return merged;
    }
    return DEFAULT_NOTE_CATEGORIES;
  } catch {
    return DEFAULT_NOTE_CATEGORIES;
  }
}

/**
 * Add a new custom category
 */
export function addUserCategory(category: string, userId: string): string[] {
  const current = getUserCategories(userId);
  const trimmed = category.trim();
  if (!trimmed || current.includes(trimmed)) return current;
  const updated = [...current, trimmed];
  try {
    localStorage.setItem(getCategoriesKey(userId), JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save custom category:", err);
  }
  return updated;
}

/**
 * Remove a custom category (defaults cannot be removed)
 */
export function removeUserCategory(category: string, userId: string): string[] {
  if (DEFAULT_NOTE_CATEGORIES.includes(category)) return getUserCategories(userId);
  const current = getUserCategories(userId);
  const updated = current.filter((c) => c !== category);
  try {
    localStorage.setItem(getCategoriesKey(userId), JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to remove custom category:", err);
  }
  return updated;
}

/**
 * Queue a note modification for background sync if offline
 */
function queuePendingSync(userId: string, item: { type: "save" | "delete"; noteId: string; note?: NoteItem }): void {
  try {
    const raw = localStorage.getItem(getSyncQueueKey(userId));
    const queue: any[] = raw ? JSON.parse(raw) : [];
    // remove existing item for this note if any
    const filtered = queue.filter((q) => q.noteId !== item.noteId);
    filtered.push({ ...item, timestamp: Date.now() });
    localStorage.setItem(getSyncQueueKey(userId), JSON.stringify(filtered));
  } catch (e) {
    console.warn("Failed to queue pending sync:", e);
  }
}

/**
 * Flush and sync all pending items when internet connection is restored
 */
export async function flushPendingSyncs(userId: string): Promise<void> {
  if (!navigator.onLine || !userId || userId === "guest") return;
  try {
    const raw = localStorage.getItem(getSyncQueueKey(userId));
    if (!raw) return;
    const queue: Array<{ type: "save" | "delete"; noteId: string; note?: NoteItem }> = JSON.parse(raw);
    if (!queue.length) return;

    for (const item of queue) {
      try {
        if (item.type === "save" && item.note) {
          const noteRef = doc(db, "users", userId, "notes", item.note.id);
          await setDoc(noteRef, { ...item.note, userId }, { merge: true });
        } else if (item.type === "delete") {
          const noteRef = doc(db, "users", userId, "notes", item.noteId);
          await deleteDoc(noteRef);
        }
      } catch (err) {
        console.warn("Error syncing pending note item:", item.noteId, err);
      }
    }
    // Clear queue after processing
    localStorage.removeItem(getSyncQueueKey(userId));
  } catch (err) {
    console.warn("Failed to flush pending syncs:", err);
  }
}

// Auto sync when online status changes
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    // Attempt sync for any logged in user
    const currentSession = localStorage.getItem("edugraphic_session_v4");
    if (currentSession) {
      try {
        const parsed = JSON.parse(currentSession);
        if (parsed?.id) {
          flushPendingSyncs(parsed.id);
        }
      } catch (e) {
        // ignore
      }
    }
  });
}

/**
 * Fetch all notes for a specific user from Firestore
 * Falls back safely to cached notes if offline or error occurs
 */
export async function fetchUserNotes(userId: string): Promise<NoteItem[]> {
  const cached = getCachedNotes(userId);
  if (!userId || userId === "guest") {
    return cached;
  }

  try {
    const notesColl = collection(db, "users", userId, "notes");
    const notesQuery = query(notesColl, orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(notesQuery);

    const items: NoteItem[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as NoteItem;
      items.push({
        ...data,
        id: d.id,
      });
    });

    // Update local cache
    setCachedNotes(userId, items);
    return items;
  } catch (err) {
    console.warn("Could not fetch notes from Firestore (using cache):", err);
    return cached;
  }
}

/**
 * Real-time subscription to user's notes
 */
export function subscribeToUserNotes(
  userId: string,
  onUpdate: (notes: NoteItem[]) => void,
  onError?: (err: any) => void
): () => void {
  // If no user or guest, invoke immediately with cached notes and return no-op unsubscriber
  if (!userId || userId === "guest") {
    onUpdate(getCachedNotes(userId));
    return () => {};
  }

  // Provide cached data immediately for instant display
  const initialCache = getCachedNotes(userId);
  if (initialCache.length > 0) {
    onUpdate(initialCache);
  }

  try {
    const notesColl = collection(db, "users", userId, "notes");
    const notesQuery = query(notesColl, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const items: NoteItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as NoteItem;
          items.push({
            ...data,
            id: d.id,
          });
        });
        setCachedNotes(userId, items);
        onUpdate(items);
      },
      (error) => {
        console.warn("Snapshot subscription error (fallback to local cache):", error);
        if (onError) onError(error);
        onUpdate(getCachedNotes(userId));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Failed to attach snapshot listener:", err);
    onUpdate(getCachedNotes(userId));
    return () => {};
  }
}

/**
 * Save or update a note in Firestore and local cache
 */
export async function saveNote(
  note: Omit<NoteItem, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string },
  userId: string
): Promise<{ success: boolean; note: NoteItem; offline: boolean }> {
  const effectiveUserId = userId || "guest";
  const now = new Date().toISOString();
  const noteId = note.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  const fullNote: NoteItem = {
    ...note,
    id: noteId,
    userId: effectiveUserId,
    createdAt: note.createdAt || now,
    updatedAt: now,
    tags: note.tags || [],
    isPinned: Boolean(note.isPinned),
    isFavorite: Boolean(note.isFavorite),
    category: note.category || DEFAULT_NOTE_CATEGORIES[0],
  };

  // 1. Optimistically update local cache
  const cached = getCachedNotes(effectiveUserId);
  const existingIdx = cached.findIndex((n) => n.id === noteId);
  let updatedCached: NoteItem[];
  if (existingIdx >= 0) {
    updatedCached = [...cached];
    updatedCached[existingIdx] = fullNote;
  } else {
    updatedCached = [fullNote, ...cached];
  }
  setCachedNotes(effectiveUserId, updatedCached);

  // 2. If guest or offline, queue and return
  if (effectiveUserId === "guest" || !navigator.onLine) {
    if (effectiveUserId !== "guest") {
      queuePendingSync(effectiveUserId, { type: "save", noteId, note: fullNote });
    }
    return { success: true, note: fullNote, offline: true };
  }

  // 3. Write directly to Firestore
  try {
    const noteRef = doc(db, "users", effectiveUserId, "notes", noteId);
    await setDoc(noteRef, fullNote, { merge: true });
    return { success: true, note: fullNote, offline: false };
  } catch (err) {
    console.warn("Firestore save failed, queued for offline sync:", err);
    queuePendingSync(effectiveUserId, { type: "save", noteId, note: fullNote });
    return { success: true, note: fullNote, offline: true };
  }
}

/**
 * Delete a note from Firestore and local cache
 */
export async function deleteNote(
  noteId: string,
  userId: string
): Promise<{ success: boolean; offline: boolean }> {
  const effectiveUserId = userId || "guest";

  // 1. Optimistically update local cache
  const cached = getCachedNotes(effectiveUserId);
  const filtered = cached.filter((n) => n.id !== noteId);
  setCachedNotes(effectiveUserId, filtered);

  // 2. If guest or offline, queue delete
  if (effectiveUserId === "guest" || !navigator.onLine) {
    if (effectiveUserId !== "guest") {
      queuePendingSync(effectiveUserId, { type: "delete", noteId });
    }
    return { success: true, offline: true };
  }

  // 3. Delete from Firestore
  try {
    const noteRef = doc(db, "users", effectiveUserId, "notes", noteId);
    await deleteDoc(noteRef);
    return { success: true, offline: false };
  } catch (err) {
    console.warn("Firestore delete failed, queued for offline:", err);
    queuePendingSync(effectiveUserId, { type: "delete", noteId });
    return { success: true, offline: true };
  }
}

/**
 * Toggle pinned status of a note
 */
export async function toggleNotePin(
  noteId: string,
  isPinned: boolean,
  userId: string
): Promise<boolean> {
  const effectiveUserId = userId || "guest";
  const cached = getCachedNotes(effectiveUserId);
  const note = cached.find((n) => n.id === noteId);
  if (!note) return false;

  const updatedNote: NoteItem = {
    ...note,
    isPinned,
    updatedAt: new Date().toISOString(),
  };

  await saveNote(updatedNote, effectiveUserId);
  return true;
}

/**
 * Toggle favorite status of a note
 */
export async function toggleNoteFavorite(
  noteId: string,
  isFavorite: boolean,
  userId: string
): Promise<boolean> {
  const effectiveUserId = userId || "guest";
  const cached = getCachedNotes(effectiveUserId);
  const note = cached.find((n) => n.id === noteId);
  if (!note) return false;

  const updatedNote: NoteItem = {
    ...note,
    isFavorite,
    updatedAt: new Date().toISOString(),
  };

  await saveNote(updatedNote, effectiveUserId);
  return true;
}

/**
 * Helper to create a note from an AI chat response
 */
export async function saveAiResponseAsNote(
  text: string,
  userId: string,
  metadata?: {
    title?: string;
    question?: string;
    source?: NoteSourceType;
    category?: string;
    attachedImageUrl?: string;
  }
): Promise<NoteItem> {
  const previewTitle =
    metadata?.title ||
    (metadata?.question
      ? `إجابة: ${metadata.question.slice(0, 50)}...`
      : `ملاحظة ذكية: ${text.slice(0, 45).replace(/[#*`]/g, "").trim()}...`);

  const res = await saveNote(
    {
      userId: userId || "guest",
      title: previewTitle,
      content: text,
      category: metadata?.category || "📚 الدراسة",
      isPinned: false,
      isFavorite: false,
      tags: ["ذكاء اصطناعي", metadata?.category || "الدراسة"].filter(Boolean),
      attachedImageUrl: metadata?.attachedImageUrl,
      attachedQuestion: metadata?.question,
      source: metadata?.source || "ai_chat",
    },
    userId
  );

  return res.note;
}

/**
 * Helper to save image analysis as note
 */
export async function saveVisionAnalysisAsNote(
  params: {
    title: string;
    imageUrl?: string;
    question?: string;
    analysisText: string;
    diagramId?: string;
    category?: string;
    userId?: string;
  },
  userId?: string
): Promise<NoteItem> {
  const effectiveUserId = userId || params.userId || "guest";
  let content = "";
  if (params.question) {
    content += `### ❓ السؤال أو الاستفسار:\n${params.question}\n\n`;
  }
  content += `### 🔍 التحليل والشرح التعليمي:\n${params.analysisText}`;

  const res = await saveNote(
    {
      userId: effectiveUserId,
      title: params.title || "تحليل صورة تعليمية",
      content,
      category: params.category || "📚 الدراسة",
      isPinned: false,
      isFavorite: false,
      tags: ["تحليل بصري", "صورة"].filter(Boolean),
      attachedImageUrl: params.imageUrl,
      attachedDiagramId: params.diagramId,
      attachedQuestion: params.question,
      attachedAnalysisSnippet: params.analysisText.slice(0, 150),
      source: "vision_analysis",
    },
    effectiveUserId
  );

  return res.note;
}
