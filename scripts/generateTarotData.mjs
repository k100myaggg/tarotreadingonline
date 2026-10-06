import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const majorArcanaData = [
  {
    id: "major_00_fool",
    number: 0,
    name: { en: "The Fool", hi: "द फूल (मूर्ख)", ja: "愚者" },
    element: "air",
    association: "Uranus",
    keywords: {
      upright: ["new beginnings", "innocence", "spontaneity", "leap of faith"],
      reversed: ["recklessness", "risk-taking", "naivety", "hesitation"]
    },
    meanings: {
      upright: "A call to embark upon a brave new journey with an untroubled spirit. Trust in the cosmos and step off the cliff edge with confidence.",
      reversed: "A warning against reckless impulsivity or staying paralyzed at the threshold when intuition calls for a leap."
    },
    symbolism: ["white rose", "cliff edge", "small companion dog", "shining sun", "wandering pack"],
    numerology: 0
  },
  {
    id: "major_01_magician",
    number: 1,
    name: { en: "The Magician", hi: "द मैजिशियन (जादूगर)", ja: "魔術師" },
    element: "air",
    association: "Mercury",
    keywords: {
      upright: ["manifestation", "resourcefulness", "inspired action", "mastery"],
      reversed: ["manipulation", "latent talent", "scattered energy", "trickery"]
    },
    meanings: {
      upright: "You hold all four tools upon the altar: mind, passion, emotion, and substance. Channel divine will into tangible reality.",
      reversed: "Potential left dormant, or willpower clouded by deception. Align your inner motive before executing outer action."
    },
    symbolism: ["infinity sign (lemniscate)", "ouroboros belt", "altar table", "four suit symbols", "red roses and white lilies"],
    numerology: 1
  },
  {
    id: "major_02_high_priestess",
    number: 2,
    name: { en: "The High Priestess", hi: "द हाई प्रीस्टेस (प्रधान पुजारिन)", ja: "女教皇" },
    element: "water",
    association: "Moon",
    keywords: {
      upright: ["intuition", "sacred knowledge", "divine feminine", "subconscious mind"],
      reversed: ["secretiveness", "disconnected intuition", "repressed feelings", "superficiality"]
    },
    meanings: {
      upright: "Sit quietly between the twin pillars of light and shadow. The answer you seek is not in external noise, but in silent inner knowing.",
      reversed: "You are ignoring your intuitive whispers in favor of logical rationalizations. Return to stillness and listen."
    },
    symbolism: ["twin pillars Boaz and Jachin", "pomegranate veil", "crescent moon", "TORA scroll", "blue robes"],
    numerology: 2
  },
  {
    id: "major_03_empress",
    number: 3,
    name: { en: "The Empress", hi: "द एम्प्रेस (महारानी)", ja: "女帝" },
    element: "earth",
    association: "Venus",
    keywords: {
      upright: ["abundance", "fertility", "nurturing", "sensory beauty", "creativity"],
      reversed: ["creative block", "overdependence", "depletion", "smothering"]
    },
    meanings: {
      upright: "A golden season of fruition, creative birth, and sensory nourishment. Nature blossoms around your endeavors.",
      reversed: "Overgiving has drained your inner spring. Prioritize radical self-care and restore harmony with your physical vessel."
    },
    symbolism: ["twelve-star crown", "pomegranate gown", "wheat field", "waterfall", "Venusian shield"],
    numerology: 3
  },
  {
    id: "major_04_emperor",
    number: 4,
    name: { en: "The Emperor", hi: "द एम्परर (सम्राट)", ja: "皇帝" },
    element: "fire",
    association: "Aries",
    keywords: {
      upright: ["authority", "structure", "discipline", "protective power", "stability"],
      reversed: ["tyranny", "rigidity", "loss of control", "inefficiency"]
    },
    meanings: {
      upright: "Erect stable boundaries and build structures built to endure. Calm leadership and disciplined focus will secure victory.",
      reversed: "Stubborn micromanagement or chaotic lack of discipline. Distinguish legitimate authority from arbitrary control."
    },
    symbolism: ["stone throne with rams' heads", "ankh scepter", "orb of sovereignty", "red armor", "arid mountain backdrop"],
    numerology: 4
  },
  {
    id: "major_05_hierophant",
    number: 5,
    name: { en: "The Hierophant", hi: "द हायरोफेंट (धर्माचार्य)", ja: "法皇" },
    element: "earth",
    association: "Taurus",
    keywords: {
      upright: ["spiritual tradition", "mentorship", "shared beliefs", "higher wisdom"],
      reversed: ["rebellion", "blind orthodoxy", "dogma", "unconventional paths"]
    },
    meanings: {
      upright: "Seek wisdom from proven traditions, reputable lineages, or an enlightened mentor. Conformity to timeless principles brings peace.",
      reversed: "Breaking free from suffocating dogma. Construct your own internal spiritual philosophy rather than following outdated scripts."
    },
    symbolism: ["triple crown", "papal cross", "crossed golden keys", "twin acolytes", "sacred pillars"],
    numerology: 5
  },
  {
    id: "major_06_lovers",
    number: 6,
    name: { en: "The Lovers", hi: "द लवर्स (प्रेमी)", ja: "恋人" },
    element: "air",
    association: "Gemini",
    keywords: {
      upright: ["sacred union", "harmony", "moral alignment", "life choice"],
      reversed: ["disharmony", "internal conflict", "misaligned values", "hasty decisions"]
    },
    meanings: {
      upright: "A profound soul union and an essential crossroads of personal values. Choosing with total integrity unites polarities.",
      reversed: "A misalignment between heart and actions, or tension within a core relationship. Re-examine the principles you stand for."
    },
    symbolism: ["Archangel Raphael", "Adam and Eve", "Tree of Life and Tree of Knowledge", "volcano peak", "radiant sun"],
    numerology: 6
  },
  {
    id: "major_07_chariot",
    number: 7,
    name: { en: "The Chariot", hi: "द चेरियट (विजयी रथ)", ja: "戦車" },
    element: "water",
    association: "Cancer",
    keywords: {
      upright: ["willpower", "triumph", "focused intent", "overcoming obstacles"],
      reversed: ["loss of direction", "aggression", "force without finesse", "obstacle paralysis"]
    },
    meanings: {
      upright: "Harmonizing opposing forces through pure resolve. Direct the black and white sphinxes with the reins of mental clarity toward your goal.",
      reversed: "Reins slipping from your grasp. Either aggressive brute force is backfiring, or momentum has stalled through indecision."
    },
    symbolism: ["starry canopy", "twin sphinxes", "armor with crescent moons", "walled fortress", "winged shield"],
    numerology: 7
  },
  {
    id: "major_08_strength",
    number: 8,
    name: { en: "Strength", hi: "स्ट्रेंग्थ (आत्मबल)", ja: "力" },
    element: "fire",
    association: "Leo",
    keywords: {
      upright: ["courage", "gentle mastery", "compassion", "inner fortitude"],
      reversed: ["self-doubt", "raw instinctual outburst", "exhaustion", "timidity"]
    },
    meanings: {
      upright: "True power does not conquer with the sword; it calms the roaring lion with an open hand, immense patience, and radical love.",
      reversed: "Doubt creeping into your spirit, or primal anger spilling out uncontrolled. Tame your inner beasts with gentleness, not shame."
    },
    symbolism: ["infinity lemniscate", "lion gently held", "garland of roses", "white robe", "peaceful golden background"],
    numerology: 8
  },
  {
    id: "major_09_hermit",
    number: 9,
    name: { en: "The Hermit", hi: "द हर्मिट (एकांतवासी ज्ञानी)", ja: "隠者" },
    element: "earth",
    association: "Virgo",
    keywords: {
      upright: ["solitude", "inner light", "soul searching", "philosophical guidance"],
      reversed: ["isolation", "loneliness", "withdrawing out of fear", "ignoring counsel"]
    },
    meanings: {
      upright: "Retreat from worldly chatter into the tranquil sanctuary of self-inquiry. The lantern you hold illuminates the single next step.",
      reversed: "Loneliness disguised as wisdom. Emerging back into the warmth of fellowship is now required; do not hide in shadows."
    },
    symbolism: ["six-pointed star lantern", "pilgrim's staff", "grey cloak", "snow-covered mountain peak"],
    numerology: 9
  },
  {
    id: "major_10_wheel_of_fortune",
    number: 10,
    name: { en: "Wheel of Fortune", hi: "व्हील ऑफ फॉर्च्यून (भाग्य चक्र)", ja: "運命の輪" },
    element: "fire",
    association: "Jupiter",
    keywords: {
      upright: ["cycles of destiny", "karmic turning point", "luck", "inevitable change"],
      reversed: ["bad luck", "resisting inevitable change", "setbacks", "breaking cycles"]
    },
    meanings: {
      upright: "The cosmic wheel turns inexorably. A stroke of destiny shifts the board in your favor. Remain centered at the wheel's still hub.",
      reversed: "Temporary downturns in external fortune. Recognize the pattern repeating in your life so you may consciously step off the karmic loop."
    },
    symbolism: ["letters TARO / ROTA", "Hebrew Tetragrammaton", "winged creatures of the four Evangelists", "Anubis and Typhon", "Sphinx with sword"],
    numerology: 10
  },
  {
    id: "major_11_justice",
    number: 11,
    name: { en: "Justice", hi: "जस्टिस (न्याय)", ja: "正義" },
    element: "air",
    association: "Libra",
    keywords: {
      upright: ["truth", "karmic fairness", "cause and effect", "clear perception"],
      reversed: ["unfairness", "dishonesty", "bias", "evading accountability"]
    },
    meanings: {
      upright: "The two-edged sword cuts away delusion while the golden scales weigh deeds with total impartiality. Truth emerges victorious.",
      reversed: "Unequal treatment, self-deception, or rationalizing an unfair compromise. Own your part in the equation with courage."
    },
    symbolism: ["upright double-edged sword", "golden balance scales", "purple veil", "stone pillars", "square clasp"],
    numerology: 11
  },
  {
    id: "major_12_hanged_man",
    number: 12,
    name: { en: "The Hanged Man", hi: "द हैंग्ड मैन (समर्पित दृष्टा)", ja: "吊るされた男" },
    element: "water",
    association: "Neptune",
    keywords: {
      upright: ["surrender", "new perspective", "sacred pause", "enlightenment through letting go"],
      reversed: ["pointless martyrdom", "stagnation", "resistance", "indecision"]
    },
    meanings: {
      upright: "Voluntary stillness. By hanging upside down in sacred surrender, worldly paradigms invert and profound spiritual clarity descends.",
      reversed: "Martyring yourself for no constructive purpose, or struggling against a necessary period of incubation. Let go of the struggle."
    },
    symbolism: ["living wooden T-cross", "golden halo", "crossed leg (figure 4)", "calm serene face", "inverted viewpoint"],
    numerology: 12
  },
  {
    id: "major_13_death",
    number: 13,
    name: { en: "Death", hi: "डेथ (रूपांतरण / काल)", ja: "死神" },
    element: "water",
    association: "Scorpio",
    keywords: {
      upright: ["profound transformation", "end of an era", "rebirth", "shedding the old"],
      reversed: ["clinging to decay", "fear of change", "lingering stagnation", "delayed rebirth"]
    },
    meanings: {
      upright: "A definitive closing of an outdated chapter so life may renew itself. The black armor clears the field; sunrise gleams on the horizon.",
      reversed: "White-knuckling onto dead roots out of terror of the void. Allow the dry leaves to fall so spring may blossom."
    },
    symbolism: ["mystic white rose banner", "rising golden sun between towers", "skeletal knight in black armor", "fallen king and praying child", "river of life"],
    numerology: 13
  },
  {
    id: "major_14_temperance",
    number: 14,
    name: { en: "Temperance", hi: "टेम्परेंस (संतुलन / सामंजस्य)", ja: "節制" },
    element: "fire",
    association: "Sagittarius",
    keywords: {
      upright: ["alchemy", "moderation", "patience", "synthesis of opposites"],
      reversed: ["excess", "imbalance", "hastiness", "clashing elements"]
    },
    meanings: {
      upright: "The angel pours the liquid of life between two golden urns without spilling a drop. Practice gentle patience and harmonizing balance.",
      reversed: "Extreme swings, overindulgence, or pushing for immediate answers before the potion has properly brewed. Seek the middle path."
    },
    symbolism: ["winged angel", "pouring water between two cups", "one foot in water and one on land", "blooming irises", "distant crowned mountain"],
    numerology: 14
  },
  {
    id: "major_15_devil",
    number: 15,
    name: { en: "The Devil", hi: "द डेविल (माया / बंधन)", ja: "悪魔" },
    element: "earth",
    association: "Capricorn",
    keywords: {
      upright: ["shadow self", "attachments", "material illusions", "breaking chains"],
      reversed: ["freedom", "reclaiming autonomy", "overcoming addiction", "seeing through illusion"]
    },
    meanings: {
      upright: "Notice that the chains around the human necks are loose enough to lift off at any moment. Confront your shadow and dismantle self-imposed bondage.",
      reversed: "The illusion cracks; you are waking up to freedom. Breaking destructive loops and regaining sovereignty over your psyche."
    },
    symbolism: ["horned Baphomet figure", "loose chains around neck", "inverted pentagram", "half-cube pedestal", "torch touching grapes"],
    numerology: 15
  },
  {
    id: "major_16_tower",
    number: 16,
    name: { en: "The Tower", hi: "द टॉवर (अचानक जागृति / ध्वंस)", ja: "塔" },
    element: "fire",
    association: "Mars",
    keywords: {
      upright: ["sudden revelation", "shattering of false structures", "liberation", "breakthrough"],
      reversed: ["disaster averted", "delaying inevitable collapse", "fear of suffering"]
    },
    meanings: {
      upright: "A divine bolt of lightning strikes the crown of ego-built fortresses. What felt secure was built on falsehood; welcome the liberating truth.",
      reversed: "Clinging to a crumbling foundation or barely dodging an acute shock. Rebuild upon bedrock rather than brittle pride."
    },
    symbolism: ["lightning striking crown", "falling figures", "flames from windows", "rocky crag foundation", "twenty-two drops of fire"],
    numerology: 16
  },
  {
    id: "major_17_star",
    number: 17,
    name: { en: "The Star", hi: "द स्टार (आशा / दिव्य प्रकाश)", ja: "星" },
    element: "air",
    association: "Aquarius",
    keywords: {
      upright: ["hope", "serenity", "spiritual blessing", "inspiration", "renewal"],
      reversed: ["discouragement", "cynicism", "despair", "dimmed faith"]
    },
    meanings: {
      upright: "After the tempest, the evening star shines with celestial radiance. Drink deeply from peace, hope, and cosmic alignment.",
      reversed: "Loss of belief and temporary disillusionment. The star still burns above; lift your eyes from the mud and reconnect to your dreams."
    },
    symbolism: ["eight-pointed golden star", "seven smaller stars", "maiden pouring water on earth and pool", "ibis bird on acacia tree"],
    numerology: 17
  },
  {
    id: "major_18_moon",
    number: 18,
    name: { en: "The Moon", hi: "द मून (रहस्य / भ्रम)", ja: "月" },
    element: "water",
    association: "Pisces",
    keywords: {
      upright: ["subconscious", "dreams", "unconscious fear", "illusion", "intuition in fog"],
      reversed: ["fog lifting", "release of fear", "truth unmasked", "misinterpretation"]
    },
    meanings: {
      upright: "The winding path through the shadows where wolves howl and the crayfish emerges from the deep. Do not mistake night shadows for reality.",
      reversed: "Clarity returns as dawn nears. Secrets are brought to light, and lingering anxieties dissolve in the warmth of day."
    },
    symbolism: ["full moon with droplets", "dog and wolf howling", "crayfish crawling from pool", "twin towers", "winding path into mountains"],
    numerology: 18
  },
  {
    id: "major_19_sun",
    number: 19,
    name: { en: "The Sun", hi: "द सन (उल्लास / तेज)", ja: "太陽" },
    element: "fire",
    association: "Sun",
    keywords: {
      upright: ["joy", "vitality", "triumph", "radiant clarity", "exuberance"],
      reversed: ["temporary cloudiness", "unrealized optimism", "need for humility"]
    },
    meanings: {
      upright: "Unclouded brilliance, child-like vitality, and overflowing warmth. Everything you touch is blessed with clarity and success.",
      reversed: "The sun is behind passing clouds; warmth remains, but confidence may be briefly shaken. Focus on gratitude to restore your light."
    },
    symbolism: ["radiant smiling sun", "naked child on white horse", "red feather and banner", "sunflower wall", "straight and wavy rays"],
    numerology: 19
  },
  {
    id: "major_20_judgement",
    number: 20,
    name: { en: "Judgement", hi: "जजमेंट (महान पुकार / पुनर्जन्म)", ja: "審判" },
    element: "fire",
    association: "Pluto",
    keywords: {
      upright: ["spiritual awakening", "reckoning", "calling", "absolution"],
      reversed: ["self-doubt", "ignoring the call", "harsh self-criticism", "regret"]
    },
    meanings: {
      upright: "The archangel sounds the golden trumpet. Rise from the crypts of past mistakes, absolved and transformed. Answer your highest vocation.",
      reversed: "Paralyzed by remorse or second-guessing an intuitive awakening. Forgive your past self; the past has no claim on you."
    },
    symbolism: ["Archangel Gabriel with banner", "trumpet call", "figures rising from stone crypts with open arms", "ocean and icy peaks"],
    numerology: 20
  },
  {
    id: "major_21_world",
    number: 21,
    name: { en: "The World", hi: "द वर्ल्ड (पूर्णता / ब्रह्मांड)", ja: "世界" },
    element: "earth",
    association: "Saturn",
    keywords: {
      upright: ["fulfillment", "wholeness", "completion of cycle", "cosmic integration"],
      reversed: ["unfinished business", "seeking closure", "shortcuts", "stalled completion"]
    },
    meanings: {
      upright: "The cosmic dance is complete. All elements synthesize into unbroken harmony. Celebrate your triumph and prepare for the next spiraling octave.",
      reversed: "Almost at the finish line, but one lingering loose end needs tying up. Do not quit before crossing the threshold of true closure."
    },
    symbolism: ["green laurel wreath", "dancing figure with twin wands", "red ribbons", "four cherubic elemental beasts in four corners"],
    numerology: 21
  }
];

const suitsConfig = [
  {
    suit: "wands",
    element: "fire",
    nameEn: "Wands",
    nameHi: "वांड्स (लाठी/अग्नि)",
    nameJa: "ワンド（杖）",
    theme: "Passion, willpower, action, inspiration, vitality"
  },
  {
    suit: "cups",
    element: "water",
    nameEn: "Cups",
    nameHi: "कप्स (प्याले/जल)",
    nameJa: "カップ（杯）",
    theme: "Emotions, intuition, love, relationships, spiritual flow"
  },
  {
    suit: "swords",
    element: "air",
    nameEn: "Swords",
    nameHi: "स्वॉर्ड्स (तलवार/वायु)",
    nameJa: "ソード（剣）",
    theme: "Intellect, truth, mental clarity, conflict, perception"
  },
  {
    suit: "pentacles",
    element: "earth",
    nameEn: "Pentacles",
    nameHi: "पेंटाकल्स (सिक्के/पृथ्वी)",
    nameJa: "ペンタクル（金貨）",
    theme: "Material world, wealth, career, physical body, craftsmanship"
  }
];

const minorRanks = [
  {
    rank: 1,
    slug: "ace",
    title: { en: "Ace of {suit}", hi: "ऐस ऑफ {suit}", ja: "{suit}のエース" },
    uprightKw: ["fresh spark", "new opportunity", "raw potential", "divine gift"],
    reversedKw: ["missed opportunity", "hesitation", "stifled potential", "false start"],
    uprightMeaning: "The pure primordial seed of {suitElement} offered from the heavens. Seize this raw potential with both hands.",
    reversedMeaning: "A delay in manifesting this fresh spark, or ignoring an inspired opening."
  },
  {
    rank: 2,
    slug: "two",
    title: { en: "Two of {suit}", hi: "टू ऑफ {suit}", ja: "{suit}の2" },
    uprightKw: ["planning", "decisions", "balance", "partnership"],
    reversedKw: ["indecision", "imbalance", "conflict of interest", "overextended"],
    uprightMeaning: "Weighing choices and balancing dual forces within the domain of {suit}.",
    reversedMeaning: "Difficulty maintaining equilibrium or hesitating to commit to a direction."
  },
  {
    rank: 3,
    slug: "three",
    title: { en: "Three of {suit}", hi: "थ्री ऑफ {suit}", ja: "{suit}の3" },
    uprightKw: ["expansion", "collaboration", "initial progress", "growth"],
    reversedKw: ["delays", "creative friction", "lack of teamwork", "setbacks"],
    uprightMeaning: "The first tangible fruit of your effort; synthesis and momentum are taking hold.",
    reversedMeaning: "Friction in execution or frustration with early results; patience is required."
  },
  {
    rank: 4,
    slug: "four",
    title: { en: "Four of {suit}", hi: "फोर ऑफ {suit}", ja: "{suit}の4" },
    uprightKw: ["foundation", "stability", "security", "consolidation"],
    reversedKw: ["rigidity", "boredom", "fear of loss", "instability"],
    uprightMeaning: "A solid sanctuary and resting point where energy is safely held and protected.",
    reversedMeaning: "Holding on too tightly or feeling trapped by comfortable confinement."
  },
  {
    rank: 5,
    slug: "five",
    title: { en: "Five of {suit}", hi: "फाइव ऑफ {suit}", ja: "{suit}の5" },
    uprightKw: ["challenge", "conflict", "inflection point", "growth through tension"],
    reversedKw: ["resolution", "compromise", "prolonged struggle", "healing"],
    uprightMeaning: "Disruption that tests your resilience and forces a necessary upgrade in perception.",
    reversedMeaning: "Easing of the struggle or learning to let go of unnecessary competitive friction."
  },
  {
    rank: 6,
    slug: "six",
    title: { en: "Six of {suit}", hi: "सिक्स ऑफ {suit}", ja: "{suit}の6" },
    uprightKw: ["harmony", "victory", "reconciliation", "generosity"],
    reversedKw: ["imbalance", "delayed recognition", "one-sidedness", "nostalgia"],
    uprightMeaning: "Sweet relief and harmonious flow restored after the five's stormy trials.",
    reversedMeaning: "Conditional support or looking backward instead of moving forward."
  },
  {
    rank: 7,
    slug: "seven",
    title: { en: "Seven of {suit}", hi: "सेवन ऑफ {suit}", ja: "{suit}の7" },
    uprightKw: ["strategy", "discernment", "perseverance", "inner assessment"],
    reversedKw: ["overwhelm", "poor strategy", "giving up", "compromised ethics"],
    uprightMeaning: "A test of character requiring wise strategy, boundaries, and patience.",
    reversedMeaning: "Feeling cornered or recognizing that an old approach is no longer sustainable."
  },
  {
    rank: 8,
    slug: "eight",
    title: { en: "Eight of {suit}", hi: "एट ऑफ {suit}", ja: "{suit}の8" },
    uprightKw: ["mastery", "acceleration", "dedicated focus", "rapid movement"],
    reversedKw: ["burnout", "haste", "scattered efforts", "misdirected energy"],
    uprightMeaning: "Focused craftsmanship and rapid transmission of energy toward concrete outcomes.",
    reversedMeaning: "Frustration with slow pacing or feeling rushed into sloppy decisions."
  },
  {
    rank: 9,
    slug: "nine",
    title: { en: "Nine of {suit}", hi: "नाइन ऑफ {suit}", ja: "{suit}の9" },
    uprightKw: ["resilience", "near completion", "inner strength", "gratitude"],
    reversedKw: ["exhaustion", "defensiveness", "fatigue", "fear of the last mile"],
    uprightMeaning: "The summit is within sight. Summon your remaining stamina and stand your ground.",
    reversedMeaning: "Weariness from protracted vigilance; lay down defensive armor and rest."
  },
  {
    rank: 10,
    slug: "ten",
    title: { en: "Ten of {suit}", hi: "टेन ऑफ {suit}", ja: "{suit}の10" },
    uprightKw: ["culmination", "completion", "legacy", "full cycle"],
    reversedKw: ["overburden", "collapse", "need to delegate", "resisting the end"],
    uprightMeaning: "The full expression and culmination of the suit's journey before the cycle resets.",
    reversedMeaning: "Carrying unnecessary weight across the threshold; shed the burden."
  },
  {
    rank: 11,
    slug: "page",
    title: { en: "Page of {suit}", hi: "पेज ऑफ {suit} (संदेशवाहक)", ja: "{suit}のペイジ" },
    uprightKw: ["curiosity", "enthusiastic study", "messages", "new perspective"],
    reversedKw: ["immaturity", "procrastination", "bad news", "daydreaming"],
    uprightMeaning: "An eager learner and carrier of messages, bringing youthful curiosity and fresh tidings.",
    reversedMeaning: "Difficulty translating creative whims into disciplined execution."
  },
  {
    rank: 12,
    slug: "knight",
    title: { en: "Knight of {suit}", hi: "नाइट ऑफ {suit} (योद्धा)", ja: "{suit}のナイト" },
    uprightKw: ["quest", "determination", "chivalric drive", "adventure"],
    reversedKw: ["recklessness", "unpredictability", "burnout", "hot-headedness"],
    uprightMeaning: "Galloping with passionate dedication on a clear quest; courageous pursuit of objectives.",
    reversedMeaning: "Charging blindly without evaluating terrain, or sudden halts in momentum."
  },
  {
    rank: 13,
    slug: "queen",
    title: { en: "Queen of {suit}", hi: "क्वीन ऑफ {suit} (रानी)", ja: "{suit}のクイーン" },
    uprightKw: ["emotional maturity", "embodied confidence", "intuitive grace", "fertility"],
    reversedKw: ["jealousy", "coldness", "insecurity", "emotional withdrawal"],
    uprightMeaning: "The mature feminine embodiment of {suit}: radiant, sovereign, and deeply wise.",
    reversedMeaning: "Insecurity eroding your warmth, or demanding perfection from others."
  },
  {
    rank: 14,
    slug: "king",
    title: { en: "King of {suit}", hi: "किंग ऑफ {suit} (राजा)", ja: "{suit}のキング" },
    uprightKw: ["mastery", "sovereign leadership", "authority", "mature vision"],
    reversedKw: ["tyranny", "stubbornness", "abuse of power", "ineffective command"],
    uprightMeaning: "The full external mastery and command over {suit}; fair, wise, and grounded authority.",
    reversedMeaning: "Dictatorial control or abdication of adult responsibility in crisis."
  }
];

const cards = [];

// 1. Add 22 Major Arcana
for (const major of majorArcanaData) {
  cards.push({
    ...major,
    arcana: "major",
    suit: null,
    image: `/cards/${major.id}.webp`
  });
}

// 2. Add 56 Minor Arcana
for (const suitConfig of suitsConfig) {
  for (const rank of minorRanks) {
    const id = `minor_${suitConfig.suit}_${rank.slug}`;
    const nameEn = rank.title.en.replace("{suit}", suitConfig.nameEn);
    const nameHi = rank.title.hi.replace("{suit}", suitConfig.nameHi);
    const nameJa = rank.title.ja.replace("{suit}", suitConfig.nameJa);

    const uprightMeaning = rank.uprightMeaning
      .replace("{suit}", suitConfig.nameEn)
      .replace("{suitElement}", suitConfig.theme);
    const reversedMeaning = rank.reversedMeaning
      .replace("{suit}", suitConfig.nameEn)
      .replace("{suitElement}", suitConfig.theme);

    cards.push({
      id,
      number: rank.rank,
      name: { en: nameEn, hi: nameHi, ja: nameJa },
      arcana: "minor",
      suit: suitConfig.suit,
      element: suitConfig.element,
      association: `${suitConfig.nameEn} Court / Pip`,
      keywords: {
        upright: rank.uprightKw,
        reversed: rank.reversedKw
      },
      meanings: {
        upright: uprightMeaning,
        reversed: reversedMeaning
      },
      symbolism: [suitConfig.suit, `${rank.slug} iconography`, suitConfig.element],
      numerology: rank.rank,
      image: `/cards/${id}.webp`
    });
  }
}

// Ensure output directories exist
const outputDir = path.resolve(__dirname, "../src/data/tarot");
fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "cards.json");
fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2), "utf-8");
console.log(`Generated ${cards.length} cards successfully at ${outputPath}`);
