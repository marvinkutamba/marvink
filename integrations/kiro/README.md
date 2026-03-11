# Kiro CLI Integration

Converts all Agency agents into **Kiro CLI skills** and generates **role-based agent configs** with curated skill sets. Solves the "115 skills × every conversation" token problem by using progressive loading and scoped agents.

## The Problem

Loading all 116 skills globally into `~/.kiro/skills/` costs ~8,000 tokens per message before you type anything. Most conversations only need 3–5 skills.

## The Solution

```
~/.kiro/
├── skills-library/          📦 All 116 skills (NOT auto-loaded)
│   ├── agency-frontend-developer/SKILL.md
│   ├── agency-backend-architect/SKILL.md
│   └── ...
│
├── skills/                  🌐 2–3 universal skills (always loaded)
│   └── agency-zk-steward/SKILL.md
│
├── agents/                  🌐 Global agents (role-based, load own skills)
│   ├── orchestrator.json    → loads orchestrator + studio-producer skills
│   ├── researcher.json      → loads trend-researcher + analytics skills
│   ├── strategist.json      → loads strategy + executive-summary skills
│   └── writer.json          → loads technical-writer + content skills
│
└── settings/
    └── mcp.json             🔌 Global MCPs (firecrawl, context7, etc.)

<project>/.kiro/
├── agents/                  🎯 Project agents (tech-stack specific)
│   ├── fullstack-dev.json   → loads frontend + backend + security skills
│   └── qa.json              → loads testing + accessibility skills
└── skills/                  🎯 Project skills (optional, symlinks)
```

Each agent uses `skill://` URIs in its `resources` field, so skills are **progressively loaded** — only metadata at startup, full content on demand. Result: ~500 tokens instead of ~8,000.

## Quick Start

```bash
# 1. Generate skills + agent configs
./scripts/convert.sh --tool kiro

# 2. Install globally
./scripts/install.sh --tool kiro

# 3. Bootstrap a project (interactive)
./integrations/kiro/setup-project.sh
```

## What Gets Installed

### Global (`~/.kiro/`)

| Component | Path | Purpose |
|-----------|------|---------|
| Skills library | `skills-library/` | All 116 skills, not auto-loaded |
| Global agents | `agents/` | 4 universal agents (orchestrator, researcher, strategist, writer) |

### Project (`<project>/.kiro/`)

Created by `setup-project.sh` based on your tech stack:

| Profile | Skills loaded | Use case |
|---------|--------------|----------|
| `fullstack-dev` | frontend, backend, security, devops | Web apps |
| `frontend-dev` | frontend, ui-designer, ux-architect, accessibility | UI work |
| `backend-dev` | backend, security, data-engineer, api-tester | APIs & data |
| `ai-ml-dev` | ai-engineer, backend, data-engineer, model-qa | ML projects |
| `devops` | devops, security, infrastructure, incident-response | Infra |
| `mobile-dev` | mobile, ui-designer, app-store-optimizer, perf | Mobile apps |
| `marketing` | growth, content, seo, social, tiktok | Marketing |
| `china-marketing` | xiaohongshu, bilibili, wechat, baidu, kuaishou | China market |
| `paid-media` | ppc, creative, search-query, social, tracking | Ad campaigns |
| `qa` | evidence, reality-checker, api, perf, accessibility | Testing |
| `pm` | project-manager, sprint, shepherd, feedback | Project mgmt |
| `design` | ui, ux-research, ux-architect, brand, whimsy | Design |
| `game-dev` | game-designer, level, tech-artist, audio, narrative | Games |
| `sales` | sales-engineer, account, customer-success, revops | Sales |
| `security` | security, threat-detection, compliance, legal | Security |

## Usage

### Switch agents in Kiro CLI

```
/agent swap fullstack-dev
/agent swap researcher
```

Or use keyboard shortcuts (defined per agent):

| Shortcut | Agent |
|----------|-------|
| `Ctrl+Shift+D` | fullstack-dev |
| `Ctrl+Shift+R` | researcher |
| `Ctrl+Shift+O` | orchestrator |
| `Ctrl+Shift+M` | marketing |

### Customize profiles

Edit `integrations/kiro/profiles.yaml` to add/modify profiles, then regenerate:

```bash
./scripts/convert.sh --tool kiro
./scripts/install.sh --tool kiro
```

### Add skills to a project manually

```bash
# Symlink specific skills into your project
cd /your/project
mkdir -p .kiro/skills
ln -s ~/.kiro/skills-library/agency-frontend-developer .kiro/skills/
```

## Architecture

```
profiles.yaml          ← Define role → skills mapping
       │
  convert.sh --tool kiro
       │
       ├── skills-library/    ← 116 SKILL.md files (from agent .md sources)
       └── agents/
           ├── global/        ← 4 agent JSON configs
           └── project/       ← 15 agent JSON configs (templates)
                  │
            install.sh --tool kiro
                  │
                  ├── ~/.kiro/skills-library/   ← All skills
                  ├── ~/.kiro/agents/           ← Global agents
                  │
            setup-project.sh
                  │
                  └── <project>/.kiro/agents/   ← Project agents
```

## Token Comparison

| Setup | Skills in context | ~Tokens/message |
|-------|------------------|-----------------|
| All skills global | 116 (full metadata) | ~8,000 |
| This integration (agent with 4 skills) | 4 (progressive) | ~300–500 |
| **Savings** | | **~95%** |

## Files

```
integrations/kiro/
├── README.md              ← This file
├── profiles.yaml          ← Role → skills mapping config
├── setup-project.sh       ← Interactive project bootstrapper
├── skills-library/        ← Generated SKILL.md files (116)
│   ├── agency-frontend-developer/SKILL.md
│   └── ...
└── agents/                ← Generated agent JSON configs
    ├── global/            ← orchestrator, researcher, strategist, writer
    └── project/           ← fullstack-dev, marketing, qa, etc.
```
