// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_CONSTANTS"
//   project_version: "v0.1.0"
//   purpose: "Own stable package identifiers and foundation policy knobs used by core services."
//   order: ["identify", "constrain"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never silently overwrite user-authored data."
//     - "Never send diagnostics to an external service."
//   observability:
//     mode: "none"
//     logs: "none"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//     systems: ["dnd5e"]
//   policy:
//     notes_ref: "[GAMEASSIST_CONSTANTS:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_CONSTANTS]/
//     `-- [GAMEASSIST_CONSTANTS:POLICY]
// --- prose banner ---
// This file names the Foundry package id and the first core limits. It refuses
// to invent a public API or an external telemetry channel.

// ============================================================================
// [GAMEASSIST_CONSTANTS:POLICY] BEGIN
// Section Title: Package identity and foundation tunables
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_CONSTANTS",
//   area: "POLICY",
//   title: "Package identity and tunables",
//   guarantees: ["MODULE_ID matches module.json id.", "Feature ids are constrained before registration."],
//   provides: ["MODULE_ID", "PACKAGE_VERSION", "POLICY"],
//   last_updated_version: "v0.1.0",
//   independent_versions: { policy_schema_version: 1 },
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// MODULE_ID is the Foundry package identifier and the diagnostic namespace.
// Feature ids stay lowercase with hyphens so settings keys can later reuse
// them without a second encoding. Diagnostic capacity is bounded so a noisy
// feature cannot grow session memory without limit.
// -----------------------------------------------------------------------------

/**
 * Foundry package id. Must match `module.json` and the installed folder name.
 */
export const MODULE_ID = "gameassist";

/**
 * Planned package version for this foundation slice. The Foundry manifest
 * remains authoritative for the distributed package version.
 */
export const PACKAGE_VERSION = "0.1.0";

/**
 * Foundation policy knobs. Changing a default is a meaningful change.
 */
export const POLICY = {
  /** Maximum retained local diagnostic events. Oldest events drop first. */
  diagnosticCapacity: 50,
  /**
   * Feature ids are lowercase alphanumeric hyphenated slugs.
   * WHY: later world settings keys should reuse the same id without encoding.
   */
  featureIdPattern: /^[a-z][a-z0-9-]{1,62}$/,
  /** Allowed Foundry lifecycle hooks for the first host adapter. */
  hostHooks: ["init", "ready"] as const,
  /**
   * GameAssist world-settings schema. Independent of package release.
   * Increment only with a documented migration.
   */
  settingsSchemaVersion: 1,
  /** Locked development baseline. Not a published support range. */
  foundryMinimumGeneration: 14,
  foundryBaselineBuild: 367,
  dnd5eSystemId: "dnd5e",
  dnd5eBaselineVersion: "5.3.3",
  /** Privileged requests older than this are rejected. */
  staleRequestMs: 30_000,
  /** Allow small clock skew on createdAt. */
  requestFutureSkewMs: 5_000,
  /** Maximum retained authorization decisions. Oldest drop first. */
  authorityLedgerCapacity: 100,
  operationIdPattern: /^[a-zA-Z0-9._:-]{1,128}$/,
  operationTypePattern: /^[a-z][a-z0-9.-]{1,62}$/,
  /** Maximum retained semantic events. Oldest drop first. */
  eventHistoryCapacity: 50,
  eventIdPattern: /^[a-zA-Z0-9._:-]{1,128}$/,
  eventTypePattern: /^[a-z][a-z0-9.-]{1,62}$/
} as const;
// --- Notes & Comments ---
// Changed (v0.1.0): establish package identity and the first core limits.
// Decision log:
//   CHOICE: hyphenated slugs - ALT: camelCase ids; REJECTED: Foundry settings
//   namespaces and folder names already prefer hyphens.
// [GAMEASSIST_CONSTANTS:POLICY] END
// ============================================================================
