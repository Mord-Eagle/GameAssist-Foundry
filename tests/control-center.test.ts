// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_CONTROL_CENTER_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove Control Center is GM-only, composes health and features, and registers a restricted Foundry menu."
//   order: ["authorize", "view", "toggle", "adapter"]
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
//     [GAMEASSIST_CONTROL_CENTER_TEST]/
//     `-- [GAMEASSIST_CONTROL_CENTER_TEST:CASES]
// --- prose banner ---
// Control Center presenter and adapter tests. They do not boot Foundry.

import { describe, expect, it } from "vitest";
import { bindFoundryControlCenter } from "../src/adapters/foundry/control-center";
import { createMemoryUserDirectory } from "../src/core/authority";
import { createMemoryHost } from "../src/core/host";
import { createGameAssistRuntime } from "../src/core/package";
import { err } from "../src/core/result";
import { createDemoBeacon, DEMO_BEACON_ID } from "../src/features/demo-beacon";
import {
  CONTROL_CENTER_KEYS,
  createControlCenter
} from "../src/ui/control-center";
import type { FeatureDefinition } from "../src/core/registry";

// ============================================================================
// [GAMEASSIST_CONTROL_CENTER_TEST:CASES] BEGIN
// Section Title: Control Center cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_CONTROL_CENTER_TEST",
//   area: "CASES",
//   title: "Control Center cases",
//   guarantees: ["GM view, player refusal, toggles, and menu registration are covered."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Memory host and directory stand in for Foundry. The adapter is driven with
// injected Application V2 fakes so Node does not need a DOM.
// -----------------------------------------------------------------------------

const gm = { id: "gm-1", isGM: true, active: true };
const player = { id: "player-1", isGM: false, active: true };

function readyRuntime(options: {
  currentUserId: string;
  features?: FeatureDefinition[] | ((diagnostics: never) => FeatureDefinition[]);
}) {
  const host = createMemoryHost();
  const directory = createMemoryUserDirectory({
    currentUserId: options.currentUserId,
    users: [gm, player]
  });
  const runtime = createGameAssistRuntime({
    host,
    userDirectory: directory,
    features:
      typeof options.features === "function" || options.features
        ? (options.features as never)
        : (diagnostics) => [createDemoBeacon(diagnostics)]
  });
  runtime.bind();
  host.emit("init");
  host.emit("ready");
  return { host, directory, runtime };
}

describe("control center presenter", () => {
  it("returns a GM view with health, features, capabilities, and recovery", () => {
    const { runtime, directory } = readyRuntime({ currentUserId: gm.id });
    const center = createControlCenter({
      runtime,
      currentUserId: () => directory.currentUserId()
    });
    const view = center.view();
    expect(view.ok).toBe(true);
    if (!view.ok) return;
    expect(view.data.titleKey).toBe(CONTROL_CENTER_KEYS.title);
    expect(view.data.health.status).toBe("healthy");
    expect(view.data.recoveryKey).toBe(CONTROL_CENTER_KEYS.recoveryNone);
    expect(view.data.features.some((feature) => feature.id === DEMO_BEACON_ID)).toBe(
      true
    );
    expect(view.data.capabilities.length).toBeGreaterThan(0);
    expect(view.data.failures).toEqual([]);
  });

  it("refuses a player without returning a view model", () => {
    const { runtime, directory } = readyRuntime({ currentUserId: player.id });
    const center = createControlCenter({
      runtime,
      currentUserId: () => directory.currentUserId()
    });
    const view = center.view();
    expect(view.ok).toBe(false);
    if (!view.ok) {
      expect(view.error).toBe("FORBIDDEN");
      expect(view.data).toEqual({ reason: "not a GM" });
    }
  });

  it("refuses a missing user", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({ host });
    const center = createControlCenter({
      runtime,
      currentUserId: () => undefined
    });
    const view = center.view();
    expect(view.ok).toBe(false);
    if (!view.ok) expect(view.error).toBe("UNAUTHORIZED");
  });

  it("lets a GM disable a feature", () => {
    const { runtime, directory } = readyRuntime({ currentUserId: gm.id });
    const center = createControlCenter({
      runtime,
      currentUserId: () => directory.currentUserId()
    });
    const updated = center.setFeatureEnabled(DEMO_BEACON_ID, false);
    expect(updated.ok).toBe(true);
    if (!updated.ok) return;
    const beacon = updated.data.features.find((feature) => feature.id === DEMO_BEACON_ID);
    expect(beacon?.enabled).toBe(false);
    expect(beacon?.status).toBe("stopped");
  });

  it("does not let a player toggle features", () => {
    const { runtime, directory } = readyRuntime({ currentUserId: player.id });
    const center = createControlCenter({
      runtime,
      currentUserId: () => directory.currentUserId()
    });
    const updated = center.setFeatureEnabled(DEMO_BEACON_ID, false);
    expect(updated.ok).toBe(false);
    if (!updated.ok) expect(updated.error).toBe("FORBIDDEN");
    const beacon = runtime.registry.snapshot(DEMO_BEACON_ID);
    expect(beacon.ok && beacon.data.enabled).toBe(true);
  });

  it("uses retry recovery when a feature failed", () => {
    const failing: FeatureDefinition = {
      id: "boom",
      title: "Boom",
      description: "Fails",
      enabledByDefault: true,
      onStart: () => err("INTERNAL")
    };
    const { runtime, directory } = readyRuntime({
      currentUserId: gm.id,
      features: [failing]
    });
    const center = createControlCenter({
      runtime,
      currentUserId: () => directory.currentUserId()
    });
    const view = center.view();
    expect(view.ok).toBe(true);
    if (!view.ok) return;
    expect(view.data.health.status).toBe("degraded");
    expect(view.data.recoveryKey).toBe(CONTROL_CENTER_KEYS.recoveryRetryFeature);
    expect(view.data.failures.some((event) => event.code === "feature.start.failed")).toBe(
      true
    );
  });

  it("uses wait-ready recovery before the package is ready", () => {
    const host = createMemoryHost();
    const directory = createMemoryUserDirectory({
      currentUserId: gm.id,
      users: [gm]
    });
    const runtime = createGameAssistRuntime({
      host,
      userDirectory: directory,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    const center = createControlCenter({
      runtime,
      currentUserId: () => directory.currentUserId()
    });
    const view = center.view();
    expect(view.ok).toBe(true);
    if (!view.ok) return;
    expect(view.data.health.status).toBe("unavailable");
    expect(view.data.recoveryKey).toBe(CONTROL_CENTER_KEYS.recoveryWaitReady);
  });
});

describe("control center adapter", () => {
  it("registers a restricted settings menu at init when Application V2 exists", () => {
    const host = createMemoryHost();
    const directory = createMemoryUserDirectory({
      currentUserId: gm.id,
      users: [gm]
    });
    const runtime = createGameAssistRuntime({
      host,
      userDirectory: directory,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    const center = createControlCenter({
      runtime,
      currentUserId: () => directory.currentUserId()
    });
    const menus: Array<{ restricted: boolean; key: string }> = [];
    class ApplicationV2 {}
    const HandlebarsApplicationMixin = (
      base: new (...args: unknown[]) => Record<string, unknown>
    ) => class extends base {};
    bindFoundryControlCenter({
      host,
      controlCenter: center,
      applications: {
        ApplicationV2: ApplicationV2 as never,
        HandlebarsApplicationMixin: HandlebarsApplicationMixin as never
      },
      settings: {
        registerMenu(_namespace, key, options) {
          menus.push({ restricted: options.restricted, key });
        }
      }
    });
    host.emit("init");
    host.emit("init");
    expect(menus).toEqual([{ restricted: true, key: "controlCenter" }]);
  });

  it("does not throw when Application V2 is missing", () => {
    const host = createMemoryHost();
    const directory = createMemoryUserDirectory({
      currentUserId: gm.id,
      users: [gm]
    });
    const runtime = createGameAssistRuntime({ host, userDirectory: directory });
    const center = createControlCenter({
      runtime,
      currentUserId: () => directory.currentUserId()
    });
    expect(() => {
      bindFoundryControlCenter({
        host,
        controlCenter: center,
        applications: undefined,
        settings: {
          registerMenu() {
            throw new Error("should not register");
          }
        }
      });
      host.emit("init");
    }).not.toThrow();
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add Control Center presenter and adapter contract tests.
// [GAMEASSIST_CONTROL_CENTER_TEST:CASES] END
// ============================================================================
