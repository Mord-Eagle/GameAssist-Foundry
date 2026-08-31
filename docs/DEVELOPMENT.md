# GameAssist-Foundry Development Workflow

**Audience:** Maintainers and development assistants

**Last updated:** 2026-08-31

This document records the local development, authorization, branch, and
Foundry-deployment practices for GameAssist-Foundry. It deliberately excludes
personal filesystem paths, credentials, tokens, and private campaign data.

## Locked Foundation Baseline

- Foundry VTT Version 14 Stable, Build 367.
- Official Dungeons & Dragons Fifth Edition system v5.3.3.
- Windows desktop host for the initial development environment.
- GameAssist planned package version 0.1.0.
- Development branch: `foundation-v0.1.0`.
- No required third-party Foundry modules.

`COMPATIBILITY.md` remains authoritative for evidence, package candidates, and
the distinction between a development baseline and a published support range.

## GitHub Authorization Model

Use normal Git credentials managed by the operating system or Git Credential
Manager. Never place a personal access token, password, credential-helper
output, or authenticated URL in source files, documentation, shell history,
prompts, or Git remotes.

The repository uses an HTTPS `origin`. Local network operations may require the
development tool to run outside its filesystem or credential sandbox so Git can
access the normal Windows certificate and credential stores. This is an
execution-boundary requirement, not a reason to disable TLS verification or
replace the remote with an embedded token.

Approved fallback:

- Use the authenticated GitHub connector for repository inspection, branch
  creation, issue or pull-request management, and carefully scoped remote file
  operations when local Git cannot reach its credential store.
- Return to local Git for ordinary source editing, diffs, tests, commits, and
  branch pushes whenever the checkout is available.

Prohibited workarounds:

- Disabling SSL or certificate verification.
- Storing a token in `origin`, a repository file, or a script.
- Broadly trusting every Git checkout with `safe.directory=*`.
- Committing directly to `main` during active feature development.
- Force-pushing or rewriting published history without explicit owner approval.

## Checkout Trust

Git's ownership safeguard may reject a checkout created by a sandbox account
and later used by the desktop account. Trust only the exact repository path with
Git's `safe.directory` setting. Do not disable the safeguard globally.

The repository-local commit author name is `Mord Eagle`. The GitHub account and
repository owner remain `Mord-Eagle`; these names serve different purposes.

## Branch Workflow

1. Confirm the repository and current branch.
2. Confirm the working tree and inspect existing changes.
3. Fetch and fast-forward the tracked development branch.
4. Make one focused group of related changes.
5. Run the checks appropriate to those changes.
6. Inspect the final diff for accidental deletion, documentation loss, or
   unrelated cleanup.
7. Commit with a concise description of the outcome.
8. Push the development branch.
9. Open a draft pull request only when the owner requests one or the milestone
   has enough coherent work to review.

`main` remains the stable repository line. The development branch may contain
planning and incomplete foundation work, but its documentation must distinguish
planned behavior from implemented and verified behavior.

## Permission Boundaries

| Operation | Normal authority | Additional approval |
| --- | --- | --- |
| Read or edit repository files | Local workspace | None when within authorized scope |
| Run local checks | Local workspace | Only when a tool needs external access |
| Fetch, pull, or push | Git Credential Manager | May require execution outside a credential sandbox |
| Create branches, commits, PRs, or issues | Owner authorization | Required by the working contract |
| Read live Foundry data | Read-only filesystem access | Narrow path permission when sandboxed |
| Write or deploy to live Foundry data | Explicit deployment step | Owner approval and a verified target path |
| Delete worlds, modules, packs, or state | Destructive operation | Explicit confirmation and backup |

## Foundry User-Data Layout

Use Foundry's portable placeholders in documentation:

```text
{userData}/
|-- Config/
|-- Data/
|   |-- modules/
|   |-- systems/
|   `-- worlds/
|-- Logs/
`-- Backups/
```

The GameAssist development deployment target will eventually be:

```text
{userData}/Data/modules/gameassist/
```

Do not hand-edit generated output in that directory. The Phase 1 build design
will choose a repeatable copy, link, or build-output deployment method. Until
then, the repository is the source of truth and no live module directory should
be created merely to appear further along.

## Development Worlds

Create these worlds after the first installable package shell exists:

1. **GameAssist Development** - Rapid iteration and diagnostics.
2. **GameAssist Acceptance** - Clean baseline with disposable Actors and
   controlled GM/player users.
3. **Campaign Template** - Prepared only after release gates pass.

An older campaign world is not a substitute for a clean acceptance world. Do
not migrate or modify a live campaign merely to test foundation code.

## Current Local Inventory

The initial inspection found:

- `dnd5e` v5.3.3, whose manifest supports Foundry 13.347 or later and is
  verified by its publisher for Foundry 14.
- Two legacy module folders last built for Foundry v11: 5e Spellblock Importer
  v1.2.1 and Universal Battlemap Importer v3.0.0.
- One legacy world created under Foundry v11.315 and `dnd5e` v3.1.2.

The legacy folders are not part of the GameAssist baseline. Leave them disabled
during development and acceptance. Removal or migration is separate campaign
housekeeping and must not be performed silently.

## Server Configuration

No custom server configuration is required for initial local module
development. Revisit hosting, proxy, certificate, port, and remote-player
configuration only when the campaign deployment model requires it. GameAssist
must not assume a particular hosting provider or network topology.

## Compendia

Use the official `dnd5e` SRD system compendia for generic development data.
Create disposable world content for tests that need controlled edge cases.
Do not create or bundle a GameAssist compendium until an approved component
design identifies reusable content that is original or properly licensed and
cannot be served cleanly by existing system, module, or world packs.

## Recovery

If local Git authentication fails:

1. Confirm the remote is the expected HTTPS repository without embedded
   credentials.
2. Confirm Git Credential Manager is configured.
3. Retry the network operation with access to the normal Windows credential and
   certificate stores.
4. Use the GitHub connector for a scoped operation if the local execution
   environment still cannot reach those stores.
5. Do not disable TLS verification or expose credentials to make the error
   disappear.

If Foundry filesystem access fails, request the narrowest read or write access
to the exact user-data subtree required by the task. Read access never implies
permission to deploy, migrate, or delete live data.
