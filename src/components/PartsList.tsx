import React, { useState } from "react";
import { Search, Volume2, Play, Square, Check, Layers } from "lucide-react";
import { DiagramPart, LanguageMode } from "../types";
import { speechManager } from "../utils/speech";

interface PartsListProps {
  parts: DiagramPart[];
  selectedPartId: string | null;
  onSelectPart: (part: DiagramPart) => void;
  languageMode: LanguageMode;
}

export const PartsList: React.FC<PartsListProps> = ({
  parts,
  selectedPartId,
  onSelectPart,
  languageMode,
}) => {
  const isEn = languageMode === "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const isPlayingAllRef = React.useRef(false);

  const filteredParts = parts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.functionAr.toLowerCase().includes(q) ||
      (p.functionEn && p.functionEn.toLowerCase().includes(q))
    );
  });

  const handlePlaySingle = (e: React.MouseEvent, part: DiagramPart) => {
    e.stopPropagation();
    const spokenName = isEn ? part.nameEn || part.nameAr : part.nameAr;
    const spokenFunction = isEn ? part.functionEn || part.functionAr : part.functionAr;
    speechManager.speak(
      `${spokenName} - ${spokenFunction}`,
      isEn ? "en" : "ar"
    );
  };

  const handlePlayAll = () => {
    if (isPlayingAll) {
      isPlayingAllRef.current = false;
      speechManager.stop();
      setIsPlayingAll(false);
      return;
    }

    setIsPlayingAll(true);
    isPlayingAllRef.current = true;
    let index = 0;

    const playNext = () => {
      if (!isPlayingAllRef.current || index >= parts.length) {
        setIsPlayingAll(false);
        isPlayingAllRef.current = false;
        return;
      }
      const p = parts[index];
      onSelectPart(p);
      const spokenName = isEn ? p.nameEn || p.nameAr : p.nameAr;
      const spokenFunction = isEn ? p.functionEn || p.functionAr : p.functionAr;
      const text = `${index + 1}. ${spokenName}: ${spokenFunction}`;
      index++;
      speechManager.speak(
        text,
        isEn ? "en" : "ar",
        undefined,
        () => {
          if (isPlayingAllRef.current && index < parts.length) {
            setTimeout(playNext, 500);
          } else {
            setIsPlayingAll(false);
            isPlayingAllRef.current = false;
          }
        }
      );
    };

    playNext();
  };

  return (
    <div
      dir={isEn ? "ltr" : "rtl"}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            {isEn ? "Parts & Components Index" : "فهرس الأجزاء والمكونات"}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {parts.length}
          </span>
        </div>

        {/* Read all button */}
        <button
          id="play-all-parts-btn"
          onClick={handlePlayAll}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isPlayingAll
              ? "bg-rose-600 text-white"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
          title={isEn ? "Read all parts sequentially" : "قراءة جميع الأجزاء تباعاً"}
        >
          {isPlayingAll ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span>{isEn ? "Stop Audio" : "إيقاف القراءة"}</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>{isEn ? "Read All" : "نطق القائمة"}</span>
            </>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-slate-400 ${
            isEn ? "left-3" : "right-3"
          }`} />
          <input
            id="search-parts-input"
            type="text"
            placeholder={isEn ? "Search part or component..." : "ابحث عن جزء أو عضو..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-1.5 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
              isEn ? "pl-8 pr-3" : "pl-3 pr-8"
            }`}
          />
        </div>
      </div>

      {/* Parts List */}
      <div className="p-3 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-1">
        {filteredParts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            {isEn ? "No matching parts found" : "لا توجد أجزاء مطابقة للبحث"}
          </div>
        ) : (
          filteredParts.map((part, index) => {
            const isSelected = selectedPartId === part.id;
            return (
              <div
                key={part.id}
                id={`part-list-item-${part.id}`}
                onClick={() => onSelectPart(part)}
                className={`pt-2 pb-2 px-2.5 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? "bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 shadow-2xs"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {isEn ? part.nameEn || part.nameAr : part.nameAr}
                    </h4>
                    <p
                      className="text-[11px] font-medium text-emerald-700 leading-tight font-sans"
                      dir={isEn ? "rtl" : "ltr"}
                    >
                      {isEn ? part.nameAr : part.nameEn}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                      {isEn ? part.functionEn || part.functionAr : part.functionAr}
                    </p>
                  </div>
                </div>

                {/* Speak button */}
                <button
                  onClick={(e) => handlePlaySingle(e, part)}
                  className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-white transition-colors shrink-0 cursor-pointer"
                  title={isEn ? "Listen to pronunciation" : "استماع للنطق"}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
