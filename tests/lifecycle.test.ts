// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_LIFECYCLE_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove init/ready/teardown order, idempotence, restart, and host binding."
//   order: ["bind", "init", "ready", "teardown", "restart"]
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
//     [GAMEASSIST_LIFECYCLE_TEST]/
//     `-- [GAMEASSIST_LIFECYCLE_TEST:CASES]
// --- prose banner ---
// Lifecycle contract tests using the in-memory host. They refuse to claim live
// Foundry verification.

import { describe, expect, it } from "vitest";
import { createMemoryHost } from "../src/core/host";
import { createGameAssistRuntime } from "../src/core/package";
import { createDemoBeacon, DEMO_BEACON_ID } from "../src/features/demo-beacon";
import { err, ok } from "../src/core/result";
import type { FeatureDefinition } from "../src/core/registry";

// ============================================================================
// [GAMEASSIST_LIFECYCLE_TEST:CASES] BEGIN
// Section Title: Lifecycle coordinator and runtime cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_LIFECYCLE_TEST",
//   area: "CASES",
//   title: "Lifecycle cases",
//   guarantees: ["Order, duplicates, restart, and demo-beacon diagnostics are covered."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Tests drive the memory host so Foundry is not required. The demo beacon is
// the first production-shaped feature definition.
// -----------------------------------------------------------------------------

describe("lifecycle coordinator", () => {
  it("registers on init and starts the demo beacon on ready", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    const snapshot = runtime.coordinator.snapshot();
    expect(snapshot.phase).toBe("ready");
    const beacon = snapshot.features.find((feature) => feature.id === DEMO_BEACON_ID);
    expect(beacon?.status).toBe("started");
    expect(
      runtime.diagnostics.list().some((event) => event.code === "demo-beacon.started")
    ).toBe(true);
  });

  it("refuses ready before init", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({ host });
    const result = runtime.coordinator.handleReady();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("UNAVAILABLE");
    expect(runtime.coordinator.snapshot().phase).toBe("idle");
  });

  it("treats duplicate init and ready as idempotent", () => {
    let starts = 0;
    const repeating: FeatureDefinition = {
      id: "counter",
      title: "Counter",
      description: "Counts starts",
      enabledByDefault: true,
      onStart() {
        starts += 1;
        return ok(undefined);
      }
    };
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      features: [repeating]
    });
    runtime.bind();
    host.emit("init");
    host.emit("init");
    host.emit("ready");
    host.emit("ready");
    expect(starts).toBe(1);
    expect(runtime.coordinator.snapshot().phase).toBe("ready");
  });

  it("teardown stops started features and is safe to repeat", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    expect(runtime.unbind().ok).toBe(true);
    expect(runtime.unbind().ok).toBe(true);
    expect(runtime.coordinator.snapshot().phase).toBe("stopped");
    expect(
      runtime.diagnostics.list().some((event) => event.code === "demo-beacon.stopped")
    ).toBe(true);
  });

  it("can start again after teardown", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    runtime.unbind();
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    const beacon = runtime.coordinator
      .snapshot()
      .features.find((feature) => feature.id === DEMO_BEACON_ID);
    expect(runtime.coordinator.snapshot().phase).toBe("ready");
    expect(beacon?.status).toBe("started");
    const starts = runtime.diagnostics
      .list()
      .filter((event) => event.code === "demo-beacon.started");
    expect(starts).toHaveLength(2);
  });

  it("keeps package ready when one feature fails to start", () => {
    const failing: FeatureDefinition = {
      id: "boom",
      title: "Boom",
      description: "Fails",
      enabledByDefault: true,
      onStart: () => err("INTERNAL")
    };
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      features: (diagnostics) => [failing, createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    const snapshot = runtime.coordinator.snapshot();
    expect(snapshot.phase).toBe("ready");
    expect(snapshot.features.find((feature) => feature.id === "boom")?.status).toBe(
      "failed"
    );
    expect(
      snapshot.features.find((feature) => feature.id === DEMO_BEACON_ID)?.status
    ).toBe("started");
  });

  it("retries a previously failed feature after teardown", () => {
    let attempts = 0;
    const flaky: FeatureDefinition = {
      id: "flaky",
      title: "Flaky",
      description: "Fails once",
      enabledByDefault: true,
      onStart() {
        attempts += 1;
        return attempts === 1 ? err("INTERNAL") : ok(undefined);
      }
    };
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({ host, features: [flaky] });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    expect(
      runtime.coordinator.snapshot().features.find((feature) => feature.id === "flaky")
        ?.status
    ).toBe("failed");
    runtime.unbind();
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    expect(
      runtime.coordinator.snapshot().features.find((feature) => feature.id === "flaky")
        ?.status
    ).toBe("started");
    expect(attempts).toBe(2);
  });

  it("unbind removes host handlers so later emits do nothing", () => {
    let starts = 0;
    const counting: FeatureDefinition = {
      id: "counter",
      title: "Counter",
      description: "Counts starts",
      enabledByDefault: true,
      onStart() {
        starts += 1;
        return ok(undefined);
      }
    };
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({ host, features: [counting] });
    runtime.bind();
    runtime.unbind();
    host.emit("init");
    host.emit("ready");
    expect(starts).toBe(0);
    expect(runtime.coordinator.snapshot().phase).toBe("stopped");
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add lifecycle and demo-beacon contract tests.
// [GAMEASSIST_LIFECYCLE_TEST:CASES] END
// ============================================================================
