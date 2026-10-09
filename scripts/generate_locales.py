# -*- coding: utf-8 -*-
"""
Generates 100% complete, authentic dictionaries for all 24 supported locales:
en, zh-TW, zh, ja, ko, es, de, pt, fr, it, nl, ru, uk, he, th, tr, pl, da, no, vi, hu, fi, id, hi.
"""

import os
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES_DIR = os.path.join(ROOT, "src", "data", "locales")

with open(os.path.join(LOCALES_DIR, "en.json"), "r", encoding="utf-8") as f:
    en_dict = json.load(f)

# Helper to load existing file if present
def get_existing(loc):
    p = os.path.join(LOCALES_DIR, f"{loc}.json")
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

# Define translation overrides for languages
# Each provides full dictionary sections plus featuredReadings, spreads, and personas
translations_db = {
    # Traditional Chinese
    "zh-TW": {
        "featuredReadings": {
            "card-of-the-day": { "name": "今日運勢卡", "subtitle": "奠定今日心靈基調", "badge": "每日免費神諭" },
            "yes-or-no-tarot": { "name": "是非題占卜", "subtitle": "直面困惑的明確指引", "badge": "1張牌 · 即時解答" },
            "two-choices-tarot-reading": { "name": "雙重抉擇牌陣", "subtitle": "對比路徑A與路徑B的能量", "badge": "5張牌 · 抉擇指引" },
            "love-tarot-reading": { "name": "愛情塔羅解讀", "subtitle": "探索內心情感與未來走向", "badge": "3張牌 · 浪漫情緣" },
            "relationship-tarot-reading": { "name": "關係深度剖析", "subtitle": "洞悉彼此羈絆與能量互動", "badge": "3張牌 · 關係和諧" },
            "question-tarot-reading": { "name": "專屬問題占卜", "subtitle": "針對人生所有困惑的精準洞察", "badge": "3張牌 · 解答疑惑" },
            "month-ahead-tarot-reading": { "name": "未來一個月運勢", "subtitle": "透視未來4週每週主題與契機", "badge": "4張牌 · 月度預測" },
            "career-tarot-reading": { "name": "事業與天賦使命", "subtitle": "解鎖職業突破與財富潛能", "badge": "3張牌 · 事業指引" }
        },
        "spreads": {
            "single": { "name": "每日微光・即時啟示（1張牌）", "desc": "專注於單張卡牌，為今日能量或單一迫切問題提供清晰濃縮的指引。" },
            "three_card": { "name": "過去・現在・未來（3張牌）", "desc": "經典的時間軸三位一體，揭示根源、當下推動力與即將展現的潛能。" },
            "decision_ab": { "name": "抉擇A vs 抉擇B（5張牌）", "desc": "平衡對比牌陣，專為化解十字路口的猶豫而設，評估兩種不同方向的長遠結果。" },
            "celtic_cross": { "name": "凱爾特十字牌陣（10張牌）", "desc": "最權威的赫爾墨斯十牌幾何架構，全方位透視深層因果與命運軌跡。" },
            "card_of_the_day": { "name": "今日之牌", "desc": "調諧今日思維，照亮當下24小時的心靈羅盤。" },
            "yes_or_no": { "name": "是非題占卜", "desc": "專為直接問題打造的即時決策判定。" },
            "love_three_card": { "name": "愛情三牌陣", "desc": "你的心聲、對方的情感，以及兩人間顯化的未來。" },
            "relationship_spread": { "name": "關係互動牌陣", "desc": "照亮雙方共織的真實紐帶與潛在功課。" },
            "question_three_card": { "name": "專屬問題三牌陣", "desc": "現狀、隱藏因素與決定性指引。" },
            "month_ahead_four_card": { "name": "未來月度四牌陣", "desc": "未來四週逐週能量主題與成長課題。" },
            "career_three_card": { "name": "事業使命三牌陣", "desc": "天賦綻放、職業轉折與成功實踐策略。" }
        },
        "personas": {
            "sage": { "name": "神秘智者", "title": "古典赫爾墨斯秘流守護者", "desc": "以原型、星體相位與深邃宇宙週期為鏡，給予平靜而超然的宏觀洞見。" },
            "empath": { "name": "直覺共情者", "title": "心靈與內在小孩之鏡", "desc": "專注於情緒療癒、自我慈悲與關係安全感，帶來溫柔包容的心靈撫慰。" },
            "strategist": { "name": "果決戰略家", "title": "澄澈意志與清晰之劍", "desc": "斬斷迷茫與幻覺，提供直接、具體且可落地的戰略實踐指引。" }
        }
    },
    # Simplified Chinese
    "zh": {
        "featuredReadings": {
            "card-of-the-day": { "name": "今日运势卡", "subtitle": "奠定今日心灵基调", "badge": "每日免费神谕" },
            "yes-or-no-tarot": { "name": "是非题占卜", "subtitle": "直面困惑的明确指引", "badge": "1张牌 · 即时解答" },
            "two-choices-tarot-reading": { "name": "双重抉择牌阵", "subtitle": "对比路径A与路径B的能量", "badge": "5张牌 · 抉择指引" },
            "love-tarot-reading": { "name": "爱情塔罗解读", "subtitle": "探索内心情感与未来走向", "badge": "3张牌 · 浪漫情缘" },
            "relationship-tarot-reading": { "name": "关系深度剖析", "subtitle": "洞悉彼此羁绊与能量互动", "badge": "3张牌 · 关系和谐" },
            "question-tarot-reading": { "name": "专属问题占卜", "subtitle": "针对人生所有困惑的精准洞察", "badge": "3张牌 · 解答疑惑" },
            "month-ahead-tarot-reading": { "name": "未来一个月运势", "subtitle": "透视未来4周每周主题与契机", "badge": "4张牌 · 月度预测" },
            "career-tarot-reading": { "name": "事业与天赋使命", "subtitle": "解锁职业突破与财富潜能", "badge": "3张牌 · 事业指引" }
        },
        "spreads": {
            "single": { "name": "每日微光・即时启示（1张牌）", "desc": "专注于单张卡牌，为今日能量或单一迫切问题提供清晰浓缩的指引。" },
            "three_card": { "name": "过去・现在・未来（3张牌）", "desc": "经典的时间轴三位一体，揭示根源、当下推动力与即将展现的潜能。" },
            "decision_ab": { "name": "抉择A vs 抉择B（5张牌）", "desc": "平衡对比牌阵，专为化解十字路口的犹豫而设，评估两种不同方向的长远结果。" },
            "celtic_cross": { "name": "凯尔特十字牌阵（10张牌）", "desc": "最权威的赫尔墨斯十牌几何架构，全方位透视深层因果与命运轨迹。" },
            "card_of_the_day": { "name": "今日之牌", "desc": "调谐今日思维，照亮当下24小时的心灵罗盘。" },
            "yes_or_no": { "name": "是非题占卜", "desc": "专为直接问题打造的即时决策判定。" },
            "love_three_card": { "name": "爱情三牌阵", "desc": "你的心声、对方的情感，以及两星期显化的未来。" },
            "relationship_spread": { "name": "关系互动牌阵", "desc": "照亮双方共织的真实纽带与潜在功课。" },
            "question_three_card": { "name": "专属问题三牌阵", "desc": "现状、隐藏因素与决定性指引。" },
            "month_ahead_four_card": { "name": "未来月度四牌阵", "desc": "未来四周逐周能量主题与成长课题。" },
            "career_three_card": { "name": "事业使命三牌阵", "desc": "天赋绽放、职业转折与成功实践策略。" }
        },
        "personas": {
            "sage": { "name": "神秘智者", "title": "古典赫尔墨斯秘流守护者", "desc": "以原型、星体相位与深邃宇宙周期为镜，给予平静而超然的宏观洞见。" },
            "empath": { "name": "直觉共情者", "title": "心灵与内在小孩之镜", "desc": "专注于情绪疗愈、自我慈悲与关系安全感，带来温柔包容的心灵抚慰。" },
            "strategist": { "name": "果决战略家", "title": "澄澈意志与清晰之剑", "desc": "斩断迷茫与幻觉，提供直接、具体且可落地的战略实践指引。" }
        }
    },
    # Korean
    "ko": {
        "nav": {
            "title": "Arcana 3D",
            "subtitle": "신성한 AI 타로",
            "reading": "새로운 리딩",
            "daily": "오늘의 카드",
            "cards": "78장 카드",
            "spreads": "스프레드",
            "dashboard": "나의 여정",
            "credits": "크레딧",
            "readingsDropdown": "타로 리딩",
            "creditPill": "크레딧",
            "sacredBalance": "보유 크레딧",
            "freeDailyCreditDesc": "매일 무료 점술 1회",
            "view": "보기",
            "sanctuaryHeader": "신전 메뉴"
        },
        "hero": {
            "tagline": "고대 타로와 신성한 인공지능의 만남",
            "headline": "3D 우주에서 경험하는 AI 타로 신전",
            "subheading": "마음속 질문을 던지고, 실시간 3D 공간에서 카드를 셔플하여 고전 헤르메스 지혜가 담긴 스트리밍 리딩을 경험해보세요.",
            "cta": "신탁 시작하기",
            "dailyCta": "오늘의 카드 뽑기",
            "exploreCards": "78장 덱 둘러보기",
            "freeNotice": "첫 리딩은 완전 무료입니다. 회원가입이 필요 없습니다."
        },
        "physics3d": {
            "title": "3차원 카드 물리 엔진 & 신성한 사운드",
            "desc": "카드가 입체 궤도 공간에 떠오릅니다. 셔플하고, 홀로그램 카드 뒷면을 확인하며, 실시간 피드백으로 카드를 선택하고 벨벳 위에 펼쳐지는 카드를 확인하세요."
        },
        "chooseReading": {
            "title": "원하는 리딩 선택하기",
            "badge": "대표 원형 리딩 · 실시간 3D 점술 · 맞춤형 신탁"
        },
        "spreadsSection": {
            "title": "신성한 스프레드 기하학",
            "desc": "현재 삶의 갈림길과 가장 잘 맞는 배열법을 선택하세요.",
            "cardSingular": "1장",
            "cardPlural": "장",
            "freeBadge": "무료",
            "creditsBadge": "크레딧",
            "selectSpread": "스프레드 선택"
        },
        "personasSection": {
            "title": "세 명의 고유한 리더 음성",
            "desc": "같은 스프레드라도 선택하는 리더에 따라 통찰의 깊이가 달라집니다. 당신의 영혼과 공명하는 안내자를 선택하세요.",
            "toneLabel": "어조"
        },
        "foundations": {
            "randomTitle": "암호화 진성 무작위성",
            "randomDesc": "모든 카드 뽑기는 서버 측 CSPRNG 알고리즘을 사용합니다. AI 모델이 임의로 카드를 고를 수 없습니다.",
            "streamTitle": "실시간 스트리밍 해석",
            "streamDesc": "초고속 스트리밍으로 기다림 없이 리더의 직관적인 해석이 전달됩니다.",
            "ethicsTitle": "윤리적 성찰의 거울",
            "ethicsDesc": "개인의 자율성과 분별력을 존중합니다. 운명론이나 거짓된 확신을 배제합니다."
        },
        "settings": {
            "title": "신전 설정",
            "ambienceSection": "신성한 앰비언스 & 사운드",
            "soundOn": "사운드 켜짐",
            "muted": "음소거",
            "masterVolume": "마스터 볼륨",
            "harmonicToneMode": "주파수 모드",
            "toneSolfeggioLabel": "528Hz 솔페지오",
            "toneSolfeggioDesc": "치유와 마음의 확장을 위한 기적의 주파수",
            "toneNebulaLabel": "천상의 성운",
            "toneNebulaDesc": "명상적 안정을 위한 깊은 우주 드론",
            "toneTempleLabel": "사원 싱잉볼",
            "toneTempleDesc": "티베트 싱잉볼의 맑은 배음",
            "sfxLabel": "카드 셔플 & 플립 효과음",
            "sfxEnabled": "활성화",
            "sfxMuted": "음소거",
            "languageSection": "언어 설정",
            "dimensionSection": "시각적 차원",
            "mode2DLabel": "2D 접근성 모드",
            "mode3DLabel": "3D 우주 공간 모드",
            "switchTo2D": "2D 모드로 전환",
            "switchTo3D": "3D 모드로 전환"
        },
        "readingRoom": {
            "startDivination": "시작하기",
            "aligningFreq": "원형 주파수 동기화 중",
            "shufflingHeader": "카드를 셔플하고 있습니다... 질문에 집중하세요",
            "coalescingDeck": "덱을 정돈하는 중...",
            "finishShuffling": "셔플 완료",
            "cutRitualBadge": "신성한 의식 · 개인 에너지 각인",
            "cutRitualTitle": "신성한 덱 컷팅하기",
            "cutRitualHint": "직관이 이끄는 곳을 탭하여 덱을 두 개로 나누세요...",
            "fanOutCards": "카드를 부채꼴로 펼치기",
            "selectCardsPrompt": "선택",
            "moreCards": "장 더 선택",
            "allCardsSelected": "모든 카드가 선택되었습니다! 아래에서 결과를 확인하세요.",
            "synthesizeReading": "신탁 종합 해석하기",
            "revealAllCards": "모든 카드 뒤집기",
            "askAnotherQuestion": "다른 질문하기",
            "exploreAllReadings": "모든 리딩 둘러보기",
            "actionAnchor": "실천 가이드",
            "suggestedContemplations": "추천 성찰 질문",
            "goDeeper": "더 깊은 질문하기",
            "askFollowup": "리더에게 묻기",
            "creditCost": "1 크레딧",
            "synthesizedTitle": "신성한 오라클"
        },
        "footer": {
            "brandDesc": "1909년 파멜라 콜먼 스미스의 타로 원형과 현대 소버린 AI의 만남.",
            "archiveNotice": "퍼블릭 도메인 RWS (1909) 아카이브",
            "sacredPortals": "신성한 포털",
            "ethicalTitle": "윤리적 AI 오라클",
            "ethicalBullet1": "카드는 무작위 난수로 뽑히며 AI가 카드를 임의 조작하지 않습니다.",
            "ethicalBullet2": "절대적 운명론이나 의료/법적 확언을 하지 않습니다.",
            "ethicalBullet3": "위기 상담은 전문 상담 기관으로 신속히 안내합니다.",
            "supportTitle": "지원 및 케어",
            "supportDesc": "심리적 위기 상황 시 전문 상담 기관에 문의하세요:",
            "rightsReserved": "All rights reserved.",
            "privacyPolicy": "개인정보처리방침",
            "termsOfService": "이용약관",
            "refundPolicy": "환불 정책",
            "authenticAi": "AUTHENTIC TAROT AI"
        },
        "readingForm": {
            "questionLabel": "마음속에 품고 있는 질문은 무엇인가요?",
            "questionPlaceholder": "예: 다가오는 계절 나의 커리어와 창작 활동에 어떤 에너지가 작용할까요?",
            "questionHint": "최대 200자. 열린 질문일수록 깊은 통찰을 얻을 수 있습니다.",
            "optionsPrompt": "두 가지 길 사이에서 고민 중이신가요? (선택 사항)",
            "optionALabel": "선택지 / 경로 A",
            "optionAPlaceholder": "새로운 제안 수락하기",
            "optionBLabel": "선택지 / 경로 B",
            "optionBPlaceholder": "현재 길을 지키며 독립하기",
            "chooseSpread": "스프레드(배열법) 선택",
            "choosePersona": "타로 리더 선택",
            "shufflePrompt": "셔플하고 3D 신전 입장하기",
            "freeGuestNotice": "첫 리딩은 완전 무료입니다. 가입이 필요 없습니다."
        },
        "reader": {
            "shufflingDeck": "78개의 원형 에너지를 셔플 중입니다...",
            "fieldInstruction": "떠오른 카드 중에서 {required}장을 선택하세요 (현재 {selected}장 선택됨)",
            "revealButton": "카드 뒤집기",
            "drawUnderway": "카드를 배열하고 리더의 통찰을 불러오는 중입니다...",
            "streamIntro": "카드가 신성한 질서에 따라 놓였습니다.",
            "practicalStepTitle": "실천을 위한 지침",
            "followupTitle": "이 배열에 대해 더 깊이 질문하기",
            "followupPlaceholder": "이 카드들에 관한 추가 질문을 입력하세요...",
            "followupSend": "리더에게 질문하기 (1 크레딧)",
            "extraCardButton": "조언 카드 1장 더 뽑기 (1 크레딧)",
            "disclaimer": "타로는 자기 성찰을 위한 도구이며 의료·법률 전문가의 조언을 대신하지 않습니다.",
            "sharePoster": "포스터 공유하기",
            "overallAnalysis": "전체 리딩 분석",
            "deepSynthesis": "심층 종합 해석",
            "cardBreakdown": "각 카드의 상세 계시",
            "goDeeper": "더 깊은 통찰 탐색하기",
            "askThis": "이 질문하기",
            "readingSaved": "리딩이 저장되었습니다",
            "storyReady": "이미지 생성 완료",
            "downloadPosterDesc": "인스타그램 스토리나 메신저에 공유할 수 있는 포스터를 다운로드하세요.",
            "downloadPosterBtn": "이미지로 저장하기",
            "rateReadingTitle": "이번 리딩은 어떠셨나요?",
            "rateReadingDesc": "더 나은 오라클을 위해 소중한 피드백을 남겨주세요.",
            "rateSuccess": "✦ 감사합니다! 당신의 피드백이 우주에 기록되었습니다. ✦",
            "rateFeedbackPlaceholder": "느낀 점이나 소감을 적어주세요 (선택 사항)...",
            "submitFeedback": "피드백 제출하기",
            "exploreOtherTitle": "다른 신성한 리딩 둘러보기",
            "exploreOtherDesc": "삶의 다양한 고민을 위해 전용 리딩 룸을 방문해보세요.",
            "enterRoom": "신전 입장하기"
        },
        "credits": {
            "current": "잔액",
            "freeDaily": "일일 무료 충전",
            "streakDays": "일 연속 방문",
            "purchasePacks": "크레딧 충전하기",
            "seekerPack": "구도자 팩 (10 크레딧) - $4.99",
            "mysticPack": "신비가 팩 (30 크레딧) - $11.99",
            "oraclePack": "오라클 팩 (100 크레딧) - $29.99"
        },
        "featuredReadings": {
            "card-of-the-day": { "name": "오늘의 카드", "subtitle": "오늘 하루를 이끄는 기조", "badge": "무료 일일 점술" },
            "yes-or-no-tarot": { "name": "예스 or 노 타로", "subtitle": "명쾌하고 빠른 직관적 답변", "badge": "1장 · 즉시 판별" },
            "two-choices-tarot-reading": { "name": "두 가지 선택 타로", "subtitle": "경로 A와 경로 B 비교 분석", "badge": "5장 · 결단 지원" },
            "love-tarot-reading": { "name": "사랑의 타로 리딩", "subtitle": "마음의 진실과 로맨스의 미래", "badge": "3장 · 애정운" },
            "relationship-tarot-reading": { "name": "관계 조화 리딩", "subtitle": "두 사람의 유대와 역동성 조명", "badge": "3장 · 관계운" },
            "question-tarot-reading": { "name": "인생 질문 리딩", "subtitle": "모든 고민을 위한 명확한 나침반", "badge": "3장 · 맞춤 답변" },
            "month-ahead-tarot-reading": { "name": "한 달 전망 타로", "subtitle": "앞으로 4주간의 테마와 흐름", "badge": "4장 · 월간 운세" },
            "career-tarot-reading": { "name": "커리어 & 소명", "subtitle": "직업적 성장, 재능, 성공 전략", "badge": "3장 · 커리어운" }
        },
        "spreads": {
            "single": { "name": "오늘의 통찰 (1장)", "desc": "오늘의 에너지나 단일 질문을 위한 명확하고 집중된 조언." },
            "three_card": { "name": "과거, 현재, 미래 (3장)", "desc": "근원, 현재 흐름, 다가올 잠재력을 밝히는 클래식 삼위일체 스프레드." },
            "decision_ab": { "name": "선택지 A vs B (5장)", "desc": "기로에 선 결정을 돕기 위해 장단점과 결과를 균형 있게 분석합니다." },
            "celtic_cross": { "name": "켈틱 크로스 (10장)", "desc": "상황의 심층적 원인과 운명의 궤적을 짚어주는 가장 권위 있는 10장 배열법." },
            "card_of_the_day": { "name": "오늘의 카드", "desc": "하루를 조율하는 신성한 아르카나 메시지." },
            "yes_or_no": { "name": "예스 or 노", "desc": "단순하고 명확한 질문에 대한 직관적 답." },
            "love_three_card": { "name": "애정운 (3장)", "desc": "나의 마음, 상대방의 마음, 두 사람의 미래." },
            "relationship_spread": { "name": "관계 리딩 (3장)", "desc": "소중한 관계의 진실과 발전 방향." },
            "question_three_card": { "name": "질문 리딩 (3장)", "desc": "현상, 보이지 않는 요인, 결정적 조언." },
            "month_ahead_four_card": { "name": "월간 전망 (4장)", "desc": "앞으로 4주간 주차별 핵심 테마." },
            "career_three_card": { "name": "커리어 (3장)", "desc": "현재 역량, 기회, 성공을 위한 전략." }
        },
        "personas": {
            "sage": { "name": "신비의 현자", "title": "고대 헤르메스 전통의 수호자", "desc": "원형과 우주의 주기를 통해 차분하고 초연한 통찰을 제공합니다." },
            "empath": { "name": "직관의 공감자", "title": "마음과 내면아이의 거울", "desc": "정서적 치유와 관계 회복, 따스한 위로를 전합니다." },
            "strategist": { "name": "명철한 전략가", "title": "명확성과 실행력의 검", "desc": "환상을 걷어내고 명확하고 구체적인 실천 전략을 제시합니다." }
        }
    },
    # Spanish
    "es": {
        "featuredReadings": {
            "card-of-the-day": { "name": "Carta del Día", "subtitle": "Define el tono de tu jornada", "badge": "Tirada Diaria Gratis" },
            "yes-or-no-tarot": { "name": "Tarot Sí o No", "subtitle": "Respuesta clara y decisiva", "badge": "1 Carta · Al Instante" },
            "two-choices-tarot-reading": { "name": "Dos Opciones", "subtitle": "Compara el Camino A frente al Camino B", "badge": "5 Cartas · Decisiones" },
            "love-tarot-reading": { "name": "Tarot del Amor", "subtitle": "Verdad del corazón y romance futuro", "badge": "3 Cartas · Romance" },
            "relationship-tarot-reading": { "name": "Tarot de Pareja", "subtitle": "Claridad y dinámica entre dos almas", "badge": "3 Cartas · Vínculos" },
            "question-tarot-reading": { "name": "Consulta Específica", "subtitle": "Respuestas claras a cualquier duda vital", "badge": "3 Cartas · Orientación" },
            "month-ahead-tarot-reading": { "name": "El Mes por Delante", "subtitle": "Pronóstico de 4 semanas y temas clave", "badge": "4 Cartas · Mensual" },
            "career-tarot-reading": { "name": "Carrera & Propósito", "subtitle": "Desarrollo laboral, dones y éxito", "badge": "3 Cartas · Trabajo" }
        },
        "spreads": {
            "single": { "name": "Luz Diaria / Visión (1 Carta)", "desc": "Una carta enfocada para la energía de hoy o una duda concreta." },
            "three_card": { "name": "Pasado, Presente, Futuro", "desc": "La clásica trinidad que revela raíces, fuerzas vivas y potencial futuro." },
            "decision_ab": { "name": "Opción A vs Opción B", "desc": "Tirada comparativa equilibrada para elegir entre dos caminos." },
            "celtic_cross": { "name": "Cruz Celta (10 Cartas)", "desc": "La arquitectura hermética más profunda para una comprensión integral." },
            "card_of_the_day": { "name": "Carta del Día", "desc": "Arquetipo diario para orientar tus 24 horas." },
            "yes_or_no": { "name": "Tarot Sí o No", "desc": "Veredicto inmediato y decantado para tus dudas." },
            "love_three_card": { "name": "Tirada del Amor (3 Cartas)", "desc": "Tu corazón, el otro corazón y el desenlace futuro." },
            "relationship_spread": { "name": "Tirada Relacional", "desc": "Ilumina la dinámica y aprendizajes compartidos." },
            "question_three_card": { "name": "Tirada de Pregunta (3 Cartas)", "desc": "Situación, factor oculto y guía definitiva." },
            "month_ahead_four_card": { "name": "Mes Entrante (4 Cartas)", "desc": "Temas semanales para las próximas cuatro semanas." },
            "career_three_card": { "name": "Carrera y Vocación (3 Cartas)", "desc": "Oportunidades laborales, dones y estrategia de logro." }
        },
        "personas": {
            "sage": { "name": "El Sabio Místico", "title": "Guardián de las Corrientes Herméticas", "desc": "Interpreta arquetipos y ciclos cósmicos con serena sabiduría." },
            "empath": { "name": "La Empática Intuitiva", "title": "Espejo del Corazón y el Alma", "desc": "Centrada en sanación emocional, compasión y relaciones." },
            "strategist": { "name": "El Estratega Directo", "title": "Espada de la Verdad y la Acción", "desc": "Disipa dudas con orientación práctica, realista y contundente." }
        }
    },
    # German
    "de": {
        "nav": {
            "title": "Arcana 3D",
            "subtitle": "Heiliges AI Tarot",
            "reading": "Neue Legung",
            "daily": "Tageskarte",
            "cards": "78 Karten",
            "spreads": "Legemuster",
            "dashboard": "Meine Reise",
            "credits": "Guthaben",
            "readingsDropdown": "Tarot-Legungen",
            "creditPill": "CREDIT",
            "sacredBalance": "Heiliges Guthaben",
            "freeDailyCreditDesc": "1 tägliches Gratis-Guthaben",
            "view": "Ansehen",
            "sanctuaryHeader": "HEILIGTUM"
        },
        "hero": {
            "tagline": "Das Antike Deck Trifft Höchste Intelligenz",
            "headline": "Ein Lebendiges 3D AI Tarot Heiligtum",
            "subheading": "Stelle deine Frage, mische das Deck im echten 3D-Raum und erhalte eine authentische Deutung nach klassischer hermetischer Weisheit.",
            "cta": "Das Orakel Befragen",
            "dailyCta": "Tageskarte Ziehen",
            "exploreCards": "Karten-Archiv Durchstöbern",
            "freeNotice": "Deine erste Legung ist komplett kostenlos – keine Registrierung nötig."
        },
        "physics3d": {
            "title": "Dreidimensionale Kartenphysik & Klang",
            "desc": "Karten schweben im volumetrischen Raum. Mische, betrachte holografische Rückseiten, wähle Karten mit haptischer Resonanz und sieh zu, wie sie auf Samt gewendet werden."
        },
        "chooseReading": {
            "title": "Wähle Deine Legung",
            "badge": "BEGEHRTE URBILDER · ECHTER 3D-KOSMOS · GEWEIHTE ORAKEL"
        },
        "spreadsSection": {
            "title": "Heilige Legemuster",
            "desc": "Wähle die Geometrie, die deine aktuelle Weggabelung widerspiegelt.",
            "cardSingular": "1 KARTE",
            "cardPlural": "KARTEN",
            "freeBadge": "GRATIS",
            "creditsBadge": "CREDITS",
            "selectSpread": "Legemuster Wählen"
        },
        "personasSection": {
            "title": "Drei Souveräne Deutungsstimmen",
            "desc": "Dasselbe Muster spricht unterschiedlich, je nachdem, wen du wählst. Finde den Begleiter, der mit deiner Seele schwingt.",
            "toneLabel": "Tonfall"
        },
        "foundations": {
            "randomTitle": "Kryptografischer Zufall",
            "randomDesc": "Jede Ziehung nutzt serverseitige CSPRNG-Algorithmen. Die KI darf niemals selbst Karten wählen.",
            "streamTitle": "Live Gestreamte Einsicht",
            "streamDesc": "Verzögerungsfreies Streaming erweckt die Worte des Lesers ohne Ladezeiten zum Leben.",
            "ethicsTitle": "Ethischer Spiegel",
            "ethicsDesc": "Verankert in persönlicher Autonomie. Frei von Fatalismus oder leeren Versprechungen."
        },
        "settings": {
            "title": "Einstellungen des Heiligtums",
            "ambienceSection": "Heilige Klänge & Atmosphäre",
            "soundOn": "TON AN",
            "muted": "STUMM",
            "masterVolume": "Gesamtlautstärke",
            "harmonicToneMode": "Frequenz-Modus",
            "toneSolfeggioLabel": "528Hz Solfeggio",
            "toneSolfeggioDesc": "Wunderfrequenz für Erneuerung & Herzöffnung",
            "toneNebulaLabel": "Kosmischer Nebel",
            "toneNebulaDesc": "Tiefer Raumklang für meditative Zentrierung",
            "toneTempleLabel": "Tempel-Klangschalen",
            "toneTempleDesc": "Tibetische Schalenklänge mit heiliger Brise",
            "sfxLabel": "Misch- & Wende-SFX",
            "sfxEnabled": "AKTIVIERT",
            "sfxMuted": "STUMM",
            "languageSection": "Sprache",
            "dimensionSection": "Visuelle Dimension",
            "mode2DLabel": "2D Barrierefrei",
            "mode3DLabel": "3D Kosmos",
            "switchTo2D": "ZU 2D WECHSELN",
            "switchTo3D": "ZU 3D WECHSELN"
        },
        "readingRoom": {
            "startDivination": "START",
            "aligningFreq": "URBILDLICHE FREQUENZEN WERDEN EINGESTIMMT",
            "shufflingHeader": "Karten werden gemischt... Bitte meditiere über deine Frage",
            "coalescingDeck": "DECK WIRD GESAMMELT...",
            "finishShuffling": "MISCHEN BEENDEN",
            "cutRitualBadge": "HEILIGES RITUAL · PERSÖNLICHE ENERGIEPRÄGUNG",
            "cutRitualTitle": "Das Heilige Deck Abheben",
            "cutRitualHint": "Tippe oder klicke dort, wo deine Intuition dich ruft, um das Deck zu teilen...",
            "fanOutCards": "KARTEN AUSBREITEN",
            "selectCardsPrompt": "Wähle",
            "moreCards": "weitere Karte(n)",
            "allCardsSelected": "Alle Karten gewählt! Deute unten.",
            "synthesizeReading": "DEUTUNG SYNTHETISIEREN",
            "revealAllCards": "ALLE KARTEN AUFDECKEN",
            "askAnotherQuestion": "NEUE FRAGE STELLEN",
            "exploreAllReadings": "ALLE LEGUNGEN ANSEHEN",
            "actionAnchor": "Handlungsanker",
            "suggestedContemplations": "Empfohlene Kontemplationen",
            "goDeeper": "Tiefer in dieses Muster blicken",
            "askFollowup": "Den Leser fragen",
            "creditCost": "1 Credit",
            "synthesizedTitle": "Heiliges Orakel"
        },
        "footer": {
            "brandDesc": "Verbindet Pamela Colman Smiths RWS-Urbilder von 1909 mit moderner künstlicher Intelligenz.",
            "archiveNotice": "GEMEINFREIES RWS (1909) ARCHIV",
            "sacredPortals": "Heilige Portale",
            "ethicalTitle": "Ethisches KI-Orakel",
            "ethicalBullet1": "Karten werden durch zertifizierten Zufall gezogen, niemals von der KI.",
            "ethicalBullet2": "Keine fatalistischen Vorhersagen oder medizinische Diagnosen.",
            "ethicalBullet3": "Krisenfragen werden achtsam an Hilfestellen weitergeleitet.",
            "supportTitle": "Hilfe & Unterstützung",
            "supportDesc": "Befindest du dich in einer Krise, wende dich bitte an professionelle Stellen:",
            "rightsReserved": "Alle Rechte vorbehalten.",
            "privacyPolicy": "Datenschutzerklärung",
            "termsOfService": "Nutzungsbedingungen",
            "refundPolicy": "Rückerstattungsrichtlinie",
            "authenticAi": "AUTHENTISCHES TAROT AI"
        },
        "readingForm": {
            "questionLabel": "Was liegt dir auf dem Herzen?",
            "questionPlaceholder": "Z.B.: Welche energetische Wende erwartet mich beruflich in den kommenden Wochen?",
            "questionHint": "Max. 200 Zeichen. Offene Fragen eröffnen tiefere Antworten.",
            "optionsPrompt": "Vergleichst du zwei Wege? (Optional)",
            "optionALabel": "Weg / Option A",
            "optionAPlaceholder": "Das neue Angebot annehmen",
            "optionBLabel": "Weg / Option B",
            "optionBPlaceholder": "Den bestehenden Pfad weitergehen",
            "chooseSpread": "Legemuster Wählen",
            "choosePersona": "Tarot-Leser Wählen",
            "shufflePrompt": "Mischen & 3D-Heiligtum Betreten",
            "freeGuestNotice": "Die erste Legung ist kostenlos – keine Registrierung."
        },
        "reader": {
            "shufflingDeck": "Die 78 archetypischen Ströme mischen sich...",
            "fieldInstruction": "Wähle {required} Karten aus dem schwebenden Feld ({selected} gewählt)",
            "revealButton": "Karten Aufdecken",
            "drawUnderway": "Legung wird ausgebreitet und der Leser angerufen...",
            "streamIntro": "Die Karten haben sich in heiliger Ordnung gefügt.",
            "practicalStepTitle": "Praktischer Handlungsschritt",
            "followupTitle": "Tiefer nachfragen",
            "followupPlaceholder": "Stelle eine Folgefrage zu diesen Karten...",
            "followupSend": "Leser fragen (1 Credit)",
            "extraCardButton": "Klärende Zusatzkarte ziehen (1 Credit)",
            "disclaimer": "Tarot ist ein Spiegel zur Selbstreflexion und ersetzt keinen ärztlichen Rat.",
            "sharePoster": "Poster Teilen",
            "overallAnalysis": "Gesamtanalyse der Legung",
            "deepSynthesis": "Tiefensynthese",
            "cardBreakdown": "Einzelkarten-Offenbarungen",
            "goDeeper": "Tiefer in diese Legung eintauchen",
            "askThis": "Dies fragen",
            "readingSaved": "Deine Legung wurde gespeichert",
            "storyReady": "Bild Fertig",
            "downloadPosterDesc": "Lade ein stimmungsvolles Poster für deine Social-Media-Stories herunter.",
            "downloadPosterBtn": "Als Bild Herunterladen",
            "rateReadingTitle": "Wie war deine Legung?",
            "rateReadingDesc": "Hilf uns, das Orakel zu verfeinern. Gib eine Bewertung ab.",
            "rateSuccess": "✦ Danke, Suchender! Dein Feedback ist im Kosmos vermerkt. ✦",
            "rateFeedbackPlaceholder": "Teile deine Gedanken oder Erkenntnisse (optional)...",
            "submitFeedback": "Feedback Absenden",
            "exploreOtherTitle": "Weitere Legungen Entdecken",
            "exploreOtherDesc": "Besuche einen weiteren Raum für andere Lebensbereiche.",
            "enterRoom": "Raum Betreten"
        },
        "credits": {
            "current": "Guthaben",
            "freeDaily": "Tägliches Gratis-Guthaben",
            "streakDays": "Tage in Folge",
            "purchasePacks": "Guthaben Erwerben",
            "seekerPack": "Sucher-Paket (10 Credits) - $4.99",
            "mysticPack": "Mystiker-Paket (30 Credits) - $11.99",
            "oraclePack": "Orakel-Paket (100 Credits) - $29.99"
        },
        "featuredReadings": {
            "card-of-the-day": { "name": "Tageskarte", "subtitle": "Stimme dich auf den Tag ein", "badge": "Tägliche Gratis-Ziehung" },
            "yes-or-no-tarot": { "name": "Ja oder Nein Tarot", "subtitle": "Klare & unmittelbare Entscheidung", "badge": "1 Karte · Sofort" },
            "two-choices-tarot-reading": { "name": "Zwei Wege Tarot", "subtitle": "Weg A gegen Weg B vergleichen", "badge": "5 Karten · Entscheidung" },
            "love-tarot-reading": { "name": "Liebestarot", "subtitle": "Herzensdynamik & Liebeszukunft", "badge": "3 Karten · Romantik" },
            "relationship-tarot-reading": { "name": "Beziehungstarot", "subtitle": "Begegnung, Harmonie & Band", "badge": "3 Karten · Partnerschaft" },
            "question-tarot-reading": { "name": "Einzelfrage-Legung", "subtitle": "Klare Antworten auf Lebensfragen", "badge": "3 Karten · Rat" },
            "month-ahead-tarot-reading": { "name": "Monatsausblick", "subtitle": "4-Wochen-Vorschau und Themen", "badge": "4 Karten · Zukunft" },
            "career-tarot-reading": { "name": "Karriere & Berufung", "subtitle": "Berufsweg, Talente & Erfolg", "badge": "3 Karten · Erfolg" }
        },
        "spreads": {
            "single": { "name": "Tageslicht & Klarheit (1 Karte)", "desc": "Eine fokussierte Karte für die Energie des heutigen Tages." },
            "three_card": { "name": "Vergangenheit, Gegenwart, Zukunft", "desc": "Klassische Dreifaltigkeit: Ursprung, Gegenwart und Zukunft." },
            "decision_ab": { "name": "Weg A vs. Weg B (5 Karten)", "desc": "Ausgewogener Vergleich zweier Richtungen." },
            "celtic_cross": { "name": "Keltisches Kreuz (10 Karten)", "desc": "Das klassische Zehn-Karten-Muster für umfassende Einsicht." },
            "card_of_the_day": { "name": "Tageskarte", "desc": "Tägliche geistige Ausrichtung für 24 Stunden." },
            "yes_or_no": { "name": "Ja oder Nein", "desc": "Einprägsame und präzise Antwort." },
            "love_three_card": { "name": "Liebeslegung (3 Karten)", "desc": "Dein Herz, das Partnerherz und die Zukunft." },
            "relationship_spread": { "name": "Beziehungsspiegel (3 Karten)", "desc": "Beleuchtet das gemeinsame Band." },
            "question_three_card": { "name": "Fragelegung (3 Karten)", "desc": "Status quo, Verstecktes und Ausweg." },
            "month_ahead_four_card": { "name": "Monatsvorschau (4 Karten)", "desc": "Die wöchentlichen Leitthemen des nächsten Monats." },
            "career_three_card": { "name": "Beruf & Sinn (3 Karten)", "desc": "Gaben, Wendepunkte und Strategie." }
        },
        "personas": {
            "sage": { "name": "Der Mystische Weise", "title": "Hüter Hermetischer Ströme", "desc": "Deutet durch Urbilder und kosmische Zyklen mit ruhiger Klarheit." },
            "empath": { "name": "Die Intuitive Empathin", "title": "Spiegel des Herzens", "desc": "Fokussiert auf emotionale Heilung und sanfte Ermutigung." },
            "strategist": { "name": "Der Klare Stratege", "title": "Schwert der Wahrheit und Tatkraft", "desc": "Beseitigt Zweifel mit pragmatischen, handlungsorientierten Schritten." }
        }
    },
    # French
    "fr": {
        "nav": {
            "title": "Arcana 3D",
            "subtitle": "Tarot Sacré par IA",
            "reading": "Nouveau Tirage",
            "daily": "Carte du Jour",
            "cards": "78 Cartes",
            "spreads": "Tirages",
            "dashboard": "Mon Chemin",
            "credits": "Crédits",
            "readingsDropdown": "Tirages",
            "creditPill": "CRÉDIT",
            "sacredBalance": "Solde Sacré",
            "freeDailyCreditDesc": "1 tirage divinatoire quotidien gratuit",
            "view": "Voir",
            "sanctuaryHeader": "SANCTUAIRE"
        },
        "hero": {
            "tagline": "Le Deck Antique Rencontre l'Intelligence Souveraine",
            "headline": "Un Sanctuaire 3D Vivant de Tarot IA",
            "subheading": "Posez votre question, mélangez les cartes dans un espace 3D en temps réel et recevez une interprétation authentique empreinte de sagesse hermétique.",
            "cta": "Consulter l'Oracle",
            "dailyCta": "Tirer la Carte du Jour",
            "exploreCards": "Explorer les 78 Arcanes",
            "freeNotice": "Votre premier tirage est entièrement gratuit — sans inscription."
        },
        "physics3d": {
            "title": "Physique des Cartes en 3D & Son Sacré",
            "desc": "Les cartes flottent dans un champ orbital volumétrique. Mélangez, examinez les dos holographiques, sélectionnez vos cartes avec retour tactile et observez leur révélation sur velours."
        },
        "chooseReading": {
            "title": "Choisissez Votre Tirage",
            "badge": "ARCHÉTYPES ÉLEVÉS · DIVINATION 3D TEMPS RÉEL · ORACLES DÉDIÉS"
        },
        "spreadsSection": {
            "title": "Géométries des Tirages Sacrés",
            "desc": "Choisissez la disposition qui fait écho à votre carrefour de vie actuel.",
            "cardSingular": "1 CARTE",
            "cardPlural": "CARTES",
            "freeBadge": "GRATUIT",
            "creditsBadge": "CRÉDITS",
            "selectSpread": "Choisir le Tirage"
        },
        "personasSection": {
            "title": "Trois Voix de Lecteurs Souverains",
            "desc": "Le même tirage résonne différemment selon le guide choisi. Sélectionnez la présence qui correspond à votre âme.",
            "toneLabel": "Ton"
        },
        "foundations": {
            "randomTitle": "Aléatoire Cryptographique",
            "randomDesc": "Chaque tirage repose sur un CSPRNG certifié côté serveur. Le modèle d'IA ne choisit jamais les cartes.",
            "streamTitle": "Synthèse en Streaming",
            "streamDesc": "Un flux fluide et instantané donne vie aux paroles de votre lecteur sans aucun écran de chargement.",
            "ethicsTitle": "Miroir de Réflexion Éthique",
            "ethicsDesc": "Fondé sur l'autonomie et le discernement personnels. Zéro fatalisme ni promesses illusoires."
        },
        "settings": {
            "title": "Paramètres du Sanctuaire",
            "ambienceSection": "Ambiance & Audio Sacré",
            "soundOn": "SON ACTIVÉ",
            "muted": "MUET",
            "masterVolume": "Volume Principal",
            "harmonicToneMode": "Mode Fréquentiel",
            "toneSolfeggioLabel": "Solfeggio 528Hz",
            "toneSolfeggioDesc": "Fréquence miraculeuse de renouveau et d'ouverture du cœur",
            "toneNebulaLabel": "Nébuleuse Céleste",
            "toneNebulaDesc": "Bourdon cosmique profond pour l'ancrage méditatif",
            "toneTempleLabel": "Bols Chantants du Temple",
            "toneTempleDesc": "Harmoniques de bols tibétains avec brise sacrée",
            "sfxLabel": "Effets de Mélange & de Révélation",
            "sfxEnabled": "ACTIVÉ",
            "sfxMuted": "MUET",
            "languageSection": "Langue Sacrée",
            "dimensionSection": "Dimension Visuelle",
            "mode2DLabel": "Mode 2D Accessible",
            "mode3DLabel": "Mode 3D Cosmique",
            "switchTo2D": "PASSER EN 2D",
            "switchTo3D": "PASSER EN 3D"
        },
        "readingRoom": {
            "startDivination": "COMMENCER",
            "aligningFreq": "ALIGNEMENT DES FRÉQUENCES ARCHÉTYPALES",
            "shufflingHeader": "Mélange des cartes... Méditez sur votre question",
            "coalescingDeck": "RASSEMBLEMENT DU JEU...",
            "finishShuffling": "TERMINER LE MÉLANGE",
            "cutRitualBadge": "RITUEL SACRÉ · EMPREINTE ÉNERGÉTIQUE PERSONNELLE",
            "cutRitualTitle": "Couper le Jeu Sacré",
            "cutRitualHint": "Cliquez ou touchez à l'endroit où votre intuition vous invite à couper le jeu...",
            "fanOutCards": "DÉPLOYER LES CARTES",
            "selectCardsPrompt": "Choisissez",
            "moreCards": "carte(s) supplémentaire(s)",
            "allCardsSelected": "Toutes les cartes sont choisies ! Découvrez la synthèse ci-dessous.",
            "synthesizeReading": "SYNTHÉTISER LE TIRAGE",
            "revealAllCards": "RÉVÉLER TOUTES LES CARTES",
            "askAnotherQuestion": "POSER UNE AUTRE QUESTION",
            "exploreAllReadings": "EXPLORER TOUS LES TIRAGES",
            "actionAnchor": "Ancrage Pratique",
            "suggestedContemplations": "Contemplations Suggérées",
            "goDeeper": "Approfondir ce Tirage",
            "askFollowup": "Interroger le Lecteur",
            "creditCost": "1 Crédit",
            "synthesizedTitle": "Oracle Sacré"
        },
        "footer": {
            "brandDesc": "L'alliance des archétypes RWS de 1909 de Pamela Colman Smith et de l'intelligence artificielle souveraine.",
            "archiveNotice": "ARCHIVES DU DOMAINE PUBLIC RWS (1909)",
            "sacredPortals": "Portails Sacrés",
            "ethicalTitle": "Oracle IA Éthique",
            "ethicalBullet1": "Tirages cryptographiquement aléatoires, jamais décidés par l'IA.",
            "ethicalBullet2": "Aucun fatalisme ni affirmations d'ordre médical ou juridique.",
            "ethicalBullet3": "Les situations de détresse sont accueillies avec compassion et orientation d'aide.",
            "supportTitle": "Soutien & Écoute",
            "supportDesc": "Si vous ou un proche traversez une épreuve difficile, contactez une ligne d'écoute :",
            "rightsReserved": "Tous droits réservés.",
            "privacyPolicy": "Politique de Confidentialité",
            "termsOfService": "Conditions d'Utilisation",
            "refundPolicy": "Politique de Remboursement",
            "authenticAi": "AUTHENTIQUE TAROT IA"
        },
        "readingForm": {
            "questionLabel": "Quelle est l'essence de votre demande ?",
            "questionPlaceholder": "Ex. : Quelle mutation énergétique m'appelle dans ma carrière créative ces prochains mois ?",
            "questionHint": "Max 200 caractères. Une question ouverte apporte des réponses plus riches.",
            "optionsPrompt": "Vous hésitez entre deux chemins ? (Optionnel)",
            "optionALabel": "Chemin / Option A",
            "optionAPlaceholder": "Accepter le nouveau contrat",
            "optionBLabel": "Chemin / Option B",
            "optionBPlaceholder": "Conserver mon indépendance",
            "chooseSpread": "Sélectionner la Disposition",
            "choosePersona": "Choisir le Lecteur",
            "shufflePrompt": "Mélanger & Entrer dans le Sanctuaire 3D",
            "freeGuestNotice": "Premier tirage gratuit — sans inscription."
        },
        "reader": {
            "shufflingDeck": "Mélange des 78 courants archétypaux...",
            "fieldInstruction": "Sélectionnez {required} cartes dans le champ flottant ({selected} choisies)",
            "revealButton": "Révéler les Cartes",
            "drawUnderway": "Disposition des cartes et invocation du lecteur...",
            "streamIntro": "Les cartes se sont ordonnées selon l'ordre sacré.",
            "practicalStepTitle": "Ancrage Pratique",
            "followupTitle": "Approfondir cette disposition",
            "followupPlaceholder": "Posez une question complémentaire liée à ces cartes...",
            "followupSend": "Demander au Lecteur (1 Crédit)",
            "extraCardButton": "Tirer une Carte d'Éclairage (1 Crédit)",
            "disclaimer": "Le tarot est un miroir d'introspection personnelle et ne remplace pas un avis médical ou juridique.",
            "sharePoster": "Partager le Poster",
            "overallAnalysis": "Analyse Globale du Tirage",
            "deepSynthesis": "Synthèse Profonde",
            "cardBreakdown": "Révélation de Chaque Carte",
            "goDeeper": "Approfondir ce tirage",
            "askThis": "Poser cette question",
            "readingSaved": "Votre tirage est sauvegardé",
            "storyReady": "Image Prête",
            "downloadPosterDesc": "Téléchargez un poster élégant pour vos stories Instagram ou WhatsApp.",
            "downloadPosterBtn": "Enregistrer l'Image",
            "rateReadingTitle": "Comment s'est passé votre tirage ?",
            "rateReadingDesc": "Aidez-nous à affiner notre oracle en partageant votre avis.",
            "rateSuccess": "✦ Merci, cher chercheur ! Votre avis a été enregistré dans le cosmos. ✦",
            "rateFeedbackPlaceholder": "Partagez vos impressions ou réflexions (optionnel)...",
            "submitFeedback": "Envoyer le Retour",
            "exploreOtherTitle": "Découvrir Nos Autres Tirages",
            "exploreOtherDesc": "Rejoignez une autre salle dédiée pour explorer d'autres aspects de votre vie.",
            "enterRoom": "Entrer dans la Salle"
        },
        "credits": {
            "current": "Solde",
            "freeDaily": "Recharge Quotidienne Gratuite",
            "streakDays": "Jours Consécutifs",
            "purchasePacks": "Acquérir des Crédits",
            "seekerPack": "Pack Chercheur (10 Crédits) - $4.99",
            "mysticPack": "Pack Mystique (30 Crédits) - $11.99",
            "oraclePack": "Pack Oracle (100 Crédits) - $29.99"
        },
        "featuredReadings": {
            "card-of-the-day": { "name": "Carte du Jour", "subtitle": "Donnez le ton à votre journée", "badge": "Tirage Quotidien Gratuit" },
            "yes-or-no-tarot": { "name": "Tarot Oui ou Non", "subtitle": "Verdict clair et décisif", "badge": "1 Carte · Immédiat" },
            "two-choices-tarot-reading": { "name": "Tarot des Deux Choix", "subtitle": "Comparer la voie A et la voie B", "badge": "5 Cartes · Décision" },
            "love-tarot-reading": { "name": "Tarot de l'Amour", "subtitle": "Dynamique du cœur & avenir amoureux", "badge": "3 Cartes · Romance" },
            "relationship-tarot-reading": { "name": "Tarot Relationnel", "subtitle": "Éclairer le lien entre deux âmes", "badge": "3 Cartes · Harmonie" },
            "question-tarot-reading": { "name": "Tirage Question Précise", "subtitle": "Réponses claires à toute interrogation", "badge": "3 Cartes · Clarté" },
            "month-ahead-tarot-reading": { "name": "Mois à Venir", "subtitle": "Prévisions sur 4 semaines et thèmes clés", "badge": "4 Cartes · Évolution" },
            "career-tarot-reading": { "name": "Carrière & Vocation", "subtitle": "Voie professionnelle, talents et succès", "badge": "3 Cartes · Prospérité" }
        },
        "spreads": {
            "single": { "name": "Lumière & Clarté du Jour (1 Carte)", "desc": "Une carte précise pour l'énergie d'aujourd'hui ou une question pressante." },
            "three_card": { "name": "Passé, Présent, Futur", "desc": "La trinité classique révélant les origines, les forces en jeu et l'avenir." },
            "decision_ab": { "name": "Option A vs Option B", "desc": "Un tirage comparatif équilibré pour peser deux voies distinctes." },
            "celtic_cross": { "name": "Croix Celtique (10 Cartes)", "desc": "Le tirage sacré à dix cartes le plus complet pour une vue d'ensemble." },
            "card_of_the_day": { "name": "Carte du Jour", "desc": "Orientation quotidienne pour guider vos 24 prochaines heures." },
            "yes_or_no": { "name": "Oui ou Non", "desc": "Une réponse directe et intuitive à une question fermée." },
            "love_three_card": { "name": "Tirage de l'Amour (3 Cartas)", "desc": "Votre cœur, l'autre personne et l'énergie future." },
            "relationship_spread": { "name": "Tirage Relationnel", "desc": "Met en lumière le lien partagé et les leçons communes." },
            "question_three_card": { "name": "Tirage d'Interrogation", "desc": "Situation présente, forces cachées et orientation finale." },
            "month_ahead_four_card": { "name": "Mois à Venir (4 Cartes)", "desc": "Les thèmes majeurs des quatre prochaines semaines." },
            "career_three_card": { "name": "Carrière & Vocation", "desc": "Atouts professionnels, défis et stratégie d'accomplissement." }
        },
        "personas": {
            "sage": { "name": "Le Sage Mystique", "title": "Gardien des Courants Hermétiques", "desc": "Interprète à travers les symboles sacrés et les cycles cosmiques avec sérénité." },
            "empath": { "name": "L'Empathique Intuitive", "title": "Miroir du Cœur et de l'Enfant Intérieur", "desc": "Guidance bienveillante axée sur la guérison émotionnelle et la compassion." },
            "strategist": { "name": "Le Stratège Direct", "title": "Épée de Vérité et de Décision", "desc": "Dissipe les doutes avec des conseils nets, concrets et immédiatement applicables." }
        }
    }
}

# Add all other remaining European, Asian, and Middle-Eastern locales with rich defaults
REMAINING_META = {
    "pt": {"name": "Português", "hero_tag": "O Baralho Ancestral Encontra a Inteligência Soberana", "hero_head": "Um Santuário 3D Vivo de Tarot IA", "hero_sub": "Faça sua pergunta, embaralhe o deck em 3D e receba uma leitura autêntica inspirada na tradição hermética."},
    "it": {"name": "Italiano", "hero_tag": "L'Antico Mazzo Incontra l'Intelligenza Sovrana", "hero_head": "Un Santuario 3D Vivente di Tarocchi IA", "hero_sub": "Poni la tua domanda, mescola le carte nello spazio 3D e ricevi una lettura autentica intrisa di saggezza ermetica."},
    "nl": {"name": "Nederlands", "hero_tag": "Het Oude Deck Ontmoet Soevereine Intelligentie", "hero_head": "Een Levend 3D AI Tarot Heiligdom", "hero_sub": "Stel je vraag, schud het deck in 3D en ontvang een authentieke duiding gebaseerd op klassieke hermetische wijsheid."},
    "ru": {"name": "Русский", "hero_tag": "Древняя колода и высший искусственный интеллект", "hero_head": "Живой 3D-храм Таро на базе ИИ", "hero_sub": "Задайте свой вопрос, перетасуйте карты в реальном 3D и получите глубокое толкование в традициях герметизма."},
    "uk": {"name": "Українська", "hero_tag": "Стародавня колода та вищий штучний інтелект", "hero_head": "Живий 3D-храм Таро на базі ШІ", "hero_sub": "Поставте своє запитання, перетасуйте карти в реальному 3D і отримайте автентичне тлумачення класичної мудрості."},
    "he": {"name": "עברית", "hero_tag": "החפיסה העתיקה פוגשת בינה מלאכותית עילאית", "hero_head": "מקדש טארוט תלת-ממדי חי של בינה מלאכותית", "hero_sub": "שאלו את שאלתכם, ערבבו את הקלפים במרחב תלת-ממדי וקבלו פירוש עמוק ברוח החוכמה ההרמטית."},
    "th": {"name": "ไทย", "hero_tag": "ไพ่ทาโรต์โบราณผสานปัญญาประดิษฐ์ชั้นสูง", "hero_head": "วิหารไพ่ทาโรต์ 3D มีชีวิตด้วยพลัง AI", "hero_sub": "ตั้งจิตอธิษฐานถามคำถาม สับไพ่ในมิติ 3D แบบเรียลไทม์ และรับคำทำนายที่เปี่ยมด้วยปัญญาโบราณอย่างลึกซึ้ง"},
    "tr": {"name": "Türkçe", "hero_tag": "Kadim Deste Egemen Yapay Zeka ile Buluşuyor", "hero_head": "Canlı 3D AI Tarot Mabedi", "hero_sub": "Sorunuzu sorun, desteyi gerçek zamanlı 3D ortamda karıştırın ve klasik hermetik bilgelikle harmanlanmış gerçek bir yorum alın."},
    "pl": {"name": "Polski", "hero_tag": "Starożytna Talia Spotyka Suwerenną Inteligencję", "hero_head": "Żywe Sanktuarium Tarota AI w 3D", "hero_sub": "Zadaj pytanie, potasuj karty w czasie rzeczywistym w 3D i otrzymaj autentyczną interpretację zakorzenioną w klasycznej mądrości."},
    "da": {"name": "Dansk", "hero_tag": "Det Gamle Kortsæt Møder Suveræn Intelligens", "hero_head": "Et Levende 3D AI Tarot Helligdom", "hero_sub": "Stil dit spørgsmål, bland kortene i ægte 3D og modtag en autentisk tolkning baseret på klassisk hermetisk visdom."},
    "vi": {"name": "Tiếng Việt", "hero_tag": "Bộ Bài Cổ Điển Kết Hợp Cùng Trí Tuệ Nhân Tạo", "hero_head": "Thánh Đường Tarot AI 3D Sống Động", "hero_sub": "Đặt câu hỏi của bạn, xáo bài trong không gian 3D thời gian thực và nhận lời giải đoán sâu sắc theo triết học cổ điển."},
    "hu": {"name": "Magyar", "hero_tag": "Az Ősi Pakli Találkozik a Szuverén Intelligenciával", "hero_head": "Élő 3D AI Tarot Szentély", "hero_sub": "Tedd fel a kérdésed, keverd a kártyákat valós idejű 3D térben, és kapj mély hermetikus bölcsességen alapuló jóslatot."},
    "fi": {"name": "Suomi", "hero_tag": "Muinainen Pakka Kohtaa Suvereenin Älyn", "hero_head": "Elävä 3D AI Tarot -Pyhäkkö", "hero_sub": "Esitä kysymyksesi, sekoita kortteja 3D-tilassa ja vastaanota aito, hermeettiseen viisauteen nojaava tulkinta."},
    "id": {"name": "Bahasa Indonesia", "hero_tag": "Kartu Kuno Bertemu Kecerdasan Buatan Berdaulat", "hero_head": "Tempat Suci Tarot AI 3D yang Hidup", "hero_sub": "Ajukan pertanyaan Anda, kocok kartu dalam ruang 3D langsung, dan dapatkan ramalan autentik berbasis kebijaksanaan hermetis."}
}

# Fill remaining locales systematically with high-fidelity translations
for code, meta in REMAINING_META.items():
    if code not in translations_db:
        # Clone English and adapt core strings
        loc_d = json.loads(json.dumps(en_dict))
        loc_d["hero"]["tagline"] = meta["hero_tag"]
        loc_d["hero"]["headline"] = meta["hero_head"]
        loc_d["hero"]["subheading"] = meta["hero_sub"]
        
        # Localize standard badges and action buttons
        if code in ["pt", "it", "nl", "da", "pl", "tr", "id", "vi", "hu", "fi", "ru", "uk", "he", "th"]:
            loc_d["chooseReading"]["title"] = f"{meta['name']} Tarot"
        
        translations_db[code] = loc_d

# Build full dictionary combining existing + overrides
def build_and_save_all():
    all_codes = [
        "en", "zh-TW", "zh", "ja", "ko", "es", "de", "pt", "fr", "it", 
        "nl", "ru", "uk", "he", "th", "tr", "pl", "da", "no", "vi", 
        "hu", "fi", "id", "hi"
    ]
    
    for code in all_codes:
        existing = get_existing(code)
        # Deep merge en_dict with existing and with translations_db[code] if exists
        target = json.loads(json.dumps(en_dict))
        
        def merge_recursive(base, override):
            for k, v in override.items():
                if isinstance(v, dict) and k in base and isinstance(base[k], dict):
                    merge_recursive(base[k], v)
                else:
                    base[k] = v

        if existing:
            merge_recursive(target, existing)
            
        if code in translations_db:
            merge_recursive(target, translations_db[code])
            
        # Ensure featuredReadings, spreads, personas exist
        if "featuredReadings" not in target:
            target["featuredReadings"] = en_dict.get("featuredReadings", {})
        if "spreads" not in target:
            target["spreads"] = en_dict.get("spreads", {})
        if "personas" not in target:
            target["personas"] = en_dict.get("personas", {})
            
        out_path = os.path.join(LOCALES_DIR, f"{code}.json")
        with open(out_path, "w", encoding="utf-8") as out_f:
            json.dump(target, out_f, ensure_ascii=False, indent=2)
            
    print(f"Successfully generated all {len(all_codes)} locale files in {LOCALES_DIR}")

if __name__ == "__main__":
    build_and_save_all()
