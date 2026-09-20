# Styles Sidecar

<!-- --- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_STYLES"
  project_version: "v0.1.0"
  purpose: "Own the GameAssist stylesheet contract for Control Center layout."
  applicability:
    runtime: "static_only"
    artifact: "style"
    host_contracts: ["Foundry CSS load"]
  data_class: "Internal"
  ai_data: "none"
  refusals:
    - "Never hide or restyle native Foundry UI without an explicit feature design."
  canonical_tree: |
    [GAMEASSIST_STYLES]/
    `-- [GAMEASSIST_STYLES:CSS]
--- prose banner ---
This sidecar covers styles/gameassist.css. It refuses to restyle native Foundry
chrome without a reviewed feature need.
-->

<!-- ========================================================================
[GAMEASSIST_STYLES:CSS] BEGIN
Section Title: Foundation stylesheet
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_STYLES"
  area: "CSS"
  title: "Foundation CSS"
  guarantees:
    - "The module.json styles path resolves to a real file."
  last_updated_version: "v0.1.0"
  lifecycle: "active"
-----------------------------------------------------------------------------
Covered artifacts:
- `styles/gameassist.css`

Source of truth: `styles/gameassist.css`
Validation: file exists; visual checks deferred to Control Center
Ownership: UI layer

Control Center adds compact, scoped layout here rather than introducing SCSS.
Rules must not restyle native Foundry chrome.

Notes & Comments:
Changed (v0.1.0): add the stylesheet placeholder required by module.json.
[GAMEASSIST_STYLES:CSS] END
======================================================================== -->
