import React from "react";
import {
  X,
  History,
  Trash2,
  Calendar,
  Layers,
  ArrowLeft,
  Download,
  BookOpen,
} from "lucide-react";
import { HistoryItem } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyItems,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-r border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                سجل التحليلات السابقة
              </h3>
              <p className="text-[11px] text-slate-500">
                {historyItems.length} رسومات محفوظة في ذاكرة التطبيق
              </p>
            </div>
          </div>

          <button
            id="close-history-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {historyItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">
                لا توجد رسومات محللة محفوظة بعد
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                عند قيامك برفع أو التقاط أي رسم مدرسي، سيتم حفظه هنا تلقائياً لسرعة الوصول إليه لاحقاً.
              </p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className="group p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 transition-all shadow-2xs hover:shadow-xs flex items-center justify-between gap-3"
              >
                {/* Thumbnail & Info */}
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                >
                  <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.titleAr}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.titleAr}
                    </h4>
                    <p className="text-[11px] font-semibold text-emerald-700 font-sans truncate" dir="ltr">
                      {item.titleEn}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Layers className="w-3 h-3" />
                        {item.partsCount} أجزاء
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition-colors shadow-2xs"
                    title="فتح هذا الرسم"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف من السجل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {historyItems.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح كل السجل</span>
            </button>
            <span className="text-[11px] text-slate-400">
              محفوظ محلياً في متصفحك
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
