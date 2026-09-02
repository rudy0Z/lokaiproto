/**
 * Script-aware typography — promoted out of Turn.tsx so the whole app has it.
 *
 * THE BUG THIS FIXES (verified 2026-08-26):
 *
 * `src/styles/index.css` carries `[lang="hi"]`, `[lang="mr"]` and `[lang="ta"]`
 * rules with tuned per-script families and leading. Nothing in the app has
 * ever set a `lang` attribute on rendered text — a repo-wide grep for `lang=`
 * in .tsx returns one unrelated prop and one comment. Those rules have never
 * matched a single element.
 *
 * The only working implementation was `scriptProps()`, private to
 * `ai/Turn.tsx`, applied inline. So the chat turn rendered Hindi correctly and
 * everything else did not — including `AssessmentView`, which renders zone 1
 * in Fraunces (a face with no Devanagari or Tamil glyphs) at `lineHeight: 1.28`
 * regardless of language. The assess screen is the case study's centerpiece and
 * the multilingual claim is the founding thesis, so the one screen that most
 * needs to prove it was the one screen that couldn't.
 *
 * Root cause is not carelessness: script handling had no layer to live in.
 * Every screen composes raw `<p style={{fontFamily: SERIF}}>`, so every screen
 * would have had to remember. Now `<Text>` remembers, and no screen can forget.
 *
 * THREE DECISIONS ENCODED HERE (state these in the case study, §2.1):
 *
 * 1. The display serif is Latin-only ON PURPOSE. Fraunces has no Indic glyphs.
 *    Rather than bolt on an ornate Indic display face, Indic scripts lead with
 *    the sans, sized and weighted up to hold the display role — legibility
 *    beats flourish for a stressed, mixed-literacy reader.
 * 2. Noto because the content is code-switched, not because it is available.
 *    The prepared packs mix Latin inline ("சேதமடைந்த மிக்சர் — refund",
 *    "e-Daakhil", "ticket ID"). Latin and Indic faces must share baseline and
 *    x-height or every line looks broken. Noto is a harmonized superfamily.
 * 3. The multilingual scale and the accessibility scale are ONE system. The
 *    per-script leading values are unitless multipliers and the size bump is
 *    `calc(1em + 1px)`, so both compose correctly with rem type when the user
 *    raises their OS text size.
 */

import type React from 'react';
import { DEVANAGARI, TAMIL, EDITORIAL, SANS } from '../components/shared';
import { useConversations } from '../context/ConversationContext';
import type { DemoLanguage } from '../data/responseTurns';

export type Script = 'latin' | 'devanagari' | 'tamil';

const SCRIPT_OF: Record<string, Script> = {
  en: 'latin',
  hi: 'devanagari',
  mr: 'devanagari',
  ta: 'tamil',
};

export function scriptOf(lang: string | undefined): Script {
  return SCRIPT_OF[lang ?? 'en'] ?? 'latin';
}

/**
 * The active UI language.
 *
 * Reads `ConversationContext`, which is what every screen actually drives.
 * NOTE: `LanguageContext.uiLang` is a second, parallel language state read
 * only by the desktop `SettingsPanel` — changing it there changes nothing on
 * any screen. Two sources of truth; collapse them before the case study says
 * "language is a system property".
 *
 * Safe outside a provider (the context has a real default), so specimens and
 * capture routes render without extra wiring.
 */
export function useUiLanguage(): DemoLanguage {
  const { selectedLanguage } = useConversations();
  return (selectedLanguage as DemoLanguage) ?? 'en';
}

/**
 * Per-script leading. Indic scripts stack vowel marks above and conjuncts
 * below the baseline; Latin leading clips them. These are the measured
 * values from `index.css`, kept in one place so the CSS rule and the JS path
 * can never drift apart again.
 */
const SCRIPT_LEADING: Record<Script, number | null> = {
  latin: null,      // use the type role's own leading
  devanagari: 1.85,
  tamil: 1.9,
};

/**
 * Resolve a font family for a script, honoring the Latin-only-serif decision.
 *
 * `serif: true` asks for the display register. In Latin that is Fraunces. In
 * Indic scripts there is no display face, so the request is answered with the
 * script's sans — the caller gets legible type instead of tofu, and the
 * weight bump that carries the display role is applied by `<Text>`.
 */
export function familyFor(script: Script, serif: boolean): string {
  if (script === 'devanagari') return DEVANAGARI;
  if (script === 'tamil') return TAMIL;
  return serif ? EDITORIAL : SANS;
}

/** True when the display register cannot be served by the serif. */
export function needsDisplayFallback(script: Script): boolean {
  return script !== 'latin';
}

/**
 * Everything an element needs to render correctly in the active script.
 *
 * Spread onto the element: `{...scriptProps(lang, { serif })}` gives you a
 * `lang` attribute (so the CSS rules finally match, and so screen readers
 * announce in the right voice) plus the family/leading/size overrides.
 */
export function scriptProps(
  lang: string | undefined,
  opts: { serif?: boolean } = {},
): { lang?: string; style: React.CSSProperties } {
  const script = scriptOf(lang);
  if (script === 'latin') {
    return { style: opts.serif ? { fontFamily: EDITORIAL } : {} };
  }
  const leading = SCRIPT_LEADING[script];
  return {
    lang,
    style: {
      fontFamily: familyFor(script, !!opts.serif),
      /* +1px optical compensation: Noto Devanagari and Tamil run visually
         smaller than Inter at the same nominal size. Applied to the element,
         so inline Latin words inside an Indic line get it too — that is
         intentional (they must sit on the same optical size as the script
         around them), but re-check it whenever a component is recomposed. */
      fontSize: 'calc(1em + 1px)',
      ...(leading ? { lineHeight: leading } : {}),
    },
  };
}
