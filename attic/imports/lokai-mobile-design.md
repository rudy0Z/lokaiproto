Mobile Home Screen (390px)
Design LokAI mobile home screen, 390px x 844px. Design System page already exists — reference all tokens from it. This is the primary citizen-facing surface. Import DM Serif Display and Plus Jakarta Sans from Google Fonts.
Status bar: 44px, shows 9:41, signal, wifi, battery in #1A1916.
Navigation bar: 56px, background #FAFAF8, border-bottom 1px #E8E4DC.
Left: the LokAI logo mark — a circle 32px with border 1.5px #1C3A6E containing "लो" in DM Serif Display 14px #1C3A6E. Right of mark: "LokAI" wordmark — "Lok" DM Serif Display 16px #1A1916, "AI" Plus Jakarta Sans 16px weight 600 #1A1916.
Right: language selector chip — shows current language in native script "हिन्दी" in Plus Jakarta Sans 13px #1C3A6E, background #EEF2F8, border 1px #B8C8E0, border-radius 20px, padding 4px 12px, chevron down 12px.
Hero band: full-width, 88px tall, no border-radius, background gradient/brand (ink to navy 160deg). Inside: "अपने अधिकार जानें" in DM Serif Display 20px italic white left-aligned with 20px left padding. Below it: "हिन्दी · தமிழ் · বাংলা · తెలుగు · मराठी · ਪੰਜਾਬੀ · ..." in Plus Jakarta Sans 10px rgba(255,255,255,0.5) — native scripts separated by dots.
Page background #FAFAF8. Horizontal padding 16px throughout.
Input card: white, border-radius 16px, border 1px #E8E4DC, shadow/md, padding 16px 18px, margin-top 20px.
Inside: voice orb component (idle state) 48px left. Right of orb: "अपनी समस्या बताएं..." in Plus Jakarta Sans 15px #8A8880. Far right: paperclip icon 18px #8A8880.
Below input row, 1px #F4F2EE divider, below that: 4 suggestion chips in 2x2 grid.
Chips: border 1px #E8E4DC, border-radius 20px, padding 8px 14px, Plus Jakarta Sans 13px #4A4840, background #F7F7F5.
Chip text in current language: "किरायेदारी समस्या" / "उपभोक्ता शिकायत" / "RTI दर्ज करें" / "नोटिस समझें"
Section: "आपके अधिकार" (Know Your Rights) — DM Serif Display 20px #1A1916 left, "सभी देखें →" Plus Jakarta Sans 13px #1C3A6E right.
Horizontal scroll row — 2.5 cards visible showing partial third.
Each card: 200px wide, white, border-radius 12px, border 1px #E8E4DC, shadow/sm, padding 16px.
Top: category badge — background #EEF2F8, text #1C3A6E, border-radius 4px, Plus Jakarta Sans 10px weight 600 uppercase.
Title: DM Serif Display 15px #1A1916. Description: Plus Jakarta Sans 12px #4A4840 2 lines. "पढ़ें →" Plus Jakarta Sans 12px #1C3A6E.
Section: "हाल की बातचीत" (Recent chats) — if first time user shows empty state: illustration placeholder 60px, "आपकी बातचीत यहाँ दिखेगी" Plus Jakarta Sans 14px #8A8880, "पहला सवाल पूछें" primary button.
Bottom navigation: 64px, background #FFFFFF, border-top 1px #E8E4DC, safe area padding.
4 tabs: घर (Home) active — icon filled #1C3A6E, 3px top border #E8832A, label Plus Jakarta Sans 10px #1C3A6E. बातचीत (Chats) / दस्तावेज़ (Documents) / प्रोफ़ाइल (Profile) — inactive icons outline #8A8880.

PROMPT 3 — Mobile Language Palette (bottom sheet)
Design the LokAI language selector bottom sheet for mobile, 390px wide, overlaying the home screen. This is a separate component.
Overlay: rgba(26,25,22,0.5) full screen.
Bottom sheet: 520px tall, slides up from bottom, background #FFFFFF, border-radius 20px 20px 0 0, shadow/float.
Handle bar: 4px x 36px, background #E8E4DC, border-radius 2px, centered, 12px from top.
Header: padding 24px 20px 16px. "भाषा चुनें" DM Serif Display 22px #1A1916. Below: "जवाब अपने आप आपकी भाषा में मिलेगा" Plus Jakarta Sans 13px #8A8880.
Language grid: 3 columns, 12px gap, padding 0 20px.
Each chip: border 1px #E8E4DC, border-radius 10px, padding 12px 8px, centered.
Native script name: Plus Jakarta Sans 14px #1A1916 weight 500, centered.
Below name: English name in Plus Jakarta Sans 10px #8A8880.
12 languages: हिन्दी / বাংলা / தமிழ் / తెలుగు / मराठी / ਪੰਜਾਬੀ / ગુજરાતી / ಕನ್ನಡ / ଓଡ଼ିଆ / മലയാളം / অসমীয়া / English
Selected (हिन्दी): background #EEF2F8, border 1.5px #1C3A6E, text #1C3A6E weight 600. Small checkmark 12px top-right.
Bottom info card: margin 16px 20px, background #F4F2EE, border-radius 10px, padding 14px 16px.
Left: voice orb icon 24px. Right: "बोलें, लिखें या फ़ोटो लें — LokAI भाषा अपने आप पहचानता है" Plus Jakarta Sans 13px #4A4840.
Close button area: 64px, border-top 1px #E8E4DC. "बंद करें" ghost button centered Plus Jakarta Sans 14px #4A4840.

PROMPT 4 — Mobile Chat / Verdict Screen
Design the LokAI mobile conversation screen showing the verdict moment — the most important screen in the product. 390px x 844px. Same design system.
Nav bar: same as home. Breadcrumb below nav: "घर / किरायेदारी समस्या" Plus Jakarta Sans 12px #8A8880, padding 10px 16px.
Chat area: background #FAFAF8, scrollable.
User message bubble: right-aligned, max-width 280px, background #C4724A (terracotta), border-radius 18px 4px 18px 18px, padding 12px 16px.
Text: Plus Jakarta Sans 15px white line-height 1.6.
"मेरे मकान मालिक ने 65 दिन बाद भी deposit वापस नहीं किया है"
Timestamp below: Plus Jakarta Sans 11px rgba(255,255,255,0.6).
LokAI label: "LokAI" Plus Jakarta Sans 11px #8A8880, left-aligned, 8px above response card.
Verdict response card: white, border-radius 4px 16px 16px 16px, border 1px #E8E4DC, left border 4px gradient/verdict, shadow/md, padding 18px.
Zone 1 — WHAT THE LAW SAYS:
Zone label: Plus Jakarta Sans 9px #8A8880 uppercase tracking 0.1em. "कानून क्या कहता है"
Main finding: DM Serif Display 20px italic #1A1916 line-height 1.3: "मकान मालिक का कोई अधिकार नहीं deposit रोकने का"
Citation stamp: Brand/navy bg, white monospace 10px: "महाराष्ट्र किराया नियंत्रण अधिनियम · धारा 24"
1px #F4F2EE divider.
Zone 2 — YOUR POSITION:
Zone label: "आपकी स्थिति" same label style.
Body: Plus Jakarta Sans 14px #4A4840 line-height 1.7: "आपकी स्थिति मजबूत है। 65 दिन बीत चुके हैं — कानूनी समय-सीमा पार हो गई है। damage का कोई लिखित प्रमाण नहीं है, तो मकान मालिक कोई कटौती नहीं कर सकते।"
1px #F4F2EE divider.
Zone 3 — ACTION:
Zone label: "अभी क्या करें" same label style.
Primary button full width: "डिमांड नोटिस तैयार करें" gradient/button-primary, border-radius 28px, Plus Jakarta Sans 14px white weight 600, padding 13px.
Ghost button below: "और जानें" centered Plus Jakarta Sans 13px #1C3A6E.
Timestamp + actions row: 4:16 PM Plus Jakarta Sans 11px #8A8880. Copy icon + Save icon + Speaker icon (voice response indicator) each 16px #8A8880, right-aligned.
Input bar: fixed bottom, background #FFFFFF, border-top 1px #E8E4DC, padding 12px 16px, safe area.
Voice orb 44px idle state left. Paperclip 18px #8A8880. Placeholder text Plus Jakarta Sans 14px #8A8880. Mic icon right.
Bottom nav same as home, Chats tab active.

PROMPT 5 — Mobile Voice Active State
Design the LokAI mobile voice recording state. 390px x 844px. Full-screen listening mode.
Status bar: white text on dark (the screen bg is slightly warm).
The entire screen background: #F8F5F0 (warm listening state). Top nav: same but on this warm background.
Center area: vertically centered in the viewport.
Voice orb: 88px diameter, gradient/verdict (saffron to amber), shadow/float.
Pulsing ring: 92px, border 2px #E8832A opacity 0.3, animates to 104px opacity 0, 1.8s loop.
Second ring: 100px, border 1.5px #E8832A opacity 0.15, animates to 116px opacity 0, 1.8s loop 0.4s delay.
Center: 3 animated bars 3px wide, rounded, white, varying heights 8-28px — waveform animation.
Red recording dot 8px solid #E8392A at top-right of orb.
Below orb, 16px gap: live transcript area.
"मेरे मकान मालिक ने..." appearing word by word, Plus Jakarta Sans 17px #1A1916 centered, max-width 300px, line-height 1.6.
Blinking cursor after the last word: 2px x 20px #E8832A.
Below transcript, 12px gap: language detection chip.
"हिन्दी" detected — background #EEF2F8, border 1px #B8C8E0, border-radius 20px, padding 4px 12px, Plus Jakarta Sans 12px #1C3A6E. Small language icon left.
Below chip, 24px gap: Stop button.
"रोकें" — border 1.5px #E8832A, border-radius 28px, padding 10px 32px, text #E8832A Plus Jakarta Sans 14px weight 600, background transparent.
Hint text below: "बोलना बंद हो जाएगा" Plus Jakarta Sans 11px #8A8880.
Bottom: same nav bar.

PROMPT 6 — Mobile Error States (three states, separate artboard sections)
Design three mobile error states for LokAI. 390px wide, 2200px tall artboard with three clearly labeled sections.
State 1 label: "NETWORK / MODEL ERROR" 10px uppercase #8A8880, full-width background #E8E4DC 28px tall, centered.
Show the chat screen with user message visible. Below it: LokAI error response card.
Card: white, border-radius 4px 16px 16px 16px, border 1px #E8E4DC, shadow/sm.
Top: small row — 6px circle #E8392A + "कुछ गड़बड़ हुई" Plus Jakarta Sans 12px #4A4840.
Heading: Plus Jakarta Sans 15px weight 600 #1A1916: "जवाब नहीं मिल सका"
Body: Plus Jakarta Sans 14px #4A4840: "नेटवर्क या सेवा में अस्थायी समस्या है। थोड़ी देर में दोबारा कोशिश करें।"
Two buttons: "फिर कोशिश करें" primary full-width. "मेरा संदेश कॉपी करें" ghost full-width.
Footer: Plus Jakarta Sans 12px #8A8880 "समस्या बनी रहे तो connection जांचें"
Input bar: voice orb shows amber warning dot 8px top-right.
State 2 label: "MICROPHONE PERMISSION DENIED" — same divider style.
Show chat screen with voice orb in error state (grey, lock icon). Dark toast notification:
Background #1A1916, border-radius 12px, padding 14px 16px, margin 0 16px.
Left: warning triangle icon 16px white. Right: "Settings" Plus Jakarta Sans 12px #E8832A.
Toast title: "माइक की अनुमति चाहिए" Plus Jakarta Sans 13px white weight 600.
Toast body: "आवाज से सवाल पूछने के लिए ब्राउज़र settings में जाकर mic allow करें।" Plus Jakarta Sans 12px rgba(255,255,255,0.7).
Input bar: voice orb grey with lock, placeholder text changed to "आवाज उपलब्ध नहीं — लिखकर पूछें", mic icon crossed out.
State 3 label: "OUT OF SCOPE / CONTEXT" — same divider.
User bubble: "दाल मखनी बनाने का सबसे अच्छा तरीका क्या है?"
LokAI response card — no left border accent (not an error, just a boundary). Background white normal.
Center icon: 48px circle #F4F2EE, border 1px #E8E4DC, inner: boundary symbol #1C3A6E.
Heading: Plus Jakarta Sans 16px weight 600 #1A1916: "यह मेरे दायरे से बाहर है।"
Body: Plus Jakarta Sans 14px #4A4840: "मैं केवल नागरिक और कानूनी सवालों में मदद करता हूं — RTI, किरायेदारी, उपभोक्ता शिकायत जैसे विषयों में। खाने की रेसिपी मेरे लिए नहीं है।"
Divider. "इनमें पूछ सकते हैं:" Label/sm.
3 redirect chips: "किरायेदार के अधिकार" / "RTI कैसे करें" / "उपभोक्ता शिकायत" — same chip style as home.
Footer: Plus Jakarta Sans 11px #8A8880 "LokAI केवल नागरिक और कानूनी मामलों में मदद करता है।"