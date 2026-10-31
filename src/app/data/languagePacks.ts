import type { DemoLanguage, ResponseMatter, ResponseTurn } from './responseTurns';
import { PREPARED_TURNS, getTurnById } from './responseTurns';

/**
 * Prepared multilingual packs for the consumer-explain turn.
 * Same facts and sources; different string packs. No live translation.
 */

type LocalizedExplain = {
  title: string;
  ruleMeans: string;
  appliesHere: string;
  nextSteps: string[];
  cta: string;
  /** Zone 4 — the unsourced claim, named concretely (never a generic disclaimer). */
  doesntCover?: string;
  userPrompt: string;
};

export const CONSUMER_EXPLAIN_I18N: Record<DemoLanguage, LocalizedExplain> = {
  en: {
    title: 'Refund for a damaged mixer',
    ruleMeans:
      'When a product arrives damaged, that can count as a consumer issue. You can ask the seller for repair, replacement, or a refund. If they ignore a fair written ask, you can follow up with a legal notice.',
    appliesHere:
      'Your mixer arrived damaged and the seller refused a replacement. The invoice, damage photos, and written refusal give you a solid next step.',
    nextSteps: [
      'Send a written demand notice by registered post with acknowledgement due (AD), and keep the postal receipt.',
      'Save the invoice, WhatsApp or seller-chat screenshots, platform order or ticket ID, defect photos or videos, and warranty details together.',
      'If the seller ignores the notice, prepare a consumer complaint — you can use e-Daakhil, or call National Consumer Helpline (1915), or approach the District Consumer Commission.',
    ],
    cta: 'Prepare demand notice',
    doesntCover:
      'One claim above is not yet sourced: whether the invoice date or the seller-chat date is the one the law counts. That date sets your two-year window, so confirm it before filing.',
    userPrompt: 'I bought a mixer grinder for ₹8,999. It arrived damaged and the seller refused a replacement. What can I do?',
  },
  hi: {
    title: 'खराब मिक्सर का रिफंड',
    ruleMeans:
      'जब सामान खराब अवस्था में पहुँचे, तो यह उपभोक्ता मुद्दा बन सकता है। आप विक्रेता से मरम्मत, बदलने या रिफंड माँग सकते हैं। अगर लिखित माँग नज़रअंदाज़ हो, तो कानूनी नोटिस भेज सकते हैं।',
    appliesHere:
      'आपका मिक्सर खराब पहुँचा और विक्रेता ने बदलने से मना कर दिया। इनवॉइस, नुकसान की तस्वीरें और लिखित इनकार अगले कदम के लिए काफ़ी हैं।',
    nextSteps: [
      'विक्रेता या प्लेटफ़ॉर्म को लिखित माँग नोटिस रजिस्टर्ड पोस्ट (AD / acknowledgement due) से भेजें और डाक रसीद रखें।',
      'इनवॉइस, WhatsApp या विक्रेता चैट के स्क्रीनशॉट, प्लेटफ़ॉर्म ऑर्डर या टिकट ID, दोष की तस्वीरें/वीडियो और वारंटी एक साथ सहेजें।',
      'अगर नोटिस नज़रअंदाज़ हो, तो e-Daakhil पर शिकायत दर्ज करें, National Consumer Helpline (1915) पर कॉल करें, या जिला उपभोक्ता आयोग जा सकते हैं।',
    ],
    cta: 'माँग नोटिस तैयार करें',
    doesntCover:
      'ऊपर एक दावा अभी स्रोत से पुष्ट नहीं है: कानून इनवॉइस की तारीख़ गिनता है या विक्रेता-चैट वाली तारीख़। यही तारीख़ आपकी दो-साल की समय-सीमा तय करती है, इसलिए दाख़िल करने से पहले इसकी पुष्टि करें।',
    userPrompt: 'मैंने ₹8,999 का मिक्सर ग्राइंडर खरीदा। वह खराब पहुँचा और विक्रेता ने बदलने से मना कर दिया। मैं क्या करूँ?',
  },
  mr: {
    title: 'खराब मिक्सरचा परतावा',
    ruleMeans:
      'सामान खराब अवस्थेत आले तर ही ग्राहक समस्या ठरू शकते. तुम्ही विक्रेत्याकडे दुरुस्ती, बदल किंवा परतावा मागू शकता. लेखी मागणी दुर्लक्षित झाल्यास कायदेशीर नोटीस पाठवू शकता.',
    appliesHere:
      'तुमचा मिक्सर खराब आला आणि विक्रेत्याने बदलण्यास नकार दिला. इनव्हॉइस, नुकसान छायाचित्रे आणि लेखी नकार पुढच्या पावलासाठी पुरेसे आहेत.',
    nextSteps: [
      'विक्रेता किंवा प्लॅटफॉर्मला लेखी मागणी नोटीस रजिस्टर्ड पोस्ट (AD / acknowledgement due) ने पाठवा आणि पोस्टल पावती ठेवा.',
      'इनव्हॉइस, WhatsApp किंवा विक्रेता चॅट स्क्रीनशॉट, प्लॅटफॉर्म ऑर्डर किंवा तिकीट ID, दोष छायाचित्रे/व्हिडिओ आणि वॉरंटी एकत्र जतन करा.',
      'नोटीस दुर्लक्षित झाल्यास e-Daakhil वर तक्रार दाखल करा, National Consumer Helpline (1915) वर कॉल करा, किंवा जिल्हा ग्राहक आयोगात जा.',
    ],
    cta: 'मागणी नोटीस तयार करा',
    doesntCover:
      'वरील एक दावा अजून स्रोताशी पुष्ट नाही: कायदा कोणती तारीख मोजतो — इन्ह्वॉइसची की विक्रेता-चॅटची. तीच तारीख तुमची दोन-वर्षांची मुदत ठरवते, त्यामुळे दाखल करण्यापूर्वी तिची खात्री करा.',
    userPrompt: 'मी ₹8,999 चा मिक्सर ग्राइंडर विकत घेतला. तो खराब आला आणि विक्रेत्याने बदलण्यास नकार दिला. मी काय करू?',
  },
  ta: {
    title: 'சேதமடைந்த மிக்சர் — refund',
    ruleMeans:
      'பொருள் சேதத்துடன் வந்தால் அது நுகர்வோர் பிரச்சினையாக இருக்கலாம். விற்பனையாளரிடம் பழுது, மாற்றம் அல்லது refund கேட்கலாம். எழுத்துப்பூர்வ கோரிக்கை புறக்கணிக்கப்பட்டால் சட்ட அறிவிப்பு அனுப்பலாம்.',
    appliesHere:
      'உங்கள் மிக்சர் சேதத்துடன் வந்தது; விற்பனையாளர் மாற்ற மறுத்தார். விலைப்பட்டியல், சேதப் படங்கள் மற்றும் எழுத்துப்பூர்வ மறுப்பு அடுத்த படிக்கு போதுமானவை.',
    nextSteps: [
      'விற்பனையாளர் அல்லது தளத்திற்கு எழுத்துப்பூர்வ கோரிக்கை அறிவிப்பை registered post with AD (acknowledgement due) மூலம் அனுப்பி, அஞ்சல் ரசீதை வைத்திருங்கள்.',
      'விலைப்பட்டியல், WhatsApp அல்லது விற்பனையாளர் அரட்டை ஸ்கிரீன்ஷாட், தள order அல்லது ticket ID, குறைபாட்டுப் படங்கள்/வீடியோ மற்றும் உத்தரவாதத்தை ஒன்றாகச் சேமிக்கவும்.',
      'அறிவிப்பு புறக்கணிக்கப்பட்டால் e-Daakhil-இல் புகார் தாக்கல் செய்யவும், National Consumer Helpline (1915) அழைக்கவும், அல்லது மாவட்ட நுகர்வோர் ஆணையத்தை அணுகவும்.',
    ],
    cta: 'கோரிக்கை அறிவிப்பைத் தயாரிக்கவும்',
    doesntCover:
      'மேலே ஒரு கூற்றுக்கு இன்னும் ஆதாரம் இல்லை: சட்டம் எந்தத் தேதியைக் கணக்கிடுகிறது — விலைப்பட்டியலா அல்லது விற்பனையாளர் அரட்டையா. அந்தத் தேதியே உங்கள் இரண்டு-ஆண்டு காலத்தை முடிவு செய்கிறது; தாக்கல் செய்வதற்கு முன் உறுதிப்படுத்துங்கள்.',
    userPrompt: 'நான் ₹8,999க்கு மிக்சர் கிரைண்டர் வாங்கினேன். அது சேதத்துடன் வந்தது; விற்பனையாளர் மாற்ற மறுத்தார். நான் என்ன செய்வது?',
  },
};

/** Glossary plain meanings in Indic scripts for highlighted terms (or skip highlight). */
export const GLOSSARY_I18N: Partial<Record<DemoLanguage, Record<string, { term: string; simpleMeaning: string; example: string }>>> = {
  hi: {
    deficiency: {
      term: 'कमी',
      simpleMeaning: 'उत्पाद या सेवा में वह खामी जो विक्रेता से उचित रूप से अपेक्षित थी।',
      example: 'वादा के अनुसार न चलने वाला मिक्सर दोषपूर्ण उत्पाद माना जा सकता है।',
    },
    legalNotice: {
      term: 'कानूनी नोटिस',
      simpleMeaning: 'औपचारिक लिखित संदेश जो शिकायत और अपेक्षित कार्रवाई बताता है।',
      example: 'खरीदार विक्रेता से रिफंड या बदलने की लिखित माँग भेज सकता है।',
    },
    districtCommission: {
      term: 'जिला उपभोक्ता आयोग',
      simpleMeaning: 'वस्तुओं और सेवाओं की पात्र शिकायतें सुनने वाला स्थानीय निकाय।',
      example: 'विक्रेता शिकायत न सुलझाए तो खरीदार इसके पास जा सकता है।',
    },
  },
  mr: {
    deficiency: {
      term: 'कमतरता',
      simpleMeaning: 'उत्पादन किंवा सेवेतील ती उणीव जी विक्रेत्याकडून योग्यरित्या अपेक्षित होती.',
      example: 'वचनानुसार न चालणारा मिक्सर दोषपूर्ण उत्पादन मानले जाऊ शकते.',
    },
    legalNotice: {
      term: 'कायदेशीर नोटीस',
      simpleMeaning: 'तक्रार आणि अपेक्षित कृती सांगणारा औपचारिक लेखी संदेश.',
      example: 'खरेदीदार विक्रेत्यास परतावा किंवा बदल मागणारी लेखी मागणी पाठवू शकतो.',
    },
  },
  ta: {
    deficiency: {
      term: 'குறைபாடு',
      simpleMeaning: 'விற்பனையாளரிடமிருந்து முறையாக எதிர்பார்க்கப்பட்ட பொருள் அல்லது சேவையில் உள்ள குறை.',
      example: 'வாக்குறுதியின்படி இயங்காத மிக்சர் குறைபாடுள்ள பொருளாகக் கருதப்படலாம்.',
    },
    legalNotice: {
      term: 'சட்ட அறிவிப்பு',
      simpleMeaning: 'புகாரையும் எதிர்பார்க்கும் நடவடிக்கையையும் விளக்கும் முறையான எழுத்துப்பூர்வ செய்தி.',
      example: 'வாங்குபவர் விற்பனையாளரிடம் refund அல்லது மாற்றத்தைக் கோரும் எழுத்துப்பூர்வ கோரிக்கை அனுப்பலாம்.',
    },
  },
};

export function localizeConsumerExplain(language: DemoLanguage): ResponseTurn {
  const base = getTurnById('consumer-explain')!;
  const pack = CONSUMER_EXPLAIN_I18N[language];
  return {
    ...base,
    language,
    title: pack.title,
    trigger: pack.userPrompt,
    payload: {
      mode: 'explain',
      data: {
        ruleMeans: pack.ruleMeans,
        appliesHere: pack.appliesHere,
        nextSteps: pack.nextSteps,
        cta: pack.cta,
        doesntCover: pack.doesntCover,
        glossaryIds: language === 'en' ? ['deficiency', 'legalNotice', 'districtCommission'] : language === 'hi' ? ['deficiency', 'legalNotice'] : ['deficiency'],
      },
    },
  };
}

/* ─── The clarify middle, localized ─────────────────────────────────────────
 * The chat's first exchange on the consumer matter asks ONE question (the
 * purchase date) because the answer genuinely routes the next turn: inside
 * the two-year window → the full explanation; outside it → the statute
 * expiry stop; unsure → the honest partial answer. A chat that asks and
 * *uses* the answer is the conversation middle the audit asked for (F1).
 *
 * Localization scope: the question, why-it-matters, and option labels ship
 * in all four prepared languages. The two non-explain FOLLOW-UP turns
 * (statute expiry, source gap) are English-only today — adding their packs
 * is the same three-file change as every language (see SCRIPT_RAIL note),
 * so until then non-Latin chats are offered only the localized explain
 * path rather than an English stop state in a Hindi conversation. */

export interface ClarifyOption {
  label: string;
  nextTurnId: 'consumer-explain' | 'statute-expiry-stop' | 'source-gap-disclose';
  /** The captured answer, localized — the matter log records what you said, not a chip id. */
  said?: string;
}

const CONSUMER_CLARIFY_I18N: Record<
  DemoLanguage,
  {
    title: string;
    question: string;
    whyItMatters: string;
    unlocks: string;
    options: ClarifyOption[];
  }
> = {
  en: {
    title: 'One date shapes your options',
    question: 'When did you buy the mixer?',
    whyItMatters:
      'The law gives you two years from purchase to take a consumer complaint further. Your date decides which doors are still open.',
    unlocks: 'Pick the closest answer below, or type it — LokAI takes the next step from there.',
    options: [
      { label: 'In the last two years', nextTurnId: 'consumer-explain' },
      { label: 'More than two years ago', nextTurnId: 'statute-expiry-stop' },
      { label: 'I’m not sure of the exact date', nextTurnId: 'source-gap-disclose' },
    ],
  },
  hi: {
    title: 'एक तारीख़ आपके विकल्प तय करती है',
    question: 'आपने मिक्सर कब खरीदा था?',
    whyItMatters:
      'कानून खरीद की तारीख़ से दो साल तक उपभोक्ता शिकायत का रास्ता खोलता है। आपकी तारीख़ तय करती है कि अब कौन-से रास्ते खुले हैं।',
    unlocks: 'नीचे सबसे सही जवाब चुनें, या लिखकर बताएं — आगे कदम LokAI उठाएगा।',
    options: [
      { label: 'पिछले दो साल के भीतर', nextTurnId: 'consumer-explain' },
      { label: 'दो साल से पहले', nextTurnId: 'statute-expiry-stop' },
      { label: 'सही तारीख़ याद नहीं', nextTurnId: 'source-gap-disclose' },
    ],
  },
  mr: {
    title: 'एक तारीख तुमचे पर्याय ठरवते',
    question: 'तुम्ही मिक्सर कधी विकत घेतला होता?',
    whyItMatters:
      'कायदा खरेदीच्या तारखेपासून दोन वर्षांपर्यंत ग्राहक तक्रारीचा मार्ग खुला ठेवतो. तुमची तारीख ठरवते की आता कोणते मार्ग उपलब्ध आहेत.',
    unlocks: 'खालील योग्य उत्तर निवडा, किंवा लिहून सांगा — पुढील पाऊल LokAI उचलेल.',
    options: [
      { label: 'गेल्या दोन वर्षांत', nextTurnId: 'consumer-explain' },
      { label: 'दोन वर्षांपूर्वी', nextTurnId: 'statute-expiry-stop' },
      { label: 'नेमकी तारीख आठवत नाही', nextTurnId: 'source-gap-disclose' },
    ],
  },
  ta: {
    title: 'ஒரு தேதி உங்கள் வழிகளை தீர்மானிக்கிறது',
    question: 'மிக்சரை எப்போது வாங்கினீர்கள்?',
    whyItMatters:
      'வாங்கிய தேதியிலிருந்து இரண்டு ஆண்டுகளுக்குள் நுகர்வோர் புகார் செய்யலாம். உங்கள் தேதி என்ன வழிகள் இன்னும் திறந்திருக்கின்றன என்பதை முடிவு செய்கிறது.',
    unlocks: 'கீழே பொருத்தமான பதிலைத் தேர்ந்தெடுக்கவும், அல்லது எழுதிக் கூறவும் — அடுத்த படியை LokAI எடுக்கும்.',
    options: [
      { label: 'கடந்த இரண்டு ஆண்டுகளில்', nextTurnId: 'consumer-explain' },
      { label: 'இரண்டு ஆண்டுகளுக்கு முன்', nextTurnId: 'statute-expiry-stop' },
      { label: 'சரியான தேதி நினைவில் இல்லை', nextTurnId: 'source-gap-disclose' },
    ],
  },
};

export function localizeConsumerClarify(language: DemoLanguage): ResponseTurn {
  const base = getTurnById('consumer-clarify')!;
  const pack = CONSUMER_CLARIFY_I18N[language];
  return {
    ...base,
    language,
    title: pack.title,
    payload: {
      mode: 'clarify',
      data: {
        question: pack.question,
        whyItMatters: pack.whyItMatters,
        unlocks: pack.unlocks,
      },
    },
  };
}

/** The tappable answers under the clarify turn, in the reader's language. */
export function clarifyOptionsFor(language: DemoLanguage): ClarifyOption[] {
  return CONSUMER_CLARIFY_I18N[language].options;
}

/* ─── The clarify follow-up turns, localized ─────────────────────────────────
 * The two non-explain follow-ups (statute expiry → stop, source gap →
 * disclose) ship in all four prepared languages. Rule from the audit: a
 * localized question must never route to an unlocalized answer. English
 * returns the canonical turn unchanged. */

const FOLLOWUP_I18N: Partial<
  Record<DemoLanguage, Partial<Record<'statute-expiry-stop' | 'source-gap-disclose', {
    title: string;
    primary: string;
    preserved: string;
    steps: [string, string, string];
    systemsNote?: string;
  }>>>
> = {
  hi: {
    'statute-expiry-stop': {
      title: 'समय-सीमा यह रास्ता बंद कर सकती है',
      primary: 'यह उदाहरण जनवरी 2022 की खरीद दिखाता है — इस डेमो की समय-सीमा से पुराना। इसलिए LokAI नोटिस नहीं बनाएगा या शिकायत का सुझाव नहीं देगा; आपकी असली तारीख़ों के लिए वकील ही समय-सीमा जाँच सकता है।',
      preserved: 'जनवरी 2022 में ₹8,999 का खराब मिक्सर खरीदा; विक्रेता अब भी रिफंड से मना कर रहा है। सबूत सूची और मामले का सारांश सुरक्षित है।',
      steps: ['खरीद और सबूतों का सारांश रखें', 'अपनी तारीख़ों के लिए समय-सीमा के बारे में वकील या लीगल-एड वर्कर से पूछें', 'मौजूदा कंज्यूमर-रिफंड उदाहरण पर लौटें'],
      systemsNote: 'समय-सीमा इस बात पर निर्भर करती है कि शिकायत की घड़ी कब शुरू हुई और कौन-सा फोरम सुनेगा। आपके मामले के लिए यह फ़ैसला सिर्फ कोर्ट या वकील करेगा — यह प्रोटोटाइप अंदाज़ा लगाने के बजाय रुक जाता है।',
    },
    'source-gap-disclose': {
      title: 'मार्केटप्लेस की नीति जाँची नहीं जा सकी',
      primary: 'खराब उत्पाद के लिए सामान्य उपभोक्ता रास्ता कंज्यूमर प्रोटेक्शन एक्ट के तहत अब भी खुला है।',
      preserved: 'इस तैयार डेमो में मार्केटप्लेस की निजी रिटर्न नीति का कोई आधिकारिक रिकॉर्ड नहीं है, इसलिए LokAI यह नहीं कहेगा कि वह नीति आपके अधिकारों पर हावी है या नहीं।',
      steps: ['यहाँ दी गई सामान्य उपभोक्ता जानकारी पढ़ें।', 'अगर आपके पास मार्केटप्लेस की नीति का टेक्स्ट है तो जोड़ें।', 'किसी भी मार्केटप्लेस-नीति दावे पर भरोसा करने से पहले कानूनी पेशेवर से पूछें।'],
    },
  },
  mr: {
    'statute-expiry-stop': {
      title: 'मुदत या मार्ग अडवळू शकते',
      primary: 'हे उदाहरण जानेवारी 2022ची खरेदी दाखवते — या डेमोच्या मुदतीपेक्षा जुने. म्हणून LokAI नोटीस तयार करणार नाही किंवा तक्रारीचा सल्ला देणार नाही; तुमच्या खऱ्या तारखांसाठी वकीलच मुदत तपासू शकतो.',
      preserved: 'जानेवारी 2022मध्ये ₹8,999चा खराब मिक्सर खरेदी केला; विक्रेता अजून परताव्यास नकार देतो. पुरावा यादी आणि प्रकरणाचा सारांश जतन केला आहे.',
      steps: ['खरेदी व पुराव्यांचा सारांश जतन करा', 'तुमच्या तारखांसाठी मुदतीबाबत वकील किंवा लीगल-एड कर्मचाऱ्यास विचारा', 'सध्याच्या ग्राहक-परतावा उदाहरणाकडे परत जा'],
      systemsNote: 'मुदत यावर अवलंबून आहे की तक्रारीची घड्याळ कधी सुरू झाली आणि कोणते फोरम ऐकेल. तुमच्या प्रकरणासाठी हा निर्णय कोर्ट किंवा वकीलच घेईल — हे प्रोटोटाइप अंदाज लावण्याऐवजी थांबते.',
    },
    'source-gap-disclose': {
      title: 'मार्केटप्लेसचे धोरण तपासता आले नाही',
      primary: 'खराब उत्पादनासाठी सामान्य ग्राहक मार्ग कॉन्स्युमर प्रोटेक्शन ॲक्टअंतर्गत अजून खुला आहे.',
      preserved: 'या तयार डेमोमध्ये मार्केटप्लेसच्या खाजगी रिटर्न धोरणाचा अधिकृत मजकूर नाही, म्हणून LokAI ते धोरण तुमच्या हक्कांवर वरचढ आहे का ते सांगणार नाही.',
      steps: ['येथे दिलेली सामान्य ग्राहक माहिती वाचा.', 'तुमच्याकडे मार्केटप्लेसच्या धोरणाचा मजकूर असल्यास तो जोडा.', 'कोणत्याही मार्केटप्लेस-धोरण दाव्यावर विश्वास ठेवण्यापूर्वी कायदेविषयक व्यावसायिकास विचारा.'],
    },
  },
  ta: {
    'statute-expiry-stop': {
      title: 'காலவரம்பு இந்த வழியைத் தடுக்கலாம்',
      primary: 'இந்த எடுத்துக்காட்டு ஜனவரி 2022 வாங்குதலைக் காட்டுகிறது — இந்த டெமோ உள்ளடக்கும் காலவரம்பைவிட பழையது. எனவே LokAI நோட்டீஸ் உருவாக்கவோ புகார் அளிக்கப் பரிந்துரைக்கவோ செய்யாது; உங்கள் உண்மையான தேதிகளுக்கு வழக்கறிஞரால் மட்டுமே காலவரம்பைச் சரிபார்க்க முடியும்.',
      preserved: 'ஜனவரி 2022இல் ₹8,999க்கு வாங்கிய பழுதான மிக்சர்; விற்பனையாளர் இன்னும் ரீஃபண்டுக்கு மறுக்கிறார். ஆதாரப் பட்டியலும் வழக்கின் சுருக்கமும் பாதுகாக்கப்பட்டுள்ளன.',
      steps: ['வாங்குதல் மற்றும் ஆதாரங்களின் சுருக்கத்தை வைத்திருங்கள்', 'உங்கள் தேதிகளுக்கான காலவரம்பு பற்றி வழக்கறிஞர் அல்லது சட்ட உதவியாளரிடம் கேளுங்கள்', 'நடைமுறை நுகர்வோர்-ரீஃபண்டு எடுத்துக்காட்டுக்குத் திரும்புங்கள்'],
      systemsNote: 'காலவரம்பு எப்போது புகார் கடிகாரம் தொடங்கியது, எந்த மன்றம் விசாரிக்கும் என்பதைப் பொறுத்தது. உங்கள் வழக்குக்கு அந்த முடிவை நீதிமன்றம் அல்லது வழக்கறிஞரால் மட்டுமே எடுக்க முடியும் — இந்த முன்மாதிரி ஊகிப்பதற்குப் பதிலாக நிற்கிறது.',
    },
    'source-gap-disclose': {
      title: 'மார்க்கெட்பிளேஸ் கொள்கையைச் சரிபார்க்க முடியவில்லை',
      primary: 'பழுதான பொருளுக்கான சாதாரண நுகர்வோர் வழி, நுகர்வோர் பாதுகாப்புச் சட்டத்தின் கீழ் இன்னும் திறந்துள்ளது.',
      preserved: 'இந்த தயார் டெமோவில் மார்க்கெட்பிளேஸின் தனியார் ரிட்டர்ன் கொள்கைக்கான அதிகாரப்பூர்வ பதிவு இல்லை, எனவே அந்தக் கொள்கை உங்கள் உரிமைகளை மீறுகிறதா என்று LokAI சொல்லாது.',
      steps: ['இங்கே அளிக்கப்பட்ட சாதாரண நுகர்வோர் தகவலைப் படியுங்கள்.', 'மார்க்கெட்பிளேஸ் கொள்கை உரை உங்களிடம் இருந்தால் சேருங்கள்.', 'எந்த மார்க்கெட்பிளேஸ்-கொள்கை கூற்றையும் நம்புவதற்கு முன் சட்ட நிபுணரிடம் கேளுங்கள்.'],
    },
  },
};

/**
 * The clarify follow-up turns in the reader's language. English returns the
 * canonical turn; hi/mr/ta return the pack with the payload re-pointed.
 * Returns undefined when no pack exists — callers keep the EN turn and the
 * honesty banner covers the gap.
 */
export function localizeConsumerFollowUp(
  turnId: 'statute-expiry-stop' | 'source-gap-disclose',
  language: DemoLanguage,
): ResponseTurn | undefined {
  if (language === 'en') return undefined;
  const base = getTurnById(turnId);
  const pack = FOLLOWUP_I18N[language]?.[turnId];
  if (!base || !pack) return undefined;
  return {
    ...base,
    language,
    title: pack.title,
    payload: base.payload.mode === 'stop'
      ? { mode: 'stop', data: {
          ...base.payload.data,
          reason: pack.primary,
          preservedSummary: pack.preserved,
          stillAvailable: [...pack.steps],
          ...(pack.systemsNote ? { systemsNote: pack.systemsNote } : {}),
        } }
      : { mode: 'disclose', data: {
          ...base.payload.data,
          partialAnswer: pack.primary,
          gap: pack.preserved,
          whatYouCanStillDo: [...pack.steps],
        } },
  };
}

/** The prepared reading for an attached document that has no claim to
 *  interpret. Its acknowledgement copy is the pack's, not a second literal —
 *  see the `receiptFiled*` fields in `TurnChrome`. */
export function localizeReceiptFiled(language: DemoLanguage): ResponseTurn | undefined {
  const base = getTurnById('receipt-filed');
  if (!base || language === 'en') return undefined;
  const chrome = turnChrome(language);
  return {
    ...base,
    language,
    title: chrome.receiptFiledTitle,
    payload: {
      mode: 'confirm',
      data: {
        acknowledgement: chrome.receiptFiledAck,
        nextHint: chrome.receiptFiledHint,
      },
    },
  };
}

export const SCRIPT_RAIL: { id: DemoLanguage; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'mr', label: 'Marathi', native: 'मराठी' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

/* ─── Language registry — the single place a language is added ──────────────
 *
 * Adding a language is a three-step change and this is step one:
 *   1. add a row here with `prepared: true` and its script
 *   2. add its string pack to CONSUMER_EXPLAIN_I18N above (+ GLOSSARY_I18N)
 *   3. import its Noto subset in src/styles/fonts.css
 *
 * `prepared` is the honesty flag. LokAI's language picker deliberately shows
 * the full ambition (India is multilingual; that is the founding thesis) but
 * must not imply coverage it does not have — .design-os/02-blueprint.md
 * explicitly rejects claiming "12 fully localized languages". Rows with
 * `prepared: false` render as visibly not-yet-available rather than as
 * working options that silently fall back to English.
 *
 * `script` drives font selection. Only devanagari and tamil subsets are
 * loaded (see fonts.css), which is exactly why every other script is
 * `prepared: false` — an unloaded script would render in an arbitrary
 * device fallback and break the line's baseline against inline Latin.
 */
export type LanguageScript = 'latin' | 'devanagari' | 'tamil';

export interface LanguageEntry {
  code: string;
  native: string;
  english: string;
  script: LanguageScript | 'unloaded';
  prepared: boolean;
}

export const LANGUAGE_REGISTRY: LanguageEntry[] = [
  { code: 'en', native: 'English',   english: 'English',   script: 'latin',      prepared: true  },
  { code: 'hi', native: 'हिन्दी',      english: 'Hindi',     script: 'devanagari', prepared: true  },
  { code: 'mr', native: 'मराठी',      english: 'Marathi',   script: 'devanagari', prepared: true  },
  { code: 'ta', native: 'தமிழ்',      english: 'Tamil',     script: 'tamil',      prepared: true  },
  { code: 'bn', native: 'বাংলা',      english: 'Bengali',   script: 'unloaded',   prepared: false },
  { code: 'te', native: 'తెలుగు',     english: 'Telugu',    script: 'unloaded',   prepared: false },
  { code: 'pa', native: 'ਪੰਜਾਬੀ',      english: 'Punjabi',   script: 'unloaded',   prepared: false },
  { code: 'gu', native: 'ગુજરાતી',    english: 'Gujarati',  script: 'unloaded',   prepared: false },
  { code: 'kn', native: 'ಕನ್ನಡ',      english: 'Kannada',   script: 'unloaded',   prepared: false },
  { code: 'or', native: 'ଓଡ଼ିଆ',      english: 'Odia',      script: 'unloaded',   prepared: false },
  { code: 'ml', native: 'മലയാളം',    english: 'Malayalam', script: 'unloaded',   prepared: false },
  { code: 'as', native: 'অসমীয়া',    english: 'Assamese',  script: 'unloaded',   prepared: false },
];

export const PREPARED_LANGUAGES = LANGUAGE_REGISTRY.filter((l) => l.prepared);

export function isPreparedLanguage(code: string): code is DemoLanguage {
  return LANGUAGE_REGISTRY.some((l) => l.code === code && l.prepared);
}

/* ── Localized notice explain (audit §15 hole) ──────────────────────────────
 * The notice-explain turn was English-only, so a Hindi/Marathi/Tamil user
 * typing "notice" got an English answer wearing the reader's language —
 * the exact betrayal the audit names. The notice surface itself is already
 * fully localized in `noticeInterpretation.ts` (summary + fields for all
 * four scripts); this pack composes that content into the explain turn's
 * three zones so the chat answer matches the notice reader. Rule statements
 * and next steps are written in the reader's own script, never machine
 * transliterated. */

const NOTICE_EXPLAIN_I18N: Record<DemoLanguage, {
  title: string;
  ruleMeans: string;
  appliesHere: string;
  nextSteps: [string, string, string];
  cta: string;
}> = {
  en: {
    title: 'Sample notice explained',
    ruleMeans:
      'A property-tax demand notice asks you to pay listed dues by a stated date. Missing the date can lead to recovery steps under the local municipal law.',
    appliesHere:
      'The prepared BMC notice lists ₹32,480 due by 15 April 2026. Check the amount and deadline on the original paper before paying or disputing.',
    nextSteps: [
      'Compare every figure with your property-tax account statement.',
      'If the amount looks wrong, raise a written query with the ward office before the deadline.',
      'Keep a copy of the notice and any payment receipt.',
    ],
    cta: 'Review the original notice',
  },
  hi: {
    title: 'तैयार नोटिस समझाई गई',
    ruleMeans:
      'संपत्ति-कर माँग नोटिस आपसे एक तय तारीख़ तक बकाया रक्म भरने को कहती है। तारीख़ छूट जाने पर स्थानीय नगर कानून के तहत वसूली की कार्रवाई शुरू हो सकती है।',
    appliesHere:
      'यह बृहन्मुंबई महानगरपालिका की संपत्ति-कर माँग है। इसमें बांद्रा (पश्चिम) के फ्लैट पर 2025–26 का ₹32,480 बकाया बताया गया है और 15 अप्रैल 2026 तक भुगतान कहा गया है। भुगतान या आपत्ति से पहले मूल कागज़ पर लिखी रक्म और तारीख़ ज़रूर मिलाएँ।',
    nextSteps: [
      'नोटिस की हर रक्म और तारीख़ अपने संपत्ति-कर खाते से मिलाएँ।',
      'रक्म गलत लगे तो तारीख़ से पहले वार्ड ऑफिस में लिखित सवाल भेजें।',
      'नोटिस और किसी भी भुगतान रसीद की एक प्रति रखें।',
    ],
    cta: 'मूल नोटिस देखें',
  },
  mr: {
    title: 'तयार नोटीस समजावून सांगितली',
    ruleMeans:
      'मालमत्ता-कर मागणी नोटीस तुम्हाला ठरलेली तारखेपर्यंत थकीत रक्म भरण्यास सांगते. तारीख चुकल्यास स्थानिक महानगरपालिका कायद्यानंतर्गत वसुलीची कारवाई सुरू होऊ शकते.',
    appliesHere:
      'ही बृहन्मुंबई महानगरपालिकेची मालमत्ता-कर मागणी आहे. बांद्रा (पश्चिम) येथील सदनिकेवर 2025–26 चा ₹32,480 थकीत असल्याचे सांगितले आहे आणि 15 एप्रिल 2026 पूर्वी भरण्यास सांगितले आहे. भरणे किंवा आक्षेप धाण्यापूर्वी मूळ कागदावरील रक्कम व तारीख तपासा.',
    nextSteps: [
      'नोटीसमधील प्रत्येक रक्कम व तारीख तुमच्या मालमत्ता-कर खात्याशी जुळवा.',
      'रक्कम चुकीची दिसल्यास तारखेपूर्वी वॉर्ड कार्यालयात लेखी विचार करा.',
      'नोटीस व भरणी पावतींची एक प्रत ठेवा.',
    ],
    cta: 'मूळ नोटीस पहा',
  },
  ta: {
    title: 'தயார் அறிவிப்பு விளக்கப்பட்டது',
    ruleMeans:
      'சொத்து-வரி கோரிக்கை அறிவிப்பு, குறிப்பிட்ட தேதிக்குள் நிலுவையில் உள்ள தொகையைச் செலுத்தச் சொல்கிறது. தேதியைத் தவறினால் உள்ளூர் நகராட்சி சட்டத்தின் கீழ் வசூல் நடவடிக்கை தொடங்கலாம்.',
    appliesHere:
      'இது பிரிஹன்மும்பை மாநகராட்சியின் சொத்து-வரி கோரிக்கை. பாந்த்ரா (மேற்கு) வீட்டிற்கு 2025–26 ஆண்டின் ₹32,480 வரி நிலுவையில் இருப்பதாகச் சொல்கிறது, 15 ஏப்ரல் 2026க்குள் செலுத்தச் சொல்கிறது. பணம் செலுத்தவோ எதிர்ப்பது முன்போ மூல் ஆவணத்தில் உள்ள தொகையையும் தேதியையும் சரிபார்க்கவும்.',
    nextSteps: [
      'அறிவிப்பில் உள்ள ஒவ்வொரு தொகையையும் தேதியையும் உங்கள் சொத்து-வரி கணக்குடன் ஒப்பிடுங்கள்.',
      'தொகை தவறாகத் தெரிந்தால் தேதிக்கு முன் வார்டு அலுவலகத்திற்கு எழுத்துப்பூர்வ கேள்வி கேளுங்கள்.',
      'அறிவிப்பின் நகலையும் பணம் செலுத்திய ரசீதுகளையும் வைத்திருங்கள்.',
    ],
    cta: 'மூல் அறிவிப்பைப் பாருங்கள்',
  },
};

export function localizeNoticeExplain(language: DemoLanguage): ResponseTurn {
  const base = getTurnById('notice-explain')!;
  if (language === 'en') return base;
  const pack = NOTICE_EXPLAIN_I18N[language];
  return {
    ...base,
    language,
    title: pack.title,
    payload: {
      mode: 'explain',
      data: {
        ruleMeans: pack.ruleMeans,
        appliesHere: pack.appliesHere,
        nextSteps: [pack.nextSteps[0], pack.nextSteps[1], pack.nextSteps[2]],
        cta: pack.cta,
      },
    },
  };
}


/* ─── The trust chrome, localized ────────────────────────────────────────────
 * The pipeline's UI strings are content too (DECISION-INTERACTION §6): the
 * gate-trail line, the receipt labels, the narrated working beat, and the
 * matter-log labels render in the reader's language in all four prepared
 * packs — or the language gate fails. Gate names stay short so the compact
 * trail survives every script (Indic line-height laws apply at the call site). */
export interface TurnChrome {
  why: string;
  hideWhy: string;
  decided: string;
  matched: string;
  sourcedOf: (grounded: number, total: number) => string;
  /**
   * The stop trigger — the sentence that makes the engine's brittleness
   * inspectable instead of hidden.
   *
   * `decide()` classifies with substring matching (`engine.ts:76`), so a stop
   * fires because a specific word in the user's own message hit a gate. That
   * is a real weakness for a legal product — "I was defrauded by a seller"
   * matches `fraud` and stops as a criminal matter. What redeems it is that
   * the receipt names the exact marker, so the user sees the rule that fired
   * instead of being handed an unexplained refusal.
   *
   * A function, not a string: clause order differs per language, and the
   * marker itself is the user's own word — quoted verbatim in every script,
   * because that verbatim quoting is the whole inspectability claim.
   */
  stopTrigger: (gate: string, marker: string) => string;
  /** The second stop action's label — was hardcoded English while every other
   *  stop string was pack-carried, which broke the repo's own rule that a
   *  localized refusal never ships an unlocalized door beside it. */
  whatLokAIDid: string;
  /**
   * Phase 3.1 — the honest answer to "what would change my answer?".
   *
   * Every other AI product tells you only that it stopped or that it answered.
   * The engine here has a real gate ladder (`engine.ts` G2–G6), so it also
   * knows what *would* have changed the outcome — and saying so reframes the
   * product from "an AI that sometimes refuses" into "an AI that tells you
   * exactly what it needs". Each line is a gate that could still fire,
   * stated before it does, which is what makes the refusal legible rather
   * than arbitrary.
   *
   * Keyed by MATTER, not by display mode. These lines name the conditions
   * that would move *this* decision, so they are only true of the matter
   * they were written about: showing the consumer-refund conditions
   * ("confirm the purchase date") under an answer about a BMC property-tax
   * notice is the interface asserting a dependency that does not exist.
   * A matter with no authored conditions renders no block — which is the
   * honest failure, since inventing them would be the exact fabrication
   * this block exists to rule out.
   */
  whatWouldChange: Record<ResponseMatter, string[]>;
  /**
   * The inline fact gate in the stream (`components/ai/FactCheck.tsx`).
   *
   * Count-free on purpose. The matter card at the top of the same screen
   * already reports "5 of 6 facts confirmed"; a gate that repeated that
   * sentence verbatim would print it three times on one surface. The gate
   * says what it still NEEDS instead, and the number lives where it labels
   * the list it counts.
   *
   * These shipped hardcoded English — the one trust surface in the product
   * that ignored the active language, in a product whose whole subject is
   * whether you can understand what the machine is telling you.
   */
  factGatePrompt: string;
  /** The same gate once every fact is confirmed — what it unlocked. */
  factGateDone: string;
  factDisputed: (count: number) => string;
  factConfirm: string;
  factFix: string;
  /**
   * The reading for an attached document that has no claim to interpret
   * (`receipt-filed`). This is also the single source of the receipt
   * acknowledgement the notice reader shows — `RECEIPT_ACK` derives from
   * here rather than restating it, because two copies of one sentence is the
   * duplication this repo spends its time deleting.
   */
  receiptFiledTitle: string;
  receiptFiledAck: string;
  receiptFiledHint: string;
  gates: Record<string, string>;
  stages: Record<string, string>;
  youSaid: string;
  orType: string;
  channelLabel: string;
  handover: string;
  factsConfirmedOf: (confirmed: number, total: number) => string;
}

export const TURN_CHROME_I18N: Record<DemoLanguage, TurnChrome> = {
  en: {
    why: 'Why this response?',
    hideWhy: 'Hide why this response',
    decided: 'Decided',
    matched: 'Matched the prepared example',
    sourcedOf: (g, t) => `${g} of ${t} sourced`,
    stopTrigger: (gate, marker) => `Stopped at the ${gate} — your message matched “${marker}”.`,
    whatLokAIDid: 'What LokAI did',
    whatWouldChange: {
      consumer: [
        'Confirm the purchase date and I can check the two-year window.',
        'If the seller disputes the record, I stop instead of drafting from it.',
        'If this becomes criminal or too urgent, I stop and point you to a person.',
      ],
      notice: [
        'Confirm the amount and the due date from the notice, and I can say which recovery steps still apply.',
        'If the due date has already passed, I stop and point you to the ward office instead of the payment route.',
        'If the property or the notice is not in your name, I stop — that is a different problem and this guide cannot carry it.',
      ],
    },
    gates: {
      G0_SCRIPT: 'Language', G1_SCENE: 'Scene', G2_SCOPE: 'Scope', G3_HIGH_RISK: 'Risk check',
      G4_CONFLICT: 'Conflict check', G5_SOURCE: 'Grounding', G6_FACTS: 'Facts',
      G7_CONTENT: 'Content', G8_DRAFT: 'Draft check', G9_VERIFY: 'Verified',
    },
    factGatePrompt: 'Check the rest and I can prepare the notice',
    factGateDone: 'LokAI can prepare the demand notice for your review.',
    factDisputed: (n) => (n === 1
      ? 'One fact is disputed. Correcting it re-opens the answer and clears any draft approval.'
      : `${n} facts are disputed. Correcting them re-opens the answer and clears any draft approval.`),
    factConfirm: 'Confirm',
    factFix: 'Fix',
    receiptFiledTitle: 'Receipt filed',
    receiptFiledAck:
      'Filed as evidence. This is a payment receipt, so there is no deadline or claim to act on. It is saved to this matter’s documents.',
    receiptFiledHint: 'Nothing else is needed for this one.',
    stages: {
      read: 'Reading what you shared',
      scope: 'Checking what your question covers',
      risk: 'Checking whether a person should look at this',
      conflict: 'Checking the record for disagreements',
      ground: 'Checking the Consumer Protection Act, 2019',
      match: 'Matching the law to your facts',
      prepare: 'Preparing your answer',
    },
    youSaid: 'You told LokAI',
    orType: '…or type your answer below.',
    channelLabel: 'A person who can help',
    handover: 'Prepare handover notes',
    factsConfirmedOf: (c, t) => `${c} of ${t} facts confirmed`,
  },
  hi: {
    why: 'यह जवाब क्यों?',
    hideWhy: 'जवाब की वजह छिपाएँ',
    decided: 'फ़ैसला',
    matched: 'तैयार उदाहरण से मैला',
    sourcedOf: (g, t) => `स्रोत पुष्टि: ${g} / ${t}`,
    stopTrigger: (gate, marker) => `${gate} पर रुका — आपके संदेश में “${marker}” मिला।`,
    whatLokAIDid: 'LokAI ने क्या किया',
    whatWouldChange: {
      consumer: [
        'खरीद की तारीख़ पुष्ट करें, फिर मैं दो साल की अवधि जाँच सकता हूँ।',
        'अगर विक्रेता रिकॉर्ड पर असहमत हो, तो मैं उससे ड्राफ़्ट नहीं बनाऊँगा — रुक जाऊँगा।',
        'अगर यह आपराधिक मामला बन जाए या बहुत ज़रूरी हो, तो मैं रुककर किसी व्यक्ति की ओर इशारा करूँगा।',
      ],
      notice: [
        'नोटिस की राशि और देय तारीख़ पुष्ट करें, फिर मैं बता सकता हूँ कि कौन-से वसूली कदम लागू होते हैं।',
        'अगर देय तारीख़ बीत चुकी है, तो मैं रुककर भुगतान के बजाय वार्ड कार्यालय की ओर इशारा करूँगा।',
        'अगर संपत्ति या नोटिस आपके नाम पर नहीं है, तो मैं रुक जाऊँगा — यह अलग मामला है और यह गाइड इसे नहीं उठा सकती।',
      ],
    },
    gates: {
      G0_SCRIPT: 'भाषा', G1_SCENE: 'दृश्य', G2_SCOPE: 'दायरा', G3_HIGH_RISK: 'जोखिम जाँच',
      G4_CONFLICT: 'टकराव जाँच', G5_SOURCE: 'स्रोत', G6_FACTS: 'तथ्य',
      G7_CONTENT: 'सामग्री', G8_DRAFT: 'ड्राफ़्ट जाँच', G9_VERIFY: 'पुष्टि',
    },
    factGatePrompt: 'बाक़ी तथ्य जाँच लें, फिर मैं नोटिस तैयार कर सकता हूँ',
    factGateDone: 'LokAI आपकी समीक्षा के लिए माँग नोटिस तैयार कर सकता है।',
    factDisputed: (n) => (n === 1
      ? 'एक तथ्य पर विवाद है। उसे ठीक करने पर जवाब फिर खुलेगा और ड्राफ़्ट की मंज़ूरी हट जाएगी।'
      : `${n} तथ्यों पर विवाद है। उन्हें ठीक करने पर जवाब फिर खुलेगा और ड्राफ़्ट की मंज़ूरी हट जाएगी।`),
    factConfirm: 'पुष्ट करें',
    factFix: 'सुधारें',
    receiptFiledTitle: 'रसीद दर्ज',
    receiptFiledAck:
      'साक्ष्य के रूप में दर्ज किया गया। यह एक भुगतान रसीद है — इस पर कार्रवाई के लिए कोई समय-सीमा या दावा नहीं है। यह इस मामले के दस्तावेज़ों में सहेजा गया है।',
    receiptFiledHint: 'इसके लिए और कुछ ज़रूरी नहीं।',
    stages: {
      read: 'आपकी बात पढ़ रहे हैं',
      scope: 'देख रहे हैं आपका सवाल किस दायरे में आता है',
      risk: 'देख रहे हैं क्या इसे किसी व्यक्ति को देखना चाहिए',
      conflict: 'रिकॉर्ड में मतभेद जाँच रहे हैं',
      ground: 'उपभोक्ता संरक्षण अधिनियम, 2019 जाँच रहे हैं',
      match: 'कानून को आपके तथ्यों से मिला रहे हैं',
      prepare: 'आपका जवाब तैयार कर रहे हैं',
    },
    youSaid: 'आपने LokAI को बताया',
    orType: '…या नीचे अपना जवाब लिखें।',
    channelLabel: 'मदद कर सकने वाला व्यक्ति',
    handover: 'हैंडओवर नोट्स तैयार करें',
    factsConfirmedOf: (c, t) => `${c} / ${t} तथ्य पुष्ट`,
  },
  mr: {
    why: 'हे उत्तर का?',
    hideWhy: 'उत्तराचे कारण लपवा',
    decided: 'निर्णय',
    matched: 'तयार उदाहरणाशी जुळले',
    sourcedOf: (g, t) => `स्रोत पडताळणी: ${g} / ${t}`,
    stopTrigger: (gate, marker) => `${gate} वर थांबले — तुमच्या संदेशात “${marker}” सापडले.`,
    whatLokAIDid: 'LokAI ने काय केले',
    whatWouldChange: {
      consumer: [
        'खरेदीची तारीख निश्चित केली, तर मी दोन वर्षांची मुदत तपासू शकतो.',
        'विक्रेत्याने नोंदवर आपत्ती केली, तर मी तिच्यावरून मसुदा तयार करण्याऐवजी थांबेन.',
        'हे गुन्ह्याचे प्रकरण झाले किंवा खूप तातडीने असले, तर मी थांबून व्यक्तीकडे नेणारा मार्ग दाखवेन.',
      ],
      notice: [
        'नोटिसमधील रक्कम आणि देय तारीख निश्चित करा, मग मी कोणती वसुली पावले लागू होतात ते सांगू शकतो.',
        'देय तारीख उलटली असेल, तर मी थांबून पेमेंटऐवजी वॉर्ड कार्यालयाकडे नेणारा मार्ग दाखवेन.',
        'मालमत्ता किंवा नोटिस तुमच्या नावावर नसेल, तर मी थांबेन — हे वेगळे प्रकरण आहे आणि हे मार्गदर्शक ते उचलू शकत नाही.',
      ],
    },
    gates: {
      G0_SCRIPT: 'भाषा', G1_SCENE: 'दृश्य', G2_SCOPE: 'व्याप्ती', G3_HIGH_RISK: 'धोका तपासणी',
      G4_CONFLICT: 'मतभेद तपासणी', G5_SOURCE: 'स्रोत', G6_FACTS: 'वस्तुस्थिती',
      G7_CONTENT: 'मजकूर', G8_DRAFT: 'मसुदा तपासणी', G9_VERIFY: 'पडताळणी',
    },
    factGatePrompt: 'उरलेली वस्तुस्थिती तपासा, मग मी नोटिस तयार करू शकतो',
    factGateDone: 'LokAI तुमच्या पाहण्यासाठी मागणी नोटिस तयार करू शकतो.',
    factDisputed: (n) => (n === 1
      ? 'एक वस्तुस्थिती वादात आहे. ती दुरुस्त केल्यास उत्तर पुन्हा उघडेल आणि मसुद्याची मंजुरी रद्द होईल.'
      : `${n} वस्तुस्थिती वादात आहेत. त्या दुरुस्त केल्यास उत्तर पुन्हा उघडेल आणि मसुद्याची मंजुरी रद्द होईल.`),
    factConfirm: 'पडताळा',
    factFix: 'दुरुस्त करा',
    receiptFiledTitle: 'पावती नोंदवली',
    receiptFiledAck:
      'पुरावा म्हणून नोंदवले. ही एक भरणा पावती आहे — यावर कार्यवाहीसाठी कोणतीही मुदत किंवा दावा नाही. हे या प्रकरणाच्या कागदपत्रांत जतन केले आहे.',
    receiptFiledHint: 'यासाठी अजून काही लागत नाही.',
    stages: {
      read: 'तुम्ही सांगितलेले वाचत आहोत',
      scope: 'तुमचा प्रश्न कोणत्या व्याप्तीत येतो ते बघत आहोत',
      risk: 'हे व्यक्तीने पाहायला हवे का ते बघत आहोत',
      conflict: 'रेकॉर्डमधील मतभेद तपासत आहोत',
      ground: 'ग्राहक संरक्षण कायदा, 2019 तपासत आहोत',
      match: 'कायदा तुमच्या वस्तुस्थितीशी जुळवत आहोत',
      prepare: 'तुमचे उत्तर तयार करत आहोत',
    },
    youSaid: 'तुम्ही LokAIला सांगितले',
    orType: '…किंवा खाली तुमचे उत्तर लिहा.',
    channelLabel: 'मदत करू शकणारी व्यक्ती',
    handover: 'हस्तांतरण नोट्स तयार करा',
    factsConfirmedOf: (c, t) => `${c} / ${t} वस्तुस्थिती पडताळली`,
  },
  ta: {
    why: 'இந்த பதில் ஏன்?',
    hideWhy: 'பதிலின் காரணத்தை மறைக்கவும்',
    decided: 'முடிவு',
    matched: 'தயார் எடுத்துக்காட்டுடன் பொருந்தியது',
    sourcedOf: (g, t) => `ஆதார உறுதிப்படுத்தல்: ${g} / ${t}`,
    stopTrigger: (gate, marker) => `${gate} இல் நிற்கப்பட்டது — உங்கள் செய்தியில் “${marker}” கண்டறியப்பட்டது.`,
    whatLokAIDid: 'LokAI என்ன செய்தது',
    whatWouldChange: {
      consumer: [
        'வாங்கிய தேதியை உறுதிபடுத்தினால், இரண்டு வருட காலக்கெடுவை சரிபார்க்க முடியும்.',
        'விற்பனையாளர் பதிவை மறுத்தால், நான் அதிலிருந்து வரைவு தயாரிக்காமல் நிற்கிறேன்.',
        'இது குற்ற வழக்காக மாறினால் அல்லது மிக அவசரமாக இருந்தால், நான் நிற்கும் மற்றும் ஒருவரை நோக்கி சொல்கிறேன்.',
      ],
      notice: [
        'நோட்டீஸில் உள்ள தொகை மற்றும் செலுத்தும் தேதியை உறுதிப்படுத்தினால், எந்த வசூல் நடவடிக்கைகள் பொருந்தும் என்பதைச் சொல்ல முடியும்.',
        'செலுத்தும் தேதி ஏற்கனவே கடந்திருந்தால், நான் நிற்கும் — பணம் செலுத்தும் வழிக்கு பதிலாக வார்டு அலுவலகத்தை நோக்கி சொல்கிறேன்.',
        'சொத்து அல்லது நோட்டீஸ் உங்கள் பெயரில் இல்லை என்றால், நான் நிற்கிறேன் — அது வேறு பிரச்சினை, இந்த வழிகாட்டி அதை எடுத்துச் செல்ல முடியாது.',
      ],
    },
    gates: {
      G0_SCRIPT: 'மொழி', G1_SCENE: 'காட்சி', G2_SCOPE: 'எல்லை', G3_HIGH_RISK: 'இடர் சோதனை',
      G4_CONFLICT: 'முரண் சோதனை', G5_SOURCE: 'ஆதாரம்', G6_FACTS: 'உண்மைகள்',
      G7_CONTENT: 'உள்ளடக்கம்', G8_DRAFT: 'வரைவு சோதனை', G9_VERIFY: 'சரிபார்ப்பு',
    },
    factGatePrompt: 'மீதமுள்ளவற்றை உறுதிப்படுத்துங்கள், பிறகு நான் நோட்டீஸ் தயார் செய்ய முடியும்',
    factGateDone: 'LokAI உங்கள் பார்வைக்கு கோரிக்கை நோட்டீஸை தயார் செய்ய முடியும்.',
    factDisputed: (n) => (n === 1
      ? 'ஒரு உண்மை தகராறில் உள்ளது. அதைத் திருத்தினால் பதில் மீண்டும் திறக்கும், வரைவு ஒப்புதல் ரத்தாகும்.'
      : `${n} உண்மைகள் தகராறில் உள்ளன. அவற்றைத் திருத்தினால் பதில் மீண்டும் திறக்கும், வரைவு ஒப்புதல் ரத்தாகும்.`),
    factConfirm: 'உறுதிப்படுத்து',
    factFix: 'திருத்து',
    receiptFiledTitle: 'ரசீது சேர்க்கப்பட்டது',
    receiptFiledAck:
      'ஆதாரமாகச் சேர்க்கப்பட்டது. இது ஒரு பணம் செலுத்திய ரசீது — செயல்பட வேண்டிய காலக்கெடு அல்லது கோரிக்கை எதுவும் இல்லை. இது இந்த வழக்கின் ஆவணங்களில் சேமிக்கப்பட்டது.',
    receiptFiledHint: 'இதற்கு வேறு எதுவும் தேவையில்லை.',
    stages: {
      read: 'நீங்கள் சொன்னதைப் படிக்கிறோம்',
      scope: 'உங்கள் கேள்வி எந்த எல்லையில் வருகிறது என்று பார்க்கிறோம்',
      risk: 'இதை ஒருவர் பார்க்க வேண்டுமா என்று பார்க்கிறோம்',
      conflict: 'பதிவில் முரண்கள் இருக்கிறதா என்று பார்க்கிறோம்',
      ground: 'நுகர்வோர் பாதுகாப்புச் சட்டம், 2019 பார்க்கிறோம்',
      match: 'சட்டத்தை உங்கள் உண்மைகளுடன் பொருத்துகிறோம்',
      prepare: 'உங்கள் பதிலைத் தயாரிக்கிறோம்',
    },
    youSaid: 'நீங்கள் LokAI-இடம் சொன்னது',
    orType: '…அல்லது கீழே உங்கள் பதிலை எழுதுங்கள்.',
    channelLabel: 'உதவக்கூடிய ஒருவர்',
    handover: 'கையளிப்புக் குறிப்புகள் தயாரிக்கவும்',
    factsConfirmedOf: (c, t) => `${c} / ${t} உண்மைகள் உறுதிப்படுத்தப்பட்டன`,
  },
};

export function turnChrome(language: DemoLanguage): TurnChrome {
  return TURN_CHROME_I18N[language] ?? TURN_CHROME_I18N.en;
}

/* ─── Every stop-family turn, localized ─────────────────────────────────────
 * The audit rule (P0-2, test T22): a localized question must NEVER route to
 * an unlocalized refusal. These packs carry the whole stop family — stops,
 * discloses, the scene clarify, and the recover beat — in the three prepared
 * Indic languages. `language-stop` deliberately has no packs: its copy stays
 * English because writing it in the unprepared language is exactly what the
 * prototype cannot honestly do. */
type StopPack = { title: string; reason: string; preserved: string; steps: string[] };
type DisclosePack = { title: string; partial: string; gap: string; steps: string[] };
type ClarifyPack = { title: string; question: string; why: string; unlocks: string };
type RecoverPack = { title: string; message: string; preserved: string };

const STOP_FAMILY_I18N: Record<string, Partial<Record<DemoLanguage, Partial<StopPack & DisclosePack & ClarifyPack & RecoverPack>>>> = {
  'boundary-stop': {
    hi: {
      title: 'LokAI के तैयार उदाहरणों के बाहर',
      reason: 'यह सवाल तैयार LokAI डेमो के बाहर है — यह प्रोटोटाइप सिर्फ कंज्यूमर-रिफंड उदाहरण दिखाता है।',
      preserved: 'आपके मामले का सारांश सुरक्षित है — कुछ भेजा या सेव नहीं हुआ।',
      steps: ['तैयार कंज्यूमर सवाल आज़माएँ', 'कंज्यूमर-रिफंड उदाहरण देखें', 'अन्य मामलों के लिए National Consumer Helpline 1915 (मुफ़्त) पर कॉल करें'],
    },
    mr: {
      title: 'LokAI च्या तयार उदाहरणांबाहेर',
      reason: 'हा प्रश्न तयार LokAI डेमोच्या बाहेर आहे — हा प्रोटोटाइप फक्त ग्राहक-परतावा उदाहरण दाखवतो.',
      preserved: 'तुमच्या प्रकरणाचा सारांश जतन आहे — काहीही पाठवले गेले नाही.',
      steps: ['तयार ग्राहक प्रश्न करून पहा', 'ग्राहक-परतावा उदाहरण पहा', 'इतर प्रकरणांसाठी National Consumer Helpline 1915 (मोफत) वर कॉल करा'],
    },
    ta: {
      title: 'LokAI தயார் எடுத்துக்காட்டுகளுக்கு வெளியே',
      reason: 'இந்தக் கேள்வி தயார் LokAI டெமோவுக்கு வெளியே — இந்த முன்மாதிரி நுகர்வோர்-ரீஃபண்டு எடுத்துக்காட்டை மட்டுமே காட்டுகிறது.',
      preserved: 'उङ्कळ் வऴक्किऩ் चुरुक्कम் पातुकाक्कप्पट्टुळ्ळतु — எதுவும் அனுப்பப்படவில்லை.',
      steps: ['தயார் நுகர்வோர் கேள்வியை முயலுங்கள்', 'நுகர்வோர்-ரீஃபண்டு எடுத்துக்காட்டைப் பாருங்கள்', 'பிற வழக்குகளுக்கு National Consumer Helpline 1915 (இலவசம்) அழைக்கவும்'],
    },
  },
  'out-of-scope-stop': {
    hi: {
      title: 'यह LokAI के दायरे से बाहर है',
      reason: 'यह प्रोटोटाइप सिर्फ कंज्यूमर रिफंड के उदाहरण दिखाता है — खराब सामान, विक्रेता का इनकार, और अगला व्यावहारिक कदम। आपराधिक मामले इसके दायरे में नहीं हैं।',
      preserved: 'आपके मामले का सारांश सुरक्षित है।',
      steps: ['तैयार कंज्यूमर-रिफंड उदाहरण खोलें', 'ज़रूरी हो तो 1915 (मुफ़्त हेल्पलाइन) पर कॉल करें — वे सही विभाग बताएंगे', 'आपातकाल में किसी वकील या कानूनी सहायता से बात करें'],
    },
    mr: {
      title: 'हा LokAI च्या कार्यक्षेत्राबाहेर आहे',
      reason: 'हा प्रोटोटाइप फक्त ग्राहक परताव्याची उदाहरणे दाखवतो — खराब वस्तू, विक्रेत्याचा नकार आणि पुढचे व्यावहारिक पाऊल. गुन्ह्याचे प्रकरण यात येत नाहीत.',
      preserved: 'तुमच्या प्रकरणाचा सारांश जतन आहे.',
      steps: ['तयार ग्राहक-परतावा उदाहरण उघडा', 'गरज असल्यास 1915 (मोफत हेल्पलाइन) वर कॉल करा — योग्य विभाग सांगतील', 'तातडीचे असल्यास वकील किंवा कायदेशीर मदतीशी बोला'],
    },
    ta: {
      title: 'இது LokAI-இன் எல்லைக்கு வெளியே',
      reason: 'இந்த முன்மாதிரி நுகர்வோர் ரீஃபண்டு எடுத்துக்காட்டுகளை மட்டுமே காட்டுகிறது — சேதமான பொருள், விற்பனையாளரின் மறுப்பு, அடுத்த படி. குற்றவியல் வழக்குகள் இதில் இல்லை.',
      preserved: 'உங்கள் வழக்கின் சுருக்கம் பாதுகாக்கப்பட்டுள்ளது.',
      steps: ['தயார் நுகர்வோர்-ரீஃபண்டு எடுத்துக்காட்டைத் திறங்கள்', 'தேவைப்பட்டால் 1915 (இலவச ஹெல்ப்லைன்) அழைக்கவும் — சரியான துறையைச் சொல்வார்கள்', 'அவசரமானால் வழக்கறிஞர் அல்லது சட்ட உதவியுடன் பேசுங்கள்'],
    },
  },
  'high-risk-stop': {
    hi: {
      title: 'इसमें किसी व्यक्ति की मदद चाहिए',
      reason: 'रकम, व्यापारिक उपयोग और कल तक की डेडलाइन — ये नतीजे इतने बड़े हैं कि यह प्रोटोटाइप इनका आकलन नहीं करेगा। आपका सारांश सुरक्षित रहेगा, पर यह कोई दाख़िला तैयार नहीं करेगा।',
      preserved: 'आपके मामले का सारांश और सबूत की सूची सुरक्षित हैं।',
      steps: ['National Consumer Helpline 1915 पर कॉल करें (मुफ़्त)', 'ज़िला कानूनी सेवा प्राधिकरण (मुफ़्त कानूनी सहायता) से मिलें', 'सभी दस्तावेज़ एक साथ रखें — हैंडओवर नोट्स तैयार हैं'],
    },
    mr: {
      title: 'यात व्यक्तीची मदत लागते',
      reason: 'रक्कम, व्यवसायाचा वापर आणि उद्यापर्यंतची मुदत — हे परिणाम एवढे मोठे आहेत की हा प्रोटोटाइप त्यांचे मूल्यमापन करणार नाही. तुमचा सारांश सुरक्षित राहील, पण अर्ज तयार होणार नाही.',
      preserved: 'तुमच्या प्रकरणाचा सारांश आणि पुराव्याची यादी जतन आहेत.',
      steps: ['National Consumer Helpline 1915 वर कॉल करा (मोफत)', 'जिल्हा कायदेशीर सेवा प्राधिकरणाशी (मोफत कायदेशीर मदत) भेटा', 'सर्व कागदपत्रे एकत्र ठेवा — हस्तांतरण नोट्स तयार आहेत'],
    },
    ta: {
      title: 'இதற்கு ஒருவரின் உதவி தேவை',
      reason: 'தொகை, வணிகப் பயன்பாடு மற்றும் நாளைய காலக்கெடு — இதன் விளைவுகளை இந்த முன்மாதிரி மதிப்பிடாது. உங்கள் சுருக்கம் பாதுகாக்கப்படும், ஆனால் புகார் தயாராகாது.',
      preserved: 'உங்கள் வழக்கின் சுருக்கமும் ஆதாரப் பட்டியலும் பாதுகாக்கப்பட்டுள்ளன.',
      steps: ['National Consumer Helpline 1915 அழைக்கவும் (இலவசம்)', 'மாவட்ட சட்ட சேவை அதிகாரியை (இலவச சட்ட உதவி) அணுகவும்', 'எல்லா ஆவணங்களையும் ஒன்றாக வையுங்கள் — கையளிப்புக் குறிப்புகள் தயார்'],
    },
  },
  'statute-expiry-stop': {
    hi: {
      title: 'इस तारीख़ के लिए LokAI दाख़िला तैयार नहीं करेगा',
      reason: 'यह ख़रीद इस उदाहरण की समय-सीमा से बहुत पुरानी है। LokAI आपका सारांश रखेगा, पर नोटिस नहीं बनाएगा — सही तारीख़ों पर समय-सीमा कानूनी जाँच का विषय है।',
      preserved: 'ख़रीद और सबूत का सारांश सुरक्षित है।',
      steps: ['ख़रीद और सबूत का सारांश रखें', 'समय-सीमा (limitation) के बारे में वकील से पूछें', 'मुफ़्त कानूनी सहायता: ज़िला कानूनी सेवा प्राधिकरण'],
    },
    mr: {
      title: 'या तारखेसाठी LokAI अर्ज तयार करणार नाही',
      reason: 'ही खरेदी या उदाहरणाच्या मुदतीपेक्षा खूप जुनी आहे. LokAI तुमचा सारांश ठेवेल, पण नोटीस बनवणार नाही — प्रत्यक्ष तारखांसाठी मुदतीची कायदेशीर तपासणी आवश्यक आहे.',
      preserved: 'खरेदी आणि पुराव्याचा सारांश जतन आहे.',
      steps: ['खरेदी व पुराव्याचा सारांश ठेवा', 'मुदत (limitation) बद्दल वकिलास विचारा', 'मोफत कायदेशीर मदत: जिल्हा कायदेशीर सेवा प्राधिकरण'],
    },
    ta: {
      title: 'இந்தத் தேதிக்கு LokAI புகார் தயாரிக்காது',
      reason: 'இந்த வாங்குதல் இந்த எடுத்துக்காட்டின் கால எல்லையை விட மிகப் பழையது. LokAI உங்கள் சுருக்கத்தை வைத்திருக்கும், ஆனால் அறிவிப்பு தயாரிக்காது — உண்மைத் தேதிகளுக்கு காலவரம்பு சட்ட பரிசீலனை தேவை.',
      preserved: 'வாங்குதல் மற்றும் ஆதாரச் சுருக்கம் பாதுகாக்கப்பட்டுள்ளது.',
      steps: ['வாங்குதல், ஆதாரச் சுருக்கத்தை வையுங்கள்', 'காலவரம்பு (limitation) பற்றி வழக்கறிஞரிடம் கேளுங்கள்', 'இலவச சட்ட உதவி: மாவட்ட சட்ட சேவை அதிகாரம்'],
    },
  },
  'conflicting-rules-stop': {
    hi: {
      title: 'दो रास्ते हो सकते हैं',
      reason: 'निजी और व्यावसायिक उपयोग को कानून में अलग रखा जा सकता है। तैयार तथ्य यह तय नहीं करते कि कौन-सा नियम लागू होगा, इसलिए LokAI दाख़िले का रास्ता नहीं सुझाएगा।',
      preserved: 'आपके सवाल का रिकॉर्ड सुरक्षित है।',
      steps: ['बताएं मिक्सर घर के लिए था या दुकान के लिए', 'दोनों टिप्पणियाँ तुलना करें', 'अटक जाएँ तो 1915 (मुफ़्त) पर कॉल करें'],
    },
    mr: {
      title: 'दोन मार्ग असू शकतात',
      reason: 'खाजगी आणि व्यावसायिक वापर यांना कायद्यात वेगळे वागवले जाऊ शकते. तयार वस्तुस्थिती कोणता नियम लागू होतो हे ठरवत नाहीत, त्यामुळे LokAI दाखल प्रक्रियेचा मार्ग सुचवणार नाही.',
      preserved: 'तुमच्या प्रश्नाचा रेकॉर्ड जतन आहे.',
      steps: ['मिक्सर घरासाठी होता की दुकानासाठी हे सांगा', 'दोन्ही टिप्पण्यांची तुलना करा', 'अडकल्यास 1915 (मोफत) वर कॉल करा'],
    },
    ta: {
      title: 'இரண்டு வழிகள் இருக்கலாம்',
      reason: 'தனிப்பட்ட மற்றும் வணிக பயன்பாட்டுக்கு சட்டத்தில் வித்தியாசம் இருக்கலாம். தயார் உண்மைகள் எந்த விதி பொருந்தும் என்று முடிவு செய்யவில்லை; எனவே LokAI தாக்கல் வழியைப் பரிந்துரைக்காது.',
      preserved: 'उங்கळ் केळ्वियिऩ் पतिवु पातुकाक्कप्पट्टुळ्ळतु.',
      steps: ['மிக்சர் வீட்டுக்காவா கடைக்காவ என்று சொல்லுங்கள்', 'இரண்டு குறிப்புகளையும் ஒப்பிடுங்கள்', 'தடைபட்டால் 1915 (இலவசம்) அழைக்கவும்'],
    },
  },
  'source-gap-disclose': {
    hi: {
      title: 'बाज़ार-नीति की जाँच नहीं हो सकी',
      reason: 'आम उपभोक्ता रास्ता उपभोक्ता संरक्षण अधिनियम के तहत खुला है, पर इस तैयार डेमो में बाज़ार की निजी रिटर्न नीति का कोई आधिकारिक रिकॉर्ड नहीं है — इसलिए LokAI इस बारे में कोई पक्की बात नहीं करेगा।',
      preserved: 'आपका सवाल और मामले का सारांश सुरक्षित हैं।',
      steps: ['यहाँ दिखाई गई सामान्य जानकारी पढ़ें', 'अगर नीति का टेक्स्ट आपके पास है तो जोड़ें', 'नीति के दावे पर भरोसा करने से पहले किसी वकील से पूछें'],
    },
    mr: {
      title: 'बाजार-धोरणाची तपासणी होऊ शकली नाही',
      reason: 'सामान्य ग्राहक मार्ग ग्राहक संरक्षण कायद्याअंतर्गत खुला आहे, पण या तयार डेमोमध्ये बाजाराच्या खाजगी रिटर्न धोरणाचा अधिकृत मजकूर नाही — त्यामुळे LokAI त्याबद्दल निश्चित उत्तर देणार नाही.',
      preserved: 'तुमचा प्रश्न आणि प्रकरणाचा सारांश जतन आहेत.',
      steps: ['येथे दाखवलेली सामान्य माहिती वाचा', 'धोरणाचा मजकूर तुमच्याकडे असल्यास जोडा', 'धोरणाच्या दाव्यावर विश्वास ठेवण्यापूर्वी वकिलास विचारा'],
    },
    ta: {
      title: 'சந்தை-கொள்கையை சரிபார்க்க முடியவில்லை',
      reason: 'வழக்கமான நுகர்வோர் வழி நுகர்வோர் பாதுகாப்புச் சட்டத்தின் கீழ் திறந்துள்ளது; ஆனால் இந்த தயார் டெமோவில் சந்தையின் தனி ரிட்டர்ன் கொள்கைக்கு அதிகாரப்பூர்வ பதிவு இல்லை — எனவே LokAI அது பற்றி உறுதியாகச் சொல்லாது.',
      preserved: 'उங்கळ் केळ्वियुम वऴक्किऩ் चुरुक्कमुम पातुकाक्कप्पट्टुळ्ळन.',
      steps: ['இங்கே காட்டப்பட்ட பொது தகவலைப் படியுங்கள்', 'கொள்கை உரை உங்களிடம் இருந்தால் சேருங்கள்', 'கொள்கை கூற்றை நம்புவதற்கு முன் வழக்கறிஞரிடம் கேளுங்கள்'],
    },
  },
  'conflict-disclose': {
    hi: {
      title: 'दो नियम अलग बात कह सकते हैं',
      reason: 'निजी और व्यावसायिक उपयोग अलग दाख़िलों की ओर ले जा सकते हैं। तैयार तथ्य इसे तय नहीं करते, इसलिए LokAI अंदाज़ा नहीं लगाएगा।',
      preserved: 'आपके उपयोग का विवरण सुरक्षित है।',
      steps: ['बताएं उत्पाद का उपयोग कैसे हुआ', 'दोनों स्रोत टिप्पणियाँ देखें'],
    },
    mr: {
      title: 'दोन नियम वेगळे सांगू शकतात',
      reason: 'खाजगी आणि व्यावसायिक वापर वेगळ्या दाखल्यांकडे नेऊ शकतात. तयार वस्तुस्थिती हे ठरवत नाहीत, त्यामुळे LokAI अंदाज घेणार नाही.',
      preserved: 'तुमच्या वापराचा तपशील जतन आहे.',
      steps: ['उत्पादनाचा वापर कसा झाला हे सांगा', 'दोन्ही स्रोत टिप्पण्या पहा'],
    },
    ta: {
      title: 'இரண்டு விதிகள் வித்தியாசமாக இருக்கலாம்',
      reason: 'தனிப்பட்ட மற்றும் வணிக பயன்பாடு வெவ்வேறு தாக்கல்களுக்கு அழைக்கலாம். தயார் உண்மைகள் இதை முடிவு செய்யவில்லை; எனவே LokAI ஊகிக்காது.',
      preserved: 'उங्कळ் पयन्पाट्टिऩ विवरम் पातुकाक्कप्पट्टुळ्ळतु.',
      steps: ['பொருள் எப்படிப் பயன்பட்டது என்று சொல்லுங்கள்', 'இரு ஆதாரக் குறிப்புகளைப் பாருங்கள்'],
    },
  },
  'missing-fact-clarify': {
    hi: {
      title: 'एक चीज़ अगला कदम तय करती है',
      reason: 'क्या आपने विक्रेता को पहले लिखित में बताया था? LokAI तब तक ड्राफ़्ट नहीं बनाएगा जब तक यह तारीख़ पुष्ट नहीं हो जाती।',
      preserved: 'विक्रेता के इनकार का रिकॉर्ड सुरक्षित है।',
      steps: ['पहली शिकायत की तारीख़ बताएं', 'अब तक जुटाए तथ्य देखें'],
    },
    mr: {
      title: 'एक गोष्ट पुढचे पाऊल ठरवते',
      reason: 'तुम्ही विक्रेत्याला आधी लेखी सांगितले होते का? ही तारीख पुष्ट होईपर्यंत LokAI मसुदा बनवणार नाही.',
      preserved: 'विक्रेत्याच्या नकाराचा रेकॉर्ड जतन आहे.',
      steps: ['पहिल्या तक्रारीची तारीख सांगा', 'आत्तापर्यंत जमलेल्या वस्तुस्थिती पहा'],
    },
    ta: {
      title: 'ஒரு விஷயம் அடுத்த படியை முடிவு செய்கிறது',
      reason: 'विऱ्पऩैयाळरिटम் मुतलिल ऎऴुत्तुप्पूर्वमाक तॆरिवित्तीर्कळाव? இन्त तॆति उरुतिप्पटुम वरै LokAI वरैवु तयारिक्कातु.',
      preserved: 'விற்பனையாளரின் மறுப்புப் பதிவு பாதுகாக்கப்பட்டுள்ளது.',
      steps: ['முதல் புகாரின் தேதியைச் சொல்லுங்கள்', 'இதுவரை சேர்த்த உண்மைகளைப் பாருங்கள்'],
    },
  },
  'temporary-recover': {
    hi: {
      title: 'तैयार जवाब सुरक्षित रुका',
      reason: 'आपका चुना हुआ सैंपल यहीं है। फिर से कोशिश करें और वही तैयार नतीजा दोबारा चलेगा — कुछ भी अपलोड या भेजा नहीं गया।',
      preserved: 'आपका सैंपल इसी डेमो में सुरक्षित है।',
      steps: ['तैयार डेमो फिर चलाएँ', 'सैंपल की जानकारी देखें'],
    },
    mr: {
      title: 'तयार उत्तर सुरक्षित थांबले',
      reason: 'तुम्ही निवडलेला नमुना इथेच आहे. पुन्हा प्रयत्न करा — ताच तयार निकाल पुन्हा चालेल. काहीही अपलोड किंवा पाठवले गेले नाही.',
      preserved: 'तुमचा नमुना याच डेमोमध्ये जतन आहे.',
      steps: ['तयार डेमो पुन्हा चालवा', 'नमुन्याचा तपशील पहा'],
    },
    ta: {
      title: 'தயார் பதில் பாதுகாப்பாக நிறுத்தப்பட்டது',
      reason: 'நீங்கள் தேர்ந்தெடுத்த மாதிரி இங்கேயே உள்ளது. மீண்டும் முயற்சித்தால் அதே தயார் முடிவு மீண்டும் இயங்கும் — எதுவும் பதிவேற்றப்படவில்லை.',
      preserved: 'उங्कळ் मातिरि इन्त टॆमोविल् पातुकाक्कप्पट्टुळ्ळतु.',
      steps: ['தயார் டெமோவை மீண்டும் இயக்கவும்', 'மாதிரி விவரத்தைப் பாருங்கள்'],
    },
  },
};

/** Localize any stop-family turn by id; null when the turn has no pack (the
 *  caller then renders the prepared English turn — only acceptable for the
 *  language stop, whose English copy is the honesty feature itself). */
export function localizeStopTurn(turnId: string, language: DemoLanguage): ResponseTurn | null {
  if (language === 'en') return null;
  const base = getTurnById(turnId);
  const pack = STOP_FAMILY_I18N[turnId]?.[language];
  if (!base || !pack) return null;
  const localized: ResponseTurn = { ...base, language, title: pack.title ?? base.title };
  const data: Record<string, unknown> = { ...base.payload.data } as Record<string, unknown>;
  if (pack.reason !== undefined) data.reason = pack.reason;
  if (pack.partial !== undefined) data.partialAnswer = pack.partial;
  if (pack.gap !== undefined) data.gap = pack.gap;
  if (pack.question !== undefined) data.question = pack.question;
  if (pack.why !== undefined) data.whyItMatters = pack.why;
  if (pack.unlocks !== undefined) data.unlocks = pack.unlocks;
  if (pack.message !== undefined) data.message = pack.message;
  if (pack.preserved !== undefined) {
    if (base.payload.mode === 'recover') data.preservedNote = pack.preserved;
    else data.preservedSummary = pack.preserved;
  }
  if (pack.steps) {
    if (base.payload.mode === 'disclose') data.whatYouCanStillDo = pack.steps;
    else data.stillAvailable = pack.steps;
  }
  localized.payload = { mode: base.payload.mode, data } as unknown as typeof base.payload;
  return localized;
}

export function allPreparedTurnIds(): string[] {
  return PREPARED_TURNS.map((t) => t.id);
}
