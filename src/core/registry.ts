// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_REGISTRY"
//   project_version: "v0.1.0"
//   purpose: "Own feature registration, in-memory enablement, isolated start/stop, and restart-safe status."
//   order: ["validate", "register", "enable", "start", "stop"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never let one feature failure prevent unrelated features from starting."
//     - "Never persist enablement in this service; settings own that later."
//     - "Never silently overwrite user-authored data."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded feature register/start/stop failures"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   state:
//     persistent: []
//     transient: ["feature table", "enabled flags", "status"]
//   policy:
//     notes_ref: "[GAMEASSIST_CONSTANTS:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_REGISTRY]/
//     |-- [GAMEASSIST_REGISTRY:DOMAIN]
//     `-- [GAMEASSIST_REGISTRY:SERVICE]
// --- prose banner ---
// This registry is the only writer of feature status. It refuses to persist
// enablement and refuses to let one broken feature disable the package.

import { POLICY } from "./constants";
import type { DiagnosticSink } from "./diagnostics";
import { err, ok, type Failure, type Result } from "./result";

// ============================================================================
// [GAMEASSIST_REGISTRY:DOMAIN] BEGIN
// Section Title: Feature definition and snapshot types
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_REGISTRY",
//   area: "DOMAIN",
//   title: "Feature types",
//   guarantees: ["Feature callbacks return Result and do not own registry state."],
//   provides: ["FeatureDefinition", "FeatureSnapshot", "FeatureStatus"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// A feature is a definition plus runtime status. Core never imports a feature
// module's internals; the composition root passes definitions in. Callbacks
// are synchronous because Foundry will not await them.
// -----------------------------------------------------------------------------

/**
 * Runtime status for one registered feature.
 */
export type FeatureStatus =
  | "registered"
  | "started"
  | "stopped"
  | "failed";

/**
 * Independently configurable GameAssist feature.
 *
 * Feature modules implement this object. They must not import other features.
 */
export interface FeatureDefinition {
  id: string;
  title: string;
  description: string;
  /** Fallback when the feature id is absent from persisted enablement. */
  enabledByDefault: boolean;
  /**
   * Registration-only work at init. Must not touch world Documents.
   */
  onRegister?(): Result<void>;
  /**
   * Start work at ready when the feature is enabled.
   */
  onStart?(): Result<void>;
  /**
   * Stop work during teardown or disable. Invoked only after a successful start.
   */
  onStop?(): Result<void>;
}

/**
 * Immutable view of feature runtime state.
 */
export interface FeatureSnapshot {
  id: string;
  title: string;
  enabled: boolean;
  status: FeatureStatus;
  lastError?: Failure;
}

interface FeatureRecord {
  definition: FeatureDefinition;
  enabled: boolean;
  status: FeatureStatus;
  lastError?: Failure;
  registered: boolean;
}
// --- Notes & Comments ---
// Changed (v0.1.0): define the feature contract used by the first registry.
// [GAMEASSIST_REGISTRY:DOMAIN] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_REGISTRY:SERVICE] BEGIN
// Section Title: Feature registry service
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_REGISTRY",
//   area: "SERVICE",
//   title: "Feature registry",
//   guarantees: [
//     "Duplicate ids are rejected.",
//     "Start failures isolate to the failing feature.",
//     "stopAll is idempotent."
//   ],
//   depends_on: ["[GAMEASSIST_REGISTRY:DOMAIN]"],
//   provides: ["FeatureRegistry", "createFeatureRegistry"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// register() accepts definitions before init. invokeRegister() runs onRegister
// callbacks once per generation. startEnabled() starts enabled features that
// are not already started. stopAll() stops started features and is safe after
// failures. onStop is not called for a feature that never reached started so
// failed starts do not double-clean.
// -----------------------------------------------------------------------------

/**
 * Registry of independently configurable features.
 */
export interface FeatureRegistry {
  register(definition: FeatureDefinition): Result<FeatureSnapshot>;
  snapshot(id: string): Result<FeatureSnapshot>;
  snapshots(): FeatureSnapshot[];
  setEnabled(id: string, enabled: boolean): Result<FeatureSnapshot>;
  /**
   * Prepares features for a new init generation after idle or teardown.
   * Started features are left untouched; failed and stopped features return
   * to registered so they may retry.
   */
  beginGeneration(): Result<FeatureSnapshot[]>;
  invokeRegister(): Result<FeatureSnapshot[]>;
  startEnabled(): Result<FeatureSnapshot[]>;
  startOne(id: string): Result<FeatureSnapshot>;
  stopOne(id: string): Result<FeatureSnapshot>;
  stopAll(): Result<FeatureSnapshot[]>;
}

/**
 * Creates an empty feature registry.
 *
 * @param diagnostics - Optional local sink for isolated failures.
 */
export function createFeatureRegistry(diagnostics?: DiagnosticSink): FeatureRegistry {
  const features = new Map<string, FeatureRecord>();

  const toSnapshot = (record: FeatureRecord): FeatureSnapshot => {
    const snapshot: FeatureSnapshot = {
      id: record.definition.id,
      title: record.definition.title,
      enabled: record.enabled,
      status: record.status
    };
    if (record.lastError) snapshot.lastError = record.lastError;
    return snapshot;
  };

  const diagnose = (
    level: "warning" | "error",
    code: string,
    message: string,
    featureId?: string
  ): void => {
    diagnostics?.record({
      level,
      code,
      message,
      ...(featureId ? { featureId } : {})
    });
  };

  const invoke = (fn: () => Result<void>): Result<void> => {
    try {
      return fn();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "unknown";
      return err("INTERNAL", { message });
    }
  };

  const startRecord = (record: FeatureRecord): void => {
    if (!record.definition.onStart) {
      record.status = "started";
      record.lastError = undefined;
      return;
    }
    const result = invoke(() => record.definition.onStart!());
    if (result.ok) {
      record.status = "started";
      record.lastError = undefined;
      return;
    }
    record.status = "failed";
    record.lastError = result;
    diagnose(
      "error",
      "feature.start.failed",
      `Feature ${record.definition.id} failed during start.`,
      record.definition.id
    );
  };

  const stopRecord = (record: FeatureRecord): void => {
    if (record.status !== "started") {
      if (record.status !== "failed") record.status = "stopped";
      return;
    }
    if (record.definition.onStop) {
      const result = invoke(() => record.definition.onStop!());
      if (!result.ok) {
        record.status = "failed";
        record.lastError = result;
        diagnose(
          "warning",
          "feature.stop.failed",
          `Feature ${record.definition.id} failed during stop.`,
          record.definition.id
        );
        return;
      }
    }
    record.status = "stopped";
    record.lastError = undefined;
  };

  return {
    register(definition) {
      if (!POLICY.featureIdPattern.test(definition.id)) {
        return err("INVALID_ARGUMENT", { field: "id", value: definition.id });
      }
      if (features.has(definition.id)) {
        return err("CONFLICT", { id: definition.id });
      }
      const record: FeatureRecord = {
        definition,
        enabled: definition.enabledByDefault,
        status: "registered",
        registered: false
      };
      features.set(definition.id, record);
      return ok(toSnapshot(record));
    },

    snapshot(id) {
      const record = features.get(id);
      if (!record) return err("NOT_FOUND", { id });
      return ok(toSnapshot(record));
    },

    snapshots() {
      return [...features.values()].map(toSnapshot);
    },

    setEnabled(id, enabled) {
      const record = features.get(id);
      if (!record) return err("NOT_FOUND", { id });
      record.enabled = enabled;
      return ok(toSnapshot(record));
    },

    beginGeneration() {
      for (const record of features.values()) {
        if (record.status === "started") continue;
        record.registered = false;
        record.status = "registered";
        record.lastError = undefined;
      }
      return ok([...features.values()].map(toSnapshot));
    },

    invokeRegister() {
      for (const record of features.values()) {
        if (record.registered) continue;
        if (!record.definition.onRegister) {
          record.registered = true;
          continue;
        }
        const result = invoke(() => record.definition.onRegister!());
        record.registered = true;
        if (!result.ok) {
          record.status = "failed";
          record.lastError = result;
          diagnose(
            "error",
            "feature.register.failed",
            `Feature ${record.definition.id} failed during register.`,
            record.definition.id
          );
        }
      }
      return ok([...features.values()].map(toSnapshot));
    },

    startEnabled() {
      for (const record of features.values()) {
        if (!record.enabled) continue;
        if (record.status === "started") continue;
        if (record.status === "failed") continue;
        startRecord(record);
      }
      return ok([...features.values()].map(toSnapshot));
    },

    startOne(id) {
      const record = features.get(id);
      if (!record) return err("NOT_FOUND", { id });
      if (!record.enabled) {
        return err("UNAVAILABLE", { id, reason: "feature is disabled" });
      }
      if (record.status === "started") return ok(toSnapshot(record));
      startRecord(record);
      return ok(toSnapshot(record));
    },

    stopOne(id) {
      const record = features.get(id);
      if (!record) return err("NOT_FOUND", { id });
      stopRecord(record);
      return ok(toSnapshot(record));
    },

    stopAll() {
      for (const record of features.values()) {
        stopRecord(record);
      }
      return ok([...features.values()].map(toSnapshot));
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): implement isolated feature registration, start, and stop.
// Decision log:
//   CHOICE: do not call onStop after a failed start - ALT: always stop;
//   REJECTED: double-cleanup risk when start already unwound itself.
//   CHOICE: keep failed status through stopAll - ALT: coerce to stopped;
//   REJECTED: health reporting would hide the failure.
// [GAMEASSIST_REGISTRY:SERVICE] END
// ============================================================================
