import React from "react";
import {
  CheckCircle2,
  HelpCircle,
  Zap,
  MapPin,
  Network,
  Lightbulb,
  Volume2,
  VolumeX,
  MessageSquare,
  Crosshair,
  X,
  Sparkles,
} from "lucide-react";
import { VisualSearchInspection, LanguageMode } from "../types";
import { speechManager } from "../utils/speech";

interface VisualInspectorCardProps {
  inspection: VisualSearchInspection;
  languageMode: LanguageMode;
  onClose: () => void;
  onInspectAnother: () => void;
  onAskAiTutor: (prompt: string) => void;
}

export const VisualInspectorCard: React.FC<VisualInspectorCardProps> = ({
  inspection,
  languageMode,
  onClose,
  onInspectAnother,
  onAskAiTutor,
}) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const isEn = languageMode === "en";

  React.useEffect(() => {
    const unsub = speechManager.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  const handleSpeakAll = () => {
    if (isSpeaking) {
      speechManager.stop();
      return;
    }

    const fullScript = isEn
      ? `Area recognized: ${inspection.nameEn}. What is this: ${inspection.whatIsThisEn}. Function: ${inspection.functionEn}. Location: ${inspection.locationEn}. Relation to other parts: ${inspection.relationToOtherPartsEn}.`
      : `تم التعرف على المنطقة بنجاح: ${inspection.nameAr}. ما هذا: ${inspection.whatIsThisAr}. وظيفته: ${inspection.functionAr}. أين يوجد: ${inspection.locationAr}. ما علاقته بباقي الأجزاء: ${inspection.relationToOtherPartsAr}.`;

    speechManager.speak(fullScript, isEn ? "en" : "ar");
  };

  const handleAskTutor = () => {
    const questionPrompt = isEn
      ? `Tell me more about ${inspection.nameEn} and its precise biological and functional role.`
      : `أريد أن أتعلم المزيد عن ${inspection.nameAr} ودوره الحيوي وتكامله مع باقي الأجزاء في هذا المخطط.`;
    onAskAiTutor(questionPrompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-500" />

        {/* Header: Recognition Status + Actions */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4 bg-slate-950/60">
          <div>
            {/* System Status: "تم التعرف على المنطقة" */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? "Region Recognized Successfully" : "تم التعرف على المنطقة"}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{inspection.nameAr}</span>
              <span className="text-sm sm:text-base font-normal text-slate-400 font-sans" dir="ltr">
                ({inspection.nameEn})
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Readout */}
            <button
              onClick={handleSpeakAll}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isSpeaking
                  ? "bg-amber-500 border-amber-400 text-slate-950 animate-pulse shadow-lg shadow-amber-500/30"
                  : "bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700"
              }`}
              title={isSpeaking ? (isEn ? "Stop voice" : "إيقاف الصوت") : (isEn ? "Listen to full breakdown" : "استماع للشرح الصوتي الكامل")}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isEn ? "Close" : "إغلاق"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content: The 4 Distinct Answers */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Question 1: ما هذا؟ */}
          <div className="bg-slate-800/60 border border-blue-500/30 rounded-2xl p-4 transition-all hover:border-blue-500/50">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-blue-300" />
              </div>
              <span className="text-base">{isEn ? "1. What is this?" : "١. ما هذا؟"}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {isEn ? inspection.whatIsThisEn : inspection.whatIsThisAr}
            </p>
          </div>

          {/* Question 2: ما وظيفته؟ */}
          <div className="bg-slate-800/60 border border-emerald-500/30 rounded-2xl p-4 transition-all hover:border-emerald-500/50">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-base">{isEn ? "2. What is its function?" : "٢. ما وظيفته؟"}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {isEn ? inspection.functionEn : inspection.functionAr}
            </p>
          </div>

          {/* Question 3: أين يوجد؟ */}
          <div className="bg-slate-800/60 border border-amber-500/30 rounded-2xl p-4 transition-all hover:border-amber-500/50">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-base">{isEn ? "3. Where is it located?" : "٣. أين يوجد؟"}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {isEn ? inspection.locationEn : inspection.locationAr}
            </p>
          </div>

          {/* Question 4: ما علاقته بباقي الأجزاء؟ */}
          <div className="bg-slate-800/60 border border-purple-500/30 rounded-2xl p-4 transition-all hover:border-purple-500/50">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <Network className="w-4 h-4 text-purple-300" />
              </div>
              <span className="text-base">{isEn ? "4. Relation to other parts?" : "٤. ما علاقته بباقي الأجزاء؟"}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {isEn ? inspection.relationToOtherPartsEn : inspection.relationToOtherPartsAr}
            </p>
          </div>

          {/* Extra Key Fact if available */}
          {(inspection.keyFactAr || inspection.keyFactEn) && (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed">
                <strong className="text-amber-300 font-bold block mb-0.5">
                  {isEn ? "Key Educational Takeaway" : "معلومة ذهبية هامة"}
                </strong>
                {isEn ? inspection.keyFactEn : inspection.keyFactAr}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onInspectAnother}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span>{isEn ? "Inspect Another Region" : "فحص منطقة أخرى 🎯"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAskTutor}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isEn ? "Ask AI Tutor" : "اسأل المعلم الذكي عن هذا الجزء"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
