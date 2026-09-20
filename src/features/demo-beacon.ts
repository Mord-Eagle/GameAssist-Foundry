// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_DEMO_BEACON"
//   project_version: "v0.1.0"
//   purpose: "Provide a harmless demonstration feature that proves registration, start, stop, and restart without mutating Foundry Documents."
//   order: ["start", "stop"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never mutate Actors, Items, Combat, settings, or flags."
//     - "Never emit player-facing chat or UI."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded start and stop beacons"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//     systems: ["dnd5e"]
//   state:
//     persistent: []
//     transient: ["started flag"]
//   policy:
//     notes_ref: "[GAMEASSIST_DEMO_BEACON:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_DEMO_BEACON]/
//     |-- [GAMEASSIST_DEMO_BEACON:POLICY]
//     `-- [GAMEASSIST_DEMO_BEACON:FEATURE]
// --- prose banner ---
// Demo Beacon exists so the package shell can start and stop something real
// without touching the world. It refuses Document writes and player UI.

import type { DiagnosticSink } from "../core/diagnostics";
import type { FeatureDefinition } from "../core/registry";
import { err, ok } from "../core/result";

// ============================================================================
// [GAMEASSIST_DEMO_BEACON:POLICY] BEGIN
// Section Title: Demo feature identity
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_DEMO_BEACON",
//   area: "POLICY",
//   title: "Demo feature identity",
//   guarantees: ["The demo feature id is stable and settings-safe."],
//   provides: ["DEMO_BEACON_ID"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "experimental"
// }
// -----------------------------------------------------------------------------
// Narrative
// This feature is scaffolding for Phase 1. It should be removed or hidden
// once a production feature occupies the same proving role.
// -----------------------------------------------------------------------------

/**
 * Stable feature id for the foundation demonstration feature.
 */
export const DEMO_BEACON_ID = "demo-beacon";
// --- Notes & Comments ---
// Changed (v0.1.0): reserve demo-beacon as the first registered feature id.
// [GAMEASSIST_DEMO_BEACON:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_DEMO_BEACON:FEATURE] BEGIN
// Section Title: Demo beacon feature factory
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_DEMO_BEACON",
//   area: "FEATURE",
//   title: "Demo beacon",
//   guarantees: ["Start and stop only record local diagnostics.", "Double-start is refused."],
//   depends_on: ["[GAMEASSIST_DEMO_BEACON:POLICY]"],
//   provides: ["createDemoBeacon"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "experimental"
// }
// -----------------------------------------------------------------------------
// Narrative
// The started flag is a local guard so a coordinator bug cannot emit two start
// beacons without a stop. The feature still does not write world state.
// -----------------------------------------------------------------------------

/**
 * Creates the harmless foundation demonstration feature.
 *
 * @param diagnostics - Local sink used for start and stop evidence.
 */
export function createDemoBeacon(diagnostics: DiagnosticSink): FeatureDefinition {
  let started = false;

  return {
    id: DEMO_BEACON_ID,
    title: "Demo Beacon",
    description:
      "Harmless lifecycle demonstration used during foundation development.",
    enabledByDefault: true,
    onStart() {
      if (started) {
        return err("CONFLICT", { id: DEMO_BEACON_ID, reason: "already started" });
      }
      started = true;
      diagnostics.record({
        level: "info",
        code: "demo-beacon.started",
        message: "Demo Beacon started.",
        featureId: DEMO_BEACON_ID
      });
      return ok(undefined);
    },
    onStop() {
      if (!started) {
        return ok(undefined);
      }
      started = false;
      diagnostics.record({
        level: "info",
        code: "demo-beacon.stopped",
        message: "Demo Beacon stopped.",
        featureId: DEMO_BEACON_ID
      });
      return ok(undefined);
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the harmless demo feature used to prove lifecycle.
// [GAMEASSIST_DEMO_BEACON:FEATURE] END
// ============================================================================
