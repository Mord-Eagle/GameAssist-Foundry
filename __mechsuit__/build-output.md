# Build Output Sidecar

<!-- --- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_BUILD_OUTPUT"
  project_version: "v0.1.0"
  purpose: "Declare generated dist/ output, its source of truth, and the refusal to hand-edit it."
  applicability:
    runtime: "node_tooling"
    artifact: "generated"
    host_contracts: ["esbuild"]
  data_class: "Internal"
  ai_data: "none"
  refusals:
    - "Never hand-edit generated dist/ files."
    - "Never bundle Node built-ins into the Foundry client."
  canonical_tree: |
    [GAMEASSIST_BUILD_OUTPUT]/
    `-- [GAMEASSIST_BUILD_OUTPUT:DIST]
--- prose banner ---
dist/ is generated from src/main.ts by scripts/build.mjs. Do not edit it.
-->

<!-- ========================================================================
[GAMEASSIST_BUILD_OUTPUT:DIST] BEGIN
Section Title: Generated client bundle
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_BUILD_OUTPUT"
  area: "DIST"
  title: "Generated dist/"
  guarantees:
    - "dist/gameassist.mjs is produced only by npm run build."
  last_updated_version: "v0.1.0"
  lifecycle: "active"
-----------------------------------------------------------------------------
Covered artifacts:
- `dist/gameassist.mjs`
- `dist/gameassist.mjs.map`
- `dist/GENERATED.md`

Source of truth: `src/main.ts` and files it imports
Generation: `npm run build` -> `node scripts/build.mjs`
Editing refusal: Do not edit generated output directly. Change source and rebuild.
Validation: `npm run check` (typecheck, test, build)
Platform: browser ESM, target es2022, unminified during foundation

Notes & Comments:
Changed (v0.1.0): declare the first generated Foundry client bundle.
[GAMEASSIST_BUILD_OUTPUT:DIST] END
======================================================================== -->
