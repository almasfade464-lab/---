import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Pin,
  Star,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Tag,
  CheckSquare,
  Square,
  Sparkles,
  Bot,
  HelpCircle,
  BookOpen,
  ListOrdered,
  List,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Code,
  Link as LinkIcon,
  Quote,
  Save,
  Check,
  RefreshCw,
  Folder,
  FolderPlus,
  FileText,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  Share2,
  Copy,
  Download,
  Image as ImageIcon,
  ExternalLink,
  Wifi,
  WifiOff,
  SlidersHorizontal,
  Layers,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { getApiUrl } from "../utils/apiConfig";
import { NoteItem, LanguageMode, ThemeMode, DiagramAnalysis } from "../types";
import {
  fetchUserNotes,
  subscribeToUserNotes,
  saveNote,
  deleteNote,
  toggleNotePin,
  toggleNoteFavorite,
  getUserCategories,
  addUserCategory,
  DEFAULT_NOTE_CATEGORIES,
  flushPendingSyncs,
} from "../utils/notesFirestore";

interface NotesViewProps {
  userId?: string;
  languageMode?: LanguageMode;
  themeMode?: ThemeMode;
  onOpenDiagram?: (diagram: DiagramAnalysis) => void;
  onNavigateBack?: () => void;
  initialSelectedNoteId?: string;
}

export const NotesView: React.FC<NotesViewProps> = ({
  userId,
  languageMode = "ar",
  themeMode = "light",
  onOpenDiagram,
  onNavigateBack,
  initialSelectedNoteId,
}) => {
  const isEn = languageMode === "en";
  const effectiveUserId = userId || "guest";

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "pinned" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"updated_desc" | "updated_asc" | "created_desc" | "alpha">("updated_desc");

  // Active Editing Note
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorCategory, setEditorCategory] = useState("📚 الدراسة");
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [editorPinned, setEditorPinned] = useState(false);
  const [editorFavorite, setEditorFavorite] = useState(false);
  const [editorAttachedImageUrl, setEditorAttachedImageUrl] = useState<string | undefined>();
  const [editorAttachedDiagramId, setEditorAttachedDiagramId] = useState<string | undefined>();
  const [editorAttachedQuestion, setEditorAttachedQuestion] = useState<string | undefined>();

  // Editor modes & views
  const [previewMode, setPreviewMode] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Auto-Save state
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "offline" | "error">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  // AI Assistance state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResultText, setAiResultText] = useState<string | null>(null);
  const [aiActionType, setAiActionType] = useState<string | null>(null);
  const [customAiPrompt, setCustomAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (effectiveUserId && effectiveUserId !== "guest") {
        flushPendingSyncs(effectiveUserId);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [effectiveUserId]);

  // Load categories & subscribe to notes
  useEffect(() => {
    setCategories(getUserCategories(effectiveUserId));

    const unsubscribe = subscribeToUserNotes(
      effectiveUserId,
      (fetchedNotes) => {
        setNotes(fetchedNotes);
        // If initial selected note specified, select it
        if (initialSelectedNoteId && !activeNote) {
          const found = fetchedNotes.find((n) => n.id === initialSelectedNoteId);
          if (found) {
            selectNoteForViewing(found);
          }
        }
      },
      (err) => {
        console.warn("Notes sync fallback:", err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [effectiveUserId, initialSelectedNoteId]);

  // Select note helper
  const selectNoteForViewing = (note: NoteItem) => {
    setActiveNote(note);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorCategory(note.category);
    setEditorTags(note.tags || []);
    setEditorPinned(note.isPinned);
    setEditorFavorite(note.isFavorite);
    setEditorAttachedImageUrl(note.attachedImageUrl);
    setEditorAttachedDiagramId(note.attachedDiagramId);
    setEditorAttachedQuestion(note.attachedQuestion);
    setIsEditing(true);
    setAiResultText(null);
    isDirtyRef.current = false;
    setSaveStatus("saved");
  };

  // Create brand new note
  const handleCreateNewNote = () => {
    const newNoteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const initialCategory = selectedCategoryId !== "all" && !["pinned", "favorites"].includes(selectedCategoryId)
      ? selectedCategoryId
      : categories[0] || "📚 الدراسة";

    const emptyNote: NoteItem = {
      id: newNoteId,
      userId: effectiveUserId,
      title: "",
      content: "",
      category: initialCategory,
      isPinned: false,
      isFavorite: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "manual",
    };

    setActiveNote(emptyNote);
    setEditorTitle("");
    setEditorContent("");
    setEditorCategory(initialCategory);
    setEditorTags([]);
    setEditorPinned(false);
    setEditorFavorite(false);
    setEditorAttachedImageUrl(undefined);
    setEditorAttachedDiagramId(undefined);
    setEditorAttachedQuestion(undefined);
    setIsEditing(true);
    setPreviewMode(false);
    setAiResultText(null);
    isDirtyRef.current = true;
    setSaveStatus("saved");
  };

  // Debounced Auto-Save trigger
  const triggerAutoSave = useCallback(
    (titleToSave: string, contentToSave: string, catToSave: string, pinned: boolean, fav: boolean) => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      setSaveStatus("saving");

      autoSaveTimerRef.current = setTimeout(async () => {
        if (!activeNote) return;

        const updatedNoteData: NoteItem = {
          ...activeNote,
          title: titleToSave.trim() || (isEn ? "Untitled Note" : "ملاحظة بدون عنوان"),
          content: contentToSave,
          category: catToSave,
          isPinned: pinned,
          isFavorite: fav,
          tags: editorTags,
          attachedImageUrl: editorAttachedImageUrl,
          attachedDiagramId: editorAttachedDiagramId,
          attachedQuestion: editorAttachedQuestion,
          updatedAt: new Date().toISOString(),
        };

        const res = await saveNote(updatedNoteData, effectiveUserId);
        if (res.success) {
          setActiveNote(res.note);
          isDirtyRef.current = false;
          setSaveStatus(res.offline ? "offline" : "saved");
          const now = new Date();
          setLastSavedTime(
            now.toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        } else {
          setSaveStatus("error");
        }
      }, 1400);
    },
    [
      activeNote,
      effectiveUserId,
      editorTags,
      editorAttachedImageUrl,
      editorAttachedDiagramId,
      editorAttachedQuestion,
      isEn,
    ]
  );

  // Changes handlers with auto-save
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditorTitle(val);
    isDirtyRef.current = true;
    triggerAutoSave(val, editorContent, editorCategory, editorPinned, editorFavorite);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditorContent(val);
    isDirtyRef.current = true;
    triggerAutoSave(editorTitle, val, editorCategory, editorPinned, editorFavorite);
  };

  const handleCategoryChange = (cat: string) => {
    setEditorCategory(cat);
    isDirtyRef.current = true;
    triggerAutoSave(editorTitle, editorContent, cat, editorPinned, editorFavorite);
  };

  const handleTogglePinned = () => {
    const next = !editorPinned;
    setEditorPinned(next);
    isDirtyRef.current = true;
    triggerAutoSave(editorTitle, editorContent, editorCategory, next, editorFavorite);
  };

  const handleToggleFavorite = () => {
    const next = !editorFavorite;
    setEditorFavorite(next);
    isDirtyRef.current = true;
    triggerAutoSave(editorTitle, editorContent, editorCategory, editorPinned, next);
  };

  // Manual Immediate Save
  const handleManualSave = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    if (!activeNote) return;

    setSaveStatus("saving");
    const updatedNoteData: NoteItem = {
      ...activeNote,
      title: editorTitle.trim() || (isEn ? "Untitled Note" : "ملاحظة بدون عنوان"),
      content: editorContent,
      category: editorCategory,
      isPinned: editorPinned,
      isFavorite: editorFavorite,
      tags: editorTags,
      attachedImageUrl: editorAttachedImageUrl,
      attachedDiagramId: editorAttachedDiagramId,
      attachedQuestion: editorAttachedQuestion,
      updatedAt: new Date().toISOString(),
    };

    const res = await saveNote(updatedNoteData, effectiveUserId);
    if (res.success) {
      setActiveNote(res.note);
      isDirtyRef.current = false;
      setSaveStatus(res.offline ? "offline" : "saved");
      const now = new Date();
      setLastSavedTime(
        now.toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else {
      setSaveStatus("error");
    }
  };

  // Delete note
  const handleDeleteCurrentNote = async () => {
    if (!activeNote) return;
    const confirmMsg = isEn ? "Are you sure you want to delete this note?" : "هل أنت متأكد من حذف هذه الملاحظة نهائياً؟";
    if (!window.confirm(confirmMsg)) return;

    await deleteNote(activeNote.id, effectiveUserId);
    setActiveNote(null);
    setIsEditing(false);
  };

  // Quick toolbar insertion for Markdown
  const insertFormatting = (prefix: string, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    let replacement = "";
    if (prefix.startsWith("\n") || suffix.endsWith("\n")) {
      // Line block insertion
      replacement = `${prefix}${selectedText || (isEn ? "text" : "نص")}${suffix}`;
    } else {
      replacement = `${prefix}${selectedText || (isEn ? "text" : "نص")}${suffix}`;
    }

    const newContent = previousText.substring(0, start) + replacement + previousText.substring(end);
    setEditorContent(newContent);
    isDirtyRef.current = true;
    triggerAutoSave(editorTitle, newContent, editorCategory, editorPinned, editorFavorite);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  // Interactive checkbox toggle in preview mode
  const handleToggleTaskCheckbox = (taskIndex: number) => {
    let currentTaskCount = 0;
    const lines = editorContent.split("\n");
    const updatedLines = lines.map((line) => {
      const isUnchecked = line.match(/^(\s*)-\s*\[\s*\]\s+(.*)$/);
      const isChecked = line.match(/^(\s*)-\s*\[[xX]\]\s+(.*)$/);

      if (isUnchecked || isChecked) {
        if (currentTaskCount === taskIndex) {
          if (isUnchecked) {
            return `${isUnchecked[1]}- [x] ${isUnchecked[2]}`;
          } else if (isChecked) {
            return `${isChecked[1]}- [ ] ${isChecked[2]}`;
          }
        }
        currentTaskCount++;
      }
      return line;
    });

    const newContent = updatedLines.join("\n");
    setEditorContent(newContent);
    isDirtyRef.current = true;
    triggerAutoSave(editorTitle, newContent, editorCategory, editorPinned, editorFavorite);
  };

  // Add new custom category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const updated = addUserCategory(newCategoryName.trim(), effectiveUserId);
    setCategories(updated);
    setEditorCategory(newCategoryName.trim());
    setNewCategoryName("");
    setShowNewCategoryModal(false);
  };

  // Call AI Assistant on current note
  const handleRunAiAction = async (action: string, promptText?: string) => {
    if (!editorContent.trim() && !editorTitle.trim()) {
      alert(isEn ? "Please write some notes first" : "يرجى كتابة محتوى في الملاحظة أولاً لمعالجتها بالذكاء الاصطناعي");
      return;
    }

    setIsAiLoading(true);
    setAiActionType(action);
    setShowAiModal(true);

    try {
      const response = await fetch(getApiUrl("/api/notes/ai-assist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          noteTitle: editorTitle,
          noteContent: editorContent,
          customPrompt: promptText,
          languageMode,
        }),
      });

      const data = await response.json();
      if (data.success && data.resultText) {
        setAiResultText(data.resultText);
      } else {
        setAiResultText(data.error || (isEn ? "Failed to process note with AI" : "تعذر استجابة الذكاء الاصطناعي"));
      }
    } catch (err: any) {
      console.error("AI notes error:", err);
      setAiResultText(isEn ? "Error contacting AI service" : "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Append AI result into current note
  const handleAppendAiResult = () => {
    if (!aiResultText) return;
    const addition = `\n\n---\n### 🤖 إفادة الذكاء الاصطناعي:\n${aiResultText}\n`;
    const newContent = editorContent + addition;
    setEditorContent(newContent);
    isDirtyRef.current = true;
    triggerAutoSave(editorTitle, newContent, editorCategory, editorPinned, editorFavorite);
    setShowAiModal(false);
  };

  // Replace note content with AI result
  const handleReplaceWithAiResult = () => {
    if (!aiResultText) return;
    const confirm = window.confirm(
      isEn
        ? "Replace the note content with AI output?"
        : "هل تريد استبدال محتوى الملاحظة بالكامل بمخرجات الذكاء الاصطناعي؟"
    );
    if (!confirm) return;

    setEditorContent(aiResultText);
    isDirtyRef.current = true;
    triggerAutoSave(editorTitle, aiResultText, editorCategory, editorPinned, editorFavorite);
    setShowAiModal(false);
  };

  // Create new note from AI result
  const handleCreateNewNoteFromAi = async () => {
    if (!aiResultText) return;
    const title = `${editorTitle || (isEn ? "Note" : "ملاحظة")} - ${
      aiActionType === "summarize"
        ? isEn
          ? "Summary"
          : "ملخص"
        : aiActionType === "generate_quiz"
        ? isEn
          ? "Quiz"
          : "أسئلة"
        : isEn
        ? "AI Insights"
        : "تحليل ذكي"
    }`;

    const res = await saveNote(
      {
        userId: effectiveUserId,
        title,
        content: aiResultText,
        category: editorCategory,
        isPinned: false,
        isFavorite: false,
        tags: ["ذكاء اصطناعي"],
        source: "ai_chat",
      },
      effectiveUserId
    );

    if (res.success) {
      selectNoteForViewing(res.note);
      setShowAiModal(false);
    }
  };

  // Filtered and Sorted notes list
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        // Category filter
        if (selectedCategoryId !== "all") {
          if (n.category !== selectedCategoryId) return false;
        }

        // Pin / Fav tab filter
        if (filterType === "pinned" && !n.isPinned) return false;
        if (filterType === "favorites" && !n.isFavorite) return false;

        // Search query filter (matches title, content, category, tags)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = n.title?.toLowerCase().includes(q);
          const matchContent = n.content?.toLowerCase().includes(q);
          const matchCat = n.category?.toLowerCase().includes(q);
          const matchTags = n.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchCat && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned notes always surface first in default view
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        if (sortOrder === "updated_desc") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortOrder === "updated_asc") {
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        if (sortOrder === "created_desc") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOrder === "alpha") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
      });
  }, [notes, selectedCategoryId, filterType, searchQuery, sortOrder]);

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(isEn ? "en-US" : "ar-SA", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Download note as Markdown file
  const handleDownloadNote = (note: NoteItem) => {
    const element = document.createElement("a");
    const file = new Blob([`# ${note.title}\n\n${note.content}`], { type: "text/markdown;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title || "note"}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      id="notes-system-root"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200"
      dir={isEn ? "ltr" : "rtl"}
    >
      {/* Top App Bar */}
      <header
        id="notes-header-bar"
        className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs"
      >
        <div className="flex items-center gap-3">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isEn ? "Go back" : "رجوع"}
            >
              {isEn ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-xs">
              📝
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEn ? "My Notes & Insights" : "ملاحظاتي المعرفية"}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  {notes.length} {isEn ? "notes" : "ملاحظة"}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {isEn
                  ? "Realtime cloud persistence, rich formatting, and AI tutor synthesis"
                  : "مزامنة سحابية فورية، تحرير تفاعلي، ومساعد ذكي لتلخيص وتوليد الأسئلة"}
              </p>
            </div>
          </div>
        </div>

        {/* Right side status & action */}
        <div className="flex items-center gap-2.5">
          {/* Connection Status Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
              isOnline
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
            }`}
            title={
              isOnline
                ? isEn
                  ? "Connected to Firestore Database"
                  : "متصل بقاعدة البيانات السحابية Firestore"
                : isEn
                ? "Offline Mode - Saved Locally"
                : "العمل بدون اتصال - الحفظ محلياً"
            }
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>
              {isOnline
                ? effectiveUserId !== "guest"
                  ? isEn
                    ? "Cloud Synced ✓"
                    : "مزامنة سحابية ✓"
                  : isEn
                  ? "Guest (Local)"
                  : "وضع الضيف"
                : isEn
                ? "Offline Cache"
                : "سجل محلي (أوفلاين)"}
            </span>
          </div>

          {/* New Note Button */}
          <button
            id="btn-new-note"
            onClick={handleCreateNewNote}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-medium text-sm shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isEn ? "New Note" : "ملاحظة جديدة +"}</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Column / Responsive Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6">
        {/* Left Side (or full width on mobile if not editing): Notes List & Filters */}
        <div
          id="notes-list-sidebar"
          className={`flex-col flex-1 lg:max-w-md xl:max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs ${
            isEditing ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search & Sort Controls */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isEn
                    ? "Search title, content, or category..."
                    : "ابحث في العنوان، المحتوى، أو التصنيف..."
                }
                className="w-full ps-10 pe-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs & Sort Dropdown */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterType === "all"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {isEn ? "All" : "الكل"}
                </button>
                <button
                  onClick={() => setFilterType("pinned")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterType === "pinned"
                      ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Pin className="w-3 h-3" />
                  <span>{isEn ? "Pinned" : "المثبتة"}</span>
                </button>
                <button
                  onClick={() => setFilterType("favorites")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterType === "favorites"
                      ? "bg-white dark:bg-slate-700 text-amber-500 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{isEn ? "Favorites" : "المفضلة"}</span>
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-slate-500">
                <SlidersHorizontal className="w-3 h-3" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="updated_desc">{isEn ? "Newest Edited" : "الأحدث تعديلاً"}</option>
                  <option value="updated_asc">{isEn ? "Oldest Edited" : "الأقدم تعديلاً"}</option>
                  <option value="created_desc">{isEn ? "Newest Created" : "الأحدث إنشاءً"}</option>
                  <option value="alpha">{isEn ? "Alphabetical" : "أبجدياً"}</option>
                </select>
              </div>
            </div>

            {/* Folder / Categories Horizontal Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId("all")}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedCategoryId === "all"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                📁 {isEn ? "All Folders" : "كافة التصنيفات"}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryId(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    selectedCategoryId === cat
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}

              <button
                onClick={() => setShowNewCategoryModal(true)}
                className="px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-1"
                title={isEn ? "Add new category" : "إضافة تصنيف جديد"}
              >
                <Plus className="w-3 h-3" />
                <span>{isEn ? "Category" : "تصنيف"}</span>
              </button>
            </div>
          </div>

          {/* Notes Cards Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">
                  {searchQuery
                    ? isEn
                      ? "No notes found matching your search"
                      : "لا توجد ملاحظات تطابق معايير البحث"
                    : isEn
                    ? "No notes yet"
                    : "لا توجد ملاحظات مسجلة بعد"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
                  {isEn
                    ? "Click 'New Note' or save insights from AI chat and vision analysis directly into your knowledge library."
                    : "اضغط على 'ملاحظة جديدة' أو احفظ شروحات الذكاء الاصطناعي وتحليلات الصور إلى مكتبتك المعرفية."}
                </p>
                <button
                  onClick={handleCreateNewNote}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEn ? "Create First Note" : "إنشاء أول ملاحظة"}</span>
                </button>
              </div>
            ) : (
              filteredNotes.map((n) => {
                const isSelected = activeNote?.id === n.id;
                const snippet = (n.content || "")
                  .replace(/#+\s/g, "")
                  .replace(/[*_`[\]]/g, "")
                  .trim()
                  .slice(0, 110);

                return (
                  <div
                    key={n.id}
                    onClick={() => selectNoteForViewing(n)}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs"
                        : "bg-white dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                    }`}
                  >
                    {/* Header of Note Card */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {n.isPinned && (
                          <span
                            className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5 text-[11px] font-bold"
                            title={isEn ? "Pinned note" : "ملاحظة مثبتة في الأعلى"}
                          >
                            <Pin className="w-3 h-3 fill-amber-500" />
                          </span>
                        )}
                        {n.isFavorite && (
                          <span
                            className="text-amber-500 flex items-center gap-0.5 text-[11px]"
                            title={isEn ? "Favorite" : "مفضلة"}
                          >
                            <Star className="w-3 h-3 fill-amber-400" />
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300">
                          {n.category || "📚 الدراسة"}
                        </span>
                        {n.source === "ai_chat" && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/40">
                            🤖 AI
                          </span>
                        )}
                        {n.attachedImageUrl && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/40 flex items-center gap-0.5">
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>{isEn ? "Image" : "صورة"}</span>
                          </span>
                        )}
                      </div>

                      {/* Quick Pin / Fav actions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNotePin(n.id, !n.isPinned, effectiveUserId);
                          }}
                          className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                            n.isPinned ? "text-amber-600" : "text-slate-400"
                          }`}
                          title={n.isPinned ? (isEn ? "Unpin" : "إلغاء التثبيت") : isEn ? "Pin to top" : "تثبيت في الأعلى"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNoteFavorite(n.id, !n.isFavorite, effectiveUserId);
                          }}
                          className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                            n.isFavorite ? "text-amber-500 fill-amber-400" : "text-slate-400"
                          }`}
                          title={n.isFavorite ? (isEn ? "Unfavorite" : "إزالة من المفضلة") : isEn ? "Add to favorites" : "إضافة للمفضلة"}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Title */}
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {n.title || (isEn ? "Untitled Note" : "ملاحظة بدون عنوان")}
                    </h4>

                    {/* Content Snippet */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {snippet || (isEn ? "(Empty note content)" : "(محتوى الملاحظة فارغ)")}
                    </p>

                    {/* Image Attachment Preview if any */}
                    {n.attachedImageUrl && (
                      <div className="mb-2 w-full h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={n.attachedImageUrl}
                          alt="attached"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Footer: Date & actions */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(n.updatedAt)}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadNote(n);
                        }}
                        className="hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                        title={isEn ? "Export note" : "تصدير الملاحظة"}
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side (or active view on mobile): Full Rich Note Editor */}
        <div
          id="notes-editor-pane"
          className={`flex-1 flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs ${
            isEditing ? "flex" : "hidden lg:flex"
          }`}
        >
          {activeNote ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Editor Header Bar */}
              <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setIsEditing(false)}
                    className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                    title={isEn ? "Back to notes list" : "العودة لقائمة الملاحظات"}
                  >
                    {isEn ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>

                  {/* Category Selector */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <Folder className="w-3.5 h-3.5 text-indigo-500" />
                    <select
                      value={editorCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pin & Favorite Buttons */}
                  <button
                    onClick={handleTogglePinned}
                    className={`p-1.5 rounded-xl border transition-all text-xs flex items-center gap-1 font-medium ${
                      editorPinned
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                        : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                    }`}
                    title={editorPinned ? (isEn ? "Pinned to top" : "مثبتة في الأعلى") : isEn ? "Pin note" : "تثبيت الملاحظة"}
                  >
                    <Pin className={`w-3.5 h-3.5 ${editorPinned ? "fill-amber-500" : ""}`} />
                    <span className="hidden sm:inline">{isEn ? "Pin" : "تثبيت"}</span>
                  </button>

                  <button
                    onClick={handleToggleFavorite}
                    className={`p-1.5 rounded-xl border transition-all text-xs flex items-center gap-1 font-medium ${
                      editorFavorite
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                        : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                    }`}
                    title={editorFavorite ? (isEn ? "Favorite" : "في المفضلة") : isEn ? "Add to favorites" : "إضافة للمفضلة"}
                  >
                    <Star className={`w-3.5 h-3.5 ${editorFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
                    <span className="hidden sm:inline">{isEn ? "Favorite" : "المفضلة"}</span>
                  </button>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                  {/* Auto-Save Status Indicator */}
                  <div
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 shadow-2xs"
                    title={
                      saveStatus === "saving"
                        ? isEn
                          ? "Saving changes automatically..."
                          : "جاري حفظ التعديلات تلقائياً..."
                        : saveStatus === "offline"
                        ? isEn
                          ? "Saved to offline cache"
                          : "محفوظ محلياً في الذاكرة"
                        : isEn
                        ? "All changes saved"
                        : "تم حفظ كافة التغييرات"
                    }
                  >
                    {saveStatus === "saving" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {isEn ? "Saving..." : "جاري الحفظ..."}
                        </span>
                      </>
                    ) : saveStatus === "offline" ? (
                      <>
                        <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400">
                          {isEn ? "Saved offline" : "محفوظ محلياً ⚡"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {isEn ? "Saved ✓" : "تم الحفظ ✓"}
                        </span>
                        {lastSavedTime && (
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            ({lastSavedTime})
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Toggle Preview / Edit Mode */}
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                      previewMode
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>
                      {previewMode
                        ? isEn
                          ? "Edit"
                          : "تعديل"
                        : isEn
                        ? "Preview"
                        : "معاينة"}
                    </span>
                  </button>

                  {/* Manual Save Button */}
                  <button
                    onClick={handleManualSave}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    title={isEn ? "Save now" : "حفظ الآن"}
                  >
                    <Save className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={handleDeleteCurrentNote}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                    title={isEn ? "Delete note" : "حذف الملاحظة"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title Input Field */}
              <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <input
                  type="text"
                  value={editorTitle}
                  onChange={handleTitleChange}
                  placeholder={isEn ? "Note Title..." : "عنوان الملاحظة..."}
                  className="w-full text-xl sm:text-2xl font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Attached Image & Diagram Preview (if present) */}
              {editorAttachedImageUrl && (
                <div className="mx-4 sm:mx-6 my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
                      <img
                        src={editorAttachedImageUrl}
                        alt="diagram"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                        📸 {isEn ? "Attached Diagram / Visual Source" : "صورة أو مخطط مرتبط"}
                      </span>
                      {editorAttachedQuestion && (
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                          {editorAttachedQuestion}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        window.open(editorAttachedImageUrl, "_blank");
                      }}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{isEn ? "View Image" : "تكبير الصورة"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditorAttachedImageUrl(undefined);
                        setEditorAttachedDiagramId(undefined);
                        isDirtyRef.current = true;
                        triggerAutoSave(editorTitle, editorContent, editorCategory, editorPinned, editorFavorite);
                      }}
                      className="p-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      title={isEn ? "Remove attachment" : "إزالة المرفق"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Formatting Toolbar (Only in Edit Mode) */}
              {!previewMode && (
                <div
                  id="editor-toolbar"
                  className="px-4 sm:px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 flex items-center gap-1 sm:gap-1.5 flex-wrap overflow-x-auto text-slate-600 dark:text-slate-300"
                >
                  {/* Headings */}
                  <button
                    onClick={() => insertFormatting("# ")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-xs"
                    title={isEn ? "Heading 1" : "عنوان رئيسي"}
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("## ")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-xs"
                    title={isEn ? "Heading 2" : "عنوان فرعي"}
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("### ")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold text-xs"
                    title={isEn ? "Heading 3" : "عنوان مستوى 3"}
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

                  {/* Text Style */}
                  <button
                    onClick={() => insertFormatting("**", "**")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEn ? "Bold text" : "خط غامق"}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("*", "*")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEn ? "Italic text" : "خط مائل"}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("`", "`")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono text-xs"
                    title={isEn ? "Inline code" : "كود مدمج"}
                  >
                    `code`
                  </button>

                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

                  {/* Lists & Tasks */}
                  <button
                    onClick={() => insertFormatting("- ")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEn ? "Bullet list" : "قائمة نقطية"}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("1. ")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEn ? "Numbered list" : "قائمة مرقمة"}
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("- [ ] ")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-indigo-600 dark:text-indigo-400"
                    title={isEn ? "Task Checkbox" : "مهمة قابلة للإنجاز (Checkbox)"}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

                  {/* Code Block, Quote, Link */}
                  <button
                    onClick={() => insertFormatting("```\n", "\n```")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEn ? "Code block" : "كتلة برمجية"}
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("> ")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEn ? "Quote block" : "اقتباس"}
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("[", "](https://)")}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEn ? "Insert link" : "إدراج رابط"}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const nowStr = new Date().toLocaleString(isEn ? "en-US" : "ar-SA");
                      insertFormatting(`\n📅 ${nowStr}\n`);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={isEn ? "Insert current date & time" : "إدراج التاريخ والوقت"}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Editor Writing Area / Preview Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {previewMode ? (
                  <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
                    {editorContent.trim() ? (
                      <ReactMarkdown
                        components={{
                          // Custom checklist rendering with interactive toggle
                          li: ({ children, ...props }) => {
                            const rawText = React.Children.toArray(children).join("");
                            const isChecklist = rawText.startsWith("[ ] ") || rawText.startsWith("[x] ") || rawText.startsWith("[X] ");
                            if (isChecklist) {
                              const isChecked = rawText.startsWith("[x] ") || rawText.startsWith("[X] ");
                              return (
                                <li className="flex items-start gap-2 list-none -ms-4 my-1">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      // Toggle in raw text
                                      const lines = editorContent.split("\n");
                                      const targetLineIdx = lines.findIndex((l) => l.includes(rawText.substring(4, 25)));
                                      if (targetLineIdx >= 0) {
                                        if (isChecked) {
                                          lines[targetLineIdx] = lines[targetLineIdx].replace("- [x] ", "- [ ] ").replace("- [X] ", "- [ ] ");
                                        } else {
                                          lines[targetLineIdx] = lines[targetLineIdx].replace("- [ ] ", "- [x] ");
                                        }
                                        const nextContent = lines.join("\n");
                                        setEditorContent(nextContent);
                                        isDirtyRef.current = true;
                                        triggerAutoSave(editorTitle, nextContent, editorCategory, editorPinned, editorFavorite);
                                      }
                                    }}
                                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span className={isChecked ? "line-through text-slate-400" : ""}>
                                    {rawText.substring(4)}
                                  </span>
                                </li>
                              );
                            }
                            return <li {...props}>{children}</li>;
                          },
                        }}
                      >
                        {editorContent}
                      </ReactMarkdown>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        {isEn ? "No content to preview" : "لا يوجد محتوى للمعاينة"}
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={editorContent}
                    onChange={handleContentChange}
                    placeholder={
                      isEn
                        ? "Write your notes, explanations, and study insights here... (Markdown supported: # headings, - lists, - [ ] tasks, `code`)"
                        : "اكتب ملاحظاتك، شروحاتك، ومعلوماتك هنا بحرية... (يدعم ماركداون: # للعناوين، - للقوائم، - [ ] للمهام، ``` للأكواد)"
                    }
                    className="w-full h-full min-h-[350px] bg-transparent text-slate-900 dark:text-slate-100 resize-none focus:outline-none text-sm sm:text-base leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                )}
              </div>

              {/* Bottom AI Assistant Toolbar on Note */}
              <div
                id="notes-ai-bottom-bar"
                className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 flex flex-wrap items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {isEn ? "AI Tutor Actions" : "المساعد الذكي للملاحظات"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {isEn ? "Transform notes into summaries, quizzes, and structured outlines" : "معالجة وتحويل الملاحظات إلى ملخص أو بنك أسئلة وهيكلة"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleRunAiAction("summarize")}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-all shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isEn ? "Summarize" : "لخص ملاحظاتي"}</span>
                  </button>

                  <button
                    onClick={() => handleRunAiAction("generate_quiz")}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-all shadow-2xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isEn ? "Generate Quiz" : "حولها إلى أسئلة"}</span>
                  </button>

                  <button
                    onClick={() => handleRunAiAction("explain")}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-all shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isEn ? "Deep Explain" : "اشرح لي هذه الملاحظات"}</span>
                  </button>

                  <button
                    onClick={() => handleRunAiAction("structure")}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-all shadow-2xs"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isEn ? "Restructure" : "رتب هذه الملاحظات"}</span>
                  </button>

                  <button
                    onClick={() => handleRunAiAction("key_points")}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1 transition-all shadow-2xs"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{isEn ? "Key Points" : "استخرج أهم النقاط"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // No Note Selected Empty State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
                <Edit3 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                {isEn ? "Select a note or create a new one" : "اختر ملاحظة للمعاينة والتعديل أو أنشئ ملاحظة جديدة"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
                {isEn
                  ? "Enjoy automatic cloud synchronization, rich text formatting, checklists, and deep AI tutoring on all your notes."
                  : "تمتع بالحفظ التلقائي السحابي، تنسيقات ماركداون، قوائم المهام، والمعالجة الذكية بالذكاء الاصطناعي."}
              </p>
              <button
                onClick={handleCreateNewNote}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isEn ? "Create New Note" : "إنشاء ملاحظة جديدة"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New Custom Category */}
      <AnimatePresence>
        {showNewCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-indigo-600" />
                  <span>{isEn ? "Add New Category" : "إضافة تصنيف أو مجلد جديد"}</span>
                </h3>
                <button
                  onClick={() => setShowNewCategoryModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={isEn ? "e.g. 🔬 Physics, 🏛️ History..." : "مثال: 🔬 فيزياء، 🏛️ تاريخ، 🧬 أحياء..."}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isEn ? "Cancel" : "إلغاء"}
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {isEn ? "Add Category" : "إضافة التصنيف"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: AI Assistant Result & Actions */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {aiActionType === "summarize"
                        ? isEn
                          ? "Summary of Notes"
                          : "تلخيص الملاحظات"
                        : aiActionType === "generate_quiz"
                        ? isEn
                          ? "Quiz & Practice Questions"
                          : "أسئلة واختبار ذاتي"
                        : aiActionType === "explain"
                        ? isEn
                          ? "Deep Concept Explanation"
                          : "شرح المفاهيم العلمية"
                        : aiActionType === "structure"
                        ? isEn
                          ? "Restructured Outline"
                          : "هيكلة وترتيب الملاحظات"
                        : aiActionType === "key_points"
                        ? isEn
                          ? "Key Golden Points"
                          : "أهم النقاط الذهبية"
                        : isEn
                        ? "AI Response"
                        : "إجابة المساعد الذكي"}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Processed adhering to strict educational guidelines" : "مستند إلى الدستور التعليمي والاستدلال العلمي الرصين"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {isAiLoading ? (
                  <div className="py-16 text-center">
                    <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-3" />
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">
                      {isEn ? "Analyzing notes with Gemini..." : "جاري استيعاب وتحليل الملاحظات بالذكاء الاصطناعي..."}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {isEn ? "Applying deep scientific reasoning and structured formatting..." : "تطبيق الدقة قبل السرعة والتحقق الذاتي من صحة الشرح..."}
                    </p>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown>{aiResultText || ""}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {!isAiLoading && aiResultText && (
                <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (aiResultText) {
                        navigator.clipboard.writeText(aiResultText);
                        setCopyFeedback(true);
                        setTimeout(() => setCopyFeedback(false), 2000);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copyFeedback ? (isEn ? "Copied!" : "تم النسخ!") : isEn ? "Copy" : "نسخ النتيجة"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAppendAiResult}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium shadow-2xs"
                    >
                      {isEn ? "➕ Append to Note" : "➕ إضافة لنهاية الملاحظة"}
                    </button>

                    <button
                      onClick={handleReplaceWithAiResult}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-medium shadow-2xs"
                    >
                      {isEn ? "🔄 Replace Content" : "🔄 استبدال المحتوى"}
                    </button>

                    <button
                      onClick={handleCreateNewNoteFromAi}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs"
                    >
                      {isEn ? "💾 Save as New Note" : "💾 حفظ كملاحظة جديدة"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
