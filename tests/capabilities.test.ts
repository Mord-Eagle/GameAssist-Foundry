// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_CAPABILITIES_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove capability detection reports supported, unavailable, unknown, and incompatible without inventing data."
//   order: ["unknown", "baseline", "incompatible", "deferred"]
//   applicability:
//     runtime: "node_tooling"
//     artifact: "test"
//     host_contracts: ["Vitest"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never treat these checks as live Foundry evidence."
//   observability:
//     mode: "none"
//     logs: "none"
//     metrics: []
//     spans: []
//   canonical_tree: |
//     [GAMEASSIST_CAPABILITIES_TEST]/
//     `-- [GAMEASSIST_CAPABILITIES_TEST:CASES]
// --- prose banner ---
// Capability contract tests with injected environments. They do not boot Foundry.

import { describe, expect, it } from "vitest";
import { evaluateDnd5eCapabilities } from "../src/adapters/dnd5e/capabilities";
import {
  CAPABILITY_IDS,
  createCapabilityService,
  findCapability,
  type RuntimeEnvironment
} from "../src/core/capabilities";
import { createMemoryHost } from "../src/core/host";
import { createGameAssistRuntime } from "../src/core/package";
import { createDemoBeacon, DEMO_BEACON_ID } from "../src/features/demo-beacon";

// ============================================================================
// [GAMEASSIST_CAPABILITIES_TEST:CASES] BEGIN
// Section Title: Capability detection cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_CAPABILITIES_TEST",
//   area: "CASES",
//   title: "Capability cases",
//   guarantees: ["Unknown, supported, incompatible, and deferred probes are covered."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Injected environments stand in for Foundry game. Health/rest/rolls must stay
// unknown on a supported dnd5e world in this slice.
// -----------------------------------------------------------------------------

const baseline: RuntimeEnvironment = {
  foundryGeneration: 14,
  foundryBuild: 367,
  systemId: "dnd5e",
  systemVersion: "5.3.3",
  hasActorCollection: true,
  hasItemCollection: true,
  hasCombatCollection: true,
  hasActiveEffectConfig: true,
  hasDnd5eConfig: true
};

function service(env: RuntimeEnvironment | undefined) {
  return createCapabilityService({
    readEnvironment: () => env,
    evaluateSystem: evaluateDnd5eCapabilities
  });
}

describe("capability service", () => {
  it("reports unknown when no environment is observable", () => {
    const capabilities = service(undefined);
    const refreshed = capabilities.refresh();
    expect(refreshed.ok).toBe(true);
    const foundry = findCapability(capabilities.snapshot(), CAPABILITY_IDS.foundry);
    const system = findCapability(capabilities.snapshot(), CAPABILITY_IDS.system);
    expect(foundry?.status).toBe("unknown");
    expect(system?.status).toBe("unknown");
  });

  it("reports a baseline-shaped environment as supported for host surfaces", () => {
    const capabilities = service(baseline);
    capabilities.refresh();
    const snapshot = capabilities.snapshot();
    expect(findCapability(snapshot, CAPABILITY_IDS.foundry)?.status).toBe("supported");
    expect(findCapability(snapshot, CAPABILITY_IDS.system)?.status).toBe("supported");
    expect(findCapability(snapshot, CAPABILITY_IDS.actors)?.status).toBe("supported");
    expect(findCapability(snapshot, CAPABILITY_IDS.dnd5eConfig)?.status).toBe("supported");
    expect(findCapability(snapshot, CAPABILITY_IDS.health)?.status).toBe("unknown");
    expect(findCapability(snapshot, CAPABILITY_IDS.rest)?.status).toBe("unknown");
    expect(findCapability(snapshot, CAPABILITY_IDS.rolls)?.status).toBe("unknown");
  });

  it("marks Foundry generation below 14 incompatible", () => {
    const capabilities = service({ ...baseline, foundryGeneration: 11 });
    capabilities.refresh();
    expect(findCapability(capabilities.snapshot(), CAPABILITY_IDS.foundry)?.status).toBe(
      "incompatible"
    );
  });

  it("marks Foundry generation above 14 unknown", () => {
    const capabilities = service({ ...baseline, foundryGeneration: 15 });
    capabilities.refresh();
    expect(findCapability(capabilities.snapshot(), CAPABILITY_IDS.foundry)?.status).toBe(
      "unknown"
    );
  });

  it("marks a non-dnd5e system incompatible without stopping the package", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      readEnvironment: () => ({ ...baseline, systemId: "pf2e" }),
      evaluateSystem: evaluateDnd5eCapabilities,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    const snapshot = runtime.coordinator.snapshot();
    expect(snapshot.phase).toBe("ready");
    expect(findCapability(snapshot.capabilities!, CAPABILITY_IDS.system)?.status).toBe(
      "incompatible"
    );
    expect(findCapability(snapshot.capabilities!, CAPABILITY_IDS.health)?.status).toBe(
      "incompatible"
    );
    const beacon = runtime.registry.snapshot(DEMO_BEACON_ID);
    expect(beacon.ok && beacon.data.status).toBe("started");
  });

  it("reports unavailable when a dnd5e world is missing CONFIG.DND5E", () => {
    const capabilities = service({ ...baseline, hasDnd5eConfig: false });
    capabilities.refresh();
    expect(findCapability(capabilities.snapshot(), CAPABILITY_IDS.dnd5eConfig)?.status).toBe(
      "unavailable"
    );
  });

  it("does not treat omitted collection flags as unavailable", () => {
    const capabilities = service({
      foundryGeneration: 14,
      systemId: "dnd5e"
    });
    capabilities.refresh();
    expect(findCapability(capabilities.snapshot(), CAPABILITY_IDS.actors)?.status).toBe(
      "unknown"
    );
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add capability detection contract tests.
// [GAMEASSIST_CAPABILITIES_TEST:CASES] END
// ============================================================================
