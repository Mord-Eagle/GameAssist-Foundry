# Phase 0 Tooling and Package Strategy

**Status:** Recorded for implementation; live Foundry verification remains open

**Owner decision date:** 2026-09-20

**Planned project version:** 0.1.0

**Related roadmap phase:** Phase 0 (Architecture and Compatibility Record)

This record closes the Phase 0 work that Architecture listed as still open:
TypeScript, build, localization, templates, style, tests, manifest, packaging,
and release validation. It does not freeze a public runtime API.

Owner-approved direction already in `ARCHITECTURE.md` and `ROADMAP.md` is
treated as given. Choices below are the first recorded implementation strategy
for that direction. If a later design review rejects one of them, update this
record rather than quietly drifting in code.

## Approved From Existing Project Records

- Authored runtime source is TypeScript compiled to browser ESM.
- Node.js may be used for build and test tooling and must not leak into shipped
  client code.
- `src/` is hand-authored; `dist/` is generated and is not hand-edited.
- No broad public `game.gameAssist` API is frozen during foundation work.
- Foundry VTT Version 14 Stable, Build 367 and official `dnd5e` v5.3.3 are the
  locked development baseline, not a published compatibility range.
- Localization uses Foundry language files rather than embedded user-facing
  prose.
- UI will use supported Foundry Application V2 APIs when Control Center exists.

## Toolchain Decisions

### Language and module format

- **Choice:** TypeScript 5.x with `strict` enabled, authored as ESM.
- **Emit:** One bundled browser ESM file at `dist/gameassist.mjs`.
- **Why:** Foundry loads `esmodules` from the package root. A single ESM bundle
  keeps import graphs out of the manifest and prevents Node-style paths from
  leaking into the client.
- **Rejected:** JavaScript-only source (loses the type contract MECHSUITS and
  adapters will need). `tsc` emitting many files with import specifiers
  (heavier manifest and more brittle runtime resolution).

### Bundler

- **Choice:** esbuild via `scripts/build.mjs`.
- **Settings:** `platform: "browser"`, `format: "esm"`, `target: "es2022"`,
  no minify during foundation, source maps on.
- **Why:** Fast, small, easy to audit, and sufficient for a module that must
  not include Node built-ins. Foundation development does not yet need HMR.
- **Rejected:** Vite as the first bundler (useful later if a Foundry-safe live
  reload workflow is proven; extra surface area now). Webpack (heavier than the
  problem). Shipping unbundled TypeScript (Foundry will not compile it).

### Package manager and Node

- **Choice:** npm with a committed lockfile. Node 20 or later (`engines`).
- **Why:** npm is the default toolchain in this development environment and
  needs no extra runtime. The lockfile makes installs reproducible.
- **Rejected:** pnpm or Yarn as a requirement (not present as a project
  standard). Committing `node_modules`.

### Static checks

- **Choice:** `tsc --noEmit` as the required static check.
- **Deferred:** ESLint and Prettier. TypeScript strictness covers the first
  shell. A lint/format pass should be added when UI and adapters introduce
  enough style surface to justify a shared config.
- **Foundry types:** Do not depend on `foundry-vtt-types` / `fvtt-types` yet.
  Community v14 types are not an owner-verified baseline. Host access goes
  through a narrow `PackageHost` port and a tiny Foundry adapter.

### Tests

- **Choice:** Vitest for Node unit and contract tests of core services.
- **Scope now:** Lifecycle phase machine, feature registry, result helpers,
  diagnostic buffer, demo-beacon start/stop, and host fakes.
- **Not claimed:** Vitest results are not live Foundry evidence.
- **Deferred:** Playwright or a Foundry test harness until the package can be
  deployed into a clean acceptance world.
- **Rejected:** Making the first tests boot a real Foundry process (no Foundry
  runtime is part of this repository's current environment).

### Manifest

- **Choice:** Hand-authored `module.json` at the repository root. The Foundry
  package id is `gameassist`.
- **Compatibility fields:** `minimum` 14 and `verified` 14.367 record the
  locked development target. They are not a claim that live acceptance has
  passed.
- **System relationship:** `dnd5e` with compatibility `minimum`/`verified`
  5.3.3. GameAssist remains a D&D 5E toolkit; it is not a system-agnostic
  library.
- **Socket:** `false` until the authority service exists.
- **Compendium packs:** none.
- **Release URLs:** omit `manifest` and `download` until a versioned release
  exists.

### Localization

- **Choice:** `lang/en.json` with a `GAMEASSIST` namespace.
- **Now:** Keys exist so the manifest path is valid. Feature titles in the
  first shell may still be developer English because Control Center and
  settings UI are not implemented.
- **Later:** Every user-facing string moves behind Foundry localization.

### Templates

- **Choice:** Handlebars templates under `templates/` when a Foundry
  Application V2 view exists.
- **Now:** No template files. An empty folder is not created for ceremony.

### Styles

- **Choice:** Plain CSS at `styles/gameassist.css`.
- **Now:** The file exists so the manifest path is valid. Control Center will
  own real layout rules.
- **Rejected:** SCSS as a first requirement (extra build step without UI).

### Packaging and deployment

- **Source of truth:** this repository.
- **Foundry load layout:** `{userData}/Data/modules/gameassist/` should contain
  `module.json`, `dist/`, `lang/`, `styles/`, and later `templates/`.
- **First deployment method:** symlink or copy the repository root after
  `npm run build`. Do not hand-edit files inside a live Foundry module copy.
- **Release archive:** deferred until Phase 7 / first publishable version. A
  future pack script must prove that the zip contains the built `dist/` output
  matching `module.json`.
- **Worlds:** Development, Acceptance, and Campaign Template worlds are created
  only after this package can be enabled in Foundry. They are not created as
  files in this repository.

### Public versus internal contracts

- Internal TypeScript exports may be imported by tests and by later GameAssist
  modules in this package.
- Nothing is assigned to `game.gameAssist` in this phase.
- Feature modules depend on core services, not on each other.
- Optional integrations will enter through adapters, not direct imports.

### Release validation (foundation)

Required for every source change in this slice:

1. `npm run typecheck`
2. `npm test`
3. `npm run build`

Not required until a live Foundry world exists:

- Enable/disable inside Foundry
- Multi-client checks
- Permission and privacy live checks
- Migration live checks

## Open Follow-ups

- ESLint / Prettier configuration.
- Verified Foundry v14 type package, if one is later owner-approved.
- Repeatable symlink/copy helper that never writes outside an owner-confirmed
  `{userData}` path.
- Release zip + manifest URL publication flow.
- Live Foundry smoke harness.

## Change Notes

- 2026-09-20 - Recorded the first TypeScript, esbuild, Vitest, manifest, and
  validation strategy so Phase 1 implementation is not a silent toolchain
  invention.
