export interface CrisisCheckResult {
  isCrisis: boolean;
  message?: {
    en: string;
    hi: string;
    ja: string;
  };
  helplines?: {
    region: string;
    contact: string;
  }[];
}

const CRISIS_PATTERNS = [
  /\b(suicide|kill\s+(myself|me)|end\s+my\s+life|want\s+to\s+die|self[\s-]?harm|cutting\s+myself)\b/i,
  /(आत्महत्या|जान\s*देना|खुद\s*को\s*मारना|जीना\s*नहीं\s*चाहता)/i,
  /(自殺|死にたい|自傷|命を絶つ)/i,
];

export function checkCrisisIntent(input: string): CrisisCheckResult {
  if (!input || typeof input !== "string") {
    return { isCrisis: false };
  }

  const isMatched = CRISIS_PATTERNS.some((pattern) => pattern.test(input));

  if (isMatched) {
    return {
      isCrisis: true,
      message: {
        en: "Your presence in this world is deeply precious. While tarot offers mirrors for contemplative reflection, we want you to be supported right now by caring, trained human listeners.",
        hi: "इस संसार में आपकी उपस्थिति अत्यंत मूल्यवान है। टैरो केवल आत्म-चिंतन का एक माध्यम है, परंतु इस समय आपका किसी प्रशिक्षित और संवेदनशील व्यक्ति से बात करना आवश्यक है।",
        ja: "あなたの存在はかけがえのない大切なものです。タロットは自己対話のための鏡ですが、いま何よりも必要なのは温かく支えてくれる専門家との対話です。",
      },
      helplines: [
        { region: "US & Canada", contact: "Call or text 988 (Suicide & Crisis Lifeline)" },
        { region: "United Kingdom", contact: "Call 111 (NHS Mental Health) or 116 123 (Samaritans)" },
        { region: "India", contact: "Vandrevala Foundation: +91 9999 666 555 | Tele-MANAS: 14416" },
        { region: "Japan", contact: "TELL Lifeline: 03-5774-0992 | よりそいホットライン: 0120-279-338" },
        { region: "International", contact: "https://findahelpline.com" },
      ],
    };
  }

  return { isCrisis: false };
}
