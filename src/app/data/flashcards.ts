/**
 * Quick Recap — the flashcard deck (M2 of the 2026 mobile redesign).
 *
 * Entry: the three-dots control in the top bar of any conversation surface.
 * Job: a 30-second recall pass over the facts that DECIDE the matter — the
 * same prepared facts the verification gate owns, reframed as recall cards.
 *
 * Content discipline:
 *  - The deck is PREPARED, mirroring `caseWorkflow.ts` as its source of
 *    truth (same dates, amounts, sections, evidence references). If the
 *    matter store changes, this deck changes with it — one matter, one
 *    truth, two surfaces.
 *  - Every chrome string (labels, buttons, progress) exists in all four
 *    prepared languages. Card values (dates, ₹ amounts, section numbers)
 *    are language-neutral; the phrasing around them is packed per script.
 *  - No judgment semantics beyond "got it / review again": this is a recap
 *    for a stressed reader, not a quiz. A reviewed card returns to the back
 *    of the deck; nothing is ever scored.
 */

import type { DemoLanguage } from './responseTurns';

export type FlashcardKind = 'fact' | 'deadline' | 'section' | 'action' | 'term';

export interface Flashcard {
  id: string;
  kind: FlashcardKind;
  front: string;
  back: string;
  /** Mono reference chip on the answer face — evidence or provision. */
  reference?: string;
}

export interface FlashcardLabels {
  title: string;
  subtitle: string;
  gotIt: string;
  review: string;
  flipHint: string;
  empty: string;
  remaining: (n: number) => string;
}

const KIND_LABEL: Record<FlashcardKind, Record<DemoLanguage, string>> = {
  fact:     { en: 'Fact',     hi: 'तथ्य',      mr: 'तथ्य',     ta: 'உண்மை' },
  deadline: { en: 'Deadline', hi: 'समय-सीमा',  mr: 'मुदत',     ta: 'காலஎல்லை' },
  section:  { en: 'The law',  hi: 'कानून',     mr: 'कायदा',    ta: 'சட்டம்' },
  action:   { en: 'Next step', hi: 'अगला कदम', mr: 'पुढील पाऊल', ta: 'அடுத்த படி' },
  term:     { en: 'Term',     hi: 'शब्द',      mr: 'संज्ञा',    ta: 'சொல்' },
};

export const flashcardKindLabel = (kind: FlashcardKind, lang: DemoLanguage): string =>
  KIND_LABEL[kind][lang] ?? KIND_LABEL[kind].en;

export const FLASHCARD_LABELS: Record<DemoLanguage, FlashcardLabels> = {
  en: {
    title: 'Quick recap',
    subtitle: 'The facts that decide this matter — flip, swipe, remember.',
    gotIt: 'Got it',
    review: 'Review again',
    flipHint: 'Tap the card to flip',
    empty: 'Nothing left to review — the deck is clear.',
    remaining: (n) => `${n} card${n === 1 ? '' : 's'} left`,
  },
  hi: {
    title: 'त्वरित पुनरावलोकन',
    subtitle: 'इस मामले को तय करने वाले तथ्य — पलटें, स्वाइप करें, याद रखें।',
    gotIt: 'समझ गया',
    review: 'फिर देखें',
    flipHint: 'पलटने के लिए कार्ड दबाएँ',
    empty: 'सब दोहरा लिया — डेक खाली है।',
    remaining: (n) => `${n} कार्ड बाकी`,
  },
  mr: {
    title: 'जलद पुनरावलोकन',
    subtitle: 'या प्रकरणाचा निर्णय ठरवणारे तथ्य — उलटा, स्वाइप करा, लक्षात ठेवा.',
    gotIt: 'समजले',
    review: 'पुन्हा पाहा',
    flipHint: 'उलटवण्यासाठी कार्डवर टॅप करा',
    empty: 'सर्व उजळले — डेक रिकामा आहे.',
    remaining: (n) => `${n} कार्ड शिल्लक`,
  },
  ta: {
    title: 'விரைவு மீள்பார்வை',
    subtitle: 'இந்த வழக்கைத் தீர்மானிக்கும் உண்மைகள் — திருப்பி பாருங்கள், ஸ்வாய்ப் செய்யுங்கள்.',
    gotIt: 'புரிந்தது',
    review: 'மீண்டும் பார்க்க',
    flipHint: 'திருப்ப அட்டையைத் தட்டவும்',
    empty: 'அனைத்தும் மீள்பார்வையிடப்பட்டது — அட்டைகள் இல்லை.',
    remaining: (n) => `${n} அட்டைகள் மீதம்`,
  },
};

/** The prepared consumer-matter deck. Mirrors caseWorkflow.ts + demoScenarios. */
const DECK: Record<DemoLanguage, Flashcard[]> = {
  en: [
    { id: 'fact-date', kind: 'fact', front: 'When did you buy the mixer?', back: '6 June 2026 — the date printed on your invoice.', reference: 'EX-01' },
    { id: 'fact-amount', kind: 'fact', front: 'What did the mixer cost?', back: '₹8,999 — the amount you are asking back.', reference: 'EX-01' },
    { id: 'fact-refusal', kind: 'fact', front: 'Did the seller refuse in writing?', back: 'Yes — a written refusal arrived on 8 June 2026.', reference: 'EX-03' },
    { id: 'deadline-window', kind: 'deadline', front: 'How long do you have to file?', back: 'Two years from purchase. Your window runs to June 2028.' },
    { id: 'law-defect', kind: 'section', front: 'What makes this a consumer issue?', back: 'S.2(10), Consumer Protection Act 2019 — a "defect" covers goods that arrive damaged.', reference: 'S.2(10)' },
    { id: 'law-forum', kind: 'section', front: 'Where would you file?', back: 'The District Consumer Commission — S.35 sets out the complaint.', reference: 'S.35' },
    { id: 'action-notice', kind: 'action', front: 'What is your next step?', back: 'Send the demand notice by registered post with acknowledgement due (AD) — and keep the postal receipt.' },
    { id: 'term-deficiency', kind: 'term', front: 'What does “deficiency” mean?', back: 'Any fault, shortcoming, or inadequacy in goods or services — the hook a refund claim hangs on.' },
  ],
  hi: [
    { id: 'fact-date', kind: 'fact', front: 'आपने मिक्सर कब खरीदा?', back: '6 जून 2026 — आपके इनवॉइस पर छपी तारीख।', reference: 'EX-01' },
    { id: 'fact-amount', kind: 'fact', front: 'मिक्सर का दाम क्या था?', back: '₹8,999 — यही राशि आप वापस माँग रहे हैं।', reference: 'EX-01' },
    { id: 'fact-refusal', kind: 'fact', front: 'क्या विक्रेता ने लिखित में मना किया?', back: 'हाँ — 8 जून 2026 को लिखित इनकार मिला।', reference: 'EX-03' },
    { id: 'deadline-window', kind: 'deadline', front: 'शिकायत दर्ज करने के लिए कितना समय है?', back: 'खरीद से दो साल। आपकी समय-सीमा जून 2028 तक है।' },
    { id: 'law-defect', kind: 'section', front: 'यह उपभोक्ता विवाद क्यों है?', back: 'उपभोक्ता संरक्षण अधिनियम 2019, धारा 2(10) — "दोष" में खराब आई वस्तुएँ भी आती हैं।', reference: 'S.2(10)' },
    { id: 'law-forum', kind: 'section', front: 'शिकायत कहाँ दर्ज होगी?', back: 'जिला उपभोक्ता आयोग — धारा 35 शिकायत की प्रक्रिया बताती है।', reference: 'S.35' },
    { id: 'action-notice', kind: 'action', front: 'आपका अगला कदम क्या है?', back: 'माँग-सूचना रजिस्टर्ड पोस्ट से एडी (पावती सहित) भेजें — और डाक पावती संभालकर रखें।' },
    { id: 'term-deficiency', kind: 'term', front: '"दोषपूर्णता" का मतलब क्या है?', back: 'वस्तु या सेवा में कोई भी कमी या खामी — रिफंड की माँग इसी पर टिकी है।' },
  ],
  mr: [
    { id: 'fact-date', kind: 'fact', front: 'तुम्ही मिक्सर कधी घेतला?', back: '६ जून २०२६ — तुमच्या बिलावर छापलेली तारीख.', reference: 'EX-01' },
    { id: 'fact-amount', kind: 'fact', front: 'मिक्सरला किती रक्कम लागली?', back: '₹८,९९९ — तुम्ही मागण्याची हीच रक्कम आहे.', reference: 'EX-01' },
    { id: 'fact-refusal', kind: 'fact', front: 'विक्रेत्याने लेखी नकार दिला का?', back: 'हो — ८ जून २०२६ रोजी लेखी नकार आला.', reference: 'EX-03' },
    { id: 'deadline-window', kind: 'deadline', front: 'तक्रार दाखल करण्यासाठी किती वेळ आहे?', back: 'खरेदीपासून दोन वर्षे. तुमची मुदत जून २०२८ पर्यंत आहे.' },
    { id: 'law-defect', kind: 'section', front: 'हा ग्राहक विवाद का आहे?', back: 'ग्राहक संरक्षण कायदा २०१९, कलम २(१०) — "दोष" मध्ये खराब आलेल्या वस्तूंचाही समावेश होतो.', reference: 'S.2(10)' },
    { id: 'law-forum', kind: 'section', front: 'तक्रार कुठे दाखल होईल?', back: 'जिल्हा ग्राहक आयोग — कलम ३५ तक्रारीची प्रक्रिया सांगतो.', reference: 'S.35' },
    { id: 'action-notice', kind: 'action', front: 'तुमचे पुढील पाऊल काय?', back: 'मागणी नोटीस रजिस्टर्ड पोस्टने ए.डी. सह पाठवा — आणि पोस्ट पावती जपून ठेवा.' },
    { id: 'term-deficiency', kind: 'term', front: '"दोष" म्हणजे काय?', back: 'वस्तू किंवा सेवेतील कोणतीही कमतरता — परताव्याचा दावा याच्यावरच उभा राहतो.' },
  ],
  ta: [
    { id: 'fact-date', kind: 'fact', front: 'மிக்சரை எப்போது வாங்கினீர்கள்?', back: '6 ஜூன் 2026 — உங்கள் பில்லில் அச்சிடப்பட்ட தேதி.', reference: 'EX-01' },
    { id: 'fact-amount', kind: 'fact', front: 'மிக்சருக்கு எவ்வளவு ஆனது?', back: '₹8,999 — நீங்கள் திரும்பக் கேட்கும் தொகை இதுவே.', reference: 'EX-01' },
    { id: 'fact-refusal', kind: 'fact', front: 'விற்பனையாளர் எழுத்துப்பூர்வமாக மறுத்தாரா?', back: 'ஆம் — 8 ஜூன் 2026 அன்று எழுத்துப்பூர்வ மறுப்பு வந்தது.', reference: 'EX-03' },
    { id: 'deadline-window', kind: 'deadline', front: 'புகார் அளிக்க எவ்வளவு காலம் உள்ளது?', back: 'வாங்கிய நாளிலிருந்து இரண்டு ஆண்டுகள். உங்கள் காலஎல்லை ஜூன் 2028 வரை.' },
    { id: 'law-defect', kind: 'section', front: 'இது ஏன் நுகர்வோர் பிரச்சினை?', back: 'நுகர்வோர் பாதுகாப்புச் சட்டம் 2019, பிரிவு 2(10) — "குறை" என்பதில் சேதமாக வரும் பொருட்களும் அடங்கும்.', reference: 'S.2(10)' },
    { id: 'law-forum', kind: 'section', front: 'எங்கே புகார் அளிப்பீர்கள்?', back: 'மாவட்ட நுகர்வோர் ஆணையம் — பிரிவு 35 புகார் முறையை விளக்குகிறது.', reference: 'S.35' },
    { id: 'action-notice', kind: 'action', front: 'உங்கள் அடுத்த படி என்ன?', back: 'கோரிக்கை நோட்டீஸை அஞ்சல் ரசீது (AD) உடன் ரிஜிஸ்டர் போஸ்ட்டில் அனுப்புங்கள் — ரசீதை இருத்தி வையுங்கள்.' },
    { id: 'term-deficiency', kind: 'term', front: '“குறை” என்றால் என்ன?', back: 'பொருள் அல்லது சேவையில் ஏதேனும் ஒரு குறைபாடு — திரும்பப் பணக் கோரிக்கை இதன் மீதுதான் நிற்கிறது.' },
  ],
};

export function getConsumerFlashcards(lang: DemoLanguage): Flashcard[] {
  return DECK[lang] ?? DECK.en;
}
