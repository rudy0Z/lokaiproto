# Dimension 03: Legal AI trust architecture (orchestrator-run; subagent capacity failure)

Evidence collected via web_search this run (2026-09-21). Verbatim quotes from snippets; snippet-level quotes marked (snippet).

## Current State

- **CoCounsel (Thomson Reuters) markets verifiability as the product:** "CoCounsel surfaces sources and reasoning so you can confidently verify and defend your work. The future of Fiduciary-Grade AI is here." — thomsonreuters.com product page (snippet). Positioning = "Fiduciary-Grade AI": a trust claim, not a capability claim.
- **Citation verification is a workflow feature:** TR training materials: "Ensure your motions and briefs are thoroughly vetted by using CoCounsel in Microsoft Word to verify citations, quotations, and legal arguments before filing" (snippet) — the anti-hallucination pattern is a dedicated pre-filing verification step.
- **Harvey benchmarks:** Vals Legal AI Report (Feb 2025): "Harvey opted into six out of seven tasks... top scores of the participating AI tools on five tasks" (snippet, vals.ai). Independent third-party benchmarking exists for legal AI quality.
- **Hallucination sanction precedent:** Mata v. Avianca, 678 F.Supp.3d 443 (SDNY 2023): attorneys sanctioned $5,000 under Rule 11 for filing six ChatGPT-fabricated cases; "first published decision imposing sanctions for AI-generated fake citations" (Wikipedia + lawyers-assistant.github.io snippets). Judge P. Kevin Castel: citations were "entirely fabricated" (github failure-repo snippet).
- **Consumer AI-lawyer enforcement:** FTC finalized order with DoNotPay (Feb 11, 2025): "Prohibits Deceptive 'AI Lawyer' Claims, Imposes Monetary Relief" ($193,000; notice to past subscribers) — ftc.gov press release (title verbatim). First federal enforcement against an "AI lawyer" product. Boundary lesson: claims must not imply lawyer-substitution.
- **ABA Formal Opinion 512 (July/Sept 2024):** organizes GenAI ethics: competence (Model Rule 1.1 — "stay informed about new technologies and use them responsibly"), confidentiality, communication (possible duty to disclose GenAI use), supervision, candor, fees (americanbar.org, westlaw, debevoise snippets). Framework: the lawyer, not the tool, owns the judgment — tools must support review, not replace it.
- **EU AI Act:** Annex III(8)(a) lists AI systems "intended to be used by a judicial authority or on their behalf to assist a judicial authority" as high-risk (artificialintelligenceact.eu snippet); Annex III categories have compliance "Due 2 Dec 2027" (regulation-ai.eu snippet, Sep 2026); Article 6(3) exception exists for systems not significantly impacting decisions (euai.app snippet). Consumer legal-info tools sit near, though likely outside, the judicial-authority scope — but the audit-trail/documentation norms of high-risk AI are the design direction of travel.
- **TAR/e-discovery is the strongest domain precedent for confidence-gated decisions:** Duke Law TAR Guidelines: "One common measure is 'recall', which measures the proportion of truly [responsive documents found]" (snippet); EDRM: TAR "is a process of having computer software electronically classify documents based on input from expert reviewers... Recall and F1" (snippet); TAR 2.0: "training does not stop early" — continuous validation rounds (ktslaw snippet). Pattern: a *statistically validated decision gate* (recall target + elusion sample) before machines decide what humans never see. Courts accepted this because the decision quality was measurable and documented.
- **UPL pressure is real for consumer-facing legal AI:** Thomson Reuters Institute (Dec 2025): "Current regulatory efforts tend to focus on companies that directly serve legal consumers, while leaving broader AI models largely unchecked" (snippet). India-specific: IJIRL paper: "The Consumer Protection Act, 2019 in India along [with other laws] do not meet AI-specific concerns" (snippet); DPDP Act 2023 will shape AI deployment data practices in India (IBA snippet). No settled India UPL regime for chatbots yet — design must self-constrain (info vs. advice boundary) ahead of regulation.
- **UX research on confidence display:** "Show AI confidence as text (Very Likely, not 87%) to boost trust by 30%. Reduces automation bias." (uxuiprinciples.com snippet; secondary source, treat as indicative). Aligns with LokAI's existing "never model confidence" gate and claim-ratio pattern.

## Key Evidence

| data point | value | date | verbatim quote | confidence | source |
|---|---|---|---|---|---|
| CoCounsel trust positioning | "Fiduciary-Grade AI" | current | "surfaces sources and reasoning so you can confidently verify and defend your work" | Medium (snippet) | thomsonreuters-cocounsel |
| Mata v. Avianca sanction | $5,000 fine, Rule 11 | 2023 | "$5,000 in sanctions... None of the six cases existed. They were entirely fabricated by ChatGPT." | High (multiple sources incl. Wikipedia, law.com, Berkeley) | mata-avianca |
| FTC v DoNotPay | $193k, deceptive "AI lawyer" claims prohibited | 2025-02-11 | "FTC Finalizes Order with DoNotPay That Prohibits Deceptive 'AI Lawyer' Claims, Imposes Monetary Relief" | High (ftc.gov primary) | ftc-donotpay |
| ABA Opinion 512 scope | competence, confidentiality, communication, supervision, candor, fees | 2024 | "Formal Opinion 512 organizes the legal ethics implications of lawyers using generative AI tools, addressing topics from confidentiality to..." | High (ABA primary; multi-source) | aba-512 |
| EU AI Act justice high-risk | Annex III(8)(a); compliance 2 Dec 2027 | 2024-2027 | "AI systems intended to be used by a judicial authority or on their behalf to assist a judicial authority" | High (multi-source) | euaiact-annex3 |
| TAR recall protocol | recall + elusion samples as decision gates | ongoing | "One common measure is 'recall', which measures the proportion of truly..." | High (Duke Law + EDRM) | tar-guidelines |
| Verbal confidence UX | verbal > numeric for trust | 2026 | "Show AI confidence as text (Very Likely, not 87%) to boost trust by 30%. Reduces automation bias." | Low-Medium (single UX site) | uxui-confidence |
| Harvey independent benchmark | Vals AI Report top scores | 2025-02-27 | "Harvey opted into six out of seven tasks. They received the top scores of the participating AI tools on five tasks" | Medium-High | vals-ai |

## Tensions & Counter-arguments

- **Determinism vs. capability trade-off:** the more deterministic the decision layer, the more brittle to novel matters; legal fact patterns are long-tail. Counter: TAR precedent shows statistical gates + human sampling beats both pure-human and pure-ML.
- **"Trust UX" can become trust theater:** badges/labels (LokAI's "Illustrative · expert review pending") build perceived trust without changing decision quality; Mata shows real failure is upstream (ungrounded generation). Products must ground decisions, not just label them.
- **Regulatory asymmetry:** US enforces against consumer products (FTC/DoNotPay) while models remain unchecked (TR Institute); India has no AI-specific legal-tech regime yet — first-mover products must adopt stricter-than-required norms as differentiator, not burden.
- **Automation bias:** verbal-confidence research suggests numeric scores increase over-trust as much as under-trust; a legal product showing "confidence: 0.92" invites reliance. LokAI's claim-ratio ("6 of 7 claims grounded") is the safer grammar — inspectable, countable, verifiable.

## Source list
[^thomsonreuters-cocounsel]: CoCounsel: The industry-leading AI for professionals. Thomson Reuters. https://www.thomsonreuters.com/ (product page, accessed 2026-09-21)
[^mata-avianca]: Mata v. Avianca, Inc. Wikipedia; Mata v. Avianca, Inc., 678 F.Supp.3d 443 (S.D.N.Y. 2023), law.berkeley.edu; NYTimes 2023-05-27; law.com 2023-12-21.
[^ftc-donotpay]: FTC Finalizes Order with DoNotPay. 2025-02-11. https://www.ftc.gov/news-events/news/press-releases/2025/02/ftc-finalizes-order-donotpay-prohibits-deceptive-ai-lawyer-claims-imposes-monetary-relief-requires
[^aba-512]: ABA Formal Opinion 512. americanbar.org (2024); UNC Law Library explainer 2025-02-26.
[^euaiact-annex3]: Annex III: High-Risk AI Systems. https://artificialintelligenceact.eu/ ; regulation-ai.eu "Annex III: 8 High-Risk Categories, Due 2 Dec 2027" (2026-09-12).
[^tar-guidelines]: TAR Guidelines. Duke Law Scholarship Repository; EDRM TAR page.
[^uxui-confidence]: How to Display AI Confidence Scores. uxuiprinciples.com (accessed 2026-09-21).
[^vals-ai]: Vals Legal AI Report. 2025-02-27. https://www.vals.ai/
[^tr-upl]: Scaling Justice: Unauthorized practice of law and the risk. Thomson Reuters Institute. 2025-12-01.
[^india-cpa-ai]: Consumer Protection in the Era of Artificial Intelligence. IJIRL. (2025/26)
[^dpdp]: IBA Technology Law Committee publications: DPDP Act 2023 impact on AI deployment in India. ibanet.org.
