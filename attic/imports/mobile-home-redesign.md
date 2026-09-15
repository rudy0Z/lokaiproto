Fix mobile home layout and redesign all 3 onboarding screens.
Width: 390px throughout.

MOBILE HOME FIX
Problem: input is near the top nav, home feels crowded.
Solution: input moves to floating position above bottom nav.

REMOVE: any input bar or search bar from the top portion of the screen.

HOME CONTENT (scrollable, 16px side margins):
Top bar: LokAI logo mark left + "हिंदी ▾" language chip right (unchanged)

Greeting section (top padding 32px):
"Good morning, Priya" — DM Serif Display 26px weight 600 #1A1916 
(NOT italic — English greeting can be italic: "Good morning," italic, 
"Priya" upright weight 600)
"Saturday, 25 March · Mumbai" 13px #8A8880

Content sections with more breathing room:
"Your Conversations" — 2 cards, vertical stack, FULL WIDTH each
  These need at least 20px padding on each side — don't crowd the cards
"Notices Near You" — 2 items as a list (not cards), 
  each 64px height, border-bottom 1px #E8E4DC
"Know Your Rights" — horizontal scroll row of 4 category chips
  each: 80px × 80px, white card, centered icon + label

Content ends 120px from bottom (leaving room for floating input)

FLOATING INPUT BAR (position:fixed, above bottom nav):
Bottom: 72px (sits just above the 56px bottom nav)
Left: 16px, Right: 16px
Height: 52px
Background: #FFFFFF
Border: 1px solid #E8E4DC
Border-radius: 999px (fully rounded pill shape — distinct from chat input)
Shadow: 0 4px 20px rgba(26,25,22,0.10)
Voice orb: 36px left, navy mic
Placeholder: "Tell us your problem..." 14px #8A8880
Send arrow: right side, 32px circle gradient background, white arrow icon

This pill-shaped floating input is a clear visual invitation — 
the primary CTA of the home screen.

Bottom nav: 56px, fixed bottom, unchanged.

---

ONBOARDING REDESIGN — 3 screens, bottom-anchored layout

KEY PRINCIPLE: All content anchors to the bottom half of the screen.
Top half is atmosphere (illustration + brand). Bottom half is action.
This matches natural phone grip — thumbs reach the bottom.

ONBOARDING SCREEN 1 — "Welcome"
Background: #F5F2EC

TOP HALF (above fold, no interaction needed):
Brand gradient panel: full width, height 50vh
  Background: linear-gradient(160deg, #1A1916, #1C3A6E)
  Noise texture overlay 3% opacity
  Centered content:
    LokAI logo mark (white, 48px circle) + wordmark in white
    Below logo: "Know Your Rights. In Your Language."
    DM Serif Display italic 20px white 0.85 opacity
    Below: "बोलें, लिखें, समझें" Plus Jakarta Sans 12px white 0.55 opacity

BOTTOM HALF (white card rising from bottom):
White card: border-radius 24px 24px 0 0 (rounded top corners only)
Background: #FFFFFF
Padding: 32px 24px 48px
Negative margin-top: -24px (overlaps the gradient panel slightly)

Content inside bottom card:
Heading: "India's law. Your language." 
  Plus Jakarta Sans 20px weight 700 #1A1916
Sub: "LokAI helps you understand your legal rights and take the first step."
  Plus Jakarta Sans 15px #4A4840 line-height 1.6, margin-bottom 28px

Phone input field:
  Label: "Enter your phone number" 13px #8A8880
  Input: 56px height, border 1px #E8E4DC, radius 12px, 
  +91 prefix in secondary text, number input
  12px gap

"Continue →" gradient button: full width, 52px, radius 999px
"Continue with Google": white bg, 1px #E8E4DC border, 52px, radius 999px
  Google icon left + "Continue with Google" center
8px gap between buttons

Terms: "By continuing you agree to our Terms & Privacy Policy"
  11px #8A8880 centered, margin-top 16px

ONBOARDING SCREEN 2 — "Choose Your Language"  
Background: #F5F2EC

TOP SECTION (non-scrollable, 28% height):
Padding-top: 48px, padding sides 24px
Progress dots: 3 dots, second active
  Active: 20px wide pill shape, navy. Inactive: 8px circle, #E8E4DC
Heading: "How should LokAI speak to you?"
  Plus Jakarta Sans 22px weight 700 #1A1916 (NOT DM Serif — 
  this is a UI instruction, not display)
Sub: "You can change this anytime"
  Plus Jakarta Sans 14px #8A8880

BOTTOM SECTION (scrollable grid):
Language grid: 3 × 4, same 12 chips from before
Each chip: 
  Background #FFFFFF, border 1px #E8E4DC, radius 12px
  Padding: 14px 8px, centered
  Native script: 16px weight 600 #1A1916
  English: 11px #8A8880 below
  Selected: #EEF2F8 bg, border 2px #1C3A6E, navy text

Note: "LokAI also auto-detects the language you type or speak"
  12px #8A8880 centered, margin: 16px 0

FIXED BOTTOM (position:fixed, bottom 0, full width):
Background: #FFFFFF, border-top 1px #E8E4DC, padding: 16px 24px 32px
"Set Language →" gradient button full width 52px radius 999px
"Use English for now" — 14px #8A8880 centered, margin-top 12px

ONBOARDING SCREEN 3 — "You're Ready"
Background: #F5F2EC

TOP SECTION (atmosphere, 40% height):
Padding-top: 48px, centered
Progress dots: 3 dots, third active
Balance scales SVG illustration: 
  64px, brand navy #1C3A6E, centered
  Below: a subtle warm circle behind it: 
  100px circle, rgba(232,131,42,0.08) — saffron glow behind the icon
Heading: "Let's understand your situation"
  Plus Jakarta Sans 22px weight 700 #1A1916
Sub: "Start with a question. We'll guide you step by step."
  Plus Jakarta Sans 14px #4A4840 centered

BOTTOM SECTION (3 entry cards + CTA):
3 suggestion cards full width (16px side margins):
  Each: 64px height, #FFFFFF bg, shadow-xs, border 1px #E8E4DC, radius 12px
  Left: 32px circle #F4F2EE bg, icon #8A8880
  Center: suggestion text 14px #1A1916
  Right: → arrow #8A8880
  → "My landlord is refusing to return my deposit"
  → "I received an official notice — what does it mean?"
  → "How do I file an RTI application?"

Privacy note: 🔒 icon + "Your information stays private — LokAI never shares your data"
  12px #8A8880 centered

FIXED BOTTOM:
"Get Started" gradient button full width 52px radius 999px
"I'll explore on my own" 14px #8A8880 centered margin-top 12px