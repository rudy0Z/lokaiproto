Design System Foundation
Complete design system rebuild for LokAI — a multilingual legal information assistant for Indian citizens. Modern, premium, Indian-themed. Import DM Serif Display and Plus Jakarta Sans from Google Fonts. Create a new Figma page titled "Design System".
Color tokens — define as Figma variables:
Surface/bg-primary: #FAFAF8 (cool off-white)
Surface/bg-card: #FFFFFF
Surface/bg-raised: #F4F2EE (warm lift for hover states)
Surface/overlay: rgba(26,25,22,0.5)
Brand/navy: #1C3A6E
Brand/navy-dark: #152C54
Brand/navy-soft: #EEF2F8
Brand/saffron: #E8832A
Brand/saffron-dark: #C4620A
Brand/saffron-soft: #FFF3E8
Brand/terracotta: #C4724A
Text/primary: #1A1916
Text/secondary: #4A4840
Text/tertiary: #8A8880
Text/disabled: #B8B6B2
Text/on-dark: #FFFFFF
Text/on-dark-secondary: rgba(255,255,255,0.65)
Border/default: #E8E4DC
Border/strong: #CDCAC4
Border/focus: #1C3A6E
Semantic/success: #1F6B3A
Semantic/success-soft: #EEF5EE
Semantic/caution: #8A4500
Semantic/caution-soft: #FFF3E8
Semantic/error: #C84030
Semantic/error-soft: #FFF0EE
Gradient/brand: linear 160deg from #1A1916 to #1C3A6E — used in headers and TL;DR card only
Gradient/verdict: linear 135deg from #E8832A to #C4620A — used only on the verdict/action accent
Gradient/button-primary: linear 180deg from #1C3A6E to #152C54 — primary button background
Gradient/button-hover: linear 180deg from #22478A to #1C3A6E — primary button hover state
Typography tokens:
Display/xl: DM Serif Display 48px/1.0 weight 400 tracking -0.02em
Display/lg: DM Serif Display 36px/1.1 weight 400 tracking -0.015em
Display/md: DM Serif Display 28px/1.2 weight 400 tracking -0.01em
Display/sm: DM Serif Display 22px/1.25 weight 400
Display/xs: DM Serif Display 18px/1.3 weight 400
Body/lg: Plus Jakarta Sans 17px/1.7 weight 400
Body/md: Plus Jakarta Sans 15px/1.75 weight 400
Body/sm: Plus Jakarta Sans 13px/1.65 weight 400
Label/lg: Plus Jakarta Sans 14px/1.4 weight 600
Label/md: Plus Jakarta Sans 12px/1.4 weight 600 tracking 0.02em
Label/sm: Plus Jakarta Sans 10px/1.4 weight 600 tracking 0.08em uppercase
Code/sm: monospace 11px/1.4 weight 500
Devanagari overrides: same fonts, +1px size, line-height +0.2 vs Latin equivalents
Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
Border radius: 4px chip, 8px input/small card, 12px card, 16px large card, 20px modal, 28px pill button
Shadow system — subtle, purposeful:
Shadow/sm: 0 1px 2px rgba(26,25,22,0.04), 0 1px 4px rgba(26,25,22,0.04)
Shadow/md: 0 2px 8px rgba(26,25,22,0.06), 0 1px 3px rgba(26,25,22,0.04)
Shadow/lg: 0 8px 24px rgba(26,25,22,0.08), 0 2px 8px rgba(26,25,22,0.04)
Shadow/float: 0 16px 40px rgba(26,25,22,0.10), 0 4px 12px rgba(26,25,22,0.06)
COMPONENT LIBRARY — show each component with all states on the design system page:
Button/Primary:
Default: gradient/button-primary background, border-radius 28px, padding 12px 24px, Plus Jakarta Sans 14px weight 600 white, shadow/sm. Subtle gradient goes from slightly lighter navy top to darker navy bottom.
Hover: gradient/button-hover, shadow/md, translateY(-1px) — lifts slightly
Active/pressed: gradient darker, translateY(0), shadow/sm
Disabled: background #E8E4DC, text #B8B6B2, no shadow
Loading: same as default but with a small white spinner 16px replacing text
Button/Secondary:
Default: background transparent, border 1.5px Brand/navy, text Brand/navy, border-radius 28px, padding 12px 24px
Hover: background Brand/navy-soft, border-color Brand/navy-dark
Active: background #DDE6F5
Disabled: border #E8E4DC, text #B8B6B2
Button/Ghost:
Default: no background, no border, text Text/secondary, padding 8px 16px
Hover: background Surface/bg-raised, text Text/primary
Active: background #EDEAE4
Button/Destructive:
Default: background Semantic/error-soft, text Semantic/error, border 1px #F0C0BC, border-radius 28px
Hover: background #FFE0DC, border-color Semantic/error
Input/Default:
Default: background #FFFFFF, border 1.5px Border/default, border-radius 12px, padding 14px 16px, shadow/sm, text Text/primary placeholder Text/tertiary
Focus: border 1.5px Border/focus, shadow 0 0 0 3px rgba(28,58,110,0.12)
Filled: border Border/strong
Error: border Semantic/error, shadow 0 0 0 3px rgba(200,64,48,0.10)
Disabled: background Surface/bg-raised, border Border/default, text Text/disabled
Citation stamp component:
Background Brand/navy, border-radius 4px, padding 3px 10px, text white monospace 11px weight 500
Left: 5px circle same white as text
Example content: "RTI Act 2005 · s.7(1)"
This is the most important component in the product — it signals verified law.
Voice orb component — 4 states:
Idle: 52px circle, border 2px Border/default, background Surface/bg-raised, center icon mic 20px Text/tertiary
Listening: 52px circle, background gradient/verdict (saffron to amber), subtle pulsing ring animation 56px diameter border 1.5px Brand/saffron opacity 0.4 expanding to 64px and fading, center: 3 animated bars 3px wide varying height saffron
Processing: 52px circle, background gradient/brand (navy), rotating arc 2px white opacity 0.4 at border
Error: 52px circle, background Semantic/error-soft, border 1.5px Semantic/error, center: lock icon or x
Language chip component:
Default: border 1px Border/default, border-radius 8px, padding 10px 12px, text in native script Plus Jakarta Sans 13px Text/secondary
Selected: background Brand/navy-soft, border 1.5px Brand/navy, text Brand/navy weight 600
The chip always shows the language's native script name — हिन्दी not Hindi, தமிழ் not Tamil
Response card component — 3 states:
Verified: white card, border-radius 12px, left border 4px gradient/verdict, shadow/md
General guidance: white card, border-radius 12px, left border 4px Border/strong, shadow/sm
Out of scope: white card, border-radius 12px, left border 4px Border/strong background Semantic/caution-soft
Inside all states: three zones separated by 1px Border/default. Zone 1 main finding in Display/sm DM Serif Display italic. Citation stamp inline. Zone 2 plain body text. Zone 3 action button.