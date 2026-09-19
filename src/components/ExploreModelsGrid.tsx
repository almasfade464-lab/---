import React from "react";
import {
  Heart,
  Leaf,
  Globe,
  Activity,
  Cpu,
  Scale,
  Wind,
  ShieldAlert,
  Bot,
  Eye,
  Stethoscope,
} from "lucide-react";
import { DiagramAnalysis, ThemeMode, LanguageMode } from "../types";

interface ExploreModelsGridProps {
  diagrams: DiagramAnalysis[];
  onSelectDiagram: (diagram: DiagramAnalysis) => void;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
}

// Icon and color badge mapping based on category/id
const getCategoryMeta = (diagram: DiagramAnalysis) => {
  const id = diagram.id;
  if (id.includes("heart") || id.includes("cardio")) {
    return {
      icon: Heart,
      bg: "bg-pink-100 text-pink-600",
      tag: "ANATOMY",
    };
  }
  if (id.includes("plant") || id.includes("botany")) {
    return {
      icon: Leaf,
      bg: "bg-emerald-100 text-emerald-600",
      tag: "BOTANY",
    };
  }
  if (id.includes("geo") || id.includes("earth")) {
    return {
      icon: Globe,
      bg: "bg-sky-100 text-sky-600",
      tag: "GEOGRAPHY",
    };
  }
  if (id.includes("digestive")) {
    return {
      icon: Activity,
      bg: "bg-rose-100 text-rose-600",
      tag: "ANATOMY",
    };
  }
  if (id.includes("robot")) {
    return {
      icon: Bot,
      bg: "bg-purple-100 text-purple-600",
      tag: "TECHNOLOGY",
    };
  }
  if (id.includes("law")) {
    return {
      icon: Scale,
      bg: "bg-amber-100 text-amber-600",
      tag: "LAW",
    };
  }
  if (id.includes("lung")) {
    return {
      icon: Wind,
      bg: "bg-teal-100 text-teal-600",
      tag: "HEALTH",
    };
  }
  if (id.includes("liver")) {
    return {
      icon: ShieldAlert,
      bg: "bg-orange-100 text-orange-600",
      tag: "HEALTH",
    };
  }
  if (id.includes("ai")) {
    return {
      icon: Bot,
      bg: "bg-blue-100 text-blue-600",
      tag: "TECHNOLOGY",
    };
  }
  if (id.includes("computer")) {
    return {
      icon: Cpu,
      bg: "bg-indigo-100 text-indigo-600",
      tag: "TECHNOLOGY",
    };
  }
  if (id.includes("eye")) {
    return {
      icon: Eye,
      bg: "bg-cyan-100 text-cyan-600",
      tag: "HEALTH",
    };
  }
  return {
    icon: Stethoscope,
    bg: "bg-blue-100 text-blue-600",
    tag: "HEALTH",
  };
};

export const ExploreModelsGrid: React.FC<ExploreModelsGridProps> = ({
  diagrams,
  onSelectDiagram,
  themeMode = "light",
  languageMode = "ar",
}) => {
  const isDark = themeMode === "dark";
  const isEn = languageMode === "en";

  return (
    <section
      dir={isEn ? "ltr" : "rtl"}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3
          className={`text-base sm:text-xl font-black tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {isEn ? "Explore Educational Diagrams" : "استكشف النماذج التعليمية"}
        </h3>
        <button
          className={`text-xs font-bold transition-colors cursor-pointer ${
            isDark
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-600 hover:text-blue-700"
          }`}
          onClick={() => {}}
        >
          {isEn ? "View All" : "عرض الكل"}
        </button>
      </div>

      {/* Grid: 4 columns on desktop, exactly matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {diagrams.map((diagram) => {
          const meta = getCategoryMeta(diagram);
          const IconComponent = meta.icon;

          return (
            <div
              key={diagram.id}
              id={`model-card-${diagram.id}`}
              onClick={() => onSelectDiagram(diagram)}
              className={`rounded-2xl transition-all overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-1 duration-200 ${
                isDark
                  ? "bg-[#101C33] border border-slate-800/90 shadow-lg hover:border-slate-700 hover:shadow-blue-900/20"
                  : "bg-white border border-slate-100 shadow-xs hover:shadow-md"
              }`}
            >
              {/* Card Image */}
              <div
                className={`relative w-full h-40 overflow-hidden ${
                  isDark ? "bg-[#0B1528]" : "bg-slate-100"
                }`}
              >
                <img
                  src={diagram.imageUrl}
                  alt={isEn ? diagram.titleEn || diagram.titleAr : diagram.titleAr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Floating Center Icon Badge */}
              <div className="relative flex justify-center -mt-4 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs border-2 ${
                    isDark
                      ? "bg-[#14233F] border-[#101C33] text-blue-400 shadow-inner"
                      : `border-white ${meta.bg}`
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 pt-2 text-center space-y-1 flex-1 flex flex-col justify-center">
                <h4
                  className={`text-xs sm:text-sm font-bold line-clamp-1 transition-colors ${
                    isDark
                      ? "text-white group-hover:text-blue-400"
                      : "text-slate-900 group-hover:text-blue-600"
                  }`}
                >
                  {isEn ? diagram.titleEn || diagram.titleAr : diagram.titleAr}
                </h4>
                <p
                  className={`text-[10px] font-bold font-sans tracking-wider uppercase ${
                    isDark ? "text-slate-400" : "text-slate-400"
                  }`}
                  dir="ltr"
                >
                  {meta.tag}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
