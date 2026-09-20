// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_SETTINGS"
//   project_version: "v0.1.0"
//   purpose: "Own GameAssist setting registration, schema migration, enablement persistence, and preservation of unknown keys."
//   order: ["register", "migrate", "hydrate", "persist"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry game.settings"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never silently overwrite user-authored or unknown stored keys."
//     - "Never delete unrecognized feature enablement entries."
//     - "Never send settings contents to an external service."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded migration and validation diagnostics"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   lifecycle:
//     registers: ["init"]
//     disposes: []
//   state:
//     persistent: ["world schemaVersion", "world featureEnablement"]
//     transient: []
//     migrations: "[GAMEASSIST_SETTINGS:MIGRATE]"
//   policy:
//     notes_ref: "[GAMEASSIST_SETTINGS:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_SETTINGS]/
//     |-- [GAMEASSIST_SETTINGS:POLICY]
//     |-- [GAMEASSIST_SETTINGS:STORAGE]
//     |-- [GAMEASSIST_SETTINGS:MIGRATE]
//     `-- [GAMEASSIST_SETTINGS:SERVICE]
// --- prose banner ---
// This service is the only GameAssist writer of package settings. It refuses
// to delete unknown keys and refuses to overwrite malformed stored values.

import { MODULE_ID, POLICY } from "./constants";
import type { DiagnosticSink } from "./diagnostics";
import type { FeatureRegistry } from "./registry";
import { err, ok, type Result } from "./result";

// ============================================================================
// [GAMEASSIST_SETTINGS:POLICY] BEGIN
// Section Title: Settings keys and schema version
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_SETTINGS",
//   area: "POLICY",
//   title: "Settings policy",
//   guarantees: ["Setting keys and schema version are centralized."],
//   provides: ["SETTING_KEYS", "SETTINGS_SCHEMA_VERSION"],
//   last_updated_version: "v0.1.0",
//   independent_versions: { state_schema_version: 1 },
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// schemaVersion 1 is the first persisted GameAssist schema. Missing or 0 means
// uninitialized. enabledByDefault remains a fallback for absent feature ids so
// a later default change still applies to untouched features.
// -----------------------------------------------------------------------------

/**
 * Foundry setting keys under the `gameassist` namespace.
 */
export const SETTING_KEYS = {
  schemaVersion: "schemaVersion",
  featureEnablement: "featureEnablement"
} as const;

/**
 * Current GameAssist settings schema. Independent of package release.
 */
export const SETTINGS_SCHEMA_VERSION = POLICY.settingsSchemaVersion;

export type SettingValueType = "number" | "object" | "boolean" | "string";

export interface SettingDefinition {
  key: string;
  scope: "world" | "client";
  config: boolean;
  valueType: SettingValueType;
  defaultValue: unknown;
}

/**
 * Persistence port. Foundry or memory adapters implement this.
 */
export interface SettingsStorage {
  register(definition: SettingDefinition): Result<void>;
  get(key: string): Result<unknown>;
  set(key: string, value: unknown): Result<void>;
}

const CORE_DEFINITIONS: readonly SettingDefinition[] = [
  {
    key: SETTING_KEYS.schemaVersion,
    scope: "world",
    config: false,
    valueType: "number",
    defaultValue: 0
  },
  {
    key: SETTING_KEYS.featureEnablement,
    scope: "world",
    config: false,
    valueType: "object",
    defaultValue: {}
  }
];
// --- Notes & Comments ---
// Changed (v0.1.0): lock schema version 1 and the first two world setting keys.
// Decision log:
//   CHOICE: do not write defaults for untouched features - ALT: persist every
//   default on first init; REJECTED: later default changes could not apply.
// [GAMEASSIST_SETTINGS:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_SETTINGS:STORAGE] BEGIN
// Section Title: In-memory settings storage
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_SETTINGS",
//   area: "STORAGE",
//   title: "Memory settings storage",
//   guarantees: ["Tests can persist values across runtime instances that share storage."],
//   provides: ["createMemorySettingsStorage"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Memory storage is the contract test stand-in for Foundry world settings.
// Sharing one instance across createGameAssistRuntime calls is how restart
// preservation is proven without Foundry.
// -----------------------------------------------------------------------------

/**
 * Creates a synchronous in-memory settings store.
 *
 * @param initial - Optional seed values used as already-persisted world state.
 */
export function createMemorySettingsStorage(
  initial: Record<string, unknown> = {}
): SettingsStorage {
  const values = new Map<string, unknown>(Object.entries(initial));
  const registered = new Set<string>();

  return {
    register(definition) {
      registered.add(definition.key);
      if (!values.has(definition.key)) {
        values.set(definition.key, cloneJson(definition.defaultValue));
      }
      return ok(undefined);
    },
    get(key) {
      if (!registered.has(key)) return err("NOT_FOUND", { key });
      return ok(cloneJson(values.get(key)));
    },
    set(key, value) {
      if (!registered.has(key)) return err("NOT_FOUND", { key });
      values.set(key, cloneJson(value));
      return ok(undefined);
    }
  };
}

function cloneJson<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
// --- Notes & Comments ---
// Changed (v0.1.0): add memory storage so enablement can be tested across restarts.
// [GAMEASSIST_SETTINGS:STORAGE] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_SETTINGS:MIGRATE] BEGIN
// Section Title: Schema migration
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_SETTINGS",
//   area: "MIGRATE",
//   title: "Settings migration",
//   guarantees: [
//     "Version 0 migrates to 1 without deleting unknown enablement keys.",
//     "Newer unknown versions are not downgraded."
//   ],
//   last_updated_version: "v0.1.0",
//   independent_versions: { state_schema_version: 1 },
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Migration runs after register and before hydrate. A missing enablement map
// becomes {}. A present non-object map is left in storage and reported; memory
// hydration then uses defaults.
// -----------------------------------------------------------------------------

function readNumber(storage: SettingsStorage, key: string): number {
  const result = storage.get(key);
  if (!result.ok) return 0;
  return typeof result.data === "number" && Number.isFinite(result.data)
    ? result.data
    : 0;
}

function migrateToV1(
  storage: SettingsStorage,
  diagnostics?: DiagnosticSink
): Result<{ from: number; to: number }> {
  const from = readNumber(storage, SETTING_KEYS.schemaVersion);
  if (from > SETTINGS_SCHEMA_VERSION) {
    diagnostics?.record({
      level: "warning",
      code: "settings.migrate.unknown-version",
      message: `Stored settings schema ${from} is newer than ${SETTINGS_SCHEMA_VERSION}.`
    });
    return ok({ from, to: from });
  }
  if (from === SETTINGS_SCHEMA_VERSION) {
    return ok({ from, to: from });
  }

  const stored = storage.get(SETTING_KEYS.featureEnablement);
  if (!stored.ok || stored.data === undefined) {
    const written = storage.set(SETTING_KEYS.featureEnablement, {});
    if (!written.ok) return written;
  } else if (!isPlainObject(stored.data)) {
    diagnostics?.record({
      level: "warning",
      code: "settings.migrate.malformed",
      message: "featureEnablement is not a plain object and was left unchanged."
    });
  }

  const versioned = storage.set(SETTING_KEYS.schemaVersion, SETTINGS_SCHEMA_VERSION);
  if (!versioned.ok) return versioned;
  diagnostics?.record({
    level: "info",
    code: "settings.migrate.completed",
    message: `Settings schema migrated from ${from} to ${SETTINGS_SCHEMA_VERSION}.`
  });
  return ok({ from, to: SETTINGS_SCHEMA_VERSION });
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the 0-to-1 settings migration with preserve-unknown-keys.
// [GAMEASSIST_SETTINGS:MIGRATE] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_SETTINGS:SERVICE] BEGIN
// Section Title: Settings service
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_SETTINGS",
//   area: "SERVICE",
//   title: "Settings service",
//   guarantees: [
//     "Register happens before get or set.",
//     "Hydration never writes defaults for missing feature ids.",
//     "persistFeatureEnablement merges one key and keeps the rest."
//   ],
//   depends_on: ["[GAMEASSIST_SETTINGS:POLICY]", "[GAMEASSIST_SETTINGS:MIGRATE]"],
//   provides: ["SettingsService", "createSettingsService"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The service talks only to SettingsStorage and FeatureRegistry. It does not
// import Foundry. Invalid per-feature values are skipped and left stored.
// -----------------------------------------------------------------------------

/**
 * GameAssist settings owner.
 */
export interface SettingsService {
  register(): Result<void>;
  migrate(): Result<{ from: number; to: number }>;
  applyFeatureEnablement(registry: FeatureRegistry): Result<void>;
  persistFeatureEnablement(id: string, enabled: boolean): Result<void>;
  readFeatureEnablement(): Result<Record<string, boolean>>;
}

/**
 * Creates the settings service around a storage port.
 */
export function createSettingsService(options: {
  storage: SettingsStorage;
  diagnostics?: DiagnosticSink;
}): SettingsService {
  const { storage, diagnostics } = options;
  let registered = false;

  const requireRegistered = (): Result<void> => {
    if (!registered) {
      return err("UNAVAILABLE", { reason: "settings are not registered" });
    }
    return ok(undefined);
  };

  return {
    register() {
      for (const definition of CORE_DEFINITIONS) {
        const result = storage.register(definition);
        if (!result.ok) {
          diagnostics?.record({
            level: "error",
            code: "settings.register.failed",
            message: `Failed to register ${MODULE_ID}.${definition.key}.`
          });
          return result;
        }
      }
      registered = true;
      return ok(undefined);
    },

    migrate() {
      const ready = requireRegistered();
      if (!ready.ok) return ready;
      return migrateToV1(storage, diagnostics);
    },

    applyFeatureEnablement(registry) {
      const ready = requireRegistered();
      if (!ready.ok) return ready;
      const stored = storage.get(SETTING_KEYS.featureEnablement);
      if (!stored.ok) return stored;
      if (!isPlainObject(stored.data)) {
        diagnostics?.record({
          level: "warning",
          code: "settings.migrate.malformed",
          message: "featureEnablement could not be applied; defaults remain in memory."
        });
        return ok(undefined);
      }
      for (const feature of registry.snapshots()) {
        if (!Object.prototype.hasOwnProperty.call(stored.data, feature.id)) {
          continue;
        }
        const value = stored.data[feature.id];
        if (typeof value !== "boolean") {
          diagnostics?.record({
            level: "warning",
            code: "settings.enablement.invalid-value",
            message: `Stored enablement for ${feature.id} is not boolean and was skipped.`,
            featureId: feature.id
          });
          continue;
        }
        registry.setEnabled(feature.id, value);
      }
      return ok(undefined);
    },

    persistFeatureEnablement(id, enabled) {
      const ready = requireRegistered();
      if (!ready.ok) return ready;
      if (!POLICY.featureIdPattern.test(id)) {
        return err("INVALID_ARGUMENT", { field: "id", value: id });
      }
      const stored = storage.get(SETTING_KEYS.featureEnablement);
      const current = stored.ok && isPlainObject(stored.data) ? { ...stored.data } : {};
      if (stored.ok && stored.data !== undefined && !isPlainObject(stored.data)) {
        diagnostics?.record({
          level: "error",
          code: "settings.persist.failed",
          message: "Refusing to overwrite a malformed featureEnablement value."
        });
        return err("UNPROCESSABLE", { key: SETTING_KEYS.featureEnablement });
      }
      current[id] = enabled;
      const written = storage.set(SETTING_KEYS.featureEnablement, current);
      if (!written.ok) {
        diagnostics?.record({
          level: "error",
          code: "settings.persist.failed",
          message: `Failed to persist enablement for ${id}.`,
          featureId: id
        });
      }
      return written;
    },

    readFeatureEnablement() {
      const ready = requireRegistered();
      if (!ready.ok) return ready;
      const stored = storage.get(SETTING_KEYS.featureEnablement);
      if (!stored.ok) return stored;
      if (!isPlainObject(stored.data)) {
        return err("UNPROCESSABLE", { key: SETTING_KEYS.featureEnablement });
      }
      const map: Record<string, boolean> = {};
      for (const [key, value] of Object.entries(stored.data)) {
        if (typeof value === "boolean") map[key] = value;
      }
      return ok(map);
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the settings service for schema 1 feature enablement.
// [GAMEASSIST_SETTINGS:SERVICE] END
// ============================================================================
