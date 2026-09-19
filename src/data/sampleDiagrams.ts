import { DiagramAnalysis } from "../types";

export const SAMPLE_DIAGRAMS: DiagramAnalysis[] = [
  // 1. تشريح القلب البشري (ANATOMY)
  {
    id: "diagram-heart-anatomy",
    titleAr: "تشريح القلب البشري",
    titleEn: "Human Heart Anatomy",
    subjectAr: "أحياء • علم التشريح",
    subjectEn: "Biology • Human Anatomy",
    gradeLevelAr: "المرحلة المتوسطة والثانوية",
    gradeLevelEn: "Middle & High School",
    summaryAr: "القلب هو العضلة الحيوية المحركة للدورة الدموية؛ يتكون من أربع حجرات (أذينان وبطينان) تضخ الدم المؤكسج لجميع أنسجة الجسم وتستقبل الدم العائد لتنقيته عبر الرئتين.",
    summaryEn: "The human heart is the muscular pump of the cardiovascular system, comprising four chambers that continuously circulate oxygenated blood to body tissues.",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:00:00.000Z",
    parts: [
      {
        id: "heart-p1",
        nameAr: "الشريان الأورطي (الأبهر)",
        nameEn: "Aorta",
        functionAr: "أكبر شريان في الجسم؛ ينقل الدم الغني بالأكسجين من البطين الأيسر إلى جميع أنحاء الجسم والأعضاء الحيوية.",
        functionEn: "The main and largest artery that conveys oxygenated blood from the left ventricle to the entire systemic circulation.",
        descriptionAr: "شريان مرن ذو جدار عضلي سميك يتحمل الضغط المرتفع الناجم عن انقباض البطين الأيسر ويضمن تدفقاً مستمراً للدم.",
        descriptionEn: "A thick-walled, elastic vessel built to withstand the high systolic pressure generated during left ventricular ejection.",
        keyFactAr: "يضخ الشريان الأورطي ما يقارب 5 لترات من الدم كل دقيقة وقت الراحة!",
        keyFactEn: "The aorta handles nearly 5 liters of blood flow every single minute at rest.",
        stepOrder: 4,
        stageTitleAr: "المرحلة 4: توزيع الأكسجين لكافة أنحاء الجسم",
        stageTitleEn: "Stage 4: Systemic Oxygen Distribution",
        x: 50,
        y: 20
      },
      {
        id: "heart-p2",
        nameAr: "البطين الأيسر",
        nameEn: "Left Ventricle",
        functionAr: "يضخ الدم المؤكسج بقوة عالية إلى الشريان الأورطي لتغذية كامل الدورة الدموية الكبرى.",
        functionEn: "Generates high pressure to pump oxygenated blood into the aorta for systemic distribution.",
        descriptionAr: "الحجرة الأكثر سمكاً وقوة عضلية في القلب لأنها مسؤولة عن التغلب على المقاومة الوعائية في كامل الجسم.",
        descriptionEn: "The thickest muscular chamber of the heart, essential for overcoming high systemic vascular resistance.",
        keyFactAr: "سماكة جدار البطين الأيسر تعادل ثلاثة أضعاف سماكة البطين الأيمن.",
        keyFactEn: "The left ventricle's muscular wall is approximately three times thicker than that of the right ventricle.",
        stepOrder: 3,
        stageTitleAr: "المرحلة 3: استقبال الدم المؤكسج والضخ عالي الضغط",
        stageTitleEn: "Stage 3: High-Pressure Systemic Pumping",
        x: 62,
        y: 65
      },
      {
        id: "heart-p3",
        nameAr: "البطين الأيمن",
        nameEn: "Right Ventricle",
        functionAr: "يستقبل الدم غير المؤكسج من الأذين الأيمن ويضخه عبر الشريان الرئوي إلى الرئتين لتبادل الغازات.",
        functionEn: "Pumps deoxygenated venous blood into the pulmonary trunk towards the lungs for oxygenation.",
        descriptionAr: "حجرة عضلية تعمل تحت ضغط منخفض مقارنة بالبطين الأيسر لنقل الدم بلطف عبر الأوعية الرئوية الدقيقة.",
        descriptionEn: "A crescent-shaped chamber operating at lower pressures to safely perfuse delicate pulmonary capillaries.",
        keyFactAr: "يعمل البطينان بالتزامن المتقن في كل نبضة دون تأخير.",
        keyFactEn: "Both ventricles contract in exact synchronized rhythm during every cardiac cycle.",
        stepOrder: 1,
        stageTitleAr: "المرحلة 1: استقبال الدم الوريدي وضخه للرئتين",
        stageTitleEn: "Stage 1: Venous Blood Reception & Pumping",
        x: 38,
        y: 68
      },
      {
        id: "heart-p4",
        nameAr: "الشريان الرئوي",
        nameEn: "Pulmonary Artery",
        functionAr: "الشريان الوحيد في الجسم البالغ الذي يحمل دماً غير مؤكسج (فقيراً بالأكسجين) إلى الرئتين.",
        functionEn: "The unique major artery that carries deoxygenated blood from the heart to the pulmonary beds.",
        descriptionAr: "يتفرع إلى فرعين أيمن وأيسر يغذيان الرئتين مباشرة للتخلص من ثاني أكسيد الكربون وتشبع الهيموجلوبين بالأكسجين.",
        descriptionEn: "Bifurcates into right and left branches supplying the lungs for carbon dioxide release and oxygen uptake.",
        keyFactAr: "الشرايين عادة تحمل دماً مؤكسجاً، والشريان الرئوي هو الاستثناء البارز في تشريح الإنسان.",
        keyFactEn: "While arteries typically carry oxygenated blood, the pulmonary artery is the notable physiological exception.",
        stepOrder: 2,
        stageTitleAr: "المرحلة 2: إرسال الدم غير المؤكسج للرئتين للتنقية",
        stageTitleEn: "Stage 2: Pulmonary Transit for Oxygenation",
        x: 68,
        y: 28
      }
    ],
    quiz: [
      {
        id: "q-h1",
        questionAr: "ما هو الشريان الذي ينقل الدم المؤكسج من القلب إلى جميع خلايا وأعضاء الجسم؟",
        questionEn: "Which artery carries oxygenated blood from the heart to the rest of the body?",
        optionsAr: ["الشريان الأورطي (الأبهر)", "الشريان الرئوي", "الوريد الأجوف العلوي", "الشريان السباتي"],
        optionsEn: ["Aorta", "Pulmonary Artery", "Superior Vena Cava", "Carotid Artery"],
        correctAnswerIndex: 0,
        explanationAr: "الشريان الأورطي هو أكبر شرايين الجسم ويتفرع لتغذية كافة الأنسجة بالدم المحمل بالأكسجين.",
        explanationEn: "The aorta is the primary systemic trunk carrying oxygenated blood from the left ventricle."
      }
    ],
    keyTakeawaysAr: [
      "القلب يتكون من 4 حجرات تعمل كزوجين من المضخات المتزامنة.",
      "الجانب الأيسر يتعامل مع الدم المؤكسج بينما الجانب الأيمن يتعامل مع الدم غير المؤكسج.",
      "سماكة جدران الحجرات تتناسب طردياً مع مقدار الضغط المطلوب للضخ."
    ],
    keyTakeawaysEn: [
      "The heart consists of four synchronized pumping chambers.",
      "Left side manages oxygen-rich blood; right side handles deoxygenated blood.",
      "Chamber wall thickness reflects the systemic workload demanded."
    ],
    suggestedQuestionsAr: [
      "كيف تمنع صمامات القلب ارتداد الدم في الاتجاه الخاطئ؟",
      "ما الفرق بين الدورة الدموية الصغرى والدورة الدموية الكبرى؟"
    ]
  },

  // 2. هيكل النبات والتركيب الضوئي (BOTANY)
  {
    id: "diagram-plant-botany",
    titleAr: "هيكل النبات والتركيب الضوئي",
    titleEn: "Plant Structure & Photosynthesis",
    subjectAr: "أحياء • علم النبات",
    subjectEn: "Biology • Botany",
    gradeLevelAr: "المرحلة المتوسطة والثانوية",
    gradeLevelEn: "Middle & High School",
    summaryAr: "توضح بنية النبات تكامل الأوراق والسيقان والجذور في امتصاص الماء والأملاح وتوليد الغذاء عبر عملية التركيب الضوئي بوجود صبغة الكلوروفيل وضوء الشمس.",
    summaryEn: "Anatomy of higher plants illustrating vascular tissues, leaf mesophyll, and photosynthetic systems converting sunlight into chemical energy.",
    imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:05:00.000Z",
    parts: [
      {
        id: "plant-p1",
        nameAr: "الأوراق والبلاستيدات الخضراء",
        nameEn: "Leaves & Chloroplasts",
        functionAr: "المصنع الرئيسي لإنتاج السكر (الجلوكوز) والأكسجين عبر امتصاص الطاقة الضوئية وثاني أكسيد الكربون.",
        functionEn: "The primary photosynthetic organ trapping photons to synthesize glucose and release oxygen.",
        descriptionAr: "تحتوي خلايا الورقة على آلاف البلاستيدات الخضراء الغنية بالكلوروفيل، بالإضافة إلى الثغور التي تنظم التبادل الغازي.",
        descriptionEn: "Leaves house dense chloroplast arrays and stomatal pores facilitating essential gas exchange.",
        keyFactAr: "عملية التركيب الضوئي في النباتات هي المصدر الأساسي لكل الأكسجين الذي نتنفسه على كوكب الأرض.",
        keyFactEn: "Plant photosynthesis is the foundational producer of free atmospheric oxygen on Earth.",
        stepOrder: 3,
        stageTitleAr: "المرحلة 3: التركيب الضوئي وصنع الغذاء وتوليد الأكسجين",
        stageTitleEn: "Stage 3: Photosynthetic Energy Conversion",
        x: 50,
        y: 28
      },
      {
        id: "plant-p2",
        nameAr: "الساق والأنسجة الوعائية (الخشب واللحاء)",
        nameEn: "Stem & Vascular Tissues",
        functionAr: "دعامة ميكانيكية للنبات وشبكة نقل ثنائية الاتجاه للماء والأملاح من الجذور والغذاء من الأوراق.",
        functionEn: "Structural support column containing xylem and phloem transport conduits.",
        descriptionAr: "ينقل الخشب الماء والمعادن صعوداً، بينما يوزع اللحاء نواتج التركيب الضوئي إلى باقي أجزاء النبات.",
        descriptionEn: "Xylem carries water upwards; phloem distributes carbohydrates throughout the plant body.",
        keyFactAr: "قوة التماسك والتلاصق للماء داخل أوعية الخشب تمكّن الماء من الصعود لارتفاع يفوق 100 متر في الأشجار العملاقة.",
        keyFactEn: "Cohesion-tension dynamics enable water to ascend beyond 100 meters in giant redwood trees.",
        stepOrder: 2,
        stageTitleAr: "المرحلة 2: صعود العصارة النيئة عبر أوعية الخشب",
        stageTitleEn: "Stage 2: Vascular Transport & Structural Support",
        x: 50,
        y: 60
      },
      {
        id: "plant-p3",
        nameAr: "المجموع الجذري والشعيرات الجذرية",
        nameEn: "Root System & Root Hairs",
        functionAr: "تثبيت النبات في التربة وامتصاص الماء والأملاح المعدنية من خلال مساحة سطحية هائلة.",
        functionEn: "Anchors the plant in soil and absorbs moisture and minerals via fine root hairs.",
        descriptionAr: "شبكة متفرعة تمتد في التربة وتفرز مواد تساعد في إذابة المعادن وامتصاصها بفاعلية.",
        descriptionEn: "Expansive subterranean network that maximizes nutrient and water uptake from soil pores.",
        keyFactAr: "تزيد الشعيرات الجذرية مساحة امتصاص الجذر بعشرات المرات.",
        keyFactEn: "Microscopic root hairs amplify root surface area by tenfold or more.",
        stepOrder: 1,
        stageTitleAr: "المرحلة 1: امتصاص الماء والأملاح المعدنية من التربة",
        stageTitleEn: "Stage 1: Water & Mineral Soil Uptake",
        x: 50,
        y: 88
      }
    ],
    quiz: [
      {
        id: "q-p1",
        questionAr: "أي نسيج وعائي في النبات ينقل الماء والأملاح المعدنية من الجذر إلى الأوراق؟",
        questionEn: "Which plant vascular tissue transports water and minerals upwards from the roots?",
        optionsAr: ["الخشب (Xylem)", "اللحاء (Phloem)", "الكامبيوم", "البشرة"],
        optionsEn: ["Xylem", "Phloem", "Cambium", "Epidermis"],
        correctAnswerIndex: 0,
        explanationAr: "نسيج الخشب متخصص في نقل الماء والأملاح المعدنية باتجاه واحد من الأسفل إلى الأعلى.",
        explanationEn: "Xylem vessels specifically transport water and inorganic nutrients upwards from roots."
      }
    ],
    keyTakeawaysAr: [
      "التركيب الضوئي يحول الطاقة الضوئية إلى طاقة كيميائية مخزنة في الروابط الكيميائية.",
      "الخشب ينقل الماء صعوداً، واللحاء ينقل الغذاء لجميع الاتجاهات.",
      "الثغور التنفسية تتحكم في النتح والحفاظ على المحتوى المائي للنبات."
    ],
    keyTakeawaysEn: [
      "Photosynthesis transforms solar photons into durable chemical energy bonds.",
      "Xylem routes water up; phloem translocates photosynthates throughout the organism.",
      "Stomata regulate transpiration and atmospheric gaseous exchange."
    ]
  },

  // 3. تضاريس الأرض والجغرافيا (GEOGRAPHY)
  {
    id: "diagram-earth-geography",
    titleAr: "تضاريس الأرض والجغرافيا",
    titleEn: "Earth Topography & Geography",
    subjectAr: "جغرافيا • علوم الأرض",
    subjectEn: "Geography • Earth Sciences",
    gradeLevelAr: "المرحلة المتوسطة",
    gradeLevelEn: "Middle School",
    summaryAr: "استكشاف التضاريس الجيولوجية للأرض من سلاسل جبلية وأودية وبحيرات جليدية وكيف تشكلت عبر ملايين السنين بتأثير الصفائح التكتونية وعوامل التعرية والتجوية.",
    summaryEn: "An overview of dynamic terrestrial landforms, tectonic orogeny, fluvial valleys, and glacial lakes shaping continental topography.",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:10:00.000Z",
    parts: [
      {
        id: "geo-p1",
        nameAr: "القمم الجبلية الشاهقة",
        nameEn: "Mountain Peaks",
        functionAr: "مستودعات مائية طبيعية تحبس الثلوج وتغذي الأنهار بالمياه العذبة مع ذوبانها في فصلي الربيع والصيف.",
        functionEn: "Natural high-altitude water towers storing snowpack that feeds continental river systems.",
        descriptionAr: "تكونت نتيجة تصادم الصفائح التكتونية والارتفاع الصخري؛ تتميز بمناخ بارد وتأثير مباشر على أنماط الرياح والأمطار.",
        descriptionEn: "Formed through tectonic collision and crustal uplift, exerting profound influence on regional climates.",
        keyFactAr: "سلسلة جبال الهيمالايا ما زالت ترتفع بمعدل حوالي 5 ملم سنوياً بفعل استمرار تصادم الصفائح القارية!",
        keyFactEn: "The Himalayas continue rising approximately 5 mm every year due to ongoing continental collision.",
        x: 35,
        y: 25
      },
      {
        id: "geo-p2",
        nameAr: "البحيرات الجليدية والأحواض المائية",
        nameEn: "Glacial Lakes & Basins",
        functionAr: "خزانات مياه عذبة تدعم التنوع الحيوي وتعمل كمنظمات طبيعية لجريان الأنهار ومنع الفيضانات.",
        functionEn: "Freshwater reservoirs fostering aquatic biodiversity and buffering downstream river discharge.",
        descriptionAr: "أحواض طبيعية تكونت بفعل انحسار وتآكل الأنهار الجليدية القديمة، تتميز بنقاء مياهها واحتوائها على الرواسب المعدنية.",
        descriptionEn: "Topographic depressions carved by ancient glacial action, characterized by crystal-clear alpine waters.",
        keyFactAr: "تحتوي البحيرات والجليد على أكثر من 68% من مجمل المياه العذبة غير الجوفية على كوكب الأرض.",
        keyFactEn: "Glaciers and alpine lakes store the majority of Earth's surface freshwater reserves.",
        x: 52,
        y: 65
      }
    ],
    quiz: [
      {
        id: "q-g1",
        questionAr: "ما هو السبب الجيولوجي الرئيسي لتكون السلاسل الجبلية الضخمة كالهيمالايا والألب؟",
        questionEn: "What is the primary geological cause of major mountain belts like the Himalayas?",
        optionsAr: ["تصادم الصفائح التكتونية", "الرياح القوية السطحية", "حركات المد والجزر", "الجاذبية القمرية"],
        optionsEn: ["Tectonic plate collision", "Surface wind erosion", "Tidal forces", "Lunar gravity"],
        correctAnswerIndex: 0,
        explanationAr: "تنشأ السلاسل الجبلية الكبرى من ضغط وتصادم الصفائح التكتونية في قشرة الأرض.",
        explanationEn: "Orogenic belts are forged primarily by convergent boundaries between lithospheric plates."
      }
    ]
  },

  // 4. الجهاز الهضمي للإنسان (ANATOMY)
  {
    id: "diagram-digestive-system",
    titleAr: "الجهاز الهضمي للإنسان",
    titleEn: "Human Digestive System",
    subjectAr: "أحياء • فسيولوجيا الإنسان",
    subjectEn: "Biology • Human Physiology",
    gradeLevelAr: "المرحلة المتوسطة والثانوية",
    gradeLevelEn: "Middle & High School",
    summaryAr: "رحلة تفكيك الغذاء من الفم والمريء إلى المعدة والأمعاء الدقيقة والغليظة لامتصاص العناصر الغذائية وتزويد الخلايا بالطاقة اللازمة للنمو والنشاط.",
    summaryEn: "Comprehensive breakdown of gastrointestinal anatomy and enzymatic processes transforming ingested nutrients into bioavailable fuel.",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:15:00.000Z",
    parts: [
      {
        id: "dig-p0",
        nameAr: "الفم والأسنان والغدد اللعابية",
        nameEn: "Mouth, Teeth & Salivary Glands",
        functionAr: "المرحلة الأولى: تقطيع وطحن الطعام بالأسنان وترطيبه بإنزيم الأميليز اللعابي لبدء تفكيك النشويات.",
        functionEn: "Stage 1: Mechanical mastication and enzymatic breakdown of starches via salivary amylase.",
        descriptionAr: "المدخل الرئيسي للجهاز الهضمي، حيث تشترك الأسنان واللسان واللعاب في تشكيل بلعة طعام جاهزة للبلع.",
        descriptionEn: "The primary entry point where mechanical breakdown and chemical digestion initiate simultaneously.",
        keyFactAr: "تفرز الغدد اللعابية في فم الإنسان ما بين لتر إلى لتر ونصف من اللعاب يومياً لتسهيل الهضم!",
        keyFactEn: "Human salivary glands produce about 1 to 1.5 liters of digestive saliva every single day.",
        stepOrder: 1,
        stageTitleAr: "المرحلة 1: الفم وبدء الهضم",
        stageTitleEn: "Stage 1: Mouth & Digestion Inception",
        x: 50,
        y: 16
      },
      {
        id: "dig-p05",
        nameAr: "المريء والبلعوم",
        nameEn: "Esophagus & Peristalsis",
        functionAr: "المرحلة الثانية: نقل بلعة الطعام من الفم إلى المعدة بواسطة انقباضات عضلية دودية لاإرادية.",
        functionEn: "Stage 2: Conduit transporting food bolus into the stomach via involuntary peristaltic contractions.",
        descriptionAr: "أنبوب عضلي يبلغ طوله حوالي 25 سم يربط الحلق بالمعدة ويغلق بصمام لمنع ارتداد الأحماض.",
        descriptionEn: "A 25 cm muscular tube executing rhythmic contractions that push nutrients safely downward.",
        keyFactAr: "الحركة الدودية للمريء قوية لدرجة أن الطعام يصل إلى المعدة حتى لو كان الشخص مقلوباً رأساً على عقب!",
        keyFactEn: "Peristalsis is muscularly driven, allowing food to reach the stomach even while hanging upside down.",
        stepOrder: 2,
        stageTitleAr: "المرحلة 2: المريء ونقل الغذاء",
        stageTitleEn: "Stage 2: Esophagus & Transport",
        x: 50,
        y: 28
      },
      {
        id: "dig-p1",
        nameAr: "المعدة والعصارة الهضمية",
        nameEn: "Stomach & Gastric Acid",
        functionAr: "المرحلة الثالثة: خلط الطعام وهضمه بحمض الهيدروكلوريك وإنزيم الببسين وتحويله إلى سائل الكيموس.",
        functionEn: "Stage 3: Chemical and mechanical churning of food into acidic chyme via gastric enzymes and HCl.",
        descriptionAr: "عضو عضلي كيسي محمي بغشاء مخاطي سميك يمنع تلف جداره الداخلي بفعل الحموضة العالية.",
        descriptionEn: "A muscular reservoir lined with protective mucous to shield tissue from harsh digestive enzymes.",
        keyFactAr: "تفرز المعدة حمضاً قوياً كافياً لإذابة بعض المعادن، ولكن جدارها يجدد خلاياه كل بضعة أيام للحماية.",
        keyFactEn: "Gastric acid has a pH around 1.5 to 2, requiring the stomach lining to regenerate every few days.",
        stepOrder: 3,
        stageTitleAr: "المرحلة 3: المعدة والتفكيك الكيميائي",
        stageTitleEn: "Stage 3: Stomach Breakdown",
        x: 46,
        y: 45
      },
      {
        id: "dig-p2",
        nameAr: "الأمعاء الدقيقة والخملات",
        nameEn: "Small Intestine & Villi",
        functionAr: "المرحلة الرابعة: إتمام هضم العناصر وامتصاص 90% من السكريات والبروتينات والدهون ونقلها للدم.",
        functionEn: "Stage 4: Primary site for complete enzymatic digestion and nutrient absorption via dense villi.",
        descriptionAr: "أنبوب يبلغ طوله حوالي 6 أمتار يحتوي على ملايين البروزات المجهرية (الخملات) التي تزيد مساحة الامتصاص.",
        descriptionEn: "A 6-meter convoluted tube packed with villi offering a surface area roughly the size of a tennis court.",
        keyFactAr: "المساحة السطحية الداخلية للأمعاء الدقيقة تعادل تقريباً مساحة ملعب تنس بفضل الخملات الدقيقة!",
        keyFactEn: "Microvilli expand the small intestine's absorptive surface to roughly 250 square meters.",
        stepOrder: 4,
        stageTitleAr: "المرحلة 4: الأمعاء الدقيقة والامتصاص الحيوي",
        stageTitleEn: "Stage 4: Small Intestine Absorption",
        x: 52,
        y: 64
      },
      {
        id: "dig-p3",
        nameAr: "الأمعاء الغليظة (القولون) والإخراج",
        nameEn: "Large Intestine & Colon",
        functionAr: "المرحلة الخامسة: امتصاص الماء والأملاح المتبقية وتجميع الفضلات غير المهضومة للتخلص منها.",
        functionEn: "Stage 5: Reabsorption of residual water and electrolytes, preparing indigestible waste for elimination.",
        descriptionAr: "الجزء النهائي من القناة الهضمية، يحتضن بكتيريا الميكروبيوم النافعة التي تساعد في إنتاج فيتامين K.",
        descriptionEn: "The terminal intestinal tract hosting beneficial gut flora and balancing bodily hydration.",
        keyFactAr: "يعيش في الأمعاء الغليظة تريليونات من البكتيريا النافعة تفوق عدد خلايا جسم الإنسان نفسه وتدعم مناعته!",
        keyFactEn: "The human colon hosts trillions of symbiotic microbes that outnumber the human cells in the body.",
        stepOrder: 5,
        stageTitleAr: "المرحلة 5: الأمعاء الغليظة واستعادة الماء",
        stageTitleEn: "Stage 5: Large Intestine & Balance",
        x: 50,
        y: 80
      }
    ],
    quiz: [
      {
        id: "q-d1",
        questionAr: "أين يحدث الجزء الأكبر من امتصاص العناصر الغذائية في الجهاز الهضمي؟",
        questionEn: "Where does the vast majority of nutrient absorption take place?",
        optionsAr: ["الأمعاء الدقيقة", "المعدة", "المريء", "الأمعاء الغليظة"],
        optionsEn: ["Small intestine", "Stomach", "Esophagus", "Large intestine"],
        correctAnswerIndex: 0,
        explanationAr: "الأمعاء الدقيقة هي المسؤولة عن امتصاص نحو 90% من المواد الغذائية بفضل خملاتها المعوية.",
        explanationEn: "The small intestine facilitates over 90% of systemic nutrient and water absorption."
      }
    ]
  },

  // 5. هيكلية الروبوتات (TECHNOLOGY)
  {
    id: "diagram-robotics-structure",
    titleAr: "هيكلية الروبوتات",
    titleEn: "Robotics Architecture",
    subjectAr: "تكنولوجيا • روبوتات وذكاء اصطناعي",
    subjectEn: "Technology • Robotics & AI",
    gradeLevelAr: "المرحلة المتوسطة والمتقدمة",
    gradeLevelEn: "Middle & Advanced Grades",
    summaryAr: "تحليل بنية الأنظمة الروبوتية المستقلة التي تجمع بين المستشعرات والمحركات ووحدات المعالجة المركزية لاتخاذ القرارات الحركية والتفاعل مع البيئة المحيطة.",
    summaryEn: "An architectural overview of humanoid and autonomous robotic systems integrating sensory feedback, actuators, and embedded neural control.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:20:00.000Z",
    parts: [
      {
        id: "rob-p1",
        nameAr: "وحدة المعالجة والرؤية الحاسوبية",
        nameEn: "CPU & Computer Vision Sensors",
        functionAr: "معالجة تدفق البيانات البصرية وحساب مسارات الحركة الآمنة في أجزاء من الثانية.",
        functionEn: "Processes real-time vision inputs and computes inverse kinematics for stable motion planning.",
        descriptionAr: "كاميرات استشعار العمق وشرائح الذكاء الاصطناعي التي تحاكي العين البشرية والدماغ في إدراك العوائق.",
        descriptionEn: "Equipped with LiDAR, stereo cameras, and edge computing chips for environmental localization.",
        keyFactAr: "تستطيع روبوتات اليوم تحليل أكثر من 60 إطاراً في الثانية لتفادي الاصطدام أثناء المشي السريع.",
        keyFactEn: "Modern humanoids process optical depth feeds at over 60 FPS to sustain dynamic balance.",
        x: 50,
        y: 20
      },
      {
        id: "rob-p2",
        nameAr: "المحركات المؤازرة والمفاصل الميكانيكية",
        nameEn: "Servo Actuators & Articulations",
        functionAr: "توليد العزم الحركي الدقيق للذراعين والأرجل لتمكين الروبوت من المشي والتقاط الأشياء بحساسية عالية.",
        functionEn: "Supplies precise rotational torque to joints, enabling fluid locomotion and dexterous manipulation.",
        descriptionAr: "موتورات كهربائية متطورة مع تروس كوكبية ومستشعرات عزم تحدد مقدار القوة المناسبة لكل مهمة.",
        descriptionEn: "Brushless DC motors paired with harmonic drives and torque feedback sensors.",
        keyFactAr: "يحتوي الروبوت البشري المتقدم على أكثر من 30 درجة حرية حركية تحاكي مفاصل الإنسان.",
        keyFactEn: "Advanced humanoid platforms feature more than 30 degrees of freedom mirroring human biomechanics.",
        x: 42,
        y: 50
      }
    ],
    quiz: [
      {
        id: "q-r1",
        questionAr: "ما هو المكون المسؤول عن تحويل الإشارات الكهربائية إلى حركة في الروبوت؟",
        questionEn: "What robotic component converts electrical control signals into physical movement?",
        optionsAr: ["المحركات المؤازرة (Actuators)", "البطارية", "الكاميرا", "المكثف"],
        optionsEn: ["Actuators / Servos", "Battery pack", "Camera", "Capacitor"],
        correctAnswerIndex: 0,
        explanationAr: "المحركات والمشغلات الميكانيكية (Actuators) هي المسؤولة عن تحويل الطاقة الكهربائية إلى حركة ميكانيكية.",
        explanationEn: "Actuators convert electrical commands into controlled rotational or linear motion."
      }
    ]
  },

  // 6. مبادئ القانون والعدالة (LAW)
  {
    id: "diagram-law-justice",
    titleAr: "مبادئ القانون والعدالة",
    titleEn: "Principles of Law & Justice",
    subjectAr: "قانون • دراسات اجتماعية",
    subjectEn: "Law • Social Studies",
    gradeLevelAr: "المرحلة الثانوية",
    gradeLevelEn: "High School",
    summaryAr: "شرح المنظومة القانونية، ميزان العدالة، ومبدأ فصل السلطات وسيادة القانون لضمان حقوق الأفراد وحماية المجتمع والنظام العام.",
    summaryEn: "An analytical study of jurisprudence, the rule of law, separation of powers, and civic rights underpinning equitable societies.",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:25:00.000Z",
    parts: [
      {
        id: "law-p1",
        nameAr: "ميزان العدالة (رمز التوازن والمساواة)",
        nameEn: "Scales of Justice",
        functionAr: "يرمز إلى وزن الأدلة والبراهين بحيادية تامة دون تمييز ومساواة جميع الأطراف أمام القانون.",
        functionEn: "Symbolizes impartial weighing of evidence and strict equality before the rule of law.",
        descriptionAr: "كفتا الميزان تمثلان ادعاءات الخصوم والأدلة المقدمة؛ حيث تميل الكفة فقط لصالح البرهان الأثبت والحق.",
        descriptionEn: "Each scale pan holds opposing arguments and testimonies, balanced impartially by evidence.",
        keyFactAr: "مفهوم ميزان العدالة يعود للحضارات القديمة كالحضارة المصرية والإغريقية كرمز للنظام الأخلاقي.",
        keyFactEn: "The balance scales symbol traces back to ancient civilizations as an emblem of moral truth.",
        x: 45,
        y: 35
      }
    ],
    quiz: [
      {
        id: "q-l1",
        questionAr: "ماذا يمثل ميزان العدالة في الرموز القانونية العالمية؟",
        questionEn: "What do the scales of justice represent in legal symbolism?",
        optionsAr: ["وزن الأدلة بحيادية ومساواة", "تحصيل الغرامات المالية", "إصدار الأحكام السريعة", "عدد القوانين"],
        optionsEn: ["Impartial weighing of evidence", "Collecting fines", "Speedy sentencing", "Number of statutes"],
        correctAnswerIndex: 0,
        explanationAr: "يرمز الميزان إلى الحياد التام والمساواة وتقييم الأدلة استناداً إلى الحق والبراهين الصريحة.",
        explanationEn: "Scales embody equal justice under law and objective evaluation of evidence without prejudice."
      }
    ]
  },

  // 7. صحة الرئتين (HEALTH)
  {
    id: "diagram-lungs-health",
    titleAr: "صحة الرئتين",
    titleEn: "Respiratory & Lung Health",
    subjectAr: "صحة • جهاز تنفسي",
    subjectEn: "Health • Respiratory Medicine",
    gradeLevelAr: "المرحلة المتوسطة والثانوية",
    gradeLevelEn: "Middle & High School",
    summaryAr: "استكشاف الحويصلات الهوائية والشعب الهوائية في الرئتين، وكيف يتم تبادل الأكسجين وثاني أكسيد الكربون، وعوامل حماية الجهاز التنفسي من الملوثات والعدوى.",
    summaryEn: "Detailed inspection of bronchial trees and pulmonary alveoli where gas exchange oxygenates blood and expels metabolic waste.",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:30:00.000Z",
    parts: [
      {
        id: "lung-p1",
        nameAr: "الحويصلات الهوائية (Alveoli)",
        nameEn: "Pulmonary Alveoli",
        functionAr: "موقع التبادل الغازي الفعلي؛ حيث ينتشر الأكسجين إلى الشعيرات الدموية ويطرد غاز ثاني أكسيد الكربون.",
        functionEn: "Microscopic air sacs where oxygen diffuses into capillaries and carbon dioxide is expelled.",
        descriptionAr: "أكياس كروية بالغة الرقة محاطة بشبكة كثيفة من الشعيرات الدموية يبلغ عددها حوالي 300 إلى 500 مليون حويصلة في الرئتين.",
        descriptionEn: "Ultra-thin membranous sacs enveloped by capillary meshes offering immense surface area.",
        keyFactAr: "إذا فُردت الحويصلات الهوائية في رئتي إنسان بالغ، فستغطي مساحة تقارب 70 متراً مربعاً!",
        keyFactEn: "Spread flat, human alveoli would carpet an area roughly equivalent to half a tennis court.",
        x: 50,
        y: 40
      }
    ],
    quiz: [
      {
        id: "q-lu1",
        questionAr: "أين يحدث تبادل الأكسجين وثاني أكسيد الكربون تحديداً في الرئتين؟",
        questionEn: "Where specifically does gas exchange occur in the human respiratory tract?",
        optionsAr: ["الحويصلات الهوائية", "القصبة الهوائية", "الحنجرة", "الأنف"],
        optionsEn: ["Alveoli", "Trachea", "Larynx", "Nasal cavity"],
        correctAnswerIndex: 0,
        explanationAr: "الحويصلات الهوائية هي الوحدات الوظيفية الميكروسكوبية التي تتبادل الغازات مع الدم مباشرة.",
        explanationEn: "Alveoli provide the ultrathin barrier where gases diffuse across the blood-air interface."
      }
    ]
  },

  // 8. صحة الكبد (HEALTH)
  {
    id: "diagram-liver-health",
    titleAr: "صحة الكبد",
    titleEn: "Hepatic Health & Functions",
    subjectAr: "صحة • علم وظائف الأعضاء",
    subjectEn: "Health • Hepatic Physiology",
    gradeLevelAr: "المرحلة المتوسطة والثانوية",
    gradeLevelEn: "Middle & High School",
    summaryAr: "الكبد هو أكبر عضو داخلي في جسم الإنسان ومختبره الكيميائي؛ يزيل السموم، ويفرز العصارة الصفراوية لهضم الدهون، ويخزن الطاقة على شكل جليكوجين.",
    summaryEn: "An overview of hepatic anatomy illustrating metabolic detoxification, bile secretion, and glycogen homeostasis maintaining vitality.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:35:00.000Z",
    parts: [
      {
        id: "liv-p1",
        nameAr: "الفص الكبدي وخلايا الكبد",
        nameEn: "Hepatic Lobules & Hepatocytes",
        functionAr: "تنقية الدم القادم من الجهاز الهضمي، تحييد المواد الكيميائية السامة، وتصنيع بروتينات البلازما الهامة لتجلط الدم.",
        functionEn: "Filters portal blood, neutralizes xenobiotics, and synthesizes critical coagulation proteins.",
        descriptionAr: "وحدات سداسية مجهرية تحتوي على صفوف من الخلايا الكبدية وشعيرات دموية مخصصة تسمى أشباه الجيوب (Sinusoids).",
        descriptionEn: "Hexagonal lobular units where hepatocytes cleanse blood draining from gastrointestinal organs.",
        keyFactAr: "الكبد هو العضو الداخلي الوحيد القادر على تجديد أنسجته المفقودة حتى لو استؤصل جزء كبير منه!",
        keyFactEn: "The liver is the only internal organ possessing substantial endogenous regenerative capacity.",
        x: 48,
        y: 45
      }
    ],
    quiz: [
      {
        id: "q-liv1",
        questionAr: "ما هي العصارة الهاضمة التي ينتجها الكبد للمساعدة في هضم وتفكيك الدهون؟",
        questionEn: "What digestive fluid does the liver produce to assist in emulsifying dietary fats?",
        optionsAr: ["العصارة الصفراوية (Bile)", "اللعاب", "حمض الهيدروكلوريك", "الأنسولين"],
        optionsEn: ["Bile", "Saliva", "Gastric acid", "Insulin"],
        correctAnswerIndex: 0,
        explanationAr: "ينتج الكبد العصارة الصفراوية التي تخزن في المرارة لتساعد في استحلاب وهضم الدهون في الأمعاء.",
        explanationEn: "Bile salts synthesized by hepatocytes emulsify dietary lipids inside the duodenum."
      }
    ]
  },

  // 9. دليل إنفوجرافيك الذكاء الاصطناعي (TECHNOLOGY)
  {
    id: "diagram-ai-infographic",
    titleAr: "دليل إنفوجرافيك الذكاء الاصطناعي",
    titleEn: "AI & Neural Networks Guide",
    subjectAr: "تكنولوجيا • ذكاء اصطناعي",
    subjectEn: "Technology • Artificial Intelligence",
    gradeLevelAr: "المرحلة المتوسطة والمتقدمة",
    gradeLevelEn: "Middle & Advanced Grades",
    summaryAr: "مخطط مفاهيمي يوضح طبقات الشبكات العصبية الاصطناعية (طبقة الدخل، الطبقات المخفية، طبقة الخرج) وكيف تتعلم النماذج من البيانات الكبيرة للتعرف على الأنماط واتخاذ القرارات الذكية.",
    summaryEn: "A conceptual infographic tracing deep neural architectures, perceptron weighting, hidden layer representations, and generative AI reasoning.",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:40:00.000Z",
    parts: [
      {
        id: "ai-p1",
        nameAr: "الطبقات المخفية العميقة (Hidden Layers)",
        nameEn: "Deep Hidden Layers",
        functionAr: "استخلاص الأنماط والخصائص المعقدة من البيانات الخام عبر عمليات ضرب الأوزان الرياضية وتطبيق دوال التنشيط.",
        functionEn: "Extracts abstract hierarchical features through weighted matrix multiplications and non-linear activations.",
        descriptionAr: "شبكة كثيفة من العقد العصبية الاصطناعية تتعلم تمثيل المفاهيم مثل تمييز الحواف في الصور أو فهم سياق الكلمات في النصوص.",
        descriptionEn: "Interconnected perceptron layers transforming basic inputs into high-level semantic representations.",
        keyFactAr: "تحتوي النماذج اللغوية الحديثة مثل Gemini على مئات المليارات من المعاملات الرياضية القابلة للتعلم!",
        keyFactEn: "Modern frontier transformer models calibrate hundreds of billions of learnable parameters.",
        x: 50,
        y: 45
      }
    ],
    quiz: [
      {
        id: "q-ai1",
        questionAr: "ما هو العنصر في الشبكة العصبية الذي يتعلم ويُعدل أثناء تدريب النموذج لتحسين دقة النتائج؟",
        questionEn: "What parameters in a neural network are iteratively tuned during training to boost accuracy?",
        optionsAr: ["الأوزان والانحيازات (Weights & Biases)", "حجم الشاشة", "سرعة الإنترنت", "نوع لوحة المفاتيح"],
        optionsEn: ["Weights & Biases", "Display resolution", "Network bandwidth", "Keyboard model"],
        correctAnswerIndex: 0,
        explanationAr: "الأوزان الرياضية وقيم الانحياز هي التي يتم ضبطها عبر خوارزمية الانتشار الخلفي لتقليل نسبة الخطأ.",
        explanationEn: "Backpropagation optimizes numeric weights and biases across all layer connections."
      }
    ]
  },

  // 10. مكونات الحاسوب (TECHNOLOGY)
  {
    id: "diagram-computer-hardware",
    titleAr: "مكونات الحاسوب",
    titleEn: "Computer Hardware Components",
    subjectAr: "تكنولوجيا • عتاد الحاسوب",
    subjectEn: "Technology • Computer Hardware",
    gradeLevelAr: "المرحلة المتوسطة",
    gradeLevelEn: "Middle School",
    summaryAr: "استكشاف القطع الأساسية لجهاز الكمبيوتر: اللوحة الأم، المعالج المركزي (CPU)، الذاكرة العشوائية (RAM)، ووحدات التخزين، وكيف تتكامل لنقل ومعالجة البيانات بسرعة فائقة.",
    summaryEn: "An architectural breakdown of motherboard busses, central processors, transient volatile memory, and solid-state storage.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:45:00.000Z",
    parts: [
      {
        id: "pc-p1",
        nameAr: "وحدة المعالجة المركزية (CPU)",
        nameEn: "Central Processing Unit (CPU)",
        functionAr: "دماغ الحاسوب المسؤول عن تنفيذ ملايين العمليات الحسابية والمنطقية وإدارة تدفق التعليمات البرمجية.",
        functionEn: "The primary computational engine executing instruction cycles and arithmetic logic operations.",
        descriptionAr: "رقاقة سيليكونية متطورة تحوي بلايين الترانزستورات المجهرية المصنعة بتقنية النانومتر.",
        descriptionEn: "A silicon microchip packing billions of microscopic nanoscale transistors on a compact die.",
        keyFactAr: "يمكن للمعالجات الحديثة تنفيذ أكثر من 3 مليارات دورة حسابية في الثانية الواحدة (3 GHz)!",
        keyFactEn: "Modern CPUs cycle through billions of instruction cycles every single second.",
        x: 50,
        y: 40
      }
    ],
    quiz: [
      {
        id: "q-pc1",
        questionAr: "ما هي القطعة التي تعتبر عقل الحاسوب والمسؤولة عن تنفيذ التعليمات الحسابية والمنطقية؟",
        questionEn: "Which hardware component acts as the primary brain executing algorithmic instructions?",
        optionsAr: ["المعالج المركزي (CPU)", "الفأرة", "الشاشة", "السماعة"],
        optionsEn: ["Central Processing Unit (CPU)", "Mouse", "Monitor", "Speaker"],
        correctAnswerIndex: 0,
        explanationAr: "المعالج المركزي (CPU) هو عقل الحاسوب الأساسي الذي يدير كل العمليات البرمجية والحسابية.",
        explanationEn: "The CPU directs system execution, fetching, decoding, and computing commands."
      }
    ]
  },

  // 11. صحة القلب (HEALTH)
  {
    id: "diagram-cardio-health",
    titleAr: "صحة القلب",
    titleEn: "Cardiovascular Care",
    subjectAr: "صحة • طب وقائي",
    subjectEn: "Health • Preventive Cardiology",
    gradeLevelAr: "المرحلة المتوسطة والثانوية",
    gradeLevelEn: "Middle & High School",
    summaryAr: "دليل إرشادي تفاعلي للمحافظة على صحة الشرايين التاجية، قياس ضغط الدم، أهمية النشاط البدني والغذاء المتوازن للوقاية من أمراض القلب والأوعية الدموية.",
    summaryEn: "A comprehensive health infographic detailing coronary perfusion, blood pressure regulation, and lifestyle cardioprotection.",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:50:00.000Z",
    parts: [
      {
        id: "cardio-p1",
        nameAr: "الشرايين التاجية (Coronary Arteries)",
        nameEn: "Coronary Arteries",
        functionAr: "تغذية عضلة القلب نفسها بالدم المشبع بالأكسجين والجلوكوز لضمان استمرار نبضه دون توقف.",
        functionEn: "Supplies oxygen-rich blood directly to myocardium tissue sustaining continuous contractile rhythm.",
        descriptionAr: "شبكة شريانية تلتف حول سطح القلب كتاج، وأي انسداد فيها يؤدي إلى النوبة القلبية (احتشاء عضلة القلب).",
        descriptionEn: "Arterial branches encircling the epicardium; stenosis here triggers myocardial ischemia.",
        keyFactAr: "ينبض قلب الإنسان الطبيعي حوالي 100,000 نبضة يومياً ويضخ أكثر من 7,500 لتر من الدم!",
        keyFactEn: "The human heart beats roughly 100,000 times daily, circulating thousands of liters of blood.",
        x: 46,
        y: 48
      }
    ],
    quiz: [
      {
        id: "q-c1",
        questionAr: "ما اسم الشرايين المسؤولة عن تغذية عضلة القلب نفسها بالأكسجين والمغذيات؟",
        questionEn: "What are the specific arteries supplying blood directly to cardiac muscle tissue?",
        optionsAr: ["الشرايين التاجية", "الشرايين السباتية", "الشرايين الفخذية", "الشرايين الكلوية"],
        optionsEn: ["Coronary arteries", "Carotid arteries", "Femoral arteries", "Renal arteries"],
        correctAnswerIndex: 0,
        explanationAr: "الشرايين التاجية تتفرع من قاعدة الأورطي لتغذية عضلة القلب بالأكسجين الحيوي.",
        explanationEn: "Coronary circulation branches off the aortic root to nourish myocardium cells."
      }
    ]
  },

  // 12. صحة العين (HEALTH)
  {
    id: "diagram-eye-health",
    titleAr: "صحة العين",
    titleEn: "Ocular Anatomy & Vision",
    subjectAr: "صحة • بصريات وعلم التشريح",
    subjectEn: "Health • Ophthalmology",
    gradeLevelAr: "المرحلة المتوسطة والثانوية",
    gradeLevelEn: "Middle & High School",
    summaryAr: "تشريح العين البشرية: القرنية، القزحية، بؤبؤ العين، العدسة، والشبكية وكيف يتم تحويل الإشارات الضوئية إلى نبضات عصبية يفسرها الدماغ كصور ملونة ثلاثية الأبعاد.",
    summaryEn: "An ocular anatomy infographic showcasing the cornea, crystalline lens, photoreceptive retina, and optic nerve transduction.",
    imageUrl: "https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-09-07T08:55:00.000Z",
    parts: [
      {
        id: "eye-p1",
        nameAr: "القزحية وبؤبؤ العين (Iris & Pupil)",
        nameEn: "Iris & Pupil Aperture",
        functionAr: "تنظيم كمية الضوء الداخلة إلى داخل العين عبر تضييق أو توسيع فتحة البؤبؤ بالاعتماد على شدة الإضاءة المحيطة.",
        functionEn: "Regulates light flux into the eye by reflexively adjusting pupillary aperture size.",
        descriptionAr: "القزحية هي الجزء الملون المحتوي على صبغة الميلانين وعضلات حلقية وإشعاعية متطورة.",
        descriptionEn: "Pigmented muscular diaphragm containing sphincter and dilator pupillae fibers.",
        keyFactAr: "نمط خطوط وبصمة قزحية العين فريد تماماً لكل شخص ولا يتشابه بين شخصين حتى في التوائم المتطابقة!",
        keyFactEn: "The iris pattern is completely distinct for every human, even between identical twins.",
        x: 50,
        y: 50
      }
    ],
    quiz: [
      {
        id: "q-e1",
        questionAr: "ما هو الجزء المسؤول عن التحكم في كمية الضوء الداخلة إلى العين؟",
        questionEn: "Which ocular component regulates the quantity of light entering the inner eye?",
        optionsAr: ["القزحية والبؤبؤ", "القرنية فقط", "الرموش", "العصب البصري"],
        optionsEn: ["Iris and pupil", "Cornea only", "Eyelashes", "Optic nerve"],
        correctAnswerIndex: 0,
        explanationAr: "تتحكم عضلات القزحية في اتساع وتضيق البؤبؤ لتنظيم كمية الإضاءة الواصلة للشبكية بدقة.",
        explanationEn: "Iris sphincter and dilator muscles modulate pupillary aperture according to ambient luminosity."
      }
    ]
  }
];
