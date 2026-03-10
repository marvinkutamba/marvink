---
name: agency-agents
description: Meta-skill for The Agency on Codex. Use when the user wants a specialized Agency role, multi-role coordination, or the NEXUS orchestration workflow inside Codex.
---

# The Agency for Codex

`agency-agents` packages the full Agency roster as one public Codex skill with
internal role sub-skills under `sub/` and NEXUS references under `references/`.

## When To Use

- The user asks for The Agency, NEXUS, or a named Agency specialist.
- The work benefits from a temporary specialist persona instead of a generic assistant.
- The task needs multi-role coordination across product, design, engineering, QA, launch, or operations.

## Operating Model

1. Decide whether the task needs one specialist, a small squad, or a NEXUS flow.
2. Read `references/roster.md` if the exact role is not obvious.
3. Load only the relevant `sub/*/subskill.md` files.
4. Read `references/strategy/QUICKSTART.md` before any full-pipeline orchestration.
5. Keep project truth in the repo being edited; Agency roles are execution overlays, not replacement project docs.

## Routing Heuristics

- UI, frontend, components, accessibility, browser UX -> frontend, UI, UX, or whimsy roles
- APIs, infrastructure, security, data, AI, mobile -> backend, DevOps, security, data, AI, or mobile roles
- Discovery, prioritization, project planning -> product and project-management roles
- QA, evidence, performance, API verification, accessibility -> testing roles
- Growth, content, social, launch, app stores -> marketing roles
- Ops, finance, compliance, analytics, support -> support roles
- Spatial/XR/visionOS workflows -> spatial-computing roles
- Cross-functional orchestration -> `sub/agents-orchestrator/subskill.md` plus NEXUS references

## Key References

- Roster: `references/roster.md`
- NEXUS quick start: `references/strategy/QUICKSTART.md`
- Master strategy: `references/strategy/nexus-strategy.md`
- Phase playbooks: `references/strategy/playbooks/`
- Scenario runbooks: `references/strategy/runbooks/`
- Coordination prompts/templates: `references/strategy/coordination/`
- Worked examples: `references/examples/`

## Minimal Loading Rule

Do not load the whole catalog by default.

Recommended sequence:

1. Read this file.
2. Read `references/roster.md` only if role selection is unclear.
3. Load 1-3 role sub-skills from `sub/`.
4. Pull in NEXUS references only for orchestration-heavy work.
5. Return to the project repo and execute there.
