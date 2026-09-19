import {
  DiagramAnalysis,
  AdaptiveExplanationData,
  AdaptiveExplanationMode,
  MultiLevelStage,
  ComparisonPair,
  SystemDecompositionLayer,
} from "../types";

export interface ModeMeta {
  mode: AdaptiveExplanationMode;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  iconName: string;
  badgeColor: string;
  pedagogicalBenefitAr: string;
  pedagogicalBenefitEn: string;
}

export const ADAPTIVE_MODES_META: Record<AdaptiveExplanationMode, ModeMeta> = {
  "whole-to-part": {
    mode: "whole-to-part",
    nameAr: "التدرج من الكل إلى الجزء",
    nameEn: "Whole-to-Part Progression",
    taglineAr: "فهم البنية الكلية أولاً ثم التعمق في الأجهزة والتفاصيل",
    taglineEn: "Master the global system first, then zoom into components & cellular details",
    iconName: "Maximize2",
    badgeColor: "from-blue-600 to-indigo-600",
    pedagogicalBenefitAr: "يمنح الطالب إطاراً معرفياً شمولياً يمنع التشتت ويسهل ربط كل تفصيل دقيق بهدفه العام في الكائن أو النظام.",
    pedagogicalBenefitEn: "Builds a mental macro-framework preventing cognitive overload when inspecting micro-level functions.",
  },
  "timeline": {
    mode: "timeline",
    nameAr: "تسلسل زمني ومراحل",
    nameEn: "Chronological Sequence",
    taglineAr: "تتبع خطوة بخطوة وفق الترتيب الزمني والحدثي",
    taglineEn: "Follow phase-by-phase chronological triggers and stage-based transitions",
    iconName: "Clock",
    badgeColor: "from-amber-500 to-orange-600",
    pedagogicalBenefitAr: "يرسخ الذاكرة المتسلسلة لخطوات الدورات البيولوجية والتفاعلات الكيميائية التي تشكل أسئلة الامتحانات الرئيسية.",
    pedagogicalBenefitEn: "Reinforces episodic memory for sequential stages, biological cycles, and cause-and-effect exam problems.",
  },
  "pathway-flow": {
    mode: "pathway-flow",
    nameAr: "توضيح مسار وحركة",
    nameEn: "Pathway & Directional Flow",
    taglineAr: "محاكاة اتجاه السريان والتدفق المستمر للطاقة والمواد",
    taglineEn: "Simulate directional dynamic flow of matter, fluids, or electrical charges",
    iconName: "Route",
    badgeColor: "from-emerald-500 to-teal-600",
    pedagogicalBenefitAr: "يحول الرسم الساكن إلى محاكاة تفاعلية متحركة توضح اتجاه الحركة وسرعة الانتقال ومناطق التبادل الحيوي.",
    pedagogicalBenefitEn: "Transforms static line art into active vector currents demonstrating directional velocity and exchange zones.",
  },
  "comparison": {
    mode: "comparison",
    nameAr: "مقارنة بين العناصر",
    nameEn: "Comparative Analysis",
    taglineAr: "تحليل الفروقات والتشابهات والتكامل بين طرفين",
    taglineEn: "Contrast side-by-side structures, functions, and complementary dual roles",
    iconName: "GitCompare",
    badgeColor: "from-purple-600 to-pink-600",
    pedagogicalBenefitAr: "ينمي التفكير الناقد لدى الطالب عبر إبراز أوجه الاختلاف والتكامل (مثل الدم المؤكسج وغير المؤكسج أو الأذين والبطين).",
    pedagogicalBenefitEn: "Sharpens analytical critical thinking by juxtaposing contrasting attributes and functional counterparts.",
  },
  "decomposition": {
    mode: "decomposition",
    nameAr: "تفكيك مكونات النظام",
    nameEn: "System Decomposition",
    taglineAr: "فصل الطبقات الهيكلية واستكشاف الأجهزة التحتية بانعزال",
    taglineEn: "Isolate functional strata, structural layers, and modular subsystems",
    iconName: "Layers",
    badgeColor: "from-cyan-600 to-blue-700",
    pedagogicalBenefitAr: "يمكن الطالب من إزالة التشابك البصري للرسم المعقد ودراسة كل طبقة (هيكلية، وظيفية، مسارية) على حدة.",
    pedagogicalBenefitEn: "Reduces visual clutter in dense diagrams by isolating structural layers and functional assemblies.",
  },
};

/**
 * Infer or enhance adaptive explanation data for any diagram
 */
export function getAdaptiveExplanationForDiagram(
  diagram: DiagramAnalysis
): AdaptiveExplanationData {
  if (diagram.adaptiveExplanation) {
    return diagram.adaptiveExplanation;
  }

  const title = (diagram.titleAr + " " + diagram.titleEn).toLowerCase();
  const subject = (diagram.subjectAr + " " + diagram.subjectEn).toLowerCase();
  const summary = (diagram.summaryAr + " " + diagram.summaryEn).toLowerCase();

  // 1. Determine optimal mode
  let primaryMode: AdaptiveExplanationMode = "whole-to-part";
  let rationaleAr = "";
  let rationaleEn = "";

  if (
    title.includes("قلب") ||
    title.includes("heart") ||
    title.includes("دورة دم") ||
    title.includes("circulation") ||
    title.includes("ماء") ||
    title.includes("water cycle") ||
    title.includes("هضم") ||
    title.includes("digest")
  ) {
    if (title.includes("قلب") || title.includes("heart")) {
      primaryMode = "pathway-flow";
      rationaleAr =
        "تم اختيار 'توضيح مسار وحركة' لأن القلب يعتمد أساساً على ديناميكية ضخ الدم المستمر وتدرج الضغوط بين الحجرات والأوعية.";
      rationaleEn =
        "Selected 'Pathway & Directional Flow' because the heart fundamentally operates as a continuous hydraulic pump distributing pressure waves.";
    } else if (title.includes("هضم") || title.includes("دورة") || title.includes("cycle")) {
      primaryMode = "timeline";
      rationaleAr =
        "تم اختيار 'تسلسل زمني ومراحل' لأن هذا المفهوم يمر عبر مراحل متتالية لا يمكن فهم نواتجها إلا بتتبع الترتيب التاريخي والحركي للعملية.";
      rationaleEn =
        "Selected 'Chronological Sequence' as this process strictly unfolds through sequential interdependent phases.";
    } else {
      primaryMode = "pathway-flow";
      rationaleAr =
        "تم اختيار 'توضيح مسار وحركة' لتوضيح السريان الطبيعي للمادة عبر مسارات النظام.";
      rationaleEn =
        "Selected 'Pathway & Directional Flow' to highlight continuous directional transit.";
    }
  } else if (
    title.includes("مقارنة") ||
    title.includes("خلية") ||
    title.includes("cell") ||
    title.includes("شريان")
  ) {
    if (title.includes("خلية") || title.includes("cell")) {
      primaryMode = "whole-to-part";
      rationaleAr =
        "تم اختيار 'التدرج من الكل إلى الجزء' لأن الخلية كائن عضوي متكامل يبدأ الفهم فيه برؤية الغلاف الخارجي ثم العضيات الداخلية فالعمليات الدقيقة.";
      rationaleEn =
        "Selected 'Whole-to-Part Progression' because cellular biology requires grasping the enclosing membrane before examining organelles.";
    } else {
      primaryMode = "comparison";
      rationaleAr =
        "تم اختيار 'مقارنة بين العناصر' لإبراز الفروقات الدقيقة ونقاط التباين بين المكونات المتقابلة.";
      rationaleEn =
        "Selected 'Comparative Analysis' to juxtapose contrasting structures and parallel functions.";
    }
  } else if (
    title.includes("تركيب") ||
    title.includes("عين") ||
    title.includes("eye") ||
    title.includes("أذن") ||
    title.includes("ear") ||
    title.includes("محرك") ||
    title.includes("engine") ||
    title.includes("مجهر")
  ) {
    primaryMode = "decomposition";
    rationaleAr =
      "تم اختيار 'تفكيك مكونات النظام' لتجزئة هذا المخطط العضوي المركب إلى طبقات وأجهزة فرعية مستقلة يسهل استيعابها.";
    rationaleEn =
      "Selected 'System Decomposition' to unpack complex overlapping strata into distinct focus layers.";
  } else {
    primaryMode = "whole-to-part";
    rationaleAr =
      "تم اختيار 'التدرج من الكل إلى الجزء' لتأسيس نظرة شمولية قبل الانتقال لاستكشاف التفاصيل الدقيقة.";
    rationaleEn =
      "Selected 'Whole-to-Part Progression' to establish holistic system understanding prior to micro-detail analysis.";
  }

  // Generate comparison pairs if diagram has at least 2 parts
  const comparisonPairs: ComparisonPair[] = [];
  if (diagram.parts.length >= 2) {
    const p1 = diagram.parts[0];
    const p2 = diagram.parts[1];
    comparisonPairs.push({
      partAId: p1.id,
      partBId: p2.id,
      titleAr: `مقارنة وظيفية: ${p1.nameAr} مقابل ${p2.nameAr}`,
      titleEn: `Functional Contrast: ${p1.nameEn} vs ${p2.nameEn}`,
      aspectAr: "الدور والتكامل الفسيولوجي",
      aspectEn: "Physiological Integration",
      contrastPointsAr: [
        `يقوم (${p1.nameAr}) بـ: ${p1.functionAr.slice(0, 70)}...`,
        `بينما يختص (${p2.nameAr}) بـ: ${p2.functionAr.slice(0, 70)}...`,
        "يعمل الاثنان بتناغم دقيق لضمان استمرار النظام وتوازن العمليات الحيوية.",
      ],
      contrastPointsEn: [
        `(${p1.nameEn}) handles: ${p1.functionEn.slice(0, 80)}...`,
        `Whereas (${p2.nameEn}) specializes in: ${p2.functionEn.slice(0, 80)}...`,
        "Both coordinate synchronously to sustain biological homeostatic equilibrium.",
      ],
    });

    if (diagram.parts.length >= 4) {
      const p3 = diagram.parts[2];
      const p4 = diagram.parts[3];
      comparisonPairs.push({
        partAId: p3.id,
        partBId: p4.id,
        titleAr: `مقارنة المسار: ${p3.nameAr} و ${p4.nameAr}`,
        titleEn: `Pathway Role: ${p3.nameEn} & ${p4.nameEn}`,
        aspectAr: "طبيعة المدخلات والمخرجات",
        aspectEn: "Input & Output Characteristics",
        contrastPointsAr: [
          `المرحلة في (${p3.nameAr}): ${p3.stageTitleAr || p3.functionAr.slice(0, 60)}`,
          `المرحلة اللاحقة في (${p4.nameAr}): ${p4.stageTitleAr || p4.functionAr.slice(0, 60)}`,
        ],
        contrastPointsEn: [
          `Phase at (${p3.nameEn}): ${p3.stageTitleEn || p3.functionEn.slice(0, 70)}`,
          `Subsequent phase at (${p4.nameEn}): ${p4.stageTitleEn || p4.functionEn.slice(0, 70)}`,
        ],
      });
    }
  }

  // Generate system decomposition layers
  const systemLayers: SystemDecompositionLayer[] = [
    {
      id: "layer-structure",
      nameAr: "الطبقة الهيكلية والتأطير",
      nameEn: "Structural & Framing Layer",
      descriptionAr: "المكونات الخارجية الداعمة والحامية للنظام",
      descriptionEn: "External protective and supportive boundaries",
      color: "#0284c7",
      partIds: diagram.parts.slice(0, Math.ceil(diagram.parts.length / 2)).map((p) => p.id),
    },
    {
      id: "layer-active",
      nameAr: "الطبقة الوظيفية الحيوية",
      nameEn: "Vital Functional Core",
      descriptionAr: "الأجزاء المحركة للعمليات والتبادل النشط",
      descriptionEn: "Active operational centers driving physiological exchanges",
      color: "#10b981",
      partIds: diagram.parts.slice(Math.ceil(diagram.parts.length / 2)).map((p) => p.id),
    },
  ];

  return {
    primaryMode,
    modeRationaleAr: rationaleAr,
    modeRationaleEn: rationaleEn,
    availableModes: [
      primaryMode,
      "whole-to-part",
      "timeline",
      "pathway-flow",
      "comparison",
      "decomposition",
    ].filter((m, i, arr) => arr.indexOf(m as AdaptiveExplanationMode) === i) as AdaptiveExplanationMode[],
    macroOverviewAr: `نظام متكامل يضم ${diagram.parts.length} مكونات رئيسية تعمل بانسجام في ${diagram.subjectAr}.`,
    macroOverviewEn: `An integrated system featuring ${diagram.parts.length} interconnected units coordinating within ${diagram.subjectEn}.`,
    flowDirectionAr: "سريان متسلسل يبدأ من المدخلات الحيوية ثم ينتقل تدريجياً عبر وحدات المعالجة وصولاً للهدف النهائي.",
    flowDirectionEn: "Continuous progressive transit from primary biological intake across metabolic chambers to target tissues.",
    comparisonPairs,
    systemLayers,
  };
}
