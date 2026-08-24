# Journey and emotion model

Authored emotional beats for the consumer-refund matter. Each beat binds a user job, touchpoint, feeling, LokAI trust move, and design decision to a hybrid response mode.

## Beats

| Beat | User job | Touchpoint | Feeling | Trust move | Mode | Design decision |
|---|---|---|---|---|---|---|
| Intake | Say what happened | Sample text / voice / notice | Confused, hopeful | Accept plain language; no category required | progress → explain/clarify | Start with situation, not legal taxonomy |
| Clarify | Answer one missing fact | Clarify card | Mild friction, cared-for | Ask one concrete question; block draft | clarify | Friction that unlocks safety, not bureaucracy |
| Verify | Own extracted facts | Confirmation chips | Cautious | Citizen confirms before legal output | confirm | Anti-hallucination gate owned by the user |
| First answer | Understand next step | Explain turn (3 zones) | Relief without certainty | Rule / applies / next + citations | explain | Three-zone only when facts + sources suffice |
| Guardrail stop | Understand why blocked | Stop / disclose turn | Anxious → contained | Protective refusal + preserved summary | stop / disclose | Refusal reads as protection, not product failure |
| Draft review | Check before sending | Review gate | Agency restored | Human-in-the-loop before action | confirm + draft lock | No direct send from AI draft |
| Leave | Take one checked action | Export / evidence checklist | Clearer | Show what still travels with them | — | Exit with artefacts, not chat history alone |
| Recover | Retry after pause | Recover turn | Trust repair | Preserve sample; offer retry | recover | Failure never implies data loss |

## Emotional intent per mode

- **clarify** → `cared_friction` — one question, why it matters, what it unlocks
- **explain** → `relief_without_certainty` — plain language + inspectable sources
- **disclose** → `honest_gap` — partial answer + explicit missing piece
- **stop** → `protective_stop` — reason, preserved summary, still-available actions, systems note
- **confirm** → `quiet_ack` — two-line acknowledgement, not a card
- **progress** → `working` — staged status with Skip / Replay
- **recover** → `trust_repair` — pause message + retry without shame

### Implementation referent

Rendered by `EMOTION_CRAFT` in [`src/app/components/ai/Turn.tsx`](../src/app/components/ai/Turn.tsx):

| Intent | Status tone | Reveal step | Density | Primary action first |
|---|---|---|---|---|
| `relief_without_certainty` | navy | 280ms | full zones | no |
| `cared_friction` | amber | 200ms (+hold) | denser | yes |
| `protective_stop` | oxblood | 160ms | denser | yes — boundary + handoff lead |
| `honest_gap` | saffron | 220ms | full | no |
| `quiet_ack` | green | instant | compact | no |
| `working` | navy | MOTION.state | compact | no |
| `trust_repair` | amber | 180ms | denser | yes — retry leads |

Each `Turn` sets `data-emotional-intent` for inspection. Reduced-motion users get all zones immediately.

## Systems view (stop states)

When LokAI stops, the product acknowledges other agents and delays:

- **Seller / marketplace** — may respond slowly or not at all
- **District Consumer Commission** — filing windows and process delays
- **Legal professional** — required when stakes exceed self-service
- **Police / criminal system** — out of scope; different standards of proof

Side effects of guessing (wrong deadline, wrong forum, false certainty) are why the product refuses rather than performs.

## Copy principles for stop states

1. Lead with why stopping protects the user.
2. Show what is preserved (summary, evidence checklist).
3. List still-available actions.
4. Name the larger system when relevant — never pretend LokAI is the whole legal system.
