import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Award,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { QuizQuestion, LanguageMode, UserQuizRecord } from "../types";
import { speechManager } from "../utils/speech";
import { saveUserScopedQuiz } from "../utils/authStorage";

interface QuizSectionProps {
  quiz: QuizQuestion[];
  diagramTitle: string;
  diagramId?: string;
  userId?: string;
  languageMode: LanguageMode;
  onQuizCompleted?: (record: UserQuizRecord) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  quiz,
  diagramTitle,
  diagramId,
  userId,
  languageMode,
  onQuizCompleted,
}) => {
  const isEn = languageMode === "en";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showExplanation, setShowExplanation] = useState<
    Record<number, boolean>
  >({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  useEffect(() => {
    const unsub = speechManager.subscribe((speaking) => {
      if (!speaking) setIsSpeakingQuestion(false);
    });
    return unsub;
  }, []);

  if (!quiz || quiz.length === 0) {
    return (
      <div
        dir={isEn ? "ltr" : "rtl"}
        className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs"
      >
        <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-800">
          {isEn
            ? "No quiz questions available for this diagram yet."
            : "لا توجد أسئلة اختبار متوفرة لهذا الرسم حالياً"}
        </p>
      </div>
    );
  }

  const currentQ = quiz[currentIndex];
  const totalQuestions = quiz.length;
  const isCurrentAnswered = selectedAnswers[currentIndex] !== undefined;

  const calculateScore = (answers: Record<number, number>) => {
    let s = 0;
    quiz.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) {
        s++;
      }
    });
    return s;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isCurrentAnswered) return; // Prevent changing once submitted

    const updatedAnswers = {
      ...selectedAnswers,
      [currentIndex]: optionIndex,
    };
    setSelectedAnswers(updatedAnswers);
    setShowExplanation({ ...showExplanation, [currentIndex]: true });

    // If last question answered, show summary
    if (Object.keys(updatedAnswers).length === totalQuestions) {
      const finalScore = calculateScore(updatedAnswers);
      const finalPercentage = Math.round((finalScore / totalQuestions) * 100);

      const record: UserQuizRecord = {
        id: "quiz-" + Date.now(),
        diagramId: diagramId || "active-diagram",
        diagramTitle: diagramTitle,
        score: finalScore,
        totalQuestions: totalQuestions,
        percentage: finalPercentage,
        completedAt: new Date().toISOString(),
      };
      try {
        const prev = JSON.parse(localStorage.getItem("edugraphic_local_quizzes") || "[]");
        localStorage.setItem("edugraphic_local_quizzes", JSON.stringify([...prev, record]));
      } catch (e) {}
      setSavedLocally(true);
      if (onQuizCompleted) onQuizCompleted(record);

      setTimeout(() => {
        setIsCompleted(true);
      }, 1200);
    }
  };

  const score = calculateScore(selectedAnswers);
  const percentage = Math.round((score / totalQuestions) * 100);

  const handleRestart = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setSavedLocally(false);
  };

  const handleSpeakQuestion = () => {
    if (isSpeakingQuestion) {
      speechManager.stop();
      setIsSpeakingQuestion(false);
      return;
    }
    const text = isEn
      ? `${currentQ.questionEn || currentQ.questionAr}. Options: ${(currentQ.optionsEn || currentQ.optionsAr).join(", ")}`
      : `${currentQ.questionAr}. الخيارات: ${currentQ.optionsAr.join("، ")}`;
    setIsSpeakingQuestion(true);
    speechManager.speak(
      text,
      isEn ? "en" : "ar",
      undefined,
      () => setIsSpeakingQuestion(false)
    );
  };

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {isEn ? "Interactive Assessment" : "اختبار الفهم التفاعلي (Interactive Quiz)"}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {isEn
              ? `Test your understanding of: ${diagramTitle}`
              : `اختبر معلوماتك حول أجزاء ووظائف: ${diagramTitle}`}
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
          <span>
            {isEn
              ? `Question ${currentIndex + 1} of ${totalQuestions}`
              : `سؤال ${currentIndex + 1} من ${totalQuestions}`}
          </span>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full bg-slate-100 h-1">
        <div
          className="bg-emerald-600 h-1 transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {isCompleted ? (
          /* Completion & Results Screen */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">
                {isEn
                  ? percentage >= 80
                    ? "Well done! Outstanding & mastered performance 🌟"
                    : percentage >= 50
                    ? "Good job! Review a few parts to reinforce your understanding 👍"
                    : "Great learning opportunity! Re-examine the diagram and try again 🌱"
                  : percentage >= 80
                  ? "أحسنت صنعاً! أداء متميز ومتقن 🌟"
                  : percentage >= 50
                  ? "نتيجة جيدة! يمكنك مراجعة بعض الأجزاء لتعزيز فهمك 👍"
                  : "فرصة رائعة للمراجعة! أعد استكشاف الرسم وجرّب ثانية 🌱"}
              </h4>
              <p className="text-xs text-slate-500">
                {isEn
                  ? `You correctly answered ${score} out of ${totalQuestions} questions (${percentage}%)`
                  : `أجبت بشكل صحيح على ${score} من أصل ${totalQuestions} أسئلة (${percentage}%)`}
              </p>
            </div>

            {savedLocally && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isEn
                    ? "Result saved locally on this device"
                    : "تم حفظ نتيجة الاختبار محلياً بنجاح"}
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                id="restart-quiz-btn"
                onClick={handleRestart}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isEn ? "Retake Quiz" : "إعادة الاختبار"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Question View */
          <div className="space-y-5">
            {/* Question Text */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {isEn ? currentQ.questionEn || currentQ.questionAr : currentQ.questionAr}
                </h4>
                {(isEn || languageMode === "both") && (
                  <p
                    className="text-xs text-slate-500 font-sans italic"
                    dir={isEn ? "rtl" : "ltr"}
                  >
                    {isEn ? currentQ.questionAr : currentQ.questionEn}
                  </p>
                )}
              </div>
              <button
                onClick={handleSpeakQuestion}
                className={`p-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                  isSpeakingQuestion
                    ? "bg-emerald-600 border-emerald-500 text-white animate-pulse"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
                title={
                  isSpeakingQuestion
                    ? isEn
                      ? "Stop Audio"
                      : "إيقاف الصوت"
                    : isEn
                    ? "Listen to question"
                    : "استماع للسؤال"
                }
              >
                {isSpeakingQuestion ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.optionsAr.map((optionAr, idx) => {
                const isSelected = selectedAnswers[currentIndex] === idx;
                const isCorrect = idx === currentQ.correctAnswerIndex;
                const hasAnswered = isCurrentAnswered;
                const primaryOption = isEn && currentQ.optionsEn?.[idx] ? currentQ.optionsEn[idx] : optionAr;
                const secondaryOption = isEn ? optionAr : currentQ.optionsEn?.[idx];

                let optionClasses =
                  "border-slate-200 hover:border-emerald-500 hover:bg-slate-50 text-slate-800";

                if (hasAnswered) {
                  if (isCorrect) {
                    optionClasses =
                      "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500";
                  } else if (isSelected && !isCorrect) {
                    optionClasses =
                      "border-rose-400 bg-rose-50 text-rose-950 font-medium";
                  } else {
                    optionClasses = "border-slate-200 opacity-60 text-slate-500";
                  }
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-option-${currentIndex}-${idx}`}
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-xl border ${
                      isEn ? "text-left" : "text-right"
                    } transition-all flex items-center justify-between gap-3 cursor-pointer ${optionClasses}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div>
                        <span className="text-xs font-semibold block">
                          {primaryOption}
                        </span>
                        {(isEn || languageMode === "both") && secondaryOption && (
                          <span
                            className="text-[11px] text-slate-500 font-sans block"
                            dir={isEn ? "rtl" : "ltr"}
                          >
                            {secondaryOption}
                          </span>
                        )}
                      </div>
                    </div>

                    {hasAnswered && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            {isCurrentAnswered && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1 animate-in fade-in">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? "Scientific Explanation:" : "الشرح العلمي للإجابة (Explanation):"}</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {isEn ? currentQ.explanationEn || currentQ.explanationAr : currentQ.explanationAr}
                </p>
                {(isEn || languageMode === "both") && (
                  <p
                    className="text-slate-600 text-[11px] font-sans italic border-t border-emerald-200/50 pt-1 mt-1"
                    dir={isEn ? "rtl" : "ltr"}
                  >
                    {isEn ? currentQ.explanationAr : currentQ.explanationEn}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Bottom */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                {isEn ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>{isEn ? "Previous" : "السابق"}</span>
              </button>

              <div className="flex gap-1">
                {quiz.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${
                      currentIndex === i
                        ? "bg-emerald-600 ring-2 ring-emerald-200"
                        : selectedAnswers[i] !== undefined
                        ? "bg-emerald-300"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>

              <button
                disabled={currentIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>{isEn ? "Next" : "التالي"}</span>
                {isEn ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
