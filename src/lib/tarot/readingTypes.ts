import { Locale } from "@/types/tarot";

export interface ReadingTypeConfig {
  slug: string;
  spreadId: string;
  romanNumeral: string;
  cardCount: number;
  badge: string;
  badgeMap?: Partial<Record<Locale, string>>;
  name: Partial<Record<Locale, string>> & { en: string; [key: string]: string | undefined };
  subtitle: Partial<Record<Locale, string>> & { en: string; [key: string]: string | undefined };
  description: Partial<Record<Locale, string>> & { en: string; [key: string]: string | undefined };
  defaultQuestion: Partial<Record<Locale, string>> & { en: string; [key: string]: string | undefined };
  chips: Partial<Record<Locale, string[]>> & { en: string[]; [key: string]: string[] | undefined };
  heroCardId: string;
  isYesNo?: boolean;
  isTwoChoices?: boolean;
}

export const READING_TYPES: ReadingTypeConfig[] = [
  {
    slug: "card-of-the-day",
    spreadId: "card_of_the_day",
    romanNumeral: "XXI",
    cardCount: 1,
    badge: "Free Daily Draw",
    heroCardId: "major_21_world",
    name: {
      en: "Card of the day",
      hi: "दिन का कार्ड",
      ja: "今日のカード",
    },
    subtitle: {
      en: "Set the tone for your day",
      hi: "अपने दिन की दिशा निर्धारित करें",
      ja: "今日という日の基調を定める",
    },
    description: {
      en: "Draw your daily sacred archetype to align your mindset, reveal immediate opportunities, and receive focused spiritual clarity for the next 24 hours.",
      hi: "अपने दिन के लिए एक मार्गदर्शक कार्ड निकालें और 24 घंटों के लिए ब्रह्मांडीय मार्गदर्शन और शांति प्राप्त करें।",
      ja: "今日を導く聖なるアルカナを1枚引き、これからの24時間を照らす明確なメッセージを受け取ります。",
    },
    defaultQuestion: {
      en: "What energy and guiding lesson should I embrace today?",
      hi: "आज के दिन मुझे किस ऊर्जा और संदेश को अपनाना चाहिए?",
      ja: "今日という日を最善に過ごすために意識すべきエネルギーは何ですか？",
    },
    chips: {
      en: [
        "What energy guides my day today?",
        "Where should I focus my mind and intention?",
        "What hidden blessing awaits me today?",
        "How can I maintain calm and alignment?",
      ],
      hi: [
        "आज के दिन मुझे क्या मार्गदर्शन चाहिए?",
        "मेरी प्राथमिक ऊर्जा किस दिशा में होनी चाहिए?",
        "आज मुझे किस अवसर पर ध्यान देना चाहिए?",
      ],
      ja: [
        "今日の私のエネルギーのテーマは何ですか？",
        "今日意識すべき教訓や機会は何ですか？",
        "心穏やかに過ごすための導きをください。",
      ],
    },
  },
  {
    slug: "yes-or-no-tarot",
    spreadId: "yes_no_tarot",
    romanNumeral: "XVII",
    cardCount: 1,
    badge: "Instant Decision",
    heroCardId: "major_17_star",
    isYesNo: true,
    name: {
      en: "Yes/No Reading",
      hi: "हाँ या ना टैरो",
      ja: "イエス・ノー リーディング",
    },
    subtitle: {
      en: "A quick answer to a simple question",
      hi: "एक सरल प्रश्न का त्वरित और सटीक उत्तर",
      ja: "シンプルな問いへの素早い答え",
    },
    description: {
      en: "Get a clear, direct affirmative or cautionary verdict to any pressing question, backed by the deep symbolic wisdom of the 78 Tarot archetypes.",
      hi: "किसी भी दुविधा में त्वरित 'हाँ' या 'ना' का स्पष्ट उत्तर पाएं, और जानें इसके पीछे की कॉस्मिक ऊर्जा।",
      ja: "迷いのある決断に対して、明確なイエスまたはノーの指針と、その背景にある象徴的意味を読み解きます。",
    },
    defaultQuestion: {
      en: "Should I proceed with this decision?",
      hi: "क्या मुझे इस निर्णय के साथ आगे बढ़ना चाहिए?",
      ja: "この決断を進めるべきでしょうか？",
    },
    chips: {
      en: [
        "Should I proceed with this opportunity?",
        "Is now the right time to make a move?",
        "Will this situation resolve in my favor?",
        "Should I reach out and speak my truth?",
      ],
      hi: [
        "क्या मुझे यह कदम उठाना चाहिए?",
        "क्या यह समय इस काम के लिए सही है?",
        "क्या यह परिस्थिति मेरे पक्ष में सुलझेगी?",
      ],
      ja: [
        "この選択肢を進めるべきでしょうか？",
        "今行動を起こすのに適した時期ですか？",
        "この状況は良い方向へ向かいますか？",
      ],
    },
  },
  {
    slug: "two-choices-tarot-reading",
    spreadId: "decision_ab",
    romanNumeral: "XIX",
    cardCount: 5,
    badge: "Path Comparison",
    heroCardId: "major_19_sun",
    isTwoChoices: true,
    name: {
      en: "Two Choices Reading",
      hi: "दो विकल्प तुलना टैरो",
      ja: "二者択一リーディング",
    },
    subtitle: {
      en: "Navigate between two options",
      hi: "दो रास्तों और विकल्पों के बीच तुलना करें",
      ja: "2つの選択肢の間を的確に見極める",
    },
    description: {
      en: "Stand at the crossroads with total clarity. Compare Option A vs Option B across near-term realities and long-term spiritual fruition.",
      hi: "दो रास्तों के दोराहे पर स्पष्टता पाएं। विकल्प क और विकल्प ख के तात्कालिक और दूरगामी परिणामों की तुलना करें।",
      ja: "選択肢Aと選択肢Bの短期的な展開と長期的な結実を詳細に比較し、最善の決断をサポートします。",
    },
    defaultQuestion: {
      en: "Which path aligns best with my highest growth?",
      hi: "मेरे विकास और सफलता के लिए कौन सा रास्ता सर्वश्रेष्ठ है?",
      ja: "どちらの道が私の魂の成長に最も調和していますか？",
    },
    chips: {
      en: [
        "Which path serves my highest expansion?",
        "Option A vs Option B: what are the true outcomes?",
        "Should I stay where I am or embark on the new offer?",
      ],
      hi: [
        "विकल्प क और ख में से कौन सा बेहतर रहेगा?",
        "क्या मुझे नई राह चुननी चाहिए या वर्तमान में बने रहना चाहिए?",
      ],
      ja: [
        "道Aと道B、どちらが真の成果をもたらしますか？",
        "現状維持と新たな挑戦、どちらを選ぶべきでしょうか？",
      ],
    },
  },
  {
    slug: "love-tarot-reading",
    spreadId: "love_reading",
    romanNumeral: "XIV",
    cardCount: 3,
    badge: "Heart & Romance",
    heroCardId: "major_14_temperance",
    name: {
      en: "Love reading",
      hi: "प्रेम और दिल का टैरो",
      ja: "愛のタロットリーディング",
    },
    subtitle: {
      en: "Explore what's ahead in your love life",
      hi: "अपने प्रेम जीवन में आने वाले मोड़ों को जानें",
      ja: "あなたの愛の行方を見通す",
    },
    description: {
      en: "Unveil the sacred dynamics of your heart space. Discover emotional truths, romantic currents, and where your love journey is heading.",
      hi: "अपने दिल की सच्चाई और प्रेम संबंधों की ऊर्जा को समझें। जानें कि आपका प्रेम जीवन किस दिशा में अग्रसर है।",
      ja: "あなたの心の真実、恋愛のダイナミクス、そして未来の可能性を照らす3枚の愛のスプレッド。",
    },
    defaultQuestion: {
      en: "What energy and direction is entering my love life?",
      hi: "मेरे प्रेम जीवन में कौन सी ऊर्जा और बदलाव आ रहे हैं?",
      ja: "私の恋愛にいま訪れているエネルギーと未来の行方は？",
    },
    chips: {
      en: [
        "What is entering my love life soon?",
        "What does my heart truly need right now?",
        "How can I attract genuine, soulful love?",
        "What lessons are currently active in my romantic sphere?",
      ],
      hi: [
        "मेरे प्रेम जीवन में आगे क्या लिखा है?",
        "सच्चे और गहरे प्रेम को आकर्षित करने के लिए क्या करूं?",
        "मेरे रिश्ते की आंतरिक स्थिति क्या है?",
      ],
      ja: [
        "私の恋愛にはどのような展開が待っていますか？",
        "心通うパートナーシップを築くための助言をください。",
        "いま私の心が本当に求めている愛の形とは？",
      ],
    },
  },
  {
    slug: "relationship-tarot-reading",
    spreadId: "relationship_reading",
    romanNumeral: "VI",
    cardCount: 3,
    badge: "Soul Connection",
    heroCardId: "major_06_lovers",
    name: {
      en: "Relationship Reading",
      hi: "रिश्ता स्पष्टता टैरो",
      ja: "関係性リーディング",
    },
    subtitle: {
      en: "Gain clarity on a relationship",
      hi: "किसी भी रिश्ते में स्पष्टता और गहराई लाएं",
      ja: "大切な関係性に深い明晰さをもたらす",
    },
    description: {
      en: "Illuminates both sides of a sacred connection: your mindset, their emotional truth, and the shared bridge for mutual peace and growth.",
      hi: "रिश्ते के दोनों पक्षों को उजागर करें: आपका दृष्टिकोण, उनका नज़रिया और संबंध को मजबूत बनाने की सलाह।",
      ja: "あなたと相手の想い、そして二人が紡ぐ絆の現在地と調和のための具体的アドバイス。",
    },
    defaultQuestion: {
      en: "How can we foster harmony and resolve tension in this connection?",
      hi: "इस रिश्ते में सामंजस्य कैसे बढ़ाएं और दूरियां कैसे मिटाएं?",
      ja: "この関係における調和と相互理解をどのように深められますか？",
    },
    chips: {
      en: [
        "What are their unspoken feelings towards me?",
        "How can we heal misunderstandings and grow closer?",
        "What is the higher spiritual purpose of our bond?",
        "Where is this relationship headed over the coming months?",
      ],
      hi: [
        "उनके दिल में मेरे लिए क्या भावनाएं हैं?",
        "हम अपने रिश्ते में मतभेद कैसे सुलझा सकते हैं?",
        "हमारे इस बंधन का भविष्य क्या है?",
      ],
      ja: [
        "相手が胸の内に秘めている本音は何ですか？",
        "二人のすれ違いを癒し、絆を深めるには？",
        "この関係性が向かうべき未来の方向性は？",
      ],
    },
  },
  {
    slug: "question-tarot-reading",
    spreadId: "question_reading",
    romanNumeral: "XVIII",
    cardCount: 3,
    badge: "Direct Clarity",
    heroCardId: "major_18_moon",
    name: {
      en: "Question Reading",
      hi: "प्रश्न टैरो",
      ja: "質問タロットリーディング",
    },
    subtitle: {
      en: "Get a clear answer to any question, personal or professional",
      hi: "किसी भी व्यक्तिगत या करियर प्रश्न का सीधा उत्तर पाएं",
      ja: "仕事や人生のあらゆる問いへの明確な回答",
    },
    description: {
      en: "Ask any focused question about career, family, finances, or personal purpose, and uncover the foundation, unseen factors, and direct advice.",
      hi: "करियर, परिवार या व्यक्तिगत जीवन से जुड़ा कोई भी प्रश्न पूछें और संपूर्ण समाधान प्राप्त करें।",
      ja: "キャリアや人生の転機におけるあらゆる質問に対し、現状の本質と見えざる要因、そして明確な解決策を導きます。",
    },
    defaultQuestion: {
      en: "What should I know regarding my current challenge?",
      hi: "मेरी वर्तमान चुनौती के संबंध में मुझे क्या जानना चाहिए?",
      ja: "直面している課題について知るべき核心は何ですか？",
    },
    chips: {
      en: [
        "What is the true underlying cause of this issue?",
        "What unexpected factor am I overlooking?",
        "What is the best strategic action to take now?",
        "How will this professional opportunity unfold?",
      ],
      hi: [
        "इस समस्या का मुख्य कारण क्या है?",
        "मुझे इस समय क्या कदम उठाना चाहिए?",
        "आने वाले समय में करियर में क्या बदलाव दिख रहे हैं?",
      ],
      ja: [
        "この状況の根底にある真の課題は何ですか？",
        "見落としている重要な要因は何でしょうか？",
        "今取るべき最も賢明な行動とは？",
      ],
    },
  },
  {
    slug: "month-ahead-tarot-reading",
    spreadId: "month_ahead_reading",
    romanNumeral: "IX",
    cardCount: 4,
    badge: "4-Week Forecast",
    heroCardId: "major_09_hermit",
    name: {
      en: "Month-Ahead Reading",
      hi: "मासिक टैरो भविष्यवाणी",
      ja: "マンスアヘッド・リーディング",
    },
    subtitle: {
      en: "See what the next four weeks have in store",
      hi: "जानें आगामी चार सप्ताह आपके लिए क्या लेकर आ रहे हैं",
      ja: "これからの4週間に何が待ち受けているかを見通す",
    },
    description: {
      en: "A comprehensive 4-week prophetic journey: map out weekly shifts, navigate upcoming tests, and optimize your personal milestones for the month.",
      hi: "आने वाले चार हफ्तों का संपूर्ण मानचित्र: सप्ताह-दर-सप्ताह ऊर्जा, चुनौतियां और उपलब्धियां जानें।",
      ja: "週ごとのテーマ、試練、そして結実を詳細に予見し、これからの1ヶ月を豊かに歩むためのロードマップ。",
    },
    defaultQuestion: {
      en: "What energies and milestones await me across the next four weeks?",
      hi: "आने वाले 4 हफ्तों में मेरे लिए क्या अवसर और चुनौतियां हैं?",
      ja: "これからの4週間に訪れるエネルギーと重要な転換点は？",
    },
    chips: {
      en: [
        "What are the major themes for the next 4 weeks?",
        "Which week requires my greatest vigilance and care?",
        "Where will I see the strongest breakthrough and success?",
        "How will this month conclude energetically?",
      ],
      hi: [
        "आगामी महीने की मुख्य ऊर्जा क्या रहेगी?",
        "किस सप्ताह में मुझे विशेष सावधानी रखनी होगी?",
        "महीने के अंत में मुझे क्या परिणाम मिलेंगे?",
      ],
      ja: [
        "今月の主要なテーマと展開はどうなりますか？",
        "特に注意を払うべき週とその乗り越え方は？",
        "この1ヶ月を通じて得られる最大の成果は何ですか？",
      ],
    },
  },
  {
    slug: "career-tarot-reading",
    spreadId: "career_reading",
    romanNumeral: "IV",
    cardCount: 3,
    badge: "Career & Wealth",
    heroCardId: "major_04_emperor",
    name: {
      en: "Career & Purpose",
      hi: "करियर और जीवन उद्देश्य",
      ja: "キャリア＆ライフパーパス",
    },
    subtitle: {
      en: "Unlock professional breakthroughs & financial clarity",
      hi: "कार्यक्षेत्र, धन और उन्नति में स्पष्ट दिशा पाएं",
      ja: "仕事の転機、才能の開花、成功への道筋",
    },
    description: {
      en: "Illuminate your professional trajectory, wealth currents, vocational calling, and the most auspicious strategic move for success.",
      hi: "अपने करियर, धन, पदोन्नति और जीवन के सही उद्देश्य की दिशा में दिव्य मार्गदर्शन प्राप्त करें।",
      ja: "仕事の展望、キャリア転換、才能の開花、そして成功への具体的戦略を導き出します。",
    },
    defaultQuestion: {
      en: "What strategic move will unlock my highest career potential?",
      hi: "मेरे करियर और धन के क्षेत्र में आगे क्या अवसर हैं?",
      ja: "私のキャリアと経済面でどのような好転が待っていますか？",
    },
    chips: {
      en: [
        "What is the best strategic move for my career right now?",
        "How can I unlock greater financial abundance?",
        "Should I transition to a new job or double down here?",
        "What hidden opportunity am I not seeing in my work?",
      ],
      hi: [
        "मुझे अपने करियर में अभी क्या कदम उठाना चाहिए?",
        "क्या यह नौकरी बदलने का सही समय है?",
        "मेरे कार्यक्षेत्र में कौन सा नया अवसर आ रहा है?",
      ],
      ja: [
        "今、仕事で取るべき最も賢明な行動は何ですか？",
        "転職や新しい挑戦に踏み出すべき時期ですか？",
        "仕事で見落としている重要なチャンスとは？",
      ],
    },
  },
];

/**
 * Top 4 Highest-Demand Curated Readings globally
 * (1: Yes/No, 2: Love & Romance, 3: Career & Wealth, 4: Card of the Day)
 */
export const FEATURED_READING_TYPES: ReadingTypeConfig[] = [
  READING_TYPES.find((r) => r.slug === "card-of-the-day")!,
  READING_TYPES.find((r) => r.slug === "yes-or-no-tarot")!,
  READING_TYPES.find((r) => r.slug === "love-tarot-reading")!,
  READING_TYPES.find((r) => r.slug === "career-tarot-reading")!,
];

export function getReadingTypeBySlug(slug: string): ReadingTypeConfig | undefined {
  return READING_TYPES.find((rt) => rt.slug === slug);
}

export function getReadingTypeBadge(config: ReadingTypeConfig, locale: Locale): string {
  if (config.badgeMap && config.badgeMap[locale]) {
    return config.badgeMap[locale]!;
  }
  if (locale === "ja") {
    switch (config.slug) {
      case "card-of-the-day": return "無料デイリー";
      case "yes-or-no-tarot": return "即答イエス／ノー";
      case "two-choices-tarot-reading": return "二者択一・進路決定";
      case "love-tarot-reading": return "愛とロマンス";
      case "relationship-tarot-reading": return "二人の絆・深層心理";
      case "question-tarot-reading": return "あらゆる問いへの指針";
      case "month-ahead-tarot-reading": return "今月の運勢・4週間";
      case "career-tarot-reading": return "天職・キャリア開花";
      default: return config.badge;
    }
  }
  if (locale === "hi") {
    switch (config.slug) {
      case "card-of-the-day": return "निःशुल्क दैनिक ड्रा";
      case "yes-or-no-tarot": return "तुरंत हाँ या ना";
      case "two-choices-tarot-reading": return "द्विमार्गी निर्णय";
      case "love-tarot-reading": return "प्रेम और संबंध";
      case "relationship-tarot-reading": return "गहरा संबंध विश्लेषण";
      case "question-tarot-reading": return "स्पष्ट उत्तर मार्गदर्शन";
      case "month-ahead-tarot-reading": return "मासिक पूर्वानुमान";
      case "career-tarot-reading": return "करियर और उद्देश्य";
      default: return config.badge;
    }
  }
  return config.badge;
}

