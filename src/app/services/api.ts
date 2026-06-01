// ─── LokAI API Service ────────────────────────────────────────────────────────
// NVIDIA NIM endpoint · sarvamai/sarvam-m model
// API key from VITE_NVIDIA_API_KEY env var — never hardcoded

export interface LokAIZone {
  label:   string;
  finding?: string;
  analysis?: string;
  steps?:  string[];
  cta?:    string;
}

export interface ContextPanel {
  primaryLaw:  string;
  sections:    { ref: string; summary: string }[];
  keyFacts:    string[];
  relatedLaws: string[];
}

export interface LokAIResponse {
  title:           string;
  zone1:           { label: string; finding: string };
  zone2:           { label: string; analysis: string };
  zone3:           { label: string; steps: string[]; cta: string };
  citations:       string[];
  contextPanel:    ContextPanel;
  scope:           'in' | 'out';
  responseLanguage: string;
}

export interface APIMessage {
  role:    'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are LokAI, an AI legal guidance assistant for Indian citizens. You help people understand their legal rights. You are not a lawyer.

CRITICAL: Respond ONLY with valid JSON. No markdown.

{
  "title": "3-4 word topic summary",
  "zone1": { "label": "THE LAW", "finding": "1-2 sentence core legal answer." },
  "zone2": { "label": "YOUR SITUATION", "analysis": "2-3 sentences applying the law to the user facts." },
  "zone3": { "label": "WHAT YOU CAN DO", "steps": ["Step 1", "Step 2", "Step 3"], "cta": "Immediate action" },
  "citations": ["Act Name · Section"],
  "contextPanel": {
    "primaryLaw": "Full name of act",
    "sections": [{ "ref": "Section X", "summary": "One line summary" }],
    "keyFacts": ["Fact 1", "Fact 2"],
    "relatedLaws": ["Related Act"]
  },
  "scope": "in",
  "responseLanguage": "en"
}

If the user asks for sports, weather, entertainment, medical advice, coding help, or anything outside Indian legal guidance, set "scope" to "out" and explain the boundary clearly in the same JSON format.`;

const TIMEOUT_MS = 15_000;

function isOutOfScope(text: string) {
  const outOfScopeTerms = [
    'weather', 'temperature', 'rain', 'cricket', 'match', 'score', 'ipl',
    'movie', 'song', 'lyrics', 'recipe', 'gym', 'diet', 'medical', 'doctor',
    'symptom', 'medicine', 'stock price', 'bitcoin', 'code', 'bug', 'javascript',
    'python', 'travel plan', 'hotel', 'restaurant',
  ];
  return outOfScopeTerms.some((term) => text.includes(term));
}

function buildOutOfScopeResponse(): LokAIResponse {
  return {
    title: 'Outside LokAI Scope',
    zone1: {
      label: 'BOUNDARY',
      finding: 'This question is outside LokAI’s role. I can help with Indian legal rights, notices, complaints, tenancy, consumer disputes, and document drafting.',
    },
    zone2: {
      label: 'WHY',
      analysis: 'LokAI is intentionally narrow so the guidance stays structured and legally relevant. For sports, weather, medicine, coding, or general trivia, you should use a general-purpose assistant or a specialist source.',
    },
    zone3: {
      label: 'TRY THIS INSTEAD',
      steps: [
        'Ask about a legal notice, tenancy issue, consumer refund, FIR, or RTI.',
        'Upload or paste the legal document you want explained.',
        'Describe the facts and the state or city if the issue is location-specific.',
      ],
      cta: 'Ask a legal question',
    },
    citations: ['LokAI Prototype Boundary'],
    contextPanel: {
      primaryLaw: 'LokAI handles Indian legal guidance only',
      sections: [
        { ref: 'Supported topics', summary: 'Notices, tenancy, consumer complaints, RTI, documents, and legal next steps.' },
      ],
      keyFacts: ['No legal issue detected in the current question', 'Use LokAI for Indian law and citizen-rights workflows'],
      relatedLaws: [],
    },
    scope: 'out',
    responseLanguage: 'en',
  };
}

function buildDemoResponse(messages: APIMessage[]): LokAIResponse {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  const text = lastUser.toLowerCase();

  if (isOutOfScope(text)) {
    return buildOutOfScopeResponse();
  }

  if (text.includes('rti') || text.includes('information') || text.includes('bmc')) {
    return {
      title: 'RTI Response Delay',
      zone1: {
        label: 'THE LAW',
        finding: 'If a public authority does not respond to an RTI within 30 days, you can file a First Appeal with the designated appellate officer.',
      },
      zone2: {
        label: 'YOUR SITUATION',
        analysis: 'Your issue appears to involve a delayed government response. The key fact is the date your RTI was submitted, because the appeal window starts after the statutory response period expires.',
      },
      zone3: {
        label: 'WHAT YOU CAN DO',
        steps: [
          'Collect your RTI receipt, application copy, and proof of submission.',
          'Draft a First Appeal citing the missed 30-day response period.',
          'Submit it to the First Appellate Authority of the same department and keep an acknowledgement.',
        ],
        cta: 'Draft First Appeal',
      },
      citations: ['RTI Act 2005 · Section 7(1)', 'RTI Act 2005 · Section 19(1)'],
      contextPanel: {
        primaryLaw: 'Right to Information Act, 2005',
        sections: [
          { ref: 'Section 7(1)', summary: 'Information must normally be provided within 30 days.' },
          { ref: 'Section 19(1)', summary: 'First appeal is available when response is refused or delayed.' },
        ],
        keyFacts: ['RTI submission date', 'Department name', 'PIO details', 'Any acknowledgement received'],
        relatedLaws: ['Maharashtra Right to Public Services Act, 2015'],
      },
      scope: 'in',
      responseLanguage: 'en',
    };
  }

  if (text.includes('phone') || text.includes('refund') || text.includes('seller') || text.includes('defective')) {
    return {
      title: 'Consumer Refund Issue',
      zone1: {
        label: 'THE LAW',
        finding: 'A seller cannot refuse remedy for a defective product when the defect is genuine and reported within a reasonable time.',
      },
      zone2: {
        label: 'YOUR SITUATION',
        analysis: 'Your strongest path is to create a written trail: invoice, product issue, seller refusal, and your requested remedy. This makes the complaint easier to file with a consumer forum or helpline.',
      },
      zone3: {
        label: 'WHAT YOU CAN DO',
        steps: [
          'Send a written complaint to the seller and manufacturer with invoice proof.',
          'Give a clear deadline for refund, replacement, or repair.',
          'If ignored, file with the National Consumer Helpline or District Consumer Commission.',
        ],
        cta: 'Draft Consumer Complaint',
      },
      citations: ['Consumer Protection Act 2019 · Section 2(11)', 'Consumer Protection Act 2019 · Section 35'],
      contextPanel: {
        primaryLaw: 'Consumer Protection Act, 2019',
        sections: [
          { ref: 'Section 2(11)', summary: 'Defines deficiency in goods or services.' },
          { ref: 'Section 35', summary: 'Allows consumers to file complaints before the District Commission.' },
        ],
        keyFacts: ['Purchase date', 'Invoice amount', 'Defect description', 'Seller response'],
        relatedLaws: ['Consumer Protection (E-Commerce) Rules, 2020'],
      },
      scope: 'in',
      responseLanguage: 'en',
    };
  }

  return {
    title: 'Deposit Legal Step',
    zone1: {
      label: 'THE LAW',
      finding: 'A landlord cannot keep a security deposit without a documented legal reason such as unpaid rent, proven damage, or another written tenancy obligation.',
    },
    zone2: {
      label: 'YOUR SITUATION',
      analysis: 'If you have vacated the property and the landlord has not given a written damage claim, your position is strong. The next step is to create a formal written record before escalating.',
    },
    zone3: {
      label: 'WHAT YOU CAN DO',
      steps: [
        'Send a formal demand notice asking for the deposit return within 15 days.',
        'Attach rent agreement, payment proof, handover messages, and photos if available.',
        'If ignored, consider filing before the appropriate consumer forum or local civil court.',
      ],
      cta: 'Draft Demand Notice',
    },
    citations: ['Maharashtra Rent Control Act 1999 · Section 24', 'Consumer Protection Act 2019 · Section 35'],
    contextPanel: {
      primaryLaw: 'Maharashtra Rent Control Act, 1999',
      sections: [
        { ref: 'Section 24', summary: 'Protects tenants against unlawful withholding and harassment.' },
        { ref: 'Section 35', summary: 'Consumer complaint route for service deficiency claims.' },
      ],
      keyFacts: ['Deposit amount', 'Move-out date', 'Written damage claim', 'Payment proof'],
      relatedLaws: ['Transfer of Property Act, 1882'],
    },
    scope: 'in',
    responseLanguage: 'en',
  };
}

export async function callLokAI(messages: APIMessage[]): Promise<LokAIResponse> {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
  if (!apiKey) {
    console.warn('[LokAI API] Missing VITE_NVIDIA_API_KEY. Using structured demo response.');
    return buildDemoResponse(messages);
  }

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('/api/nvidia/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'sarvamai/sarvam-m',
        messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.3,
        max_tokens:  700,
        stream:      false,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[LokAI API] HTTP error:', response.status, response.statusText, body);
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    const data    = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    if (!content) throw new Error('Empty API response');

    // Strip any accidental markdown fences
    const clean = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(clean) as LokAIResponse;
    } catch {
      console.error('[LokAI API] JSON parse failed. Raw content:', clean);
      throw new Error('JSON parse failed');
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.error('[LokAI API] Fetch error:', err);
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[LokAI API] Timed out. Using structured demo response.');
      return buildDemoResponse(messages);
    }
    console.warn('[LokAI API] Falling back to structured demo response.');
    return buildDemoResponse(messages);
  }
}

// ─── Sarvam Speech-to-Text (STT) ─────────────────────────────────────────────
export async function callSarvamSTT(audioBlob: Blob): Promise<string> {
  const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
  if (!apiKey) throw new Error('VITE_SARVAM_API_KEY is not set.');

  const formData = new FormData();
  formData.append('file', audioBlob, 'input.wav');
  formData.append('model', 'saarathi:v1');

  const response = await fetch('/api/sarvam/speech-to-text', {
    method: 'POST',
    headers: { 'api-subscription-key': apiKey },
    body: formData,
  });

  if (!response.ok) throw new Error(`STT failed: ${response.statusText}`);
  const data = await response.json();
  return data.transcript || '';
}

// ─── Sarvam Text-to-Speech (TTS) ─────────────────────────────────────────────
export async function callSarvamTTS(text: string, language: string = 'hi-IN'): Promise<string> {
  const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
  if (!apiKey) throw new Error('VITE_SARVAM_API_KEY is not set.');

  const response = await fetch('/api/sarvam/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: language,
      speaker: 'meera',
      model: 'bulbul:v1'
    }),
  });

  if (!response.ok) throw new Error(`TTS failed: ${response.statusText}`);
  const data = await response.json();
  return data.audios?.[0] || ''; // Returns base64 string
}

// ─── Sarvam Document Parse (OCR) ─────────────────────────────────────────────
export async function callSarvamOCR(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
  if (!apiKey) throw new Error('VITE_SARVAM_API_KEY is not set.');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/sarvam/v1/document-parse', {
    method: 'POST',
    headers: { 'api-subscription-key': apiKey },
    body: formData,
  });

  if (!response.ok) throw new Error(`OCR failed: ${response.statusText}`);
  const data = await response.json();
  // Document parse usually returns structured data; we'll return the full text for now
  return data.parsed_content || '';
}
