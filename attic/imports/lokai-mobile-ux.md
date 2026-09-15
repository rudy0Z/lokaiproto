PROMPT 2 — Mobile Citizen Experience (390px) — Primary Surface
Design the LokAI mobile experience for a regular Indian citizen. 390px wide, 844px tall. This is the primary product surface — designed mobile-first, voice-first, Indian-language-first.
Screen 1 — Mobile Home:
Top: logo mark (लो circle) left, "LokAI" wordmark center, language selector chip right (shows current language in native script — "हिन्दी" — with a chevron). Tap opens the language palette.
Below nav: full-width gradient header band — 80px tall, ink-to-navy gradient, contains the line: "अपने अधिकार जानें" (Know your rights) in DM Serif Display 18px white italic. Below it in the same band: "Hindi · தமிழ் · বাংলা · తెలుగు · ਪੰਜਾਬੀ · ..." in Plus Jakarta Sans 10px rgba(255,255,255,0.5) — showing all supported languages in their native scripts.
The band communicates the multilingual promise before the user types anything.
Below the band: the input card. Dominant element. Voice orb 52px centered above the input field — gradient fill using verdict gradient (saffron to amber). Below the orb: "Tap to speak or type your situation" in Plus Jakarta Sans 15px #8A8880. Below that: language detected chip showing "Auto-detecting language..." until voice is used.
Suggestion chips below in two rows — in the user's set language: "किरायेदारी विवाद" / "उपभोक्ता शिकायत" / "RTI दर्ज करें" / "नोटिस समझें". Each chip shows the Hindi text.
Below: Recent verdicts section — 2 compact cards showing previous legal standing results with outcome badges.
Screen 2 — Language Palette (bottom sheet, slides up from bottom):
Full-width bottom sheet, 480px tall, white, border-radius 16px 16px 0 0.
Header: "Choose your language" in DM Serif Display 20px. Small subtitle: "Response language will match your input automatically" Plus Jakarta Sans 13px #8A8880.
Language grid — 3 columns, each chip shows the language's own script name: हिन्दी · বাংলা · தமிழ் · తెలుగు · मराठी · ਪੰਜਾਬੀ · ગુજરાતી · ಕನ್ನಡ · ଓଡ଼ିଆ · മലയാളം · অসমীয়া · English.
Selected language chip: background #EEF2F8, border 1.5px #1C3A6E, text #1C3A6E.
At the bottom of the sheet: "Chat language auto-matches your speech — no setting needed" in a subtle info card.
Screen 3 — Verdict Screen (the hero moment):
This replaces the generic chat response. After the user speaks their situation, the full screen shows the verdict.
Top: small transcript chip showing what was understood: "मेरे किरायेदार ने 65 दिन बाद भी deposit वापस नहीं किया" — small, contained, showing the system heard correctly.
Below: the main verdict card takes 70% of the screen. Left border: 4px verdict gradient (saffron to amber). Inside: "आपकी स्थिति मजबूत है" (Your position is strong) in DM Serif Display 22px italic — this is the moment. The finding. Below: "महाराष्ट्र किराया नियंत्रण अधिनियम के तहत" (Under Maharashtra Rent Control Act) in Plus Jakarta Sans 14px. Below: citation stamp. Below a divider: "आप क्या कर सकते हैं" section with one primary action button full-width: "डिमांड नोटिस तैयार करें" (Generate Demand Notice) — background #1C3A6E, white text, border-radius 28px.
Below the verdict card: "किसी वकील से बात करें" (Talk to a lawyer) ghost button — for when the user wants human help.
Screen 4 — Voice Active State:
The entire screen becomes the listening state. Background shifts to #F8F6F0 (warm listening mode).
Center: the voice orb expands to 80px, verdict gradient, slow breathing animation.
Below orb: live transcript text appearing word by word in the user's language — Plus Jakarta Sans 17px #1A1916, centered, max 2 lines.
Below transcript: language detected chip — auto-updated: "हिन्दी" when Hindi is detected, "বাংলা" when Bengali is detected.
Bottom: "रोकें" (Stop) button — pill, centered, border 1.5px #E8832A, text #E8832A.
No waveform bars. The live text IS the feedback — you can see your problem being understood.

PROMPT 3 — Desktop Advocate Workspace
Design the LokAI desktop advocate workspace (1440px). This is a professional legal document tool, not a consumer chat app. Same brand identity but different surface — denser, faster, utility-first.
Sidebar: same ink-to-navy gradient header with LokAI wordmark. Navigation items: Dashboard, Matter Workspace, Document Library, Client Matters, Settings. Active: #E8832A left border. Bottom: "Adv. Suresh K. — Nagpur · Pro" avatar.
Main area — two column layout:
Left column (380px) — Matter Brief:
Section header "Matter Brief" Plus Jakarta Sans 12px uppercase #8A8880.
Form-style input for matter details — not a chat:
Matter type: dropdown (RTI / Consumer Complaint / Demand Notice / Workplace)
Client language: language chip selector showing native scripts
Key facts: text area "paste or speak client notes — any language"
Jurisdiction: state selector
Below: "Generate Documents" button — full width, background #1C3A6E.
Below: Hypothesis note in small text: "Advocate time savings hypothesis — to be validated in pilot." Plus Jakarta Sans 11px #8A8880 italic. This acknowledges the unresearched claim honestly.
Right column (fluid) — Live Document:
As the advocate fills in the brief, the document composes in real time on the right.
Document header: "RTI Application under RTI Act, 2005" in DM Serif Display 20px — looks like a real legal document.
Editable fields highlighted with dashed saffron underline.
Citation stamps appear inline as sections are generated.
"AI Generated Draft — Review before submitting" stamp at top of document.
Below document: What to do next — 3 steps: Review fields / Submit to PIO / 30-day response window.

PROMPT 4 — Language System Showcase Screen (Desktop)
Design a dedicated language showcase screen for LokAI — demonstrating all 12 supported Indian languages simultaneously. This is a portfolio artifact showing the multilingual system design.
Full page, 1440px. Same sidebar.
Main area header: "LokAI speaks India" in DM Serif Display 36px — left aligned.
Subtitle: "The same legal question, understood in 12 languages — natively, not translated." Plus Jakarta Sans 16px #4A4840.
Below: a grid of 12 language demonstration cards — 4 columns, 3 rows.
Each card shows:
- Language name in its own script — large, DM Serif Display 22px, native script (हिन्दी / தமிழ் / বাংলা / etc)
- A sample legal query in that language — "मेरे मकान मालिक ने deposit नहीं दिया" type sentences
- Below: the LokAI response in the same language — first line only, truncated
- Citation stamp in that language's context
- Bottom: a small language indicator chip
Cards use a subtle left border: each language group gets a different color — North Indian languages (navy), South Indian (deep green #1F6B3A), East Indian (saffron), West Indian (terracotta). This creates a visual map of India's linguistic geography.
This screen exists to show: LokAI isn't a Hindi chatbot with a language toggle. It's a system designed for India's full linguistic reality.