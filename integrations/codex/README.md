# Codex Integration

The Agency is packaged for Codex as one public meta-skill named
`agency-agents`. The public skill stays small, while all specialists live as
internal sub-skills under `sub/`, and the NEXUS playbooks/runbooks live under
`references/`.

## Install

```bash
./scripts/convert.sh --tool codex
./scripts/install.sh --tool codex
```

This copies `integrations/codex/agency-agents/` to
`~/.codex/skills/agency-agents/`.

## Activate The Skill

In Codex, invoke the skill directly:

```
Use $agency-agents to choose the right Agency specialist for this repo.
```

```
Use $agency-agents and run a NEXUS-style workflow for this feature.
```

## Skill Layout

```text
~/.codex/skills/agency-agents/
  SKILL.md
  agents/openai.yaml
  sub/<agent-slug>/subskill.md
  references/roster.md
  references/strategy/...
  references/examples/...
```

## Why One Skill Instead Of Dozens Of Public Skills

Codex works best when the public skill list stays compact. The Agency therefore
ships as one public skill that routes into internal role files on demand,
instead of exposing dozens of separate public skills.

## Regenerate

```bash
./scripts/convert.sh --tool codex
```
