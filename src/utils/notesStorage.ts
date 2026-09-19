/**
 * EduGraphic Notes Storage System
 * Manages saving, retrieving, updating, and exporting educational notes ("ملاحظاتي")
 */

import { DiagramAnalysis, DiagramPart, QuizQuestion } from "../types";

export interface EducationalNote {
  id: string;
  diagramId: string;
  titleAr: string;
  titleEn: string;
  subjectAr: string;
  subjectEn: string;
  gradeLevelAr: string;
  imageUrl: string;
  summaryAr: string;
  summaryEn: string;
  directSummaryAr?: string;
  inImageTextExplanationAr?: string;
  parts: DiagramPart[];
  quiz: QuizQuestion[];
  keyTakeawaysAr?: string[];
  userCustomNotes?: string;
  tags: string[];
  savedAt: string;
  videoScenes?: {
    id: string;
    titleAr: string;
    titleEn: string;
    narrativeAr: string;
    narrativeEn: string;
    durationSeconds: number;
    partId?: string;
  }[];
}

const NOTES_STORAGE_KEY_PREFIX = "edugraphic_saved_notes_";

function getStorageKey(userId?: string): string {
  return `${NOTES_STORAGE_KEY_PREFIX}${userId || "guest"}`;
}

export function getSavedNotes(userId?: string): EducationalNote[] {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read saved notes from storage:", err);
    return [];
  }
}

export function saveDiagramToNotes(
  diagram: DiagramAnalysis,
  extra?: {
    userCustomNotes?: string;
    inImageTextExplanationAr?: string;
    videoScenes?: any[];
  },
  userId?: string
): EducationalNote {
  const existingNotes = getSavedNotes(userId);
  const now = new Date().toISOString();

  // Check if this diagram is already saved
  const existingIndex = existingNotes.findIndex((n) => n.diagramId === diagram.id);

  const noteData: EducationalNote = {
    id: existingIndex >= 0 ? existingNotes[existingIndex].id : `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    diagramId: diagram.id,
    titleAr: diagram.titleAr,
    titleEn: diagram.titleEn,
    subjectAr: diagram.subjectAr,
    subjectEn: diagram.subjectEn,
    gradeLevelAr: diagram.gradeLevelAr,
    imageUrl: diagram.imageUrl,
    summaryAr: diagram.summaryAr,
    summaryEn: diagram.summaryEn,
    directSummaryAr: diagram.directSummaryAr,
    inImageTextExplanationAr: extra?.inImageTextExplanationAr || (existingIndex >= 0 ? existingNotes[existingIndex].inImageTextExplanationAr : undefined),
    parts: diagram.parts || [],
    quiz: diagram.quiz || [],
    keyTakeawaysAr: diagram.keyTakeawaysAr || [],
    userCustomNotes: extra?.userCustomNotes ?? (existingIndex >= 0 ? existingNotes[existingIndex].userCustomNotes : ""),
    tags: [diagram.subjectAr, diagram.gradeLevelAr].filter(Boolean),
    savedAt: now,
    videoScenes: extra?.videoScenes || (existingIndex >= 0 ? existingNotes[existingIndex].videoScenes : undefined),
  };

  if (existingIndex >= 0) {
    existingNotes[existingIndex] = noteData;
  } else {
    existingNotes.unshift(noteData);
  }

  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(existingNotes));
  } catch (err) {
    console.error("Failed to save note to localStorage:", err);
  }

  return noteData;
}

export function deleteSavedNote(noteId: string, userId?: string): boolean {
  try {
    const existing = getSavedNotes(userId);
    const filtered = existing.filter((n) => n.id !== noteId);
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error("Failed to delete note:", err);
    return false;
  }
}

export function isDiagramSavedInNotes(diagramId: string, userId?: string): boolean {
  const notes = getSavedNotes(userId);
  return notes.some((n) => n.diagramId === diagramId);
}

export function updateNoteUserCustomNotes(noteId: string, text: string, userId?: string): boolean {
  try {
    const existing = getSavedNotes(userId);
    const note = existing.find((n) => n.id === noteId);
    if (!note) return false;
    note.userCustomNotes = text;
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(existing));
    return true;
  } catch (err) {
    console.error("Failed to update note custom text:", err);
    return false;
  }
}
