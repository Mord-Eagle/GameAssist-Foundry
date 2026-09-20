# Tooling Sidecar

<!-- --- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_TOOLING"
  project_version: "v0.1.0"
  purpose: "Cover TypeScript, Vitest, and esbuild configuration that cannot carry in-file Foundry runtime banners."
  applicability:
    runtime: "node_tooling"
    artifact: "source"
    host_contracts: ["TypeScript", "Vitest", "esbuild"]
  data_class: "Internal"
  ai_data: "none"
  refusals:
    - "Never treat local tooling success as live Foundry evidence."
  canonical_tree: |
    [GAMEASSIST_TOOLING]/
    `-- [GAMEASSIST_TOOLING:CONFIG]
--- prose banner ---
This sidecar points at tsconfig.json, vitest.config.ts, and scripts/build.mjs.
Detailed decisions live in docs/design/PHASE-0-TOOLING.md.
-->

<!-- ========================================================================
[GAMEASSIST_TOOLING:CONFIG] BEGIN
Section Title: Foundation toolchain configs
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_TOOLING"
  area: "CONFIG"
  title: "Toolchain configs"
  guarantees:
    - "Typecheck, unit tests, and the client bundle have named commands."
  last_updated_version: "v0.1.0"
  lifecycle: "active"
-----------------------------------------------------------------------------
Covered artifacts:
- `tsconfig.json`
- `vitest.config.ts`
- `scripts/build.mjs`
- `docs/design/PHASE-0-TOOLING.md`

Source of truth: the listed files
Validation: `npm run check`
Editing: hand-edit configs; keep PHASE-0-TOOLING.md aligned when meaning changes

Notes & Comments:
Changed (v0.1.0): record the first TypeScript, Vitest, and esbuild toolchain.
[GAMEASSIST_TOOLING:CONFIG] END
======================================================================== -->
