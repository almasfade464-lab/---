import React, { useState, useEffect } from "react";
import {
  X,
  Bookmark,
  Search,
  Trash2,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Calendar,
  Layers,
  FileText,
  Film,
  Download,
  HelpCircle,
  Edit3,
  Check,
  Sparkles,
} from "lucide-react";
import { DiagramAnalysis, LanguageMode } from "../types";
import {
  getSavedNotes,
  deleteSavedNote,
  updateNoteUserCustomNotes,
  EducationalNote,
} from "../utils/notesStorage";

interface MyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDiagram: (diagram: DiagramAnalysis) => void;
  languageMode?: LanguageMode;
  userId?: string;
}

export const MyNotesModal: React.FC<MyNotesModalProps> = ({
  isOpen,
  onClose,
  onSelectDiagram,
  languageMode = "ar",
  userId,
}) => {
  const isEn = languageMode === "en";
  const [notes, setNotes] = useState<EducationalNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [customTextDraft, setCustomTextDraft] = useState("");

  const reloadNotes = () => {
    setNotes(getSavedNotes(userId));
  };

  useEffect(() => {
    if (isOpen) {
      reloadNotes();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const subjects = Array.from(new Set(notes.map((n) => n.subjectAr).filter(Boolean)));

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summaryAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.userCustomNotes && note.userCustomNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === "all" || note.subjectAr === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isEn ? "Are you sure you want to delete this note?" : "هل أنت متأكد من حذف هذه الملاحظة من سجل ملاحظاتك؟")) {
      deleteSavedNote(id, userId);
      reloadNotes();
    }
  };

  const handleOpenDiagram = (note: EducationalNote) => {
    // Reconstruct full diagram analysis object
    const diagram: DiagramAnalysis = {
      id: note.diagramId,
      titleAr: note.titleAr,
      titleEn: note.titleEn,
      subjectAr: note.subjectAr,
      subjectEn: note.subjectEn,
      gradeLevelAr: note.gradeLevelAr,
      gradeLevelEn: note.gradeLevelAr,
      summaryAr: note.summaryAr,
      summaryEn: note.summaryEn,
      directSummaryAr: note.directSummaryAr,
      parts: note.parts,
      quiz: note.quiz,
      keyTakeawaysAr: note.keyTakeawaysAr,
      imageUrl: note.imageUrl,
      createdAt: note.savedAt,
    };
    onSelectDiagram(diagram);
    onClose();
  };

  const handleSaveCustomRemarks = (noteId: string) => {
    updateNoteUserCustomNotes(noteId, customTextDraft, userId);
    setEditingNoteId(null);
    reloadNotes();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isEn ? "My Educational Notes & Saved Lessons" : "ملاحظاتي والدروس المحفوظة"}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {notes.length} {isEn ? "Notes" : "ملاحظة"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEn
                  ? "Access your saved visual diagrams, explanations, quizzes, and videos"
                  : "مستودعك التعليمي الشخصي للصور والشروح والاختبارات ومقاطع الفيديو المحفوظة"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search notes..." : "بحث في ملاحظاتي..."}
              className="w-full ps-9 pe-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedSubject("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                selectedSubject === "all"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {isEn ? "All Subjects" : "كافة المواد"}
            </button>
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  selectedSubject === subj
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                <Bookmark className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">
                {isEn ? "No Saved Notes Yet" : "لا توجد ملاحظات محفوظة حتى الآن"}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isEn
                  ? "When analyzing any image, click 'Save to My Notes' to store the image, full explanation, quiz, and video presentation here."
                  : "عند تحليل أي صورة أو رسم تعليمي، اضغط على زر 'حفظ في ملاحظاتي' لتخزين الصورة وشرحها واختبارها هنا للرجوع إليها في أي وقت."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleOpenDiagram(note)}
                  className="group relative bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-200 shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header line: Subject badge + Date + Delete */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {note.subjectAr}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(note.savedAt).toLocaleDateString("ar-EG")}</span>
                        <button
                          onClick={(e) => handleDelete(note.id, e)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                          title={isEn ? "Delete Note" : "حذف الملاحظة"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Image & Title row */}
                    <div className="flex items-start gap-3">
                      <img
                        src={note.imageUrl}
                        alt={note.titleAr}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {isEn ? note.titleEn : note.titleAr}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {note.directSummaryAr || note.summaryAr}
                        </p>
                      </div>
                    </div>

                    {/* Content highlights pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-300">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60">
                        <Layers className="w-3 h-3 text-blue-400" />
                        <span>{note.parts.length} عناصر</span>
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60">
                        <HelpCircle className="w-3 h-3 text-emerald-400" />
                        <span>{note.quiz.length} أسئلة اختبار</span>
                      </span>
                      {note.videoScenes && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60">
                          <Film className="w-3 h-3 text-indigo-400" />
                          <span>عرض فيديو</span>
                        </span>
                      )}
                    </div>

                    {/* Custom User Remarks / Notes */}
                    {editingNoteId === note.id ? (
                      <div
                        className="pt-2 border-t border-slate-700/60 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <textarea
                          value={customTextDraft}
                          onChange={(e) => setCustomTextDraft(e.target.value)}
                          placeholder={isEn ? "Add your personal notes or study reminders here..." : "اكتب ملاحظاتك وتلخيصك الشخصي هنا..."}
                          rows={2}
                          className="w-full p-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-amber-400"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 text-[11px] rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                          >
                            {isEn ? "Cancel" : "إلغاء"}
                          </button>
                          <button
                            onClick={() => handleSaveCustomRemarks(note.id)}
                            className="px-2.5 py-1 text-[11px] rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                          >
                            {isEn ? "Save" : "حفظ الملاحظة"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1 text-[11px] truncate flex-1">
                          <Edit3 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">
                            {note.userCustomNotes
                              ? note.userCustomNotes
                              : isEn
                              ? "Click to add your personal remarks..."
                              : "أضف ملاحظاتك الشخصية..."}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setCustomTextDraft(note.userCustomNotes || "");
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold ps-2"
                        >
                          {note.userCustomNotes ? (isEn ? "Edit" : "تعديل") : (isEn ? "Add" : "إضافة")}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Open Diagram Action Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isEn ? "Open Interactive Lesson" : "فتح الدرس التفاعلي"}</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEn ? "Saved locally and securely on your device" : "محفوظ محلياً وبشكل آمن في حسابك وجهازك"}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            {isEn ? "Close" : "إغلاق"}
          </button>
        </div>
      </div>
    </div>
  );
};
