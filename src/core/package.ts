// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_PACKAGE"
//   project_version: "v0.1.0"
//   purpose: "Compose diagnostics, registry, lifecycle, and host binding into one testable GameAssist runtime."
//   order: ["create", "register", "bind", "unbind"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry Hooks"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never assign a public game.gameAssist API."
//     - "Never leave Hook subscriptions active after unbind."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded bind and unbind events"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   lifecycle:
//     registers: ["init", "ready"]
//     disposes: ["hook subscriptions", "started features"]
//   policy:
//     notes_ref: "[GAMEASSIST_PACKAGE:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_PACKAGE]/
//     `-- [GAMEASSIST_PACKAGE:RUNTIME]
// --- prose banner ---
// This composition root wires core services for tests and for the Foundry
// entrypoint. It refuses to freeze a public Foundry API object.

import {
  createDiagnosticBuffer,
  type DiagnosticBuffer,
  type DiagnosticSink
} from "./diagnostics";
import type { PackageHost } from "./host";
import {
  createLifecycleCoordinator,
  type LifecycleCoordinator
} from "./lifecycle";
import {
  createFeatureRegistry,
  type FeatureDefinition,
  type FeatureRegistry,
  type FeatureSnapshot
} from "./registry";
import { ok, type Result } from "./result";
import {
  createMemorySettingsStorage,
  createSettingsService,
  type SettingsService,
  type SettingsStorage
} from "./settings";

// ============================================================================
// [GAMEASSIST_PACKAGE:RUNTIME] BEGIN
// Section Title: Runtime composition and host binding
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_PACKAGE",
//   area: "RUNTIME",
//   title: "GameAssist runtime",
//   guarantees: [
//     "bind subscribes to init and ready exactly once per generation.",
//     "unbind tears down features and removes host handlers."
//   ],
//   provides: ["GameAssistRuntime", "createGameAssistRuntime"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The entrypoint may pass feature definitions, including the demo beacon, but
// this file does not contain feature business rules. Diagnostics are recorded
// both in the buffer and through the host sink so tests and the Foundry
// console see the same codes.
// -----------------------------------------------------------------------------

/**
 * Composed GameAssist runtime used by the Foundry entrypoint and tests.
 */
export interface GameAssistRuntime {
  readonly diagnostics: DiagnosticBuffer;
  readonly registry: FeatureRegistry;
  readonly coordinator: LifecycleCoordinator;
  readonly settings: SettingsService;
  bind(): Result<void>;
  unbind(): Result<void>;
  setFeatureEnabled(id: string, enabled: boolean): Result<FeatureSnapshot>;
}

/**
 * Creates a GameAssist runtime around a host and feature list.
 *
 * @param options.host - Foundry or in-memory host.
 * @param options.storage - Optional settings storage. Tests share one memory
 * store across runtimes to prove restart preservation. Foundry supplies the
 * game.settings adapter.
 * @param options.features - Feature definitions, or a factory that receives
 * the runtime diagnostic sink so features share the same local history.
 */
export function createGameAssistRuntime(options: {
  host: PackageHost;
  storage?: SettingsStorage;
  features?:
    | readonly FeatureDefinition[]
    | ((diagnostics: DiagnosticSink) => readonly FeatureDefinition[]);
}): GameAssistRuntime {
  const buffer = createDiagnosticBuffer();
  const sink: DiagnosticSink = {
    record(event) {
      buffer.record(event);
      const stored = buffer.list();
      const latest = stored[stored.length - 1];
      if (latest) options.host.diagnose(latest);
    }
  };
  const registry = createFeatureRegistry(sink);
  const storage = options.storage ?? createMemorySettingsStorage();
  const settings = createSettingsService({ storage, diagnostics: sink });
  const coordinator = createLifecycleCoordinator({
    registry,
    diagnostics: sink,
    settings
  });
  const unsubscribers: Array<() => void> = [];
  let bound = false;

  const featureList =
    typeof options.features === "function"
      ? options.features(sink)
      : (options.features ?? []);

  for (const feature of featureList) {
    const registered = registry.register(feature);
    if (!registered.ok) {
      sink.record({
        level: "error",
        code: "feature.register.rejected",
        message: `Feature ${feature.id} was rejected during runtime composition.`,
        featureId: feature.id
      });
    }
  }

  return {
    diagnostics: buffer,
    registry,
    coordinator,
    settings,
    setFeatureEnabled(id, enabled) {
      const exists = registry.snapshot(id);
      if (!exists.ok) return exists;
      const persisted = settings.persistFeatureEnablement(id, enabled);
      if (!persisted.ok) return persisted;
      return coordinator.setFeatureEnabled(id, enabled);
    },
    bind() {
      if (bound) return ok(undefined);
      unsubscribers.push(
        options.host.on("init", () => {
          coordinator.handleInit();
        })
      );
      unsubscribers.push(
        options.host.on("ready", () => {
          coordinator.handleReady();
        })
      );
      bound = true;
      sink.record({
        level: "info",
        code: "lifecycle.bind",
        message: "GameAssist bound init and ready handlers."
      });
      return ok(undefined);
    },
    unbind() {
      if (!bound) {
        coordinator.teardown();
        return ok(undefined);
      }
      while (unsubscribers.length > 0) {
        const unsubscribe = unsubscribers.pop();
        unsubscribe?.();
      }
      bound = false;
      coordinator.teardown();
      sink.record({
        level: "info",
        code: "lifecycle.unbind",
        message: "GameAssist unbound host handlers and completed teardown."
      });
      return ok(undefined);
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): compose the first GameAssist runtime and host binding.
// Decision log:
//   CHOICE: no game.gameAssist export - ALT: debug global; REJECTED: public
//   API policy forbids freezing a surface before real consumers exist.
// [GAMEASSIST_PACKAGE:RUNTIME] END
// ============================================================================
