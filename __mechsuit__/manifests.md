# Manifest Sidecar

<!-- --- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_MANIFESTS"
  project_version: "v0.1.0"
  purpose: "Own contracts for module.json and package.json so non-commentable manifests stay truthful."
  applicability:
    runtime: "static_only"
    artifact: "manifest"
    host_contracts: ["Foundry module.json", "npm package.json"]
  data_class: "Internal"
  ai_data: "none"
  refusals:
    - "Never place secrets, tokens, or personal filesystem paths in manifests."
    - "Never claim live Foundry verification from unverified compatibility fields."
  canonical_tree: |
    [GAMEASSIST_MANIFESTS]/
    `-- [GAMEASSIST_MANIFESTS:MANIFESTS]
        |-- [GAMEASSIST_MANIFESTS:MANIFESTS:FOUNDRY]
        `-- [GAMEASSIST_MANIFESTS:MANIFESTS:NPM]
--- prose banner ---
This sidecar explains Foundry and npm manifests. It refuses secrets and refuses
to treat compatibility fields as live evidence.
-->

<!-- ========================================================================
[GAMEASSIST_MANIFESTS:MANIFESTS] BEGIN
Section Title: Package manifests
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_MANIFESTS"
  area: "MANIFESTS"
  title: "Package manifests"
  guarantees:
    - "Covered JSON manifests have an explicit source of truth and edit path."
  last_updated_version: "v0.1.0"
  lifecycle: "active"
-----------------------------------------------------------------------------
Covered artifacts:
- `module.json`
- `package.json`

Source of truth: the listed JSON files
Validation: JSON parse, `npm run typecheck` does not read these files;
Foundry validates `module.json` only in a live install
Ownership: package maintainers
Editing: hand-edit the JSON, then update this sidecar when fields or meaning change

[GAMEASSIST_MANIFESTS:MANIFESTS:FOUNDRY] BEGIN
Section Title: Foundry module.json
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_MANIFESTS"
  area: "MANIFESTS:FOUNDRY"
  title: "Foundry manifest"
  guarantees:
    - "id is gameassist and matches the intended module folder name."
    - "esmodules points at generated dist/gameassist.mjs."
  last_updated_version: "v0.1.0"
  lifecycle: "active"
-----------------------------------------------------------------------------
`module.json` is the Foundry package contract. Compatibility `verified` records
the locked development baseline from COMPATIBILITY.md; it is not proof that
acceptance tests have passed. `socket` stays false until the authority service
exists. `manifest` and `download` URLs are omitted until a versioned release.

Notes & Comments:
Changed (v0.1.0): add the first Foundry package manifest for the lifecycle shell.
[GAMEASSIST_MANIFESTS:MANIFESTS:FOUNDRY] END

[GAMEASSIST_MANIFESTS:MANIFESTS:NPM] BEGIN
Section Title: npm package.json
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_MANIFESTS"
  area: "MANIFESTS:NPM"
  title: "npm package metadata"
  guarantees:
    - "npm metadata is private development tooling, not the Foundry package id."
  last_updated_version: "v0.1.0"
  lifecycle: "active"
-----------------------------------------------------------------------------
`package.json` name is `gameassist-foundry` so it does not collide with the
Foundry id `gameassist`. Scripts: `build`, `typecheck`, `test`, `check`.
Foundry never reads this file.

Notes & Comments:
Changed (v0.1.0): add private npm metadata for TypeScript, esbuild, and Vitest.
[GAMEASSIST_MANIFESTS:MANIFESTS:NPM] END

Notes & Comments:
Decision log:
- CHOICE: repository-root module.json - ALT: generate module.json into dist/;
  REJECTED: Foundry requires the manifest at the module root, and lang/styles
  stay unbundled beside it.
[GAMEASSIST_MANIFESTS:MANIFESTS] END
======================================================================== -->
