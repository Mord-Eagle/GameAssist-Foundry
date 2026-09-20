// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_FOUNDRY_SETTINGS"
//   project_version: "v0.1.0"
//   purpose: "Adapt Foundry game.settings into the GameAssist SettingsStorage port without leaking Foundry types into core."
//   order: ["detect", "register", "get", "set"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry game.settings"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never assume settings.set is synchronous or that Foundry awaits it."
//     - "Never log stored setting values."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded write-acceptance diagnostics"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   lifecycle:
//     registers: ["init"]
//     disposes: []
//   policy:
//     notes_ref: "[GAMEASSIST_FOUNDRY_SETTINGS:ADAPTER]"
//   variances:
//     - rule: "synchronous Result for writes"
//       class: "ADAPTED"
//       reason: "Foundry settings.set may return a Promise."
//       preserved_intent: "Callers still receive a structured refusal when the write cannot even be submitted."
//       compensating_control: "Thrown errors map to INTERNAL; Promise rejection is diagnosed locally and not claimed as confirmed storage."
//       scope: "[GAMEASSIST_FOUNDRY_SETTINGS:ADAPTER]"
//       review: "Revisit if Foundry documents a synchronous world-setting write."
//   canonical_tree: |
//     [GAMEASSIST_FOUNDRY_SETTINGS]/
//     `-- [GAMEASSIST_FOUNDRY_SETTINGS:ADAPTER]
// --- prose banner ---
// This adapter is the only file that may call Foundry game.settings. It
// refuses to treat an accepted Promise as a confirmed disk write.

import { MODULE_ID } from "../../core/constants";
import type { SettingsStorage, SettingValueType } from "../../core/settings";
import { err, ok } from "../../core/result";

// ============================================================================
// [GAMEASSIST_FOUNDRY_SETTINGS:ADAPTER] BEGIN
// Section Title: Foundry game.settings adapter
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_FOUNDRY_SETTINGS",
//   area: "ADAPTER",
//   title: "Foundry settings adapter",
//   guarantees: ["Lazy-detects game.settings so module evaluation stays safe in Node."],
//   provides: ["createFoundrySettingsStorage"],
//   seams: ["game.settings.register", "game.settings.get", "game.settings.set"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// game may not exist when the esmodule is evaluated. Every method resolves
// Foundry settings at call time, which for register is init.
// -----------------------------------------------------------------------------

interface FoundrySettings {
  register(
    namespace: string,
    key: string,
    data: {
      scope: "world" | "client";
      config: boolean;
      type: unknown;
      default: unknown;
    }
  ): void;
  get(namespace: string, key: string): unknown;
  set(namespace: string, key: string, value: unknown): unknown;
}

function detectFoundrySettings(): FoundrySettings | undefined {
  const game = (globalThis as { game?: { settings?: FoundrySettings } }).game;
  const settings = game?.settings;
  if (
    settings &&
    typeof settings.register === "function" &&
    typeof settings.get === "function" &&
    typeof settings.set === "function"
  ) {
    return settings;
  }
  return undefined;
}

function foundryType(valueType: SettingValueType): unknown {
  switch (valueType) {
    case "number":
      return Number;
    case "boolean":
      return Boolean;
    case "string":
      return String;
    case "object":
      return Object;
  }
}

/**
 * Creates a SettingsStorage backed by Foundry game.settings.
 *
 * The adapter object can be created before `game` exists. Calls made before
 * settings are available return UNAVAILABLE.
 */
export function createFoundrySettingsStorage(): SettingsStorage {
  return {
    register(definition) {
      const settings = detectFoundrySettings();
      if (!settings) {
        return err("UNAVAILABLE", { reason: "game.settings is not available" });
      }
      try {
        settings.register(MODULE_ID, definition.key, {
          scope: definition.scope,
          config: definition.config,
          type: foundryType(definition.valueType),
          default: definition.defaultValue
        });
        return ok(undefined);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "unknown";
        return err("INTERNAL", { message });
      }
    },
    get(key) {
      const settings = detectFoundrySettings();
      if (!settings) {
        return err("UNAVAILABLE", { reason: "game.settings is not available" });
      }
      try {
        return ok(settings.get(MODULE_ID, key));
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "unknown";
        return err("INTERNAL", { message });
      }
    },
    set(key, value) {
      const settings = detectFoundrySettings();
      if (!settings) {
        return err("UNAVAILABLE", { reason: "game.settings is not available" });
      }
      try {
        const submitted = settings.set(MODULE_ID, key, value);
        // COMPAT: Foundry may return a Promise. Core remains synchronous
        // because init/ready are not awaitable.
        if (
          submitted &&
          typeof submitted === "object" &&
          "then" in submitted &&
          typeof (submitted as { then?: unknown }).then === "function"
        ) {
          void (submitted as Promise<unknown>).catch(() => {
            const consoleLike = (
              globalThis as { console?: { warn: (message: string) => void } }
            ).console;
            consoleLike?.warn(
              `[gameassist] warning settings.persist.failed: Foundry rejected ${key}.`
            );
          });
        }
        return ok(undefined);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "unknown";
        return err("INTERNAL", { message });
      }
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the Foundry game.settings adapter for schema 1.
// Decision log:
//   CHOICE: lazy game.settings lookup - ALT: capture game at construction;
//   REJECTED: esmodule evaluation happens before init.
// [GAMEASSIST_FOUNDRY_SETTINGS:ADAPTER] END
// ============================================================================
