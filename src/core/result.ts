// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_RESULT"
//   project_version: "v0.1.0"
//   purpose: "Provide the GameAssist-owned success and failure envelope used at internal service boundaries."
//   order: ["construct"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never wrap Foundry Hook return contracts in this envelope."
//   observability:
//     mode: "none"
//     logs: "none"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   policy:
//     notes_ref: "[GAMEASSIST_RESULT:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_RESULT]/
//     |-- [GAMEASSIST_RESULT:POLICY]
//     `-- [GAMEASSIST_RESULT:DOMAIN]
// --- prose banner ---
// This file defines ok/err results for GameAssist services. It refuses to wrap
// native Foundry Hook returns, which keep their host contract.

// ============================================================================
// [GAMEASSIST_RESULT:POLICY] BEGIN
// Section Title: Envelope vocabulary
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_RESULT",
//   area: "POLICY",
//   title: "Envelope vocabulary",
//   guarantees: ["Error codes stay in a small stable set."],
//   provides: ["GameAssistErrorCode"],
//   last_updated_version: "v0.1.0",
//   independent_versions: { envelope_schema_version: 1 },
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Trace identifiers are omitted until a socket or multi-step transaction needs
// them. Manufacturing a trace id for every helper would add noise without a
// consumer.
// -----------------------------------------------------------------------------

/**
 * Stable failure vocabulary for GameAssist-owned boundaries.
 */
export type GameAssistErrorCode =
  | "INVALID_ARGUMENT"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "UNPROCESSABLE"
  | "UNAVAILABLE"
  | "INTERNAL";
// --- Notes & Comments ---
// Changed (v0.1.0): adopt the MECHSUITS-recommended error vocabulary minus
// RATE_LIMITED and TIMEOUT, which have no consumer in the lifecycle shell.
// [GAMEASSIST_RESULT:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_RESULT:DOMAIN] BEGIN
// Section Title: Success and failure constructors
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_RESULT",
//   area: "DOMAIN",
//   title: "Result constructors",
//   guarantees: ["ok and err produce a discriminated union with no thrown control flow."],
//   depends_on: ["[GAMEASSIST_RESULT:POLICY]"],
//   provides: ["ok", "err", "Result"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Services return Result instead of throwing for expected refusals. Unexpected
// exceptions are caught at the registry boundary and mapped to INTERNAL.
// -----------------------------------------------------------------------------

/**
 * Successful GameAssist service result.
 */
export type Success<T> = { ok: true; data: T };

/**
 * Failed GameAssist service result.
 */
export type Failure<E extends string = GameAssistErrorCode> = {
  ok: false;
  error: E;
  data?: unknown;
};

/**
 * Discriminated service result.
 */
export type Result<T, E extends string = GameAssistErrorCode> = Success<T> | Failure<E>;

/**
 * Constructs a successful result.
 *
 * @param data - Canonical value produced by the service.
 */
export function ok<T>(data: T): Success<T> {
  return { ok: true, data };
}

/**
 * Constructs a failed result without throwing.
 *
 * @param error - Stable error code from the GameAssist vocabulary.
 * @param data - Optional structured details. Callers must not place secrets or
 * restricted user content here.
 */
export function err<E extends string = GameAssistErrorCode>(
  error: E,
  data?: unknown
): Failure<E> {
  // CHOICE: plain object over thrown Error - ALT: throw; REJECTED: Foundry
  // Hook adapters and feature isolation need inspectable failures.
  return data === undefined ? { ok: false, error } : { ok: false, error, data };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the first GameAssist result envelope.
// [GAMEASSIST_RESULT:DOMAIN] END
// ============================================================================
