// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_FOUNDRY_ENVIRONMENT"
//   project_version: "v0.1.0"
//   purpose: "Read Foundry game.release, game.system, and collection presence without throwing when game is absent."
//   order: ["detect", "project"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry game", "Foundry CONFIG"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never enumerate world Documents or read actor contents."
//     - "Never throw during environment detection."
//   observability:
//     mode: "none"
//     logs: "none"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   lifecycle:
//     registers: []
//     disposes: []
//   policy:
//     notes_ref: "[GAMEASSIST_FOUNDRY_ENVIRONMENT:ADAPTER]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_FOUNDRY_ENVIRONMENT]/
//     `-- [GAMEASSIST_FOUNDRY_ENVIRONMENT:ADAPTER]
// --- prose banner ---
// This adapter is the only Foundry environment reader. It refuses to inspect
// hidden actors and refuses to throw when game is missing.

import type { RuntimeEnvironment } from "../../core/capabilities";

// ============================================================================
// [GAMEASSIST_FOUNDRY_ENVIRONMENT:ADAPTER] BEGIN
// Section Title: Foundry environment reader
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_FOUNDRY_ENVIRONMENT",
//   area: "ADAPTER",
//   title: "Foundry environment",
//   guarantees: ["Returns undefined when game is missing.", "Does not walk Document collections."],
//   provides: ["readFoundryEnvironment"],
//   seams: ["game.release", "game.system", "game.actors", "CONFIG"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Presence of a collection is a boolean. Contents are not read. That keeps
// privacy intact and avoids treating an empty world as missing APIs.
// -----------------------------------------------------------------------------

interface FoundryGame {
  release?: { generation?: number; build?: number };
  system?: { id?: string; version?: string };
  actors?: unknown;
  items?: unknown;
  combats?: unknown;
}

interface FoundryConfig {
  ActiveEffect?: unknown;
  DND5E?: unknown;
}

/**
 * Reads observable Foundry host facts.
 *
 * @returns Undefined when `game` is not present so callers emit unknown.
 */
export function readFoundryEnvironment(): RuntimeEnvironment | undefined {
  const global = globalThis as { game?: FoundryGame; CONFIG?: FoundryConfig };
  const game = global.game;
  if (!game) return undefined;

  const env: RuntimeEnvironment = {
    hasActorCollection: game.actors !== undefined,
    hasItemCollection: game.items !== undefined,
    hasCombatCollection: game.combats !== undefined,
    hasActiveEffectConfig: global.CONFIG?.ActiveEffect !== undefined,
    hasDnd5eConfig: global.CONFIG?.DND5E !== undefined
  };

  if (typeof game.release?.generation === "number") {
    env.foundryGeneration = game.release.generation;
  }
  if (typeof game.release?.build === "number") {
    env.foundryBuild = game.release.build;
  }
  if (typeof game.system?.id === "string") {
    env.systemId = game.system.id;
  }
  if (typeof game.system?.version === "string") {
    env.systemVersion = game.system.version;
  }
  return env;
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the lazy Foundry environment reader.
// [GAMEASSIST_FOUNDRY_ENVIRONMENT:ADAPTER] END
// ============================================================================
