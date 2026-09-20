// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_FOUNDRY_USERS"
//   project_version: "v0.1.0"
//   purpose: "Adapt Foundry game.users into the GameAssist UserDirectory port without caching isGM."
//   order: ["detect", "project"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry Users"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never cache isGM across calls."
//     - "Never trust a client-supplied role field."
//   observability:
//     mode: "none"
//     logs: "none"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   authority:
//     model: "Foundry user.isGM rechecked on every read"
//     stale_operation_policy: "reject"
//   policy:
//     notes_ref: "[GAMEASSIST_FOUNDRY_USERS:ADAPTER]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_FOUNDRY_USERS]/
//     `-- [GAMEASSIST_FOUNDRY_USERS:ADAPTER]
// --- prose banner ---
// This adapter reads Foundry users on every call. It refuses to cache isGM and
// refuses to take a role from request payloads.

import type { UserDirectory, UserRecord } from "../../core/authority";

// ============================================================================
// [GAMEASSIST_FOUNDRY_USERS:ADAPTER] BEGIN
// Section Title: Foundry user directory
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_FOUNDRY_USERS",
//   area: "ADAPTER",
//   title: "Foundry users",
//   guarantees: ["Each call re-reads game.users.", "Missing game yields an empty directory."],
//   provides: ["createFoundryUserDirectory"],
//   seams: ["game.userId", "game.users"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Foundry may not have game at esmodule evaluation. The directory object is
// created anyway and reads lazily. Empty users means authority reports
// NOT_FOUND or UNAVAILABLE rather than throwing.
// -----------------------------------------------------------------------------

interface FoundryUser {
  id?: string;
  isGM?: boolean;
  active?: boolean;
}

interface FoundryUsers {
  contents?: FoundryUser[];
  [Symbol.iterator]?: () => Iterator<FoundryUser>;
}

/**
 * Creates a UserDirectory backed by Foundry's live user list.
 */
export function createFoundryUserDirectory(): UserDirectory {
  const readGame = ():
    | { userId?: string; users?: FoundryUsers }
    | undefined => {
    return (globalThis as { game?: { userId?: string; users?: FoundryUsers } }).game;
  };

  const listUsers = (): UserRecord[] => {
    const game = readGame();
    const users = game?.users;
    if (!users) return [];
    const records: FoundryUser[] = [];
    if (Array.isArray(users.contents)) {
      records.push(...users.contents);
    } else {
      const iterate = users[Symbol.iterator];
      if (typeof iterate === "function") {
        const iterator = iterate.call(users);
        let next = iterator.next();
        while (!next.done) {
          records.push(next.value);
          next = iterator.next();
        }
      }
    }
    return records
      .filter((user) => typeof user.id === "string")
      .map((user) => ({
        id: user.id as string,
        isGM: user.isGM === true,
        active: user.active === true
      }));
  };

  return {
    currentUserId() {
      const id = readGame()?.userId;
      return typeof id === "string" ? id : undefined;
    },
    users() {
      return listUsers();
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the lazy Foundry user directory adapter.
// [GAMEASSIST_FOUNDRY_USERS:ADAPTER] END
// ============================================================================
