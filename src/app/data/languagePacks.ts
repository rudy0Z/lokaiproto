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

export const SCRIPT_RAIL: { id: DemoLanguage; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'mr', label: 'Marathi', native: 'मराठी' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

export function allPreparedTurnIds(): string[] {
  return PREPARED_TURNS.map((t) => t.id);
}
