# Write

## Voice

Calm, direct, and respectful. Lead with the user’s immediate concern, use one idea per sentence, define legal terms where they first matter, and say exactly what LokAI can and cannot do. Never hide uncertainty behind technical labels or numeric confidence.

## Priority screens

- Home: “What happened?” / “Try a sample question” / “This prototype uses prepared examples. Nothing is uploaded or sent.”
- Matter: “Refund for a damaged appliance” / “Bought 6 June · ₹8,999 · seller refused replacement.”
- Answer: “What the rule means” / “How it applies here” / “What you can do next.”
- Evidence: “Facts you confirmed” / “Details still needed” / “Where this information comes from.”
- Review: “Check before you use this” / “LokAI prepared a draft. You decide whether to copy or download it.”
- Boundary: “This needs professional help” / “We’ll keep your summary, but we won’t prepare a filing.”

## States

- Loading: “Understanding your issue…” → “Checking the facts…” → “Reviewing the source…” → “Preparing a clear answer…”
- Missing fact: “One detail changes the next step: when did you first ask the seller for a refund?”
- Source gap: “We found the general rule, but not an official source that answers this exact situation. We won’t present a firm conclusion.”
- Conflict: “Two rules may apply. They point to different next steps, so this needs review.”
- High risk: “A deadline or large loss may be involved. LokAI will stop here and help you organise what to take to a qualified professional.”
- Out of scope: “LokAI can’t help with this request. It can still help with the consumer, tenancy, notice, and RTI examples in this prototype.”
- Recovery: “The demo paused before preparing the answer. Your sample details are safe. Try again.”

## Microcopy

- `Verified source` → `Source supports this point`
- `Grounding score` → `Claims checked against sources`
- `Source fidelity` → `How the source supports this`
- `Autonomy` → `What LokAI may prepare`
- `Prepare` → `Explain and prepare a draft`
- `Review required` → `You must review this`
- `Upload notice` → `Use sample notice`
- `Start recording` → `Play sample voice question`
- `Subscribe / Upgrade` → removed
- Global label: `Interactive demo · prepared examples · no data sent`

## Gate

PASS — Priority screens and guardrail states use plain language, technical labels are replaced, capability claims are honest, and no placeholder copy remains.
