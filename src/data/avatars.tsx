import React from "react";

export interface CartoonAvatar {
  id: string;
  nameAr: string;
  nameEn: string;
  category: "animals" | "space" | "fun";
  color: string;
  render: (size?: number) => React.ReactNode;
}

export const CARTOON_AVATARS: CartoonAvatar[] = [
  {
    id: "cat",
    nameAr: "قطة لطيفة",
    nameEn: "Cute Cat",
    category: "animals",
    color: "#F59E0B",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#FEF3C7" stroke="#FBBF24" strokeWidth="3" />
        {/* Ears */}
        <polygon points="24,35 15,10 40,24" fill="#F59E0B" />
        <polygon points="26,30 20,16 36,25" fill="#FDE68A" />
        <polygon points="76,35 85,10 60,24" fill="#F59E0B" />
        <polygon points="74,30 80,16 64,25" fill="#FDE68A" />
        {/* Head */}
        <circle cx="50" cy="54" r="32" fill="#F59E0B" />
        {/* Cheeks */}
        <ellipse cx="36" cy="62" rx="4" ry="2.5" fill="#F43F5E" opacity="0.6" />
        <ellipse cx="64" cy="62" rx="4" ry="2.5" fill="#F43F5E" opacity="0.6" />
        {/* Eyes */}
        <circle cx="38" cy="50" r="5" fill="#1E293B" />
        <circle cx="40" cy="48" r="1.8" fill="#FFFFFF" />
        <circle cx="62" cy="50" r="5" fill="#1E293B" />
        <circle cx="64" cy="48" r="1.8" fill="#FFFFFF" />
        {/* Nose & Mouth */}
        <polygon points="50,56 46,53 54,53" fill="#FB7185" />
        <path d="M46 60 Q50 64 54 60" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Whiskers */}
        <line x1="22" y1="56" x2="34" y2="58" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="62" x2="34" y2="62" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <line x1="66" y1="58" x2="78" y2="56" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <line x1="66" y1="62" x2="78" y2="62" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "dog",
    nameAr: "كلب لطيف",
    nameEn: "Cute Dog",
    category: "animals",
    color: "#D97706",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#FFEDD5" stroke="#FDBA74" strokeWidth="3" />
        {/* Floppy Ears */}
        <path d="M22 32 C12 36 10 58 18 64 C24 70 28 54 26 38 Z" fill="#9A3412" />
        <path d="M78 32 C88 36 90 58 82 64 C76 70 72 54 74 38 Z" fill="#9A3412" />
        {/* Face */}
        <ellipse cx="50" cy="52" rx="30" ry="28" fill="#EA580C" />
        <ellipse cx="50" cy="62" rx="18" ry="14" fill="#FFEDD5" />
        {/* Eyes */}
        <circle cx="39" cy="48" r="4.5" fill="#1E293B" />
        <circle cx="40.5" cy="46.5" r="1.5" fill="#FFFFFF" />
        <circle cx="61" cy="48" r="4.5" fill="#1E293B" />
        <circle cx="62.5" cy="46.5" r="1.5" fill="#FFFFFF" />
        {/* Cute Nose */}
        <ellipse cx="50" cy="59" rx="6" ry="4.5" fill="#1E293B" />
        {/* Tongue */}
        <path d="M48 66 Q50 72 52 66" fill="#F43F5E" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="34" cy="58" rx="3.5" ry="2" fill="#FB7185" opacity="0.6" />
        <ellipse cx="66" cy="58" rx="3.5" ry="2" fill="#FB7185" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "panda",
    nameAr: "باندا مرحة",
    nameEn: "Playful Panda",
    category: "animals",
    color: "#0F172A",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="3" />
        {/* Ears */}
        <circle cx="26" cy="28" r="13" fill="#1E293B" />
        <circle cx="74" cy="28" r="13" fill="#1E293B" />
        {/* Face */}
        <circle cx="50" cy="54" r="32" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        {/* Eye Patches */}
        <ellipse cx="36" cy="50" rx="8" ry="11" transform="rotate(-15 36 50)" fill="#1E293B" />
        <ellipse cx="64" cy="50" rx="8" ry="11" transform="rotate(15 64 50)" fill="#1E293B" />
        {/* Eyes */}
        <circle cx="36" cy="49" r="3" fill="#FFFFFF" />
        <circle cx="64" cy="49" r="3" fill="#FFFFFF" />
        <circle cx="36.5" cy="49" r="1.5" fill="#0F172A" />
        <circle cx="64.5" cy="49" r="1.5" fill="#0F172A" />
        {/* Nose & Mouth */}
        <ellipse cx="50" cy="62" rx="4.5" ry="3" fill="#1E293B" />
        <path d="M47 67 Q50 70 53 67" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Blush */}
        <circle cx="28" cy="62" r="4" fill="#FDA4AF" opacity="0.7" />
        <circle cx="72" cy="62" r="4" fill="#FDA4AF" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: "rabbit",
    nameAr: "أرنب لطيف",
    nameEn: "Cute Bunny",
    category: "animals",
    color: "#EC4899",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="3" />
        {/* Long Bunny Ears */}
        <path d="M34 40 C30 18 36 6 42 12 C48 18 42 36 38 42 Z" fill="#F472B6" />
        <path d="M36 36 C33 22 37 12 40 16 C43 20 40 32 38 36 Z" fill="#FCE7F3" />
        <path d="M66 40 C70 18 64 6 58 12 C52 18 58 36 62 42 Z" fill="#F472B6" />
        <path d="M64 36 C67 22 63 12 60 16 C57 20 60 32 62 36 Z" fill="#FCE7F3" />
        {/* Head */}
        <circle cx="50" cy="58" r="28" fill="#F472B6" />
        {/* Eyes */}
        <circle cx="40" cy="54" r="4.5" fill="#1E293B" />
        <circle cx="41.5" cy="52.5" r="1.5" fill="#FFFFFF" />
        <circle cx="60" cy="54" r="4.5" fill="#1E293B" />
        <circle cx="61.5" cy="52.5" r="1.5" fill="#FFFFFF" />
        {/* Nose & Smile */}
        <polygon points="50,62 47,59 53,59" fill="#FCE7F3" />
        <path d="M46 66 Q50 69 54 66" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <ellipse cx="33" cy="63" rx="4.5" ry="3" fill="#BE185D" opacity="0.4" />
        <ellipse cx="67" cy="63" rx="4.5" ry="3" fill="#BE185D" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "fox",
    nameAr: "ثعلب ذكي",
    nameEn: "Clever Fox",
    category: "animals",
    color: "#EA580C",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="3" />
        {/* Big Ears */}
        <polygon points="26,38 12,12 42,26" fill="#EA580C" />
        <polygon points="27,33 19,18 36,26" fill="#1E293B" />
        <polygon points="74,38 88,12 58,26" fill="#EA580C" />
        <polygon points="73,33 81,18 64,26" fill="#1E293B" />
        {/* Head */}
        <polygon points="50,78 18,44 82,44" fill="#EA580C" />
        {/* White Cheeks */}
        <polygon points="50,78 22,46 38,58" fill="#FFFFFF" />
        <polygon points="50,78 78,46 62,58" fill="#FFFFFF" />
        {/* Nose */}
        <circle cx="50" cy="74" r="4" fill="#1E293B" />
        {/* Eyes */}
        <path d="M34 50 Q39 46 44 50" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M56 50 Q61 46 66 50" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "bear",
    nameAr: "دب ودود",
    nameEn: "Friendly Bear",
    category: "animals",
    color: "#78350F",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="3" />
        {/* Round Ears */}
        <circle cx="28" cy="30" r="12" fill="#92400E" />
        <circle cx="28" cy="30" r="6" fill="#FDE68A" />
        <circle cx="72" cy="30" r="12" fill="#92400E" />
        <circle cx="72" cy="30" r="6" fill="#FDE68A" />
        {/* Head */}
        <circle cx="50" cy="54" r="30" fill="#B45309" />
        {/* Snout */}
        <ellipse cx="50" cy="62" rx="15" ry="11" fill="#FDE68A" />
        {/* Nose */}
        <polygon points="50,60 45,56 55,56" fill="#451A03" />
        <path d="M47 65 Q50 68 53 65" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Eyes */}
        <circle cx="39" cy="48" r="4" fill="#1E293B" />
        <circle cx="40.5" cy="46.5" r="1.3" fill="#FFFFFF" />
        <circle cx="61" cy="48" r="4" fill="#1E293B" />
        <circle cx="62.5" cy="46.5" r="1.3" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "penguin",
    nameAr: "بطريق شجاع",
    nameEn: "Brave Penguin",
    category: "animals",
    color: "#0284C7",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="3" />
        {/* Body */}
        <ellipse cx="50" cy="54" rx="28" ry="32" fill="#0F172A" />
        {/* White Belly */}
        <ellipse cx="50" cy="56" rx="19" ry="25" fill="#FFFFFF" />
        {/* Eyes */}
        <circle cx="41" cy="44" r="4.5" fill="#0F172A" />
        <circle cx="42.5" cy="42.5" r="1.5" fill="#FFFFFF" />
        <circle cx="59" cy="44" r="4.5" fill="#0F172A" />
        <circle cx="60.5" cy="42.5" r="1.5" fill="#FFFFFF" />
        {/* Cute Beak */}
        <polygon points="50,56 42,49 58,49" fill="#F59E0B" />
        {/* Blush */}
        <circle cx="33" cy="52" r="3.5" fill="#F43F5E" opacity="0.5" />
        <circle cx="67" cy="52" r="3.5" fill="#F43F5E" opacity="0.5" />
        {/* Scarf */}
        <rect x="36" y="66" width="28" height="6" rx="3" fill="#EF4444" />
      </svg>
    ),
  },
  {
    id: "robot",
    nameAr: "روبوت ذكي",
    nameEn: "Smart Robot",
    category: "fun",
    color: "#6366F1",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="3" />
        {/* Antenna */}
        <line x1="50" y1="24" x2="50" y2="12" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="11" r="5" fill="#F43F5E" />
        {/* Ears */}
        <rect x="18" y="44" width="6" height="14" rx="3" fill="#4F46E5" />
        <rect x="76" y="44" width="6" height="14" rx="3" fill="#4F46E5" />
        {/* Head */}
        <rect x="24" y="26" width="52" height="48" rx="14" fill="#6366F1" />
        {/* Screen/Face */}
        <rect x="30" y="34" width="40" height="32" rx="8" fill="#1E1B4B" />
        {/* Glowing Eyes */}
        <circle cx="40" cy="47" r="5" fill="#22D3EE" />
        <circle cx="41.5" cy="45.5" r="1.8" fill="#FFFFFF" />
        <circle cx="60" cy="47" r="5" fill="#22D3EE" />
        <circle cx="61.5" cy="45.5" r="1.8" fill="#FFFFFF" />
        {/* Smile Meter */}
        <path d="M42 56 Q50 62 58 56" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "star",
    nameAr: "نجمة لامعة",
    nameEn: "Bright Star",
    category: "space",
    color: "#EAB308",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#FEF9C3" stroke="#FDE047" strokeWidth="3" />
        {/* 5-pointed chubby star */}
        <path
          d="M50 14 L58 34 L80 36 L63 50 L68 72 L50 60 L32 72 L37 50 L20 36 L42 34 Z"
          fill="#FACC15"
          stroke="#EAB308"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Eyes */}
        <circle cx="44" cy="44" r="3.5" fill="#713F12" />
        <circle cx="45" cy="43" r="1.2" fill="#FFFFFF" />
        <circle cx="56" cy="44" r="3.5" fill="#713F12" />
        <circle cx="57" cy="43" r="1.2" fill="#FFFFFF" />
        {/* Smile */}
        <path d="M46 51 Q50 56 54 51" stroke="#713F12" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Cheeks */}
        <circle cx="39" cy="48" r="2.5" fill="#FB7185" />
        <circle cx="61" cy="48" r="2.5" fill="#FB7185" />
      </svg>
    ),
  },
  {
    id: "planet",
    nameAr: "كوكب ملون",
    nameEn: "Colorful Planet",
    category: "space",
    color: "#8B5CF6",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="3" />
        {/* Saturn-like Ring behind */}
        <ellipse cx="50" cy="50" rx="42" ry="12" transform="rotate(-22 50 50)" stroke="#C084FC" strokeWidth="6" opacity="0.4" fill="none" />
        {/* Planet Sphere */}
        <circle cx="50" cy="50" r="26" fill="#8B5CF6" />
        {/* Surface patterns */}
        <path d="M28 44 Q50 48 72 44" stroke="#A78BFA" strokeWidth="3" fill="none" />
        <path d="M30 56 Q50 60 70 56" stroke="#7C3AED" strokeWidth="3" fill="none" />
        {/* Ring front */}
        <path d="M12 62 Q50 36 88 38" stroke="#E9D5FF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Face */}
        <circle cx="44" cy="48" r="3" fill="#FFFFFF" />
        <circle cx="56" cy="48" r="3" fill="#FFFFFF" />
        <path d="M47 54 Q50 58 53 54" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "owl",
    nameAr: "بومة الحكمة",
    nameEn: "Wise Owl",
    category: "animals",
    color: "#059669",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="3" />
        {/* Ear tufts */}
        <polygon points="30,34 22,14 42,26" fill="#047857" />
        <polygon points="70,34 78,14 58,26" fill="#047857" />
        {/* Body */}
        <ellipse cx="50" cy="56" rx="27" ry="30" fill="#10B981" />
        {/* Belly */}
        <ellipse cx="50" cy="62" rx="16" ry="18" fill="#D1FAE5" />
        {/* Glasses / Big Eyes */}
        <circle cx="38" cy="46" r="11" fill="#FFFFFF" stroke="#065F46" strokeWidth="2.5" />
        <circle cx="62" cy="46" r="11" fill="#FFFFFF" stroke="#065F46" strokeWidth="2.5" />
        <line x1="49" y1="46" x2="51" y2="46" stroke="#065F46" strokeWidth="3" />
        <circle cx="39" cy="46" r="4.5" fill="#1E293B" />
        <circle cx="41" cy="44" r="1.5" fill="#FFFFFF" />
        <circle cx="61" cy="46" r="4.5" fill="#1E293B" />
        <circle cx="63" cy="44" r="1.5" fill="#FFFFFF" />
        {/* Beak */}
        <polygon points="50,56 46,50 54,50" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    id: "smile",
    nameAr: "شخصية مبتسمة",
    nameEn: "Happy Smile",
    category: "fun",
    color: "#3B82F6",
    render: (size = 48) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="3" />
        {/* Big Happy Circle */}
        <circle cx="50" cy="50" r="34" fill="#3B82F6" />
        {/* Sparkle Hat/Crown */}
        <polygon points="50,14 43,26 57,26" fill="#F59E0B" />
        {/* Eyes (Smiling Arches) */}
        <path d="M37 44 Q43 38 47 44" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M53 44 Q57 38 63 44" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Big Grin */}
        <path d="M38 54 Q50 72 62 54" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="#1E3A8A" />
        {/* Rosy Cheeks */}
        <circle cx="32" cy="53" r="4" fill="#F472B6" />
        <circle cx="68" cy="53" r="4" fill="#F472B6" />
      </svg>
    ),
  },
];

export function getAvatarById(id?: string): CartoonAvatar {
  const found = CARTOON_AVATARS.find((a) => a.id === id);
  return found || CARTOON_AVATARS[0];
}
