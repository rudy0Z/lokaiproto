/**
 * The Notice Interpreter's prepared data (§3.8 / §3.8a).
 *
 * The founding feature is a person receiving a legal notice in a language and
 * jurisdiction not their own — so the source document here is a Marathi BMC
 * property-tax demand, and its *interpretation* is served in the user's chosen
 * language (EN / HI / MR / TA). That split is the thesis rendered as data: the
 * ORIGINAL stays in its own strange register (Marathi legalese, quoted, where
 * the strangeness is the point — the copy note in §3.8a), and everything the
 * app SAYS about it is plain and in the reader's language.
 *
 * Deterministic-demo constraint (`verify-demo.mjs`): no OCR, no network. A
 * prepared document maps to a prepared interpretation, exactly like every other
 * scripted turn. The attach affordance is a pick from this set, never a real
 * file input.
 *
 * Depth is decided by the DOCUMENT, not the user (§3.8a point 2): a `notice`
 * gets fields extracted and an original to read alongside; a `receipt` is filed
 * as evidence with a one-line acknowledgement and nothing to act on. The person
 * who cannot read the notice also cannot categorise it, so the app does.
 */

import type { DemoLanguage } from './responseTurns';

export type DocKind = 'notice' | 'receipt';

/** How a surfaced figure is marked back in the original. */
export type ClauseHighlight = 'amount' | 'section' | 'deadline';

/** One line of the original document, addressable so a surfaced field can point
 *  at the exact clause it was read from (§3.8a point 3 — correspondence, not
 *  layout). `block` drives the paper rendering (letterhead vs body vs signature). */
export interface OriginalClause {
  id: string;
  text: string;
  block: 'letterhead' | 'ref' | 'subject' | 'body' | 'sign';
  highlight?: ClauseHighlight;
}

/** A specific fact pulled out of the dense original. `clauseId` is the line it
 *  came from; tapping the field scrolls the original there and highlights it. */
export interface SurfacedField {
  id: string;
  label: string;
  value: string;
  /** Mono citation stamp — how this figure is anchored in the source. */
  citation: string;
  clauseId: string;
  /** Amounts render in the tabular `Amount` primitive. */
  isAmount?: boolean;
}

export interface NoticeInterpretation {
  /** Plain-language summary — "what this document is actually telling you." */
  summary: string;
  /** The one caps label over the extracted figures. */
  fieldsLabel: string;
  fields: SurfacedField[];
}

export interface PreparedDocument {
  id: string;
  kind: DocKind;
  fileName: string;
  pages: number;
  /** The language the DOCUMENT is written in (not the reader's). */
  sourceLang: DemoLanguage;
  /** Human label for the detected language, shown as a badge on the turn. */
  sourceLangLabel: string;
  /** Notices carry an original to read alongside; receipts do not. */
  original?: OriginalClause[];
  /** Interpretation per reader language. Notices only. */
  interpretation?: Record<DemoLanguage, NoticeInterpretation>;
  /** One-line acknowledgement for the `receipt` depth, per reader language. */
  receiptAck?: Record<DemoLanguage, string>;
}

/* ── The original — a Marathi BMC property-tax demand ──────────────────────────
   Reused from the desktop Notice.tsx example, segmented so the amount, the legal
   section, and the deadline are each individually addressable. Devanagari
   numerals in the source (as a real notice would carry); Latin numerals in the
   plain-language surfacing, because that is the register switch the product
   performs. */
const BMC_ORIGINAL: OriginalClause[] = [
  { id: 'letter', block: 'letterhead', text: 'महाराष्ट्र शासन — बृहन्मुंबई महानगरपालिका' },
  { id: 'ref', block: 'ref', text: 'जा. क्र. / Ref. No: BMC/H-West/2026/0341   ·   दिनांक: १८ मार्च २०२६' },
  { id: 'subject', block: 'subject', text: 'विषय: मालमत्ता कर थकबाकीबाबत नोटीस — मालमत्ता क्र. ४५२/बी, पाली हिल, बांद्रा (प).' },
  { id: 'greet', block: 'body', text: 'श्रीमती रिया शर्मा, १४बी, पाली हिल, बांद्रा (पश्चिम), मुंबई — ४०००५०.' },
  { id: 'amount', block: 'body', highlight: 'amount', text: 'आपणास कळविण्यात येते की, आर्थिक वर्ष २०२५–२६ करिता देय मालमत्ता कर रु. ३२,४८०/– (अक्षरी: बत्तीस हजार चारशे ऐंशी रुपये) अद्याप अदा केलेला नाही.' },
  { id: 'section', block: 'body', highlight: 'section', text: 'महाराष्ट्र महानगरपालिका अधिनियम, १८८८ च्या कलम १४९ अन्वये आपणास ही नोटीस देण्यात येत आहे.' },
  { id: 'deadline', block: 'body', highlight: 'deadline', text: 'सदर रक्कम या नोटिशीच्या दिनांकापासून ३० दिवसांच्या आत, म्हणजेच १५ एप्रिल २०२६ पूर्वी भरावी.' },
  { id: 'consequence', block: 'body', text: 'कसूर केल्यास वसुली कारवाई सुरू केली जाईल, ज्यामध्ये सदर मालमत्तेवर टाच येऊ शकते.' },
  { id: 'sign', block: 'sign', text: 'कर निरीक्षक, H/West वॉर्ड' },
];

/* Field labels per reader language. Values (₹32,480, dates, reference numbers)
   are proper nouns / figures and stay stable across languages — only the labels
   and the summary translate. */
function fields(labels: {
  amount: string; deadline: string; section: string; reference: string;
}): SurfacedField[] {
  return [
    { id: 'amount', label: labels.amount, value: '₹32,480', citation: 'MMC Act 1888 · S.149', clauseId: 'amount', isAmount: true },
    { id: 'deadline', label: labels.deadline, value: '15 April 2026', citation: '30 days from 18 Mar 2026', clauseId: 'deadline' },
    { id: 'section', label: labels.section, value: 'Section 149', citation: 'MMC Act, 1888', clauseId: 'section' },
    { id: 'reference', label: labels.reference, value: 'BMC/H-West/2026/0341', citation: 'Ref. no.', clauseId: 'ref' },
  ];
}

const BMC_INTERPRETATION: Record<DemoLanguage, NoticeInterpretation> = {
  en: {
    summary:
      "This is a property-tax demand from the Brihanmumbai Municipal Corporation. It says ₹32,480 of tax for 2025–26 is unpaid on your flat in Bandra West, and asks you to pay within 30 days (by 15 April 2026) or recovery action can begin. It is a first notice; no court case has started yet.",
    fieldsLabel: 'What the notice says',
    fields: fields({ amount: 'Amount claimed', deadline: 'Pay by', section: 'Legal basis', reference: 'Reference number' }),
  },
  hi: {
    summary:
      'यह बृहन्मुंबई महानगरपालिका की संपत्ति-कर माँग है। इसमें कहा गया है कि बांद्रा (पश्चिम) स्थित आपके फ्लैट पर 2025–26 का ₹32,480 कर बकाया है, और 30 दिन के भीतर — 15 अप्रैल 2026 तक — भुगतान करने को कहा गया है, वरना वसूली की कार्रवाई शुरू हो सकती है। यह पहली नोटिस है; अभी कोई अदालती मामला शुरू नहीं हुआ।',
    fieldsLabel: 'नोटिस क्या कहती है',
    fields: fields({ amount: 'माँगी गई रकम', deadline: 'भुगतान की तिथि', section: 'कानूनी आधार', reference: 'संदर्भ क्रमांक' }),
  },
  mr: {
    summary:
      'ही बृहन्मुंबई महानगरपालिकेची मालमत्ता-कर मागणी आहे. बांद्रा (पश्चिम) येथील तुमच्या सदनिकेवर 2025–26 चा ₹32,480 कर थकीत असल्याचे यात म्हटले आहे, आणि 30 दिवसांत — 15 एप्रिल 2026 पर्यंत — भरण्यास सांगितले आहे, अन्यथा वसुलीची कारवाई सुरू होऊ शकते. ही पहिली नोटीस आहे; अद्याप कोणताही न्यायालयीन खटला सुरू झालेला नाही.',
    fieldsLabel: 'नोटीस काय सांगते',
    fields: fields({ amount: 'मागितलेली रक्कम', deadline: 'भरण्याची तारीख', section: 'कायदेशीर आधार', reference: 'संदर्भ क्रमांक' }),
  },
  ta: {
    summary:
      'இது பிரிஹன்மும்பை மாநகராட்சியின் சொத்து-வரி கோரிக்கை. பாந்த்ரா (மேற்கு) உள்ள உங்கள் வீட்டிற்கு 2025–26 ஆண்டின் ₹32,480 வரி நிலுவையில் இருப்பதாகக் கூறி, 30 நாட்களுக்குள் — 15 ஏப்ரல் 2026க்குள் — செலுத்தச் சொல்கிறது; இல்லையெனில் வசூல் நடவடிக்கை தொடங்கலாம். இது முதல் அறிவிப்பு; நீதிமன்ற வழக்கு எதுவும் இன்னும் தொடங்கவில்லை.',
    fieldsLabel: 'அறிவிப்பு என்ன சொல்கிறது',
    fields: fields({ amount: 'கோரப்பட்ட தொகை', deadline: 'செலுத்த வேண்டிய தேதி', section: 'சட்ட அடிப்படை', reference: 'குறிப்பு எண்' }),
  },
};

const RECEIPT_ACK: Record<DemoLanguage, string> = {
  en: 'Filed as evidence. This is a payment receipt, so there is no deadline or claim to act on. It is saved to this matter’s documents.',
  hi: 'साक्ष्य के रूप में दर्ज किया गया। यह एक भुगतान रसीद है — इस पर कार्रवाई के लिए कोई समय-सीमा या दावा नहीं है। यह इस मामले के दस्तावेज़ों में सहेजा गया है।',
  mr: 'पुरावा म्हणून नोंदवले. ही एक भरणा पावती आहे — यावर कार्यवाहीसाठी कोणतीही मुदत किंवा दावा नाही. हे या प्रकरणाच्या कागदपत्रांत जतन केले आहे.',
  ta: 'ஆதாரமாகச் சேர்க்கப்பட்டது. இது ஒரு பணம் செலுத்திய ரசீது — செயல்பட வேண்டிய காலக்கெடு அல்லது கோரிக்கை எதுவும் இல்லை. இது இந்த வழக்கின் ஆவணங்களில் சேமிக்கப்பட்டது.',
};

/** The scripted set the attach affordance offers. Ordered: the notice first
 *  (the founding-feature demo), then a receipt to show depth-by-document. */
export const PREPARED_DOCUMENTS: PreparedDocument[] = [
  {
    id: 'bmc-property-tax',
    kind: 'notice',
    fileName: 'property-tax-notice.pdf',
    pages: 1,
    sourceLang: 'mr',
    sourceLangLabel: 'Marathi',
    original: BMC_ORIGINAL,
    interpretation: BMC_INTERPRETATION,
  },
  {
    id: 'payment-receipt',
    kind: 'receipt',
    fileName: 'payment-receipt.jpg',
    pages: 1,
    sourceLang: 'en',
    sourceLangLabel: 'English',
    receiptAck: RECEIPT_ACK,
  },
];

export function getPreparedDocument(id: string): PreparedDocument | undefined {
  return PREPARED_DOCUMENTS.find((d) => d.id === id);
}

/** The interpretation in the reader's language, falling back to English if a
 *  prepared pack is missing (keeps the `prepared` honesty of the language
 *  registry — an unsupported language never silently renders as another). */
export function interpretationFor(doc: PreparedDocument, lang: DemoLanguage): NoticeInterpretation | null {
  if (!doc.interpretation) return null;
  return doc.interpretation[lang] ?? doc.interpretation.en;
}

export function receiptAckFor(doc: PreparedDocument, lang: DemoLanguage): string {
  return doc.receiptAck?.[lang] ?? doc.receiptAck?.en ?? '';
}
