import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  Loader2,
  HelpCircle,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
  BrainCircuit,
  Bookmark,
  Check,
} from "lucide-react";
import { ChatMessage, DiagramAnalysis, DiagramPart, LanguageMode } from "../types";
import { speechManager } from "../utils/speech";
import { getUserScopedChats, saveUserScopedChats } from "../utils/authStorage";
import { saveAiResponseAsNote } from "../utils/notesFirestore";
import { getApiUrl } from "../utils/apiConfig";

interface AiTutorChatProps {
  diagram: DiagramAnalysis;
  currentPart: DiagramPart | null;
  userId?: string;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  onOpenNotes?: (noteId?: string) => void;
  languageMode?: LanguageMode;
}

export const AiTutorChat: React.FC<AiTutorChatProps> = ({
  diagram,
  currentPart,
  userId,
  initialPrompt,
  onClearInitialPrompt,
  onOpenNotes,
  languageMode = "ar",
}) => {
  const isEn = languageMode === "en";

  const getInitialWelcomeText = () => {
    if (isEn) {
      return `Welcome! I am your "EduGraphic AI Tutor". Ask me any specific question about (${diagram.titleEn || diagram.titleAr}) or any of its parts, and I will provide you with a direct, scientifically accurate answer focused exactly on your inquiry without fluff.`;
    }
    return `أهلاً بك! أنا "المعلم الذكي لإديو-جرافيك". اطرح أي سؤال مباشر ومحدد حول رسم (${diagram.titleAr}) أو أي من أجزائه، وسأجيبك فوراً بدقة علمية ومباشرة على نفس سؤالك دون حشو أو تشتيت.`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (userId) {
      const saved = getUserScopedChats(userId, diagram.id);
      if (saved && saved.length > 0) return saved;
    }
    return [
      {
        id: "welcome-msg",
        role: "assistant",
        text: getInitialWelcomeText(),
        timestamp: new Date().toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];
  });

  // Reload user-scoped messages when diagram or user changes
  useEffect(() => {
    if (userId) {
      const saved = getUserScopedChats(userId, diagram.id);
      if (saved && saved.length > 0) {
        setMessages(saved);
        return;
      }
    }
    setMessages([
      {
        id: "welcome-msg-" + Date.now(),
        role: "assistant",
        text: getInitialWelcomeText(),
        timestamp: new Date().toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, [diagram.id, userId]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [savedMsgIds, setSavedMsgIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSaveMessageToNotes = async (msgId: string, text: string) => {
    try {
      await saveAiResponseAsNote(text, userId || "guest", {
        title: `${isEn ? "AI Tutor" : "المعلم الذكي"}: ${diagram.titleAr || diagram.titleEn}`,
        question: currentPart ? currentPart.nameAr : diagram.titleAr,
        category: "📚 الدراسة",
        attachedImageUrl: diagram.imageUrl,
        source: "ai_chat",
      });
      setSavedMsgIds((prev) => ({ ...prev, [msgId]: true }));
      setTimeout(() => {
        setSavedMsgIds((prev) => ({ ...prev, [msgId]: false }));
      }, 3500);
    } catch (e) {
      console.error("Failed to save note:", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external initial prompt if requested (e.g. from PartDetailsCard)
  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const sendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text: cleanText,
      timestamp: new Date().toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      relatedPartId: currentPart?.id,
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      if (userId) {
        saveUserScopedChats(userId, diagram.id, updated);
      }
      return updated;
    });
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/diagram-chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanText,
          languageMode,
          diagramSummary: {
            title: isEn ? diagram.titleEn : diagram.titleAr,
            titleEn: diagram.titleEn,
            titleAr: diagram.titleAr,
            subject: isEn ? diagram.subjectEn : diagram.subjectAr,
            summary: isEn ? diagram.summaryEn : diagram.summaryAr,
            parts: diagram.parts.map((p) => ({
              name: p.nameAr,
              nameEn: p.nameEn,
              function: isEn ? p.functionEn : p.functionAr,
            })),
          },
          currentPart: currentPart
            ? {
                name: currentPart.nameAr,
                nameEn: currentPart.nameEn,
                function: isEn ? currentPart.functionEn : currentPart.functionAr,
                description: isEn ? currentPart.descriptionEn : currentPart.descriptionAr,
              }
            : null,
          history: messages.slice(-5),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI tutor");
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        text:
          data.reply ||
          (isEn
            ? "Sorry, an issue occurred while preparing the response."
            : "عذراً، حدث خطأ أثناء إعداد الرد."),
        timestamp: new Date().toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => {
        const updated = [...prev, aiMsg];
        if (userId) {
          saveUserScopedChats(userId, diagram.id, updated);
        }
        return updated;
      });
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        text: isEn
          ? "Unable to reach the AI Tutor right now. Please check connection and try again."
          : "تعذر الاتصال بالمعلم الذكي حالياً. يرجى التحقق من الاتصال وإعادة المحاولة.",
        timestamp: new Date().toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => {
        const updated = [...prev, errorMsg];
        if (userId) {
          saveUserScopedChats(userId, diagram.id, updated);
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      speechManager.stop();
      setSpeakingMessageId(null);
      return;
    }
    setSpeakingMessageId(msgId);
    speechManager.speak(text, isEn ? "en" : "ar", undefined, () => {
      setSpeakingMessageId(null);
    });
  };

  const quickQuestions = isEn
    ? diagram.suggestedQuestionsEn || [
        "Why is this diagram important in our curriculum?",
        "How do these parts coordinate with each other?",
        "Summarize this diagram into 3 easy study points.",
      ]
    : diagram.suggestedQuestionsAr || [
        "ما أهمية هذا الرسم في المقرر الدراسي؟",
        "كيف تعمل هذه الأجزاء معاً بتناغم؟",
        "لخّص لي هذا الرسم في 3 نقاط سهلة للحفظ.",
      ];

  const handleResetChat = () => {
    const freshMessages: ChatMessage[] = [
      {
        id: "welcome-msg-" + Date.now(),
        role: "assistant",
        text: getInitialWelcomeText(),
        timestamp: new Date().toLocaleTimeString(isEn ? "en-US" : "ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];
    setMessages(freshMessages);
    if (userId) {
      saveUserScopedChats(userId, diagram.id, freshMessages);
    }
  };

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{isEn ? "EduGraphic AI Tutor" : "المعلم الذكي لإديو-جرافيك"}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded font-normal flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>{isEn ? "Private" : "خاص بحسابك"}</span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {currentPart
                ? isEn
                  ? `Current Focus: ${currentPart.nameEn}`
                  : `التركيز الحالي: ${currentPart.nameAr}`
                : isEn
                ? `Diagram: ${diagram.titleEn || diagram.titleAr}`
                : `مخطط: ${diagram.titleAr}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetChat}
            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
            title={isEn ? "Start New Chat (Clears this diagram's chat)" : "بدء محادثة جديدة (مسح محادثة هذا المخطط)"}
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
          <span
            className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300/60 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs"
            title={isEn ? "Strict First-Principles Scientific Reasoning & Verification" : "استدلال علمي فائق الدقة مبني على الفهم والمراجعة"}
          >
            <BrainCircuit className="w-3 h-3 text-emerald-700" />
            <span>{isEn ? "Ultra-Reasoning" : "استدلال فائق"}</span>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
        {messages.map((msg) => {
          const isAi = msg.role === "assistant";
          const isSpeakingThis = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isAi ? "justify-start" : "justify-end flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-2xs ${
                  isAi
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isAi
                    ? "bg-white border border-slate-200 text-slate-800 shadow-2xs"
                    : "bg-emerald-600 text-white font-medium"
                }`}
              >
                {isAi ? (
                  <div className="markdown-body space-y-2 text-slate-800">
                    <Markdown
                      components={{
                        h1: ({ children }) => (
                          <h4 className="font-bold text-emerald-800 text-xs sm:text-sm mt-2 mb-1 border-b border-emerald-100 pb-0.5">
                            {children}
                          </h4>
                        ),
                        h2: ({ children }) => (
                          <h5 className="font-bold text-emerald-800 text-xs mt-1.5 mb-1">
                            {children}
                          </h5>
                        ),
                        h3: ({ children }) => (
                          <h6 className="font-semibold text-slate-900 text-xs mt-1 mb-0.5">
                            {children}
                          </h6>
                        ),
                        p: ({ children }) => (
                          <p className="leading-relaxed mb-1.5 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 my-1.5 ps-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-1 my-1.5 ps-1 font-medium">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        code: ({ children }) => (
                          <code className="px-1.5 py-0.5 rounded bg-slate-100 text-emerald-700 font-mono text-[11px]">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto my-2">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-s-3 border-emerald-500 bg-emerald-50/70 p-2 rounded-e text-emerald-900 text-[11px] my-1.5 font-medium">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-line">{msg.text}</p>
                )}

                {/* Footer time, save to notes, and speech */}
                <div
                  className={`mt-1.5 pt-1 flex items-center justify-between text-[10px] ${
                    isAi
                      ? "border-t border-slate-100 text-slate-400"
                      : "text-emerald-100/80"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isAi && (
                    <div className="flex items-center gap-1">
                      {/* Save to Notes Button */}
                      <button
                        onClick={() => handleSaveMessageToNotes(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                          savedMsgIds[msg.id]
                            ? "bg-emerald-50 text-emerald-700 font-bold"
                            : "hover:bg-slate-100 text-slate-500 hover:text-indigo-600"
                        }`}
                        title={
                          savedMsgIds[msg.id]
                            ? isEn
                              ? "Saved to Notes!"
                              : "تم الحفظ في ملاحظاتي!"
                            : isEn
                            ? "Save to My Notes"
                            : "حفظ الشرح في ملاحظاتي"
                        }
                      >
                        {savedMsgIds[msg.id] ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-[10px] text-emerald-600 font-bold">
                              {isEn ? "Saved" : "تم الحفظ ✓"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] hidden sm:inline">
                              {isEn ? "Save" : "حفظ"}
                            </span>
                          </>
                        )}
                      </button>

                      {/* TTS Audio button */}
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                        title={
                          isSpeakingThis
                            ? isEn
                              ? "Stop Audio"
                              : "إيقاف الصوت"
                            : isEn
                            ? "Listen to explanation"
                            : "استماع للشرح"
                        }
                      >
                        {isSpeakingThis ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 bg-white rounded-xl border border-slate-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>
              {isEn
                ? "AI Tutor is formulating your explanation..."
                : "المعلم الذكي يقوم بكتابة الشرح..."}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length < 5 && !isLoading && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-slate-400 shrink-0">
            {isEn ? "Suggested questions:" : "أسئلة مقترحة:"}
          </span>
          {quickQuestions.slice(0, 2).map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 text-[11px] transition-colors shadow-2xs cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(inputText);
        }}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          id="chat-user-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentPart
              ? isEn
                ? `Ask about ${currentPart.nameEn}...`
                : `اسأل عن ${currentPart.nameAr}...`
              : isEn
              ? "Type your question to the AI Tutor here..."
              : "اكتب سؤالك هنا للمعلم الذكي..."
          }
          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <button
          id="send-chat-msg-btn"
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors shadow-xs cursor-pointer"
          title={isEn ? "Send" : "إرسال"}
        >
          <Send className={`w-4 h-4 ${isEn ? "" : "rotate-180"}`} />
        </button>
      </form>
    </div>
  );
};
