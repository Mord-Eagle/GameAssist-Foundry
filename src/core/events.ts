// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_EVENTS"
//   project_version: "v0.1.0"
//   purpose: "Own in-process GameAssist semantic events without wrapping Foundry Hooks or awaiting subscribers."
//   order: ["register", "publish", "deliver", "evict"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never emit GameAssist events through Foundry Hooks.call."
//     - "Never await subscriber callbacks."
//     - "Never put user-authored text, Document contents, or request payloads in event fields."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded subscriber isolation without payloads"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   policy:
//     notes_ref: "[GAMEASSIST_CONSTANTS:POLICY]"
//   state:
//     persistent: []
//     transient: ["event type catalog", "event history", "subscribers"]
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_EVENTS]/
//     |-- [GAMEASSIST_EVENTS:POLICY]
//     |-- [GAMEASSIST_EVENTS:DOMAIN]
//     `-- [GAMEASSIST_EVENTS:SERVICE]
// --- prose banner ---
// This bus is the only writer of GameAssist event history. It refuses to treat
// Foundry Hooks as the contract and refuses to await subscribers.

import { POLICY } from "./constants";
import type { DiagnosticSink } from "./diagnostics";
import { err, ok, type Result } from "./result";

// ============================================================================
// [GAMEASSIST_EVENTS:POLICY] BEGIN
// Section Title: Foundation event types
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_EVENTS",
//   area: "POLICY",
//   title: "Foundation event types",
//   guarantees: ["Foundation types are registered with catalog-owned visibility."],
//   provides: ["EVENT_TYPES", "EventVisibility"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// These types describe package meaning, not Hook traffic. Domain types such as
// health transitions wait for their owning service.
// -----------------------------------------------------------------------------

/**
 * Who may see an event in default list results.
 */
export type EventVisibility = "public" | "gm";

/**
 * Foundation GameAssist event types. Domain services register additional types.
 */
export const EVENT_TYPES = {
  lifecycleReady: "gameassist.lifecycle.ready",
  lifecycleStopped: "gameassist.lifecycle.stopped",
  featureStarted: "gameassist.feature.started",
  featureStopped: "gameassist.feature.stopped",
  featureFailed: "gameassist.feature.failed"
} as const;

export type FoundationEventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
// --- Notes & Comments ---
// Changed (v0.1.0): lock the first GameAssist event type catalog.
// [GAMEASSIST_EVENTS:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_EVENTS:DOMAIN] BEGIN
// Section Title: Event and publisher types
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_EVENTS",
//   area: "DOMAIN",
//   title: "Event types",
//   guarantees: ["Payloads are flat code-owned fields.", "Visibility is catalog-owned."],
//   provides: ["SemanticEvent", "PublishEvent", "EventPublisher"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Flat payloads keep accidental Document dumps out of history. Publishers cannot
// override the visibility registered for a type.
// -----------------------------------------------------------------------------

/**
 * JSON-safe, code-owned event fields. Nested objects are refused.
 */
export type EventPayload = Readonly<Record<string, string | number | boolean>>;

/**
 * One retained GameAssist semantic event.
 */
export interface SemanticEvent {
  id: string;
  type: string;
  visibility: EventVisibility;
  payload: EventPayload;
  /** Wall-clock milliseconds since Unix epoch. */
  at: number;
}

/**
 * Publisher input. Visibility is taken from the type catalog.
 */
export interface PublishEvent {
  id?: string;
  type: string;
  payload?: EventPayload;
  at?: number;
}

/**
 * Write port used by lifecycle and registry.
 */
export interface EventPublisher {
  /**
   * Records and delivers one semantic event.
   *
   * @param event - Type must already be registered. Id is generated when omitted.
   */
  publish(event: PublishEvent): Result<SemanticEvent>;
}

export interface EventTypeDefinition {
  type: string;
  visibility: EventVisibility;
}

export type EventHandler = (event: SemanticEvent) => void;
// --- Notes & Comments ---
// Changed (v0.1.0): define the in-process event contract.
// [GAMEASSIST_EVENTS:DOMAIN] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_EVENTS:SERVICE] BEGIN
// Section Title: Event bus
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_EVENTS",
//   area: "SERVICE",
//   title: "Event bus",
//   guarantees: [
//     "Duplicate ids with the same type are idempotent.",
//     "Subscriber throws do not block other subscribers.",
//     "Default list omits gm-visibility events."
//   ],
//   depends_on: ["[GAMEASSIST_EVENTS:DOMAIN]"],
//   provides: ["EventBus", "createEventBus"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Delivery is synchronous because Foundry will not await GameAssist callbacks
// either. History is a bounded ring. Type-specific subscribers run before
// wildcard subscribers, each in registration order.
// -----------------------------------------------------------------------------

/**
 * In-process GameAssist event bus.
 */
export interface EventBus extends EventPublisher {
  registerType(definition: EventTypeDefinition): Result<EventTypeDefinition>;
  subscribe(type: string, handler: EventHandler): () => void;
  list(options?: { includePrivileged?: boolean }): SemanticEvent[];
}

const FOUNDATION_TYPES: readonly EventTypeDefinition[] = [
  { type: EVENT_TYPES.lifecycleReady, visibility: "public" },
  { type: EVENT_TYPES.lifecycleStopped, visibility: "public" },
  { type: EVENT_TYPES.featureStarted, visibility: "public" },
  { type: EVENT_TYPES.featureStopped, visibility: "public" },
  { type: EVENT_TYPES.featureFailed, visibility: "public" }
];

const copyEvent = (event: SemanticEvent): SemanticEvent => ({
  id: event.id,
  type: event.type,
  visibility: event.visibility,
  payload: { ...event.payload },
  at: event.at
});

const isFlatPayload = (payload: EventPayload): boolean => {
  for (const value of Object.values(payload)) {
    const kind = typeof value;
    if (kind !== "string" && kind !== "number" && kind !== "boolean") {
      return false;
    }
  }
  return true;
};

/**
 * Creates an in-process event bus with foundation types pre-registered.
 *
 * @param options.diagnostics - Optional sink for isolated subscriber failures.
 * @param options.now - Optional wall-clock seam for tests.
 */
export function createEventBus(options: {
  diagnostics?: DiagnosticSink;
  now?: () => number;
} = {}): EventBus {
  const now = options.now ?? Date.now;
  const types = new Map<string, EventVisibility>();
  const history: SemanticEvent[] = [];
  const byId = new Map<string, SemanticEvent>();
  const subscribers = new Map<string, EventHandler[]>();
  let sequence = 0;

  for (const definition of FOUNDATION_TYPES) {
    types.set(definition.type, definition.visibility);
  }

  const remember = (event: SemanticEvent): void => {
    history.push(event);
    byId.set(event.id, event);
    if (history.length > POLICY.eventHistoryCapacity) {
      const oldest = history.shift();
      if (oldest) byId.delete(oldest.id);
    }
  };

  const deliver = (event: SemanticEvent): void => {
    const targeted = subscribers.get(event.type) ?? [];
    const wild = subscribers.get("*") ?? [];
    for (const handler of [...targeted, ...wild]) {
      try {
        handler(copyEvent(event));
      } catch {
        options.diagnostics?.record({
          level: "error",
          code: "events.subscriber.failed",
          message: `Subscriber for ${event.type} threw.`
        });
      }
    }
  };

  return {
    registerType(definition) {
      if (!POLICY.eventTypePattern.test(definition.type)) {
        return err("INVALID_ARGUMENT", { field: "type" });
      }
      if (definition.visibility !== "public" && definition.visibility !== "gm") {
        return err("INVALID_ARGUMENT", { field: "visibility" });
      }
      const existing = types.get(definition.type);
      if (existing) {
        if (existing !== definition.visibility) {
          return err("CONFLICT", { type: definition.type });
        }
        return ok({ type: definition.type, visibility: existing });
      }
      types.set(definition.type, definition.visibility);
      return ok({ type: definition.type, visibility: definition.visibility });
    },

    publish(input) {
      if (!POLICY.eventTypePattern.test(input.type)) {
        return err("INVALID_ARGUMENT", { field: "type" });
      }
      const visibility = types.get(input.type);
      if (!visibility) {
        return err("INVALID_ARGUMENT", { field: "type", reason: "unregistered" });
      }
      const payload = input.payload ?? {};
      if (!isFlatPayload(payload)) {
        return err("INVALID_ARGUMENT", { field: "payload" });
      }
      sequence += 1;
      const id = input.id ?? `${input.type}:${sequence}`;
      if (!POLICY.eventIdPattern.test(id)) {
        return err("INVALID_ARGUMENT", { field: "id" });
      }
      const existing = byId.get(id);
      if (existing) {
        if (existing.type !== input.type) {
          return err("CONFLICT", { id });
        }
        return ok(copyEvent(existing));
      }
      const event: SemanticEvent = {
        id,
        type: input.type,
        visibility,
        payload: { ...payload },
        at: input.at ?? now()
      };
      remember(event);
      deliver(event);
      return ok(copyEvent(event));
    },

    subscribe(type, handler) {
      if (type !== "*" && !POLICY.eventTypePattern.test(type)) {
        return () => undefined;
      }
      const list = subscribers.get(type) ?? [];
      list.push(handler);
      subscribers.set(type, list);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        const current = subscribers.get(type);
        if (!current) return;
        subscribers.set(
          type,
          current.filter((candidate) => candidate !== handler)
        );
      };
    },

    list(options) {
      const includePrivileged = options?.includePrivileged === true;
      return history
        .filter((event) => event.visibility === "public" || includePrivileged)
        .map(copyEvent);
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the in-process GameAssist event bus.
// Decision log:
//   CHOICE: catalog-owned visibility - ALT: publisher-supplied visibility;
//   REJECTED: a caller could mark privileged meaning public.
//   CHOICE: do not call Foundry Hooks - ALT: Hooks.callAll for third parties;
//   REJECTED: Hook bags are not a versioned GameAssist contract.
// [GAMEASSIST_EVENTS:SERVICE] END
// ============================================================================
