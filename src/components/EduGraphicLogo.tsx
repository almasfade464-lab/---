import React from "react";

interface EduGraphicLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  variant?: "vector" | "image";
  showText?: boolean;
  schoolName?: boolean;
  isDark?: boolean;
}

export const EduGraphicLogo: React.FC<EduGraphicLogoProps> = ({
  className = "",
  size = "md",
  variant = "vector",
  showText = false,
  schoolName = false,
  isDark = false,
}) => {
  // Dimension mapping
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
    hero: "w-28 h-28 sm:w-36 sm:h-36",
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;

  if (variant === "image") {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <img
          src="/logo.png"
          alt="شعار إديو-جرافيك المعتمد"
          className={`${currentSizeClass} object-contain rounded-2xl shadow-sm`}
          referrerPolicy="no-referrer"
        />
        {showText && (
          <div className="flex flex-col text-right">
            <span
              className={`font-black tracking-tight text-base sm:text-lg ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              إديو-جرافيك
            </span>
            {schoolName && (
              <span
                className={`text-[11px] font-medium leading-tight ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                منصة الرسوم التعليمية التفاعلية
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Pure SVG Vector rendering of the exact approved logo
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSizeClass} shrink-0 select-none`}
        aria-label="شعار إديو-جرافيك المعتمد"
      >
        <defs>
          {/* Subtle Glow Filter */}
          <filter id="eduGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. Base Open Book (Vibrant Electric Blue #0066FF / #0070F3) */}
        <g id="open-book">
          {/* Spine Bottom Curve */}
          <path
            d="M 224,438 C 224,456 276,456 276,438 Z"
            fill="#0066FF"
          />

          {/* Left Under-Page Layer (Darker/Outline ribbon) */}
          <path
            d="M 238,426 C 170,412 110,422 66,424 L 74,402 C 120,400 180,392 238,406 Z"
            fill="#0066FF"
          />

          {/* Left Main Page (Thick curved open page) */}
          <path
            d="M 242,416 C 175,398 120,380 92,328 C 96,334 104,364 88,390 C 130,388 185,385 242,408 Z"
            fill="#0066FF"
          />
          <path
            d="M 242,414 C 180,394 130,382 92,328 L 102,328 C 136,376 186,386 242,406 Z"
            fill="#007DFE"
          />

          {/* Right Under-Page Layer */}
          <path
            d="M 262,426 C 330,412 390,422 434,424 L 426,402 C 380,400 320,392 262,406 Z"
            fill="#0066FF"
          />

          {/* Right Main Page */}
          <path
            d="M 258,416 C 325,398 380,380 408,328 C 404,334 396,364 412,390 C 370,388 315,385 258,408 Z"
            fill="#0066FF"
          />
          <path
            d="M 258,414 C 320,394 370,382 408,328 L 398,328 C 364,376 314,386 258,406 Z"
            fill="#007DFE"
          />

          {/* Center Book Crease / Page fold */}
          <path
            d="M 246,420 C 248,395 250,380 250,370 C 250,380 252,395 254,420 Z"
            fill="#0052CC"
          />
        </g>

        {/* 2. Neural Circuit Trunk & Brain Hemispheres */}
        <g id="neural-circuits" strokeLinecap="round" strokeLinejoin="round">
          {/* Main vertical green circuit stem rising from book center */}
          <path
            d="M 250,385 L 250,285 M 250,195 L 250,132"
            stroke="#00C853"
            strokeWidth="7"
          />

          {/* Center Purple 4-Point Star (Sparkle) */}
          <path
            d="M 250,198 Q 250,240 286,240 Q 250,240 250,282 Q 250,240 214,240 Q 250,240 250,198 Z"
            fill="#8B2EEB"
          />

          {/* --- LEFT HEMISPHERE (Blue Circuit & Lobe) --- */}
          {/* Brain Outer Sulci/Lobe curves */}
          <path
            d="M 215,96 C 175,75 130,105 142,150 C 105,158 92,205 125,238 C 112,275 140,320 185,324"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />

          {/* Circuit traces in left brain */}
          <path
            d="M 234,395 C 220,380 210,360 210,340 L 165,340 L 165,310"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="165" cy="308" r="6" fill="#0066FF" />

          {/* Lower left trace branching towards bottom book page */}
          <path
            d="M 222,370 L 180,370 L 155,395"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="155" cy="395" r="6" fill="#0066FF" />

          {/* Middle left circuit */}
          <path
            d="M 214,260 L 165,260 L 165,210 L 195,210"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="195" cy="210" r="6" fill="#0066FF" />

          {/* Upper left circuit */}
          <path
            d="M 205,160 L 180,160 L 180,135 L 210,135"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="210" cy="135" r="6" fill="#0066FF" />

          {/* Top interior node */}
          <path
            d="M 226,118 L 226,145"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="226" cy="147" r="6" fill="#0066FF" />

          {/* Green stem to left badge */}
          <path
            d="M 165,260 C 150,265 140,265 132,265"
            stroke="#00C853"
            strokeWidth="7"
            fill="none"
          />

          {/* --- RIGHT HEMISPHERE (Blue Circuit & Lobe) --- */}
          {/* Brain Outer Sulci/Lobe curves */}
          <path
            d="M 285,96 C 325,75 370,105 358,150 C 395,158 408,205 375,238 C 388,275 360,320 315,324"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />

          {/* Circuit traces in right brain */}
          <path
            d="M 266,395 C 280,380 290,360 290,340 L 335,340 L 335,310"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="335" cy="308" r="6" fill="#0066FF" />

          {/* Lower right trace */}
          <path
            d="M 278,370 L 320,370 L 345,395"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="345" cy="395" r="6" fill="#0066FF" />

          {/* Middle right circuit */}
          <path
            d="M 286,260 L 335,260 L 335,210 L 305,210"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="305" cy="210" r="6" fill="#0066FF" />

          {/* Upper right circuit */}
          <path
            d="M 295,160 L 320,160 L 320,135 L 290,135"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="290" cy="135" r="6" fill="#0066FF" />

          {/* Top right interior node */}
          <path
            d="M 274,118 L 274,145"
            stroke="#0066FF"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="274" cy="147" r="6" fill="#0066FF" />

          {/* Green stem to right badge */}
          <path
            d="M 335,260 C 350,265 360,265 368,265"
            stroke="#00C853"
            strokeWidth="7"
            fill="none"
          />
        </g>

        {/* 3. The Three Circular Infographic Badges */}

        {/* --- BADGE 1: TOP (Pie Chart) --- */}
        <g id="badge-top">
          {/* Badge Outer Ring */}
          <circle
            cx="250"
            cy="92"
            r="42"
            stroke="#00C853"
            strokeWidth="8"
            fill={isDark ? "#101C33" : "#FFFFFF"}
          />
          {/* Inner Pie: Green 3/4 circle */}
          <circle cx="250" cy="92" r="26" fill="#00C853" />
          {/* Pie Slice: Purple Quadrant (12 o'clock to 3 o'clock) */}
          <path
            d="M 250,92 L 250,66 A 26,26 0 0,1 276,92 Z"
            fill="#8B2EEB"
          />
        </g>

        {/* --- BADGE 2: LEFT (Bar Chart) --- */}
        <g id="badge-left">
          {/* Badge Outer Ring */}
          <circle
            cx="96"
            cy="252"
            r="42"
            stroke="#00C853"
            strokeWidth="8"
            fill={isDark ? "#101C33" : "#FFFFFF"}
          />
          {/* 3 Vertical Bars */}
          {/* Bar 1 (Short Purple) */}
          <rect
            x="74"
            y="254"
            width="10"
            height="18"
            rx="3"
            fill="#8B2EEB"
          />
          {/* Bar 2 (Medium Purple) */}
          <rect
            x="91"
            y="238"
            width="10"
            height="34"
            rx="3"
            fill="#8B2EEB"
          />
          {/* Bar 3 (Tall Green) */}
          <rect
            x="108"
            y="228"
            width="10"
            height="44"
            rx="3"
            fill="#00C853"
          />
        </g>

        {/* --- BADGE 3: RIGHT (Checklist / Data Items) --- */}
        <g id="badge-right">
          {/* Badge Outer Ring */}
          <circle
            cx="404"
            cy="252"
            r="42"
            stroke="#00C853"
            strokeWidth="8"
            fill={isDark ? "#101C33" : "#FFFFFF"}
          />
          {/* Item 1 (Top: Green) */}
          <circle cx="388" cy="238" r="4.5" fill="#00C853" />
          <line
            x1="399"
            y1="238"
            x2="424"
            y2="238"
            stroke="#0066FF"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Item 2 (Middle: Green) */}
          <circle cx="388" cy="252" r="4.5" fill="#00C853" />
          <line
            x1="399"
            y1="252"
            x2="424"
            y2="252"
            stroke="#00C853"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Item 3 (Bottom: Purple) */}
          <circle cx="388" cy="266" r="4.5" fill="#8B2EEB" />
          <line
            x1="399"
            y1="266"
            x2="424"
            y2="266"
            stroke="#8B2EEB"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col text-right">
          <span
            className={`font-black tracking-tight text-base sm:text-lg ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            إديو-جرافيك
          </span>
          {schoolName && (
            <span
              className={`text-[11px] font-medium leading-tight ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              منصة الرسوم التعليمية التفاعلية
            </span>
          )}
        </div>
      )}
    </div>
  );
};
