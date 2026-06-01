# LokAI — Design Changelog

> This document records the full design evolution of LokAI: what existed before the three-prompt overhaul, what changed in each prompt, and the canonical design system state after the expansion.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design System Foundation](#2-design-system-foundation)
3. [Phase 0 — Initial Build (Baseline)](#3-phase-0--initial-build-baseline)
4. [Phase 1 — Three-Prompt Expansion (Overhaul)](#4-phase-1--three-prompt-expansion-overhaul)
   - [Prompt 1: Mobile Screen Redesigns](#prompt-1-mobile-screen-redesigns)
   - [Prompt 2: Two New Mobile Screens](#prompt-2-two-new-mobile-screens)
   - [Prompt 3: Two New Desktop Pages](#prompt-3-two-new-desktop-pages)
5. [Routing & Navigation Changes](#5-routing--navigation-changes)
6. [Component Inventory (Post-Overhaul)](#6-component-inventory-post-overhaul)
7. [Design Token Reference](#7-design-token-reference)
8. [File Structure](#8-file-structure)

---

## 1. Project Overview

**LokAI** is a premium multilingual Indian legal assistant. It provides legal information (not legal advice) to Indian citizens in 12 Indian languages. The product comprises:

- A **desktop web app** with a collapsible sidebar and multiple functional pages.
- A **mobile app** (React-rendered at 390×844 iPhone 14 spec) with native-feeling screens.
- A **MobileCanvas** (`/mobile`) — a Figma-style canvas displaying all mobile artboards at once.
- An **Advocate Workspace** (`/advocate`) for professional lawyers.
- A **Language Showcase** (`/languages`) demonstrating native multilingual capability.

---

## 2. Design System Foundation

The design system is declared in `/src/app/components/shared.tsx` and `/src/styles/fonts.css`.

### Typography

| Token | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Display/xl | DM Serif Display | 48px | 400 | Hero headings |
| Display/lg | DM Serif Display | 36px | 400 | Page headings |
| Display/md | DM Serif Display | 28px | 400 | Section headings |
| Display/sm | DM Serif Display | 22px | 400 | Card findings (italic) |
| Display/xs | DM Serif Display | 18px | 400 | Sub-headings |
| Body/lg | Plus Jakarta Sans | 17px | 400 | Main body text |
| Body/md | Plus Jakarta Sans | 15px | 400 | Standard body |
| Body/sm | Plus Jakarta Sans | 13px | 400 | Secondary body |
| Label/md | Plus Jakarta Sans | 12px | 600 | Labels, chips |
| Code/sm | monospace | 11px | 500 | Citation stamps |

**Rule:** DM Serif Display is used for all headings at 18px and above. Plus Jakarta Sans is used for all other text. This creates a clear editorial hierarchy between legal findings (serif) and informational text (sans).

### Color Tokens

```
C.bg          = #FAFAF8   — cooler off-white page background
C.surface     = #FFFFFF   — pure white card background
C.ink         = #1A1916   — near-black primary text
C.navy        = #1C3A6E   — deep authoritative navy (brand)
C.saffron     = #E8832A   — warm saffron (action / verdict)
C.deepAmber   = #C4620A   — deep amber (saffron pair)
C.terracotta  = #C4724A   — warm mid-tone
C.teal        = #2A6E5A   — teal accent
C.textSoft    = #4A4840   — secondary text
C.muted       = #8A8880   — tertiary / zone labels
C.border      = #E8E4DC   — card borders
C.borderLight = #EEEBE4   — subtle dividers
C.rule        = #F0EDE6   — section rules within cards
C.green       = #2D6A4F   — success / resolved
C.amber       = #8A4500   — warning / action needed
C.badgeBg     = #EEF2F8   — badge background (navy soft)
C.badgeText   = #1C3A6E   — badge text
C.badgeBorder = #B8C8E0   — badge border
```

### Three Purposeful Gradients

The entire design system is built on exactly **three gradients**, each with a single defined purpose:

| Name | Value | Permitted Use |
|---|---|---|
| `GRAD.brand` | `linear-gradient(160deg, #1A1916 0%, #1C3A6E 100%)` | Sidebar headers, hero bands, TL;DR card, gradient band |
| `GRAD.verdict` | `linear-gradient(135deg, #E8832A 0%, #C4620A 100%)` | Response card left border, voice orb active state, verdict accent |
| `GRAD.language` | `linear-gradient(90deg, #E8832A, #C4724A, #1C3A6E, #2A6E5A)` | 3px top border on language selector chip **only** |

Using these gradients outside their defined purpose is a design violation.

### Signature Components

#### Citation Stamp
The most important UI component in the product. Signals verified law.
```
Background: C.navy (#1C3A6E)
Text: #FFFFFF, monospace 11px weight 400
Border-radius: 4px
Padding: 3px 10px
Example: "RTI Act 2005 · s.7(1)"
```
Rendered by `<CitationStamp text="..." />` in `shared.tsx`.

#### Logo Mark
The "लो" Devanagari character inside a circle.
```
Circle: border 1.5px, transparent fill
Text: DM Serif Display, ~45% of circle diameter
Variants: light (white) for dark backgrounds, dark for light backgrounds
```
Rendered by `<LogoMark size={n} light={bool} />`.

#### Voice Orb
State-aware microphone button.
```
Idle state:   solid saffron (#E8832A), mic SVG in white
Active state: GRAD.verdict background, breathe animation
Size default: 52px circle
```

#### Response Card (Verdict Card)
```
Background:    C.surface (#FFFFFF)
Border:        1px C.border on right/top/bottom
Left border:   4px GRAD.verdict
Border-radius: 12px
Zone 1: Main legal finding — DM Serif Display 20-22px italic
Zone 2: Body explanation — Plus Jakarta Sans 13-14px
Zone 3: Action / CTA button
```

---

## 3. Phase 0 — Initial Build (Baseline)

### What Existed Before the Overhaul

The baseline LokAI build comprised a functional desktop web app with a **collapsible sidebar** and **6 desktop pages**, plus a basic **MobileCanvas** viewer containing **6 mobile screens**.

---

### Desktop Pages (Baseline)

#### `/` — Home (`Home.tsx`)
The main dashboard for returning users.
- **PageHeader:** Personalized greeting "Good morning, Riya", date, and "All services up" status badge.
- **AIInput:** Central prompt input card with a VoiceOrb, text placeholder, Paperclip attachment icon, 4 suggestion chips (legal question / notice / draft / scan), and a hover-reveal arrow send button.
- **MattersSection:** 2-column grid of MatterCards. Each card has: issue title, status badge, main legal finding in DM Serif Display italic, CitationStamp, next-step action, and a "Continue →" link. Cards have 4px left verdict gradient border.
- **NoticesSection:** 3-column grid of NoticeCards showing Mumbai-area legal notices with tag badge, title, truncated summary, date, and "Read →" link.
- **RightsSection:** 3-column grid of RightsCards for Tenancy Rights, RTI Filing Guide, Consumer Rights with icon, description, and topic count.

#### `/ask` and `/ask/:chatId` — Chat (`Chat.tsx`)
Full AI chat interface for legal queries.

#### `/draft` — Draft (`Draft.tsx`)
Document drafting page.

#### `/boundary` — Know Your Rights (`Boundary.tsx`)
Rights explorer page.

#### `/notice` — Notice Interpreter (`Notice.tsx`)
Upload and interpret legal notices.

#### `/pro` — Pro Home (`ProHome.tsx`)
Pro tier feature landing page.

---

### Sidebar (`Sidebar.tsx`) — Baseline

**Expanded state (260px):**
- Brand gradient header (140px) with LogoMark + Wordmark in white.
- Navigation items: Dashboard, Ask a question, Draft a document, Notice interpreter, Know Your Rights, Mobile Preview, New User Preview.
- Recent chats section ("Your Matters") with 4 items.
- User section with avatar, name "Riya Sharma", settings icon, and the LokAI disclaimer.

**Collapsed state (64px):**
- Brand gradient header (64px) with LogoMark only.
- Icon-only navigation (4 items).
- User avatar at bottom.
- Floating pill toggle button (−14px from right edge) to expand/collapse.

**Active indicator:** 3px saffron left border bar.

---

### Mobile Screens — Baseline (6 screens in MobileCanvas)

All screens rendered at 390×844 (iPhone 14). The canvas at `/mobile` displayed all artboards as a dark-background board.

#### `MobileHome.tsx`
**Baseline design:**
- Simple StatusBar (44px), TopNav with LokAI wordmark and avatar.
- Large voice prompt area with VoiceOrb and suggestion text.
- Basic bottom navigation (Home, Chat, Rights, Alerts, Profile).
- No language selector chip. No gradient band. No language sheet.

#### `MobileChat.tsx`
Chat thread screen with message bubbles.

#### `MobileVoiceActive.tsx`
**Baseline design:**
- Basic listening state.
- Static orb (no breathing animation).
- Minimal transcript display.
- Stop button at bottom.

#### `MobileRights.tsx`
Rights category browser.

#### `MobileProfile.tsx`
User profile and settings screen.

#### `MobileErrorStates.tsx`
Tall artboard (390×2400) showing multiple error state variants.

---

### Shared Components (`shared.tsx`) — Baseline

All core tokens and components existed in the baseline:
- `SERIF`, `SANS`, `MONO` font constants.
- `C` color object.
- `GRAD` gradient object (brand, verdict, language).
- `CARD`, `BADGE` style objects.
- `CitationStamp` component.
- `LogoMark`, `Wordmark`, `Logo` components.
- `VoiceOrb` component (solid saffron, idle state only).
- `SectionLabel` component.

---

## 4. Phase 1 — Three-Prompt Expansion (Overhaul)

The overhaul was driven by a three-prompt spec from `lokai-mobile-ux.md`. Each prompt targeted a specific scope.

---

### Prompt 1: Mobile Screen Redesigns

**Scope:** Redesign `MobileHome.tsx` and `MobileVoiceActive.tsx` to match the premium brand identity. Exportable artboard components added for use in MobileCanvas.

---

#### `MobileHome.tsx` — Before vs. After

**Before:**
- Simple TopNav with centred wordmark and avatar only.
- Plain voice prompt area with static VoiceOrb.
- No language selector, no gradient band, no language sheet.
- Recent items list (basic).

**After — complete redesign:**

**HomeTopNav (new):**
- Logo mark (लो circle) on the left.
- LokAI wordmark centred.
- Language selector chip on the right showing "हिन्दी" with ChevronDown.
- The chip has the **language gradient as a 3px top border** — the only place in the mobile UI where `GRAD.language` appears.
- Tapping the chip opens the LanguageSheet overlay.

**GradientBand (new):**
- 80px tall band using `GRAD.brand` (ink → navy).
- Headline in DM Serif Display italic: "अपने अधिकार जानें" (white).
- Subtext listing 12 languages in their native scripts at 50% white opacity.

**VoiceInputCard (new):**
- Centred layout within a white card with 16px border-radius.
- Voice orb now uses `GRAD.verdict` (saffron → amber) instead of solid saffron — signals active/prominent state.
- Orb has `box-shadow: 0 4px 16px rgba(232,131,42,0.25)` glow.
- "Tap to speak or type your situation" prompt text.
- Language-detected chip ("Auto-detecting language…") with a 5px dot indicator.
- Text input row for typing.
- 4 suggestion chips in 2 rows in Devanagari: किरायेदारी विवाद, उपभोक्ता शिकायत, RTI दर्ज करें, नोटिस समझें.

**RecentVerdicts (new):**
- Section header "Recent Verdicts" in DM Serif Display 18px.
- Verdict cards with absolute-positioned 4px left gradient bar (`GRAD.verdict`), verdict-chip outcome badge, CitationStamp inline, date.
- Outcome badges colour-coded: Position Strong (green), Action Needed (amber).

**LanguageSheet (inline, new):**
- Full bottom sheet overlay with `rgba(26,25,22,0.55)` backdrop.
- 16px 16px 0 0 border-radius (slides up from bottom).
- Drag handle pill at top.
- 3-column grid of 12 language chips, each showing native script name (e.g. हिन्दी, தமிழ், বাংলা).
- Selected state: navy border 1.5px, navy-soft background.
- Auto-detect info card at bottom with Info icon.

**Exported:** `HomeArtboard` component used by `MobileCanvas`.

---

#### `MobileVoiceActive.tsx` — Before vs. After

**Before:**
- Static orb.
- Plain transcript text.
- White background.
- Basic "Stop" button.

**After — complete redesign:**

**Background:** Changed from white to `#F8F6F0` — a warm "listening mode" tint that communicates an active, attentive state.

**BreathingOrb (new):**
- 80px (up from 52px in idle state) to signal active listening.
- Uses `GRAD.verdict` background.
- CSS animation `voiceBreathe`: scales 1→1.09 over 2.8s with expanding box-shadow ring fading out.
- Inner radial gloss overlay for depth.
- Two static concentric rings (120px and 160px) in saffron at low opacity behind the orb.

**LiveTranscript (new):**
- Hindi mixed-language sentence: "मेरे किरायेदार ने 65 दिन बाद भी deposit वापस नहीं किया—"
- Each word animates in via `wordFade` keyframe (opacity 0→1, translateY 4→0) with staggered 0.12s delays.
- Blinking saffron cursor (2px wide, 18px tall) at the end — `cursorBlink` animation step-end 0.9s.

**LanguageChip (new):**
- Shows "हिन्दी · detected" with a saffron 6px dot.

**Bottom area:**
- "Speak naturally — LokAI is understanding you" hint in muted text.
- रोकें ("Stop") button: transparent background, saffron border 1.5px, saffron text, 50px border-radius pill.

**Exported:** `VoiceArtboard` component used by `MobileCanvas`.

---

### Prompt 2: Two New Mobile Screens

**Scope:** Create two brand-new mobile screens as standalone routes.

---

#### `MobileLanguagePalette.tsx` — New at `/m/language`

This screen exists as the **dedicated full-screen state** of the language selector — showing the bottom sheet permanently open over the home screen (useful for design documentation and showcasing the component in isolation).

**Artboard layout:**
- 390×844 frame.
- Background behind sheet: neutral `C.bg` with centred "Home screen" label.
- LanguageSheet rendered open and non-dismissable (onClose is a no-op) to freeze the state.

**LanguageSheet internals:**
- Drag handle pill at top.
- Header: "Choose your language" in DM Serif Display 20px + subtitle.
- 3-column grid of 12 language chips (full-width layout):
  - Native script name in DM Serif Display 18px.
  - English name below in Plus Jakarta Sans 10px.
  - Selected: navy border 1.5px, `#EEF2F8` background.
  - Default: `C.border` 1px, `C.bg` background.
  - Transition: all 0.15s ease.
- Auto-detect info card at bottom: `#EEF2F8` background, Info icon, explanatory text.

**12 languages supported:**
हिन्दी, বাংলা, தமிழ், తెలుగు, मराठी, ਪੰਜਾਬੀ, ગુજરાતી, ಕನ್ನಡ, ଓଡ଼ିଆ, മലയാളം, অসমীয়া, English.

**Exported:** `LanguagePaletteArtboard` for MobileCanvas.

---

#### `MobileVerdict.tsx` — New at `/m/verdict`

The Verdict screen is the most legally significant screen in the app — it delivers the AI's legal finding to the user after their voice query.

**Screen structure:**

**Top bar:**
- Back arrow (ArrowLeft icon).
- "Verdict" in DM Serif Display 17px.
- Context badge: "Security Deposit" in navy chip.

**TranscriptChip:**
- White pill with saffron waveform icon (5 bars at heights 4/8/12/8/4px).
- Italic transcript: "मेरे किरायेदार ने 65 दिन बाद भी deposit वापस नहीं किया"
- Represents what the user said.

**VerdictCard (the dominant element):**
- White card with 4px left gradient bar (`GRAD.verdict`) via absolute-positioned div.
- Zone 1 — Finding: "आपकी स्थिति मजबूत है" in DM Serif Display 22px italic.
- Context: "महाराष्ट्र किराया नियंत्रण अधिनियम के तहत" in Plus Jakarta Sans 14px.
- CitationStamp inline: `MRC Act 1999 · S.24`.
- Rule divider.
- Zone 2 — "आप क्या कर सकते हैं" label (10px caps) + 3 bullet points with saffron 6px dot markers.
- Rule divider.
- Zone 3 — Primary CTA: "डिमांड नोटिस तैयार करें" — navy full-width pill button with ChevronRight.

**SupportingCards:**
- Two side-by-side info cards: "Legal Standing: Strong" (green) and "Time Limit: 30 days left" (saffron). Labels in 10px caps, values in DM Serif Display 15px.

**Secondary CTA:**
- "किसी वकील से बात करें" — saffron ghost button (transparent, saffron border 1.5px) with Phone icon.

**Disclaimer:**
- "LokAI provides legal information, not legal advice." in 11px muted centred text.

**Bottom navigation:** Standard BottomNav with "chat" as active.

**Exported:** `VerdictArtboard` for MobileCanvas.

---

### Prompt 3: Two New Desktop Pages

**Scope:** Create two new standalone desktop surfaces with their own layouts (not under the main sidebar Root).

---

#### `AdvocateWorkspace.tsx` — New at `/advocate`

A professional tool for practising advocates. Two-column layout: brief form on the left, live document on the right.

**AdvocateSidebar (local, not shared Sidebar.tsx):**
- Width: 240px expanded / 60px collapsed.
- Brand gradient header (72px min-height) with LogoMark, Wordmark, and "Advocate Workspace" subtitle in white.
- Collapse/expand toggle button inside the header (white semi-transparent button).
- 5 nav items: Dashboard, Matter Workspace, Document Library, Client Matters, Settings.
- Active state: saffron icon, saffron left indicator bar, `#F0EDE6` background.
- User footer: Advocate avatar with `GRAD.verdict` circle background ("S"), "Adv. Suresh K." name, "Nagpur · Pro" location, PRO badge in navy chip, "Back to LokAI" link.

**MatterBriefPanel (380px fixed, left column):**
- Panel header: "Matter Brief" label + description.
- Form fields:
  - Matter Type: Select dropdown (RTI, Consumer Complaint, Demand Notice, Workplace).
  - Client Language: LangChipSelector — 6 chip options in native scripts (हिन्दी, বাংলা, தமிழ், मराठी, English, ਪੰਜਾਬੀ). Selected state: navy border + navy-soft background.
  - Key Facts: Textarea with pre-filled RTI matter description.
  - Jurisdiction: Select dropdown (8 Indian states).
- "Generate Documents" button: navy background, full-width, FileText icon.
- Hypothesis note in italic muted text.

**LiveDocumentPanel (flex: 1, right column):**
- "AI Generated Draft — Review before submitting" amber info banner.
- Document surface: white card with 40px 48px padding, shadow, `minHeight: 600px`.
- Document content: Full RTI Application under RTI Act 2005 with:
  - Header: Centred title + section reference.
  - Addressee block with EditableFields (saffron dashed underline).
  - Subject line with CitationStamp inline.
  - Body paragraphs with client name EditableField.
  - Numbered information-requested list in a bordered inset block.
  - Statutory reference paragraphs with CitationStamps.
  - Signature block.
- "What to do next" card: 3 numbered steps with navy circle badges.

**EditableField component:**
- Renders text with `borderBottom: 1.5px dashed C.saffron`.
- Used for all variable content in the generated document.

---

#### `LanguageShowcase.tsx` — New at `/languages`

A showcase page demonstrating LokAI's native multilingual capability using the same deposit-recovery legal query across 12 Indian languages.

**Reuses:** `AdvocateSidebar` (same component, local copy), active state on "docs" nav item.

**Page header:**
- "LokAI speaks India" in DM Serif Display 36px.
- Subtitle: "The same legal question, understood in 12 languages — natively, not translated."
- Region legend: 4 color swatches for North / South / East / West India.

**Regional color system:**
| Region | Color |
|---|---|
| North India | `C.navy` (#1C3A6E) |
| South India | `#1F6B3A` (deep green) |
| East India | `C.saffron` (#E8832A) |
| West India | `C.terracotta` (#C4724A) |

**Language cards (4-column grid, 12 cards):**
Each card shows:
- Language name in DM Serif Display 22px.
- Region badge (colour-coded per region).
- User query block: the same deposit-recovery question in that language's script.
- LokAI response preview (2-line clamp) in the same script.
- CitationStamp for the applicable state law.
- Language name in English as a small pill.
- Left border 4px in the regional colour.

**Footer note:**
- Emphasises LokAI is not "a Hindi chatbot with a language toggle" — it understands each language natively and cites the applicable state law.
- "12 languages · 28 states" badge.

---

## 5. Routing & Navigation Changes

### routes.tsx Changes

```
Added routes:
  { path: '/advocate',   Component: AdvocateWorkspace }
  { path: '/languages',  Component: LanguageShowcase  }
  { path: '/m/language', Component: MobileLanguagePalette }
  { path: '/m/verdict',  Component: MobileVerdict        }
```

These are all **standalone routes** (not children of Root), so they render without the main desktop sidebar.

### Sidebar.tsx Changes

Two new items added to `expandedNavItems`:
```
{ path: '/advocate',  label: 'Advocate Workspace', Icon: Briefcase }
{ path: '/languages', label: 'Language Showcase',  Icon: Globe     }
```
The collapsed `collapsedNavItems` was **not** expanded — these pages are accessible only in the expanded sidebar state, keeping the collapsed icon set minimal.

### MobileCanvas.tsx Changes

Screens reorganised from a flat list into three labelled groups:

**Citizen Experience — Primary Screens (4 screens):**
- Home (`/m/home`)
- Language Palette (`/m/language`) — new
- Verdict Screen (`/m/verdict`) — new
- Voice Active (`/m/voice`)

**Secondary screens (3 screens):**
- Chat, Rights, Profile

**Error states (1 screen):**
- Error States (390×2400 tall artboard at scale 0.32)

Added "Desktop surfaces" callout section at bottom with links to `/advocate` and `/languages`.

Added design tokens swatch strip at the very bottom.

---

## 6. Component Inventory (Post-Overhaul)

### Shared (`/src/app/components/shared.tsx`)

| Export | Type | Description |
|---|---|---|
| `SERIF` | const | `"DM Serif Display", serif` |
| `SANS` | const | `"Plus Jakarta Sans", sans-serif` |
| `MONO` | const | `ui-monospace, "SF Mono", "Fira Code", monospace` |
| `C` | const object | Full color token map |
| `GRAD` | const object | Three gradients (brand, verdict, language) |
| `CARD` | CSSProperties | White card base with border and 12px radius |
| `BADGE` | CSSProperties | Navy-soft badge pill |
| `CitationStamp` | Component | Navy pill with white mono text |
| `LogoMark` | Component | "लो" in a circle, light/dark variants |
| `Wordmark` | Component | "Lok" (serif) + "AI" (sans) |
| `Logo` | Component | LogoMark + Wordmark combined |
| `VoiceOrb` | Component | Saffron mic button |
| `SectionLabel` | Component | 10px caps label |

### Desktop Pages

| File | Route | Description |
|---|---|---|
| `Home.tsx` | `/` | Dashboard with matters, notices, rights |
| `Chat.tsx` | `/ask`, `/ask/:chatId` | AI chat interface |
| `Draft.tsx` | `/draft` | Document drafting |
| `Boundary.tsx` | `/boundary` | Know Your Rights explorer |
| `Notice.tsx` | `/notice` | Notice interpreter |
| `ProHome.tsx` | `/pro` | Pro tier features |
| `AdvocateWorkspace.tsx` | `/advocate` | 🆕 Advocate matter + document tool |
| `LanguageShowcase.tsx` | `/languages` | 🆕 12-language visual showcase |
| `MobileCanvas.tsx` | `/mobile` | Figma-style artboard canvas |
| `HomeEmpty.tsx` | `/first-time` | First-time user onboarding |

### Mobile Screens

| File | Route | Description | Status |
|---|---|---|---|
| `MobileHome.tsx` | `/m/home` | Home with voice, verdicts, language | ✅ Redesigned |
| `MobileVoiceActive.tsx` | `/m/voice` | Breathing orb, live transcript | ✅ Redesigned |
| `MobileLanguagePalette.tsx` | `/m/language` | Language selector full-screen | 🆕 New |
| `MobileVerdict.tsx` | `/m/verdict` | Legal verdict result screen | 🆕 New |
| `MobileChat.tsx` | `/m/chat` | Chat thread | — Unchanged |
| `MobileRights.tsx` | `/m/rights` | Rights browser | — Unchanged |
| `MobileProfile.tsx` | `/m/profile` | User profile | — Unchanged |
| `MobileErrorStates.tsx` | `/m/errors` | Error state variants | — Unchanged |

---

## 7. Design Token Reference

### Spacing Scale
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

### Border Radius
| Usage | Value |
|---|---|
| Chip | 4px |
| Input / small card | 8px |
| Card | 12px |
| Large card | 16px |
| Modal | 20px |
| Pill button | 28px |

### Shadow System
```
Shadow/sm:    0 1px 2px rgba(26,25,22,0.04), 0 1px 4px rgba(26,25,22,0.04)
Shadow/md:    0 2px 8px rgba(26,25,22,0.06), 0 1px 3px rgba(26,25,22,0.04)
Shadow/lg:    0 8px 24px rgba(26,25,22,0.08), 0 2px 8px rgba(26,25,22,0.04)
Shadow/float: 0 16px 40px rgba(26,25,22,0.10), 0 4px 12px rgba(26,25,22,0.06)
```

---

## 8. File Structure

```
/src
├── app
│   ├── App.tsx
│   ├── Root.tsx
│   ├── RootEmpty.tsx
│   ├── routes.tsx                         ← Updated: +4 routes
│   ├── components
│   │   ├── Sidebar.tsx                    ← Updated: +Advocate + Language nav items
│   │   ├── SettingsPanel.tsx
│   │   ├── shared.tsx                     ← Design system foundation
│   │   └── ui/
│   ├── context
│   │   └── SidebarContext.tsx
│   └── pages
│       ├── Home.tsx
│       ├── HomeEmpty.tsx
│       ├── Chat.tsx
│       ├── Draft.tsx
│       ├── Boundary.tsx
│       ├── Notice.tsx
│       ├── ProHome.tsx
│       ├── MobileCanvas.tsx               ← Updated: 4 groups, desktop callout
│       ├── AdvocateWorkspace.tsx          ← 🆕 New
│       ├── LanguageShowcase.tsx           ← 🆕 New
│       └── mobile
│           ├── MobileHome.tsx             ← ✅ Redesigned
│           ├── MobileVoiceActive.tsx      ← ✅ Redesigned
│           ├── MobileLanguagePalette.tsx  ← 🆕 New
│           ├── MobileVerdict.tsx          ← 🆕 New
│           ├── MobileChat.tsx
│           ├── MobileRights.tsx
│           ├── MobileProfile.tsx
│           └── MobileErrorStates.tsx
├── styles
│   ├── fonts.css    ← DM Serif Display + Plus Jakarta Sans (Google Fonts)
│   ├── theme.css
│   ├── index.css
│   └── tailwind.css
└── imports
    └── pasted_text
        └── design-system.md   ← Original design spec input
```

---

*Document last updated: April 2, 2026. Reflects state after the three-prompt lokai-mobile-ux.md overhaul.*
