// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_AUTHORITY"
//   project_version: "v0.1.0"
//   purpose: "Own privileged-request authorization, responsible GM selection, idempotency, and stale-request rejection."
//   order: ["validate", "recheck", "dedupe", "select", "record"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never trust a payload that claims the sender is a GM."
//     - "Never log request payloads."
//     - "Never treat client visibility as mutation authority."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded authorization refusals without payloads"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   authority:
//     model: "active authorized GM for shared world mutations"
//     stale_operation_policy: "reject"
//   policy:
//     notes_ref: "[GAMEASSIST_AUTHORITY:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_AUTHORITY]/
//     |-- [GAMEASSIST_AUTHORITY:POLICY]
//     |-- [GAMEASSIST_AUTHORITY:DOMAIN]
//     `-- [GAMEASSIST_AUTHORITY:SERVICE]
// --- prose banner ---
// This service is the only GameAssist writer of authorization decisions. It
// refuses client-supplied role claims and refuses to log request payloads.

import { POLICY } from "./constants";
import type { DiagnosticSink } from "./diagnostics";
import { err, ok, type Result } from "./result";

// ============================================================================
// [GAMEASSIST_AUTHORITY:POLICY] BEGIN
// Section Title: Authority tunables
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_AUTHORITY",
//   area: "POLICY",
//   title: "Authority policy",
//   guarantees: ["Stale requests are rejected.", "Operation ids are constrained."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// POLICY.staleRequestMs and requestFutureSkewMs live in constants so settings
// and authority share one knob owner. This section documents how they are used.
// -----------------------------------------------------------------------------

export interface UserRecord {
  id: string;
  isGM: boolean;
  active: boolean;
}

/**
 * Host user directory. Implementations must re-read Foundry on each call.
 */
export interface UserDirectory {
  currentUserId(): string | undefined;
  users(): UserRecord[];
}
// --- Notes & Comments ---
// Changed (v0.1.0): declare the user directory port used by authority.
// [GAMEASSIST_AUTHORITY:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_AUTHORITY:DOMAIN] BEGIN
// Section Title: Request and authorization types
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_AUTHORITY",
//   area: "DOMAIN",
//   title: "Request types",
//   guarantees: ["Authorization results never include the original payload."],
//   provides: ["PrivilegedRequest", "Authorization"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// requestedBy is a user id for correlation. Role is always taken from the
// directory. payload may exist on the request object for later executors but
// is dropped from Authorization and diagnostics.
// -----------------------------------------------------------------------------

export interface PrivilegedRequest {
  operationId: string;
  type: string;
  requestedBy: string;
  /** Wall-clock milliseconds since Unix epoch. */
  createdAt: number;
}

export interface Authorization {
  operationId: string;
  type: string;
  requestedBy: string;
  executorId: string;
}

interface LedgerEntry {
  type: string;
  result: Result<Authorization>;
}

/**
 * Creates an in-memory user directory for tests.
 */
export function createMemoryUserDirectory(options: {
  currentUserId?: string;
  users?: UserRecord[];
}): UserDirectory & { setCurrentUserId: (id: string | undefined) => void; setUsers: (users: UserRecord[]) => void } {
  let currentUserId = options.currentUserId;
  let users = options.users ? options.users.map((user) => ({ ...user })) : [];
  return {
    currentUserId: () => currentUserId,
    users: () => users.map((user) => ({ ...user })),
    setCurrentUserId(id) {
      currentUserId = id;
    },
    setUsers(next) {
      users = next.map((user) => ({ ...user }));
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add privileged request types and a memory directory.
// [GAMEASSIST_AUTHORITY:DOMAIN] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_AUTHORITY:SERVICE] BEGIN
// Section Title: Authority service
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_AUTHORITY",
//   area: "SERVICE",
//   title: "Authority service",
//   guarantees: [
//     "isGM is re-read from the directory on every call.",
//     "Duplicate operation ids with the same type are idempotent.",
//     "Stale requests are rejected."
//   ],
//   depends_on: ["[GAMEASSIST_AUTHORITY:DOMAIN]"],
//   provides: ["AuthorityService", "createAuthorityService"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// authorize is the retryable privileged-action entry. assertWorldMutation is
// the local GM gate for world settings. Both ignore any caller-supplied role.
// -----------------------------------------------------------------------------

export interface AuthorityService {
  authorize(request: PrivilegedRequest): Result<Authorization>;
  assertWorldMutation(userId: string): Result<UserRecord>;
  responsibleGm(preferredId?: string): Result<UserRecord>;
  canViewPrivilegedDiagnostics(userId: string): boolean;
}

/**
 * Creates the authority service around a live user directory.
 */
export function createAuthorityService(options: {
  directory: UserDirectory;
  diagnostics?: DiagnosticSink;
  now?: () => number;
}): AuthorityService {
  const now = options.now ?? Date.now;
  const ledger = new Map<string, LedgerEntry>();

  const diagnose = (code: string, message: string): void => {
    options.diagnostics?.record({ level: "warning", code, message });
  };

  const remember = (
    operationId: string,
    type: string,
    result: Result<Authorization>
  ): Result<Authorization> => {
    ledger.set(operationId, { type, result });
    if (ledger.size > POLICY.authorityLedgerCapacity) {
      const oldest = ledger.keys().next().value;
      if (oldest !== undefined) ledger.delete(oldest);
    }
    return result;
  };

  const lookup = (id: string): UserRecord | undefined =>
    options.directory.users().find((user) => user.id === id);

  const responsibleGm = (preferredId?: string): Result<UserRecord> => {
    const activeGms = options.directory
      .users()
      .filter((user) => user.isGM && user.active)
      .slice()
      .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
    if (preferredId) {
      const preferred = activeGms.find((user) => user.id === preferredId);
      if (preferred) return ok(preferred);
    }
    const first = activeGms[0];
    if (!first) {
      diagnose("authority.no-gm", "No active GM is available for privileged work.");
      return err("UNAVAILABLE", { reason: "no active GM" });
    }
    return ok(first);
  };

  const assertWorldMutation = (userId: string): Result<UserRecord> => {
    const user = lookup(userId);
    if (!user) return err("NOT_FOUND", { userId });
    // INVARIANT: role comes from the directory, never from the caller.
    if (!user.isGM) {
      diagnose("authority.denied", `User ${userId} is not a GM.`);
      return err("FORBIDDEN", { reason: "not a GM" });
    }
    if (!user.active) {
      return err("UNAVAILABLE", { reason: "GM is not active" });
    }
    return ok(user);
  };

  return {
    responsibleGm,
    assertWorldMutation,
    canViewPrivilegedDiagnostics(userId) {
      return lookup(userId)?.isGM === true;
    },
    authorize(request) {
      if (!POLICY.operationIdPattern.test(request.operationId)) {
        return err("INVALID_ARGUMENT", { field: "operationId" });
      }
      if (!POLICY.operationTypePattern.test(request.type)) {
        return err("INVALID_ARGUMENT", { field: "type" });
      }
      if (!request.requestedBy) {
        return err("INVALID_ARGUMENT", { field: "requestedBy" });
      }

      const existing = ledger.get(request.operationId);
      if (existing) {
        if (existing.type !== request.type) {
          diagnose(
            "authority.duplicate",
            `Operation ${request.operationId} was reused with a different type.`
          );
          return err("CONFLICT", { operationId: request.operationId });
        }
        return existing.result;
      }

      const timestamp = now();
      if (request.createdAt > timestamp + POLICY.requestFutureSkewMs) {
        return remember(
          request.operationId,
          request.type,
          err("INVALID_ARGUMENT", { field: "createdAt" })
        );
      }
      if (request.createdAt < timestamp - POLICY.staleRequestMs) {
        diagnose("authority.stale", `Operation ${request.type} was stale.`);
        return remember(
          request.operationId,
          request.type,
          err("UNPROCESSABLE", { reason: "stale" })
        );
      }

      const requester = lookup(request.requestedBy);
      if (!requester) {
        return remember(
          request.operationId,
          request.type,
          err("NOT_FOUND", { userId: request.requestedBy })
        );
      }

      const executor = responsibleGm(requester.isGM ? requester.id : undefined);
      if (!executor.ok) {
        return remember(request.operationId, request.type, executor);
      }

      return remember(request.operationId, request.type, ok({
        operationId: request.operationId,
        type: request.type,
        requestedBy: request.requestedBy,
        executorId: executor.data.id
      }));
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add authorize, responsible GM selection, and stale reject.
// Decision log:
//   CHOICE: sort active GMs by id - ALT: Foundry insertion order; REJECTED:
//   insertion order is not a documented authority contract.
//   CHOICE: remember failures in the ledger - ALT: allow retry of failed ids;
//   REJECTED: duplicate execution after a transient no-GM would be surprising
//   without a new operation id.
// [GAMEASSIST_AUTHORITY:SERVICE] END
// ============================================================================
