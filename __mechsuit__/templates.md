# Templates Sidecar

<!-- --- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_TEMPLATES"
  project_version: "v0.1.0"
  purpose: "Own Handlebars templates loaded by Foundry Application V2."
  applicability:
    runtime: "static_only"
    artifact: "template"
    host_contracts: ["Foundry Handlebars"]
  data_class: "Internal"
  ai_data: "none"
  refusals:
    - "Never triple-stash untrusted text."
  canonical_tree: |
    [GAMEASSIST_TEMPLATES]/
    `-- [GAMEASSIST_TEMPLATES:CONTROL_CENTER]
--- prose banner ---
This sidecar covers templates/control-center.hbs. Copy is localized; the
template only interpolates presenter fields.
-->

<!-- ========================================================================
[GAMEASSIST_TEMPLATES:CONTROL_CENTER] BEGIN
Section Title: Control Center template
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_TEMPLATES"
  area: "CONTROL_CENTER"
  title: "Control Center Handlebars"
  guarantees:
    - "User-facing chrome uses localize helpers."
    - "Mustache escaping is used for diagnostic text."
  last_updated_version: "v0.1.0"
  lifecycle: "active"
-----------------------------------------------------------------------------
Covered artifacts:
- `templates/control-center.hbs`

Source of truth: `templates/control-center.hbs`
Validation: file exists; live render deferred to Foundry smoke checks
Ownership: UI layer
Localization: keys under GAMEASSIST.ControlCenter

Notes & Comments:
Changed (v0.1.0): add the Control Center Handlebars template.
[GAMEASSIST_TEMPLATES:CONTROL_CENTER] END
======================================================================== -->
