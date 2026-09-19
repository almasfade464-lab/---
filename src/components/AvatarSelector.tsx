import React from "react";
import { Check } from "lucide-react";
import { CARTOON_AVATARS, CartoonAvatar } from "../data/avatars";

interface AvatarSelectorProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
  isDark?: boolean;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatarId,
  onSelect,
  isDark = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          اختر الأفاتار الكرتوني المفضل:
        </label>
        <span className="text-[11px] text-blue-500 font-medium">
          {CARTOON_AVATARS.find((a) => a.id === selectedAvatarId)?.nameAr || "اختر شخصيتك"}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-3 rounded-2xl border transition-colors max-h-56 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800">
        {CARTOON_AVATARS.map((avatar: CartoonAvatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all group cursor-pointer border ${
                isSelected
                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30 shadow-sm scale-105"
                  : isDark
                  ? "bg-slate-800/80 border-slate-700/60 hover:bg-slate-700 hover:border-slate-600"
                  : "bg-white border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 shadow-xs"
              }`}
              title={avatar.nameAr}
            >
              <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                {avatar.render(38)}
              </div>
              <span className={`text-[10px] mt-1 font-medium truncate w-full text-center ${
                isSelected ? "text-blue-600 dark:text-blue-400 font-bold" : isDark ? "text-slate-400" : "text-slate-600"
              }`}>
                {avatar.nameAr}
              </span>

              {/* Selected Check Badge */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
