# Localization Sidecar

<!-- --- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_LOCALIZATION"
  project_version: "v0.1.0"
  purpose: "Own Foundry language files and the GAMEASSIST key namespace."
  applicability:
    runtime: "static_only"
    artifact: "localization"
    host_contracts: ["Foundry localization"]
  data_class: "Internal"
  ai_data: "none"
  refusals:
    - "Never embed user-facing prose in implementation code once Control Center exists."
  canonical_tree: |
    [GAMEASSIST_LOCALIZATION]/
    `-- [GAMEASSIST_LOCALIZATION:LANG]
--- prose banner ---
This sidecar covers lang/en.json. Foundation feature titles may still be
developer English until Control Center consumes these keys.
-->

<!-- ========================================================================
[GAMEASSIST_LOCALIZATION:LANG] BEGIN
Section Title: English language pack
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_LOCALIZATION"
  area: "LANG"
  title: "English localization"
  guarantees:
    - "Keys stay under the GAMEASSIST namespace."
  last_updated_version: "v0.1.0"
  lifecycle: "active"
-----------------------------------------------------------------------------
Covered artifacts:
- `lang/en.json`

Source of truth: `lang/en.json`
Validation: JSON parse; Foundry loads the file listed in module.json
Ownership: UI layer once Control Center exists; core may not add ad-hoc English
UI strings after that point

The first keys exist so the manifest path is valid and Demo Beacon has a home
for later UI copy.

Notes & Comments:
Changed (v0.1.0): add the English language pack stub.
[GAMEASSIST_LOCALIZATION:LANG] END
======================================================================== -->
