# Systemize

## Foundations

Warm neutral canvas, white task surfaces, navy structure, limited saffron emphasis, and semantic green/oxblood states. Use a 4 px spacing base, 44 px minimum touch targets, restrained radii, and one low-elevation shadow level. Typography roles are Fraunces display, Inter UI/body, JetBrains Mono evidence, and Noto families for Indian scripts.

## DTCG token contract

`tokens.dtcg.json` is the portable source. It uses DTCG 2025.10 typed color, dimension, and duration objects. Runtime CSS variables in `src/styles/theme.css` map to these values; component constants in `shared.tsx` are compatibility aliases only.

## Components

- `LegalTerm`: semantic button treatment for unfamiliar terms.
- `LegalTermDialog`: mobile accessible dialog with simple meaning, example, and source note.
- `LegalTermPanel`: desktop contextual right-panel content.
- `DemoInput`: sample text, sample notice, and sample voice selectors with visible demo labeling.
- `DemoProgress`: four deterministic stages with status announcement.
- `GuardrailNotice`: reusable ask/check/stop/recover state.
- `SourceBasis`: source identity, jurisdiction, date, support status, and reviewed/illustrative label.
- Existing `GroundingMeter`, `ReviewGate`, `EvidenceLocker`, and `AutonomyDial` remain, but use claims/facts instead of unexplained percentages.

## States

- Controls: default, hover, focus-visible, pressed, disabled.
- Demo: idle, understanding, checking facts, reviewing sources, preparing answer, complete.
- Policy: self-service, review-recommended, human-help-required.
- Evidence: confirmed, missing, disputed, unsupported.
- Sources: supports, conflicts, unavailable, illustrative/unreviewed.
- Dialog: closed/open with focus return and Escape dismissal.

## Design-code mapping

- DTCG `color.*` → CSS `--color-*` in `src/styles/theme.css` → compatibility `C.*` in `src/app/components/shared.tsx`.
- DTCG `dimension.space*` → CSS `--space-*`.
- DTCG radii → CSS `--radius-*`.
- DTCG durations → CSS `--duration-*`.
- Component semantics live in `src/app/components/demo/`; scenario content lives in `src/app/data/demoScenarios.ts`; behavior lives in `src/app/context/DemoContext.tsx`.

## Usage rules

- One visual accent per component; state is never communicated by color alone.
- Normal body copy is at least 14 px on mobile and 15 px on desktop.
- Every icon-only control has an accessible name.
- Every interactive element is a real button/link/input and supports focus-visible.
- Legal terms are highlighted only when a useful glossary entry exists.
- “Verified” is reserved for a user-confirmed fact or a directly mapped source statement. All legal source content remains “illustrative · expert review pending.”
- Motion uses opacity/transform, remains interruptible, and is removed under reduced-motion preference.

## Gate

PASS — Foundations, portable tokens, semantic states, component contracts, design-code mappings, and legal-content labeling rules are explicit.
