import type { DemoLanguage, ResponseTurn } from './responseTurns';
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
    options: [{ label: 'पिछले दो साल के भीतर', nextTurnId: 'consumer-explain' }],
  },
  mr: {
    title: 'एक तारीख तुमचे पर्याय ठरवते',
    question: 'तुम्ही मिक्सर कधी विकत घेतला होता?',
    whyItMatters:
      'कायदा खरेदीच्या तारखेपासून दोन वर्षांपर्यंत ग्राहक तक्रारीचा मार्ग खुला ठेवतो. तुमची तारीख ठरवते की आता कोणते मार्ग उपलब्ध आहेत.',
    unlocks: 'खालील योग्य उत्तर निवडा, किंवा लिहून सांगा — पुढील पाऊल LokAI उचलेल.',
    options: [{ label: 'गेल्या दोन वर्षांत', nextTurnId: 'consumer-explain' }],
  },
  ta: {
    title: 'ஒரு தேதி உங்கள் வழிகளை தீர்மானிக்கிறது',
    question: 'மிக்சரை எப்போது வாங்கினீர்கள்?',
    whyItMatters:
      'வாங்கிய தேதியிலிருந்து இரண்டு ஆண்டுகளுக்குள் நுகர்வோர் புகார் செய்யலாம். உங்கள் தேதி என்ன வழிகள் இன்னும் திறந்திருக்கின்றன என்பதை முடிவு செய்கிறது.',
    unlocks: 'கீழே பொருத்தமான பதிலைத் தேர்ந்தெடுக்கவும், அல்லது எழுதிக் கூறவும் — அடுத்த படியை LokAI எடுக்கும்.',
    options: [{ label: 'கடந்த இரண்டு ஆண்டுகளில்', nextTurnId: 'consumer-explain' }],
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

export function allPreparedTurnIds(): string[] {
  return PREPARED_TURNS.map((t) => t.id);
}
