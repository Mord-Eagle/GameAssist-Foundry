// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_CAPABILITIES"
//   project_version: "v0.1.0"
//   purpose: "Own capability snapshot composition and refuse to invent Foundry or dnd5e data when a probe is unknown."
//   order: ["read", "evaluate", "snapshot"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never treat unknown as supported."
//     - "Never invent actor, item, health, rest, or roll data."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded capability refresh"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//     systems: ["dnd5e"]
//   policy:
//     notes_ref: "[GAMEASSIST_CAPABILITIES:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_CAPABILITIES]/
//     |-- [GAMEASSIST_CAPABILITIES:POLICY]
//     |-- [GAMEASSIST_CAPABILITIES:DOMAIN]
//     `-- [GAMEASSIST_CAPABILITIES:SERVICE]
// --- prose banner ---
// This service composes host and system capability reports. It refuses to
// invent document data and refuses to upgrade unknown to supported.

import { POLICY } from "./constants";
import type { DiagnosticSink } from "./diagnostics";
import { ok, type Result } from "./result";

// ============================================================================
// [GAMEASSIST_CAPABILITIES:POLICY] BEGIN
// Section Title: Capability vocabulary
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_CAPABILITIES",
//   area: "POLICY",
//   title: "Capability vocabulary",
//   guarantees: ["Status values are a closed set."],
//   provides: ["CapabilityStatus", "CAPABILITY_IDS"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// supported means the surface was detected. It is not Foundry acceptance.
// unknown means this process cannot verify the claim. incompatible means the
// detected host is the wrong generation or system.
// -----------------------------------------------------------------------------

/**
 * Detection result for one named surface.
 */
export type CapabilityStatus =
  | "supported"
  | "unavailable"
  | "unknown"
  | "incompatible";

/**
 * Stable capability ids used in snapshots and diagnostics.
 */
export const CAPABILITY_IDS = {
  foundry: "foundry",
  system: "system",
  actors: "actors",
  items: "items",
  combat: "combat",
  effects: "effects",
  dnd5eConfig: "dnd5e-config",
  health: "health",
  rest: "rest",
  rolls: "rolls"
} as const;
// --- Notes & Comments ---
// Changed (v0.1.0): lock the first capability status vocabulary and ids.
// [GAMEASSIST_CAPABILITIES:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_CAPABILITIES:DOMAIN] BEGIN
// Section Title: Environment and report types
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_CAPABILITIES",
//   area: "DOMAIN",
//   title: "Capability types",
//   guarantees: ["Optional environment flags default to unknown, not false."],
//   provides: ["RuntimeEnvironment", "CapabilityReport", "CapabilitySnapshot"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// A missing boolean flag is not unavailable. Tests and Node runs omit flags
// they cannot see so evaluators emit unknown instead of pretending the
// collection is missing from a Foundry world.
// -----------------------------------------------------------------------------

/**
 * Duck-typed host facts. Every field is optional so unknown stays representable.
 */
export interface RuntimeEnvironment {
  foundryGeneration?: number;
  foundryBuild?: number;
  systemId?: string;
  systemVersion?: string;
  hasActorCollection?: boolean;
  hasItemCollection?: boolean;
  hasCombatCollection?: boolean;
  hasActiveEffectConfig?: boolean;
  hasDnd5eConfig?: boolean;
}

/**
 * One named capability report. detail is code-owned, never Document text.
 */
export interface CapabilityReport {
  id: string;
  status: CapabilityStatus;
  detail: string;
  version?: string;
}

/**
 * Session snapshot produced by refresh.
 */
export interface CapabilitySnapshot {
  reports: CapabilityReport[];
  /** Wall-clock milliseconds since Unix epoch. */
  at: number;
}

/**
 * Evaluates Foundry generation against the locked minimum.
 */
export function evaluateFoundryHost(
  env: RuntimeEnvironment | undefined
): CapabilityReport {
  if (!env || env.foundryGeneration === undefined) {
    return {
      id: CAPABILITY_IDS.foundry,
      status: "unknown",
      detail: "Foundry release was not observable."
    };
  }
  const version = `${env.foundryGeneration}.${env.foundryBuild ?? "unknown"}`;
  if (env.foundryGeneration < POLICY.foundryMinimumGeneration) {
    return {
      id: CAPABILITY_IDS.foundry,
      status: "incompatible",
      version,
      detail: `Foundry generation ${env.foundryGeneration} is below ${POLICY.foundryMinimumGeneration}.`
    };
  }
  if (env.foundryGeneration > POLICY.foundryMinimumGeneration) {
    return {
      id: CAPABILITY_IDS.foundry,
      status: "unknown",
      version,
      detail: `Foundry generation ${env.foundryGeneration} is newer than the locked baseline.`
    };
  }
  return {
    id: CAPABILITY_IDS.foundry,
    status: "supported",
    version,
    detail: `Foundry generation ${POLICY.foundryMinimumGeneration} detected.`
  };
}

/**
 * Evaluates Foundry document collections. Absent flags stay unknown.
 */
export function evaluateDocumentSurfaces(
  env: RuntimeEnvironment | undefined
): CapabilityReport[] {
  const flag = (
    id: string,
    present: boolean | undefined,
    supported: string,
    unavailable: string
  ): CapabilityReport => {
    if (present === undefined) {
      return { id, status: "unknown", detail: "Collection presence was not observable." };
    }
    return present
      ? { id, status: "supported", detail: supported }
      : { id, status: "unavailable", detail: unavailable };
  };
  return [
    flag(
      CAPABILITY_IDS.actors,
      env?.hasActorCollection,
      "Actor collection is present.",
      "Actor collection is missing."
    ),
    flag(
      CAPABILITY_IDS.items,
      env?.hasItemCollection,
      "Item collection is present.",
      "Item collection is missing."
    ),
    flag(
      CAPABILITY_IDS.combat,
      env?.hasCombatCollection,
      "Combat collection is present.",
      "Combat collection is missing."
    ),
    flag(
      CAPABILITY_IDS.effects,
      env?.hasActiveEffectConfig,
      "Active Effect config is present.",
      "Active Effect config is missing."
    )
  ];
}

/**
 * Builds a snapshot from host and system reports.
 */
export function buildCapabilitySnapshot(
  reports: CapabilityReport[],
  at: number
): CapabilitySnapshot {
  return { reports: reports.map((report) => ({ ...report })), at };
}

/**
 * Finds one report by id.
 */
export function findCapability(
  snapshot: CapabilitySnapshot,
  id: string
): CapabilityReport | undefined {
  return snapshot.reports.find((report) => report.id === id);
}
// --- Notes & Comments ---
// Changed (v0.1.0): add environment types and Foundry host evaluators.
// Decision log:
//   CHOICE: missing flags are unknown - ALT: treat missing as unavailable;
//   REJECTED: Node tests would look like a broken Foundry world.
// [GAMEASSIST_CAPABILITIES:DOMAIN] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_CAPABILITIES:SERVICE] BEGIN
// Section Title: Capability service
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_CAPABILITIES",
//   area: "SERVICE",
//   title: "Capability service",
//   guarantees: [
//     "refresh is safe when the environment reader returns undefined.",
//     "snapshot returns a copy."
//   ],
//   depends_on: ["[GAMEASSIST_CAPABILITIES:DOMAIN]"],
//   provides: ["CapabilityService", "createCapabilityService"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The service does not import Foundry or dnd5e. Composition supplies a reader
// and a system evaluator. Health, rest, and roll meaning stay in the system
// evaluator so core never grows private data paths.
// -----------------------------------------------------------------------------

export type SystemCapabilityEvaluator = (
  env: RuntimeEnvironment | undefined
) => CapabilityReport[];

/**
 * Read-only capability owner.
 */
export interface CapabilityService {
  refresh(): Result<CapabilitySnapshot>;
  snapshot(): CapabilitySnapshot;
}

const emptyUnknown = (at: number): CapabilitySnapshot =>
  buildCapabilitySnapshot(
    [
      {
        id: CAPABILITY_IDS.foundry,
        status: "unknown",
        detail: "Foundry release was not observable."
      }
    ],
    at
  );

/**
 * Creates a capability service around environment and system evaluators.
 */
export function createCapabilityService(options: {
  readEnvironment: () => RuntimeEnvironment | undefined;
  evaluateSystem: SystemCapabilityEvaluator;
  diagnostics?: DiagnosticSink;
  now?: () => number;
}): CapabilityService {
  const now = options.now ?? Date.now;
  let current = emptyUnknown(now());

  return {
    refresh() {
      const env = options.readEnvironment();
      const reports = [
        evaluateFoundryHost(env),
        ...evaluateDocumentSurfaces(env),
        ...options.evaluateSystem(env)
      ];
      current = buildCapabilitySnapshot(reports, now());
      const foundry = findCapability(current, CAPABILITY_IDS.foundry);
      const system = findCapability(current, CAPABILITY_IDS.system);
      options.diagnostics?.record({
        level:
          foundry?.status === "incompatible" || system?.status === "incompatible"
            ? "warning"
            : "info",
        code: "capability.refresh",
        message: `foundry=${foundry?.status ?? "unknown"} system=${system?.status ?? "unknown"}`
      });
      return ok(current);
    },
    snapshot() {
      return buildCapabilitySnapshot(current.reports, current.at);
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the capability service used at init and ready.
// [GAMEASSIST_CAPABILITIES:SERVICE] END
// ============================================================================
