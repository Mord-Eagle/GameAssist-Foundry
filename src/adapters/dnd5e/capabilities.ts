// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_DND5E_CAPABILITIES"
//   project_version: "v0.1.0"
//   purpose: "Interpret dnd5e system identity and defer health, rest, and roll probes until their owning services exist."
//   order: ["identify", "config", "defer"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["dnd5e system"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never read actor.system or other private dnd5e document paths."
//     - "Never invent health, rest, or roll capabilities."
//   observability:
//     mode: "none"
//     logs: "none"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//     systems: ["dnd5e"]
//   policy:
//     notes_ref: "[GAMEASSIST_DND5E_CAPABILITIES:EVALUATE]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_DND5E_CAPABILITIES]/
//     `-- [GAMEASSIST_DND5E_CAPABILITIES:EVALUATE]
// --- prose banner ---
// This adapter owns dnd5e identity interpretation. It refuses private document
// paths and refuses to mark deferred workflows as supported.

import {
  CAPABILITY_IDS,
  type CapabilityReport,
  type RuntimeEnvironment
} from "../../core/capabilities";
import { POLICY } from "../../core/constants";

// ============================================================================
// [GAMEASSIST_DND5E_CAPABILITIES:EVALUATE] BEGIN
// Section Title: dnd5e capability evaluator
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_DND5E_CAPABILITIES",
//   area: "EVALUATE",
//   title: "dnd5e evaluator",
//   guarantees: [
//     "Non-dnd5e systems are incompatible.",
//     "health, rest, and rolls stay unknown on a supported dnd5e world."
//   ],
//   provides: ["evaluateDnd5eCapabilities"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Identity is all this slice can honestly know. HP schema, rest workflows, and
// roll pipelines belong to later services. Marking them supported here would
// invent a contract.
// -----------------------------------------------------------------------------

function deferred(
  id: string,
  systemStatus: CapabilityReport["status"]
): CapabilityReport {
  if (systemStatus === "incompatible") {
    return {
      id,
      status: "incompatible",
      detail: "GameAssist system features require dnd5e."
    };
  }
  if (systemStatus === "unknown") {
    return {
      id,
      status: "unknown",
      detail: "System identity was not observable."
    };
  }
  return {
    id,
    status: "unknown",
    detail: "Deferred until the owning GameAssist service defines a probe."
  };
}

/**
 * Interprets dnd5e identity and deferred domain capabilities.
 */
export function evaluateDnd5eCapabilities(
  env: RuntimeEnvironment | undefined
): CapabilityReport[] {
  let system: CapabilityReport;
  if (!env || env.systemId === undefined) {
    system = {
      id: CAPABILITY_IDS.system,
      status: "unknown",
      detail: "Game system id was not observable."
    };
  } else if (env.systemId !== POLICY.dnd5eSystemId) {
    system = {
      id: CAPABILITY_IDS.system,
      status: "incompatible",
      version: env.systemVersion,
      detail: `System ${env.systemId} is not ${POLICY.dnd5eSystemId}.`
    };
  } else {
    system = {
      id: CAPABILITY_IDS.system,
      status: "supported",
      version: env.systemVersion,
      detail: `${POLICY.dnd5eSystemId} ${env.systemVersion ?? "unknown"} detected.`
    };
  }

  let config: CapabilityReport;
  if (system.status === "incompatible") {
    config = {
      id: CAPABILITY_IDS.dnd5eConfig,
      status: "incompatible",
      detail: "dnd5e config is not used on a non-dnd5e system."
    };
  } else if (env?.hasDnd5eConfig === undefined) {
    config = {
      id: CAPABILITY_IDS.dnd5eConfig,
      status: "unknown",
      detail: "CONFIG.DND5E presence was not observable."
    };
  } else if (env.hasDnd5eConfig) {
    config = {
      id: CAPABILITY_IDS.dnd5eConfig,
      status: "supported",
      detail: "CONFIG.DND5E is present."
    };
  } else {
    config = {
      id: CAPABILITY_IDS.dnd5eConfig,
      status: system.status === "supported" ? "unavailable" : "unknown",
      detail: "CONFIG.DND5E is missing."
    };
  }

  return [
    system,
    config,
    deferred(CAPABILITY_IDS.health, system.status),
    deferred(CAPABILITY_IDS.rest, system.status),
    deferred(CAPABILITY_IDS.rolls, system.status)
  ];
}
// --- Notes & Comments ---
// Changed (v0.1.0): add dnd5e identity evaluation with deferred domain probes.
// Decision log:
//   CHOICE: do not inspect actor.system.attributes.hp - ALT: sample one actor;
//   REJECTED: private path leakage and hidden-actor risk.
// [GAMEASSIST_DND5E_CAPABILITIES:EVALUATE] END
// ============================================================================
