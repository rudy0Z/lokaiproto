# attic — parked files, not part of the build

Everything here is **outside `src/`** and is ignored by Vite. It is kept only for
provenance. Nothing in this folder is imported; nothing here should be restored
without a reason.

| Folder | What | Why parked |
|---|---|---|
| `figma-components/` | `ImageWithFallback.tsx` from the Figma-Make scaffold | zero importers; Tailwind classes it used are not in the pipeline |
| `imports/` | 8 pasted design docs + a stub PDF from the Figma era | historical AI-context residue; superseded by `docs/` |
| `logs/` | vite dev-server logs from old sessions | noise; gitignored going forward |

Safe to delete this entire folder whenever you like — git history keeps copies.