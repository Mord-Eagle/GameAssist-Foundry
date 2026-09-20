// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_LIFECYCLE"
//   project_version: "v0.1.0"
//   purpose: "Own GameAssist phase changes for init, ready, teardown, and restart without assuming Foundry awaits Hooks."
//   order: ["idle", "init", "ready", "stopped"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry Hooks"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never assume Foundry awaits Hook callbacks."
//     - "Never start features before init has completed."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded phase transitions"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   lifecycle:
//     registers: ["init", "ready"]
//     disposes: ["started features"]
//   state:
//     persistent: []
//     transient: ["phase"]
//   policy:
//     notes_ref: "[GAMEASSIST_LIFECYCLE:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_LIFECYCLE]/
//     |-- [GAMEASSIST_LIFECYCLE:POLICY]
//     `-- [GAMEASSIST_LIFECYCLE:SERVICE]
// --- prose banner ---
// This coordinator is the only writer of package phase. It refuses to start
// features before init and refuses to treat Foundry Hooks as awaitable.

import type { DiagnosticSink } from "./diagnostics";
import type { FeatureRegistry, FeatureSnapshot } from "./registry";
import { err, ok, type Result } from "./result";

// ============================================================================
// [GAMEASSIST_LIFECYCLE:POLICY] BEGIN
// Section Title: Phase vocabulary
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_LIFECYCLE",
//   area: "POLICY",
//   title: "Phase vocabulary",
//   guarantees: ["Phase names are a closed set."],
//   provides: ["LifecyclePhase"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// idle is the pre-init state. stopped is a completed teardown that may start
// a new generation. failed is reserved for coordinator-level faults, not
// isolated feature failures.
// -----------------------------------------------------------------------------

/**
 * Package lifecycle phase. Feature-level failures do not move the package to
 * failed; they remain on the feature snapshot.
 */
export type LifecyclePhase = "idle" | "init" | "ready" | "stopped";
// --- Notes & Comments ---
// Changed (v0.1.0): define the first GameAssist phase set.
// [GAMEASSIST_LIFECYCLE:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_LIFECYCLE:SERVICE] BEGIN
// Section Title: Lifecycle coordinator
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_LIFECYCLE",
//   area: "SERVICE",
//   title: "Lifecycle coordinator",
//   guarantees: [
//     "handleInit then handleReady is the only start path.",
//     "Duplicate init or ready is idempotent.",
//     "teardown is safe from every phase."
//   ],
//   depends_on: ["[GAMEASSIST_LIFECYCLE:POLICY]"],
//   provides: ["LifecycleCoordinator", "createLifecycleCoordinator"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The coordinator translates host notifications into registry operations. It
// does not import feature modules. Restart is teardown followed by a new init.
// -----------------------------------------------------------------------------

/**
 * Immutable view of package lifecycle.
 */
export interface LifecycleSnapshot {
  phase: LifecyclePhase;
  features: FeatureSnapshot[];
}

/**
 * Owns package phase and delegates feature start/stop to the registry.
 */
export interface LifecycleCoordinator {
  snapshot(): LifecycleSnapshot;
  handleInit(): Result<LifecycleSnapshot>;
  handleReady(): Result<LifecycleSnapshot>;
  teardown(): Result<LifecycleSnapshot>;
}

/**
 * Creates a lifecycle coordinator around an existing registry.
 */
export function createLifecycleCoordinator(options: {
  registry: FeatureRegistry;
  diagnostics?: DiagnosticSink;
}): LifecycleCoordinator {
  const { registry, diagnostics } = options;
  let phase: LifecyclePhase = "idle";

  const snapshot = (): LifecycleSnapshot => ({
    phase,
    features: registry.snapshots()
  });

  const note = (code: string, message: string): void => {
    diagnostics?.record({ level: "info", code, message });
  };

  return {
    snapshot,

    handleInit() {
      if (phase === "init" || phase === "ready") {
        return ok(snapshot());
      }
      // ORDER: reset failed/stopped features before register so a new generation
      // can retry without hiding an in-flight started feature.
      registry.beginGeneration();
      registry.invokeRegister();
      phase = "init";
      note("lifecycle.init", "GameAssist completed init registration.");
      return ok(snapshot());
    },

    handleReady() {
      if (phase === "ready") {
        return ok(snapshot());
      }
      if (phase !== "init") {
        return err("UNAVAILABLE", {
          phase,
          reason: "ready requires a completed init"
        });
      }
      registry.startEnabled();
      phase = "ready";
      note("lifecycle.ready", "GameAssist reached ready.");
      return ok(snapshot());
    },

    teardown() {
      if (phase === "idle" || phase === "stopped") {
        phase = "stopped";
        return ok(snapshot());
      }
      registry.stopAll();
      phase = "stopped";
      note("lifecycle.teardown", "GameAssist completed teardown.");
      return ok(snapshot());
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): implement init/ready/teardown with idempotent duplicates.
// Decision log:
//   CHOICE: ready before init is UNAVAILABLE - ALT: implicit init; REJECTED:
//   hidden order would hide host-adapter bugs.
// [GAMEASSIST_LIFECYCLE:SERVICE] END
// ============================================================================
