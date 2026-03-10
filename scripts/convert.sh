#!/usr/bin/env bash
#
# convert.sh — Convert agency agent .md files into tool-specific formats.
#
# Reads all agent files from the standard category directories and outputs
# converted files to integrations/<tool>/. Run this to regenerate all
# integration files after adding or modifying agents.
#
# Usage:
#   ./scripts/convert.sh [--tool <name>] [--out <dir>] [--help]
#
# Tools:
#   codex        — Codex meta-skill with internal sub-skills (~/.codex/skills/)
#   antigravity  — Antigravity skill files (~/.gemini/antigravity/skills/)
#   gemini-cli   — Gemini CLI extension (skills/ + gemini-extension.json)
#   opencode     — OpenCode agent files (.opencode/agent/*.md)
#   cursor       — Cursor rule files (.cursor/rules/*.mdc)
#   aider        — Single CONVENTIONS.md for Aider
#   windsurf     — Single .windsurfrules for Windsurf
#   all          — All tools (default)
#
# Output is written to integrations/<tool>/ relative to the repo root.
# This script never touches user config dirs — see install.sh for that.

set -euo pipefail

# --- Colour helpers ---
if [[ -t 1 ]]; then
  GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'; RED=$'\033[0;31m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  GREEN=''; YELLOW=''; RED=''; BOLD=''; RESET=''
fi

info()    { printf "${GREEN}[OK]${RESET}  %s\n" "$*"; }
warn()    { printf "${YELLOW}[!!]${RESET}  %s\n" "$*"; }
error()   { printf "${RED}[ERR]${RESET} %s\n" "$*" >&2; }
header()  { echo -e "\n${BOLD}$*${RESET}"; }

# --- Paths ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="$REPO_ROOT/integrations"
TODAY="$(date +%Y-%m-%d)"

AGENT_DIRS=(
  design engineering marketing product project-management
  testing support spatial-computing specialized
)
CODEX_SKILL_NAME="agency-agents"

# --- Usage ---
usage() {
  sed -n '3,22p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

# --- Frontmatter helpers ---

# Extract a single field value from YAML frontmatter block.
# Usage: get_field <field> <file>
get_field() {
  local field="$1" file="$2"
  awk -v f="$field" '
    /^---$/ { fm++; next }
    fm == 1 && $0 ~ "^" f ": " { sub("^" f ": ", ""); print; exit }
  ' "$file"
}

# Strip the leading frontmatter block and return only the body.
# Usage: get_body <file>
get_body() {
  awk 'BEGIN{fm=0} /^---$/{fm++; next} fm>=2{print}' "$1"
}

# Convert a human-readable agent name to a lowercase kebab-case slug.
# "Frontend Developer" → "frontend-developer"
slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//'
}

title_case() {
  echo "$1" | tr '-' ' ' | awk '{ for (i = 1; i <= NF; i++) $i = toupper(substr($i,1,1)) substr($i,2); print }'
}

# --- Per-tool converters ---

convert_antigravity() {
  local file="$1"
  local name description slug outdir outfile body

  name="$(get_field "name" "$file")"
  description="$(get_field "description" "$file")"
  slug="agency-$(slugify "$name")"
  body="$(get_body "$file")"

  outdir="$OUT_DIR/antigravity/$slug"
  outfile="$outdir/SKILL.md"
  mkdir -p "$outdir"

  # Antigravity SKILL.md format mirrors community skills in ~/.gemini/antigravity/skills/
  cat > "$outfile" <<HEREDOC
---
name: ${slug}
description: ${description}
risk: low
source: community
date_added: '${TODAY}'
---
${body}
HEREDOC
}

convert_gemini_cli() {
  local file="$1"
  local name description slug outdir outfile body

  name="$(get_field "name" "$file")"
  description="$(get_field "description" "$file")"
  slug="$(slugify "$name")"
  body="$(get_body "$file")"

  outdir="$OUT_DIR/gemini-cli/skills/$slug"
  outfile="$outdir/SKILL.md"
  mkdir -p "$outdir"

  # Gemini CLI skill format: minimal frontmatter (name + description only)
  cat > "$outfile" <<HEREDOC
---
name: ${slug}
description: ${description}
---
${body}
HEREDOC
}

convert_opencode() {
  local file="$1"
  local name description color slug outfile body

  name="$(get_field "name" "$file")"
  description="$(get_field "description" "$file")"
  color="$(get_field "color" "$file")"
  slug="$(slugify "$name")"
  body="$(get_body "$file")"

  outfile="$OUT_DIR/opencode/agent/${slug}.md"
  mkdir -p "$OUT_DIR/opencode/agent"

  # OpenCode agent format: same as the source format (.md with frontmatter).
  # color field is supported. No conversion needed beyond directory placement.
  cat > "$outfile" <<HEREDOC
---
name: ${name}
description: ${description}
color: ${color}
---
${body}
HEREDOC
}

convert_cursor() {
  local file="$1"
  local name description slug outfile body

  name="$(get_field "name" "$file")"
  description="$(get_field "description" "$file")"
  slug="$(slugify "$name")"
  body="$(get_body "$file")"

  outfile="$OUT_DIR/cursor/rules/${slug}.mdc"
  mkdir -p "$OUT_DIR/cursor/rules"

  # Cursor .mdc format: description + globs + alwaysApply frontmatter
  cat > "$outfile" <<HEREDOC
---
description: ${description}
globs: ""
alwaysApply: false
---
${body}
HEREDOC
}

CODEX_ROSTER_TMP="$(mktemp)"
CODEX_CURRENT_CATEGORY=""

init_codex() {
  local dest="$OUT_DIR/codex/$CODEX_SKILL_NAME"
  rm -rf "$dest"
  mkdir -p "$dest/sub" "$dest/references" "$dest/agents"
  CODEX_CURRENT_CATEGORY=""

  cat > "$CODEX_ROSTER_TMP" <<'HEREDOC'
# The Agency Roster for Codex

Use this file to pick the exact specialist sub-skill to load. Each entry maps
an original Agency agent to an internal Codex `sub/.../subskill.md` file.
HEREDOC
}

convert_codex() {
  local file="$1"
  local name description slug outfile body category category_title source_name

  name="$(get_field "name" "$file")"
  description="$(get_field "description" "$file")"
  slug="$(basename "$file" .md)"
  body="$(get_body "$file")"
  category="$(basename "$(dirname "$file")")"
  category_title="$(title_case "$category")"
  source_name="$(basename "$file")"

  outfile="$OUT_DIR/codex/$CODEX_SKILL_NAME/sub/$slug/subskill.md"
  mkdir -p "$(dirname "$outfile")"

  cat > "$outfile" <<HEREDOC
# ${name}

- Category: \`${category_title}\`
- Description: ${description}
- Source: \`${category}/${source_name}\`

${body}
HEREDOC

  if [[ "$category" != "$CODEX_CURRENT_CATEGORY" ]]; then
    printf "\n## %s\n" "$category_title" >> "$CODEX_ROSTER_TMP"
    CODEX_CURRENT_CATEGORY="$category"
  fi

  cat >> "$CODEX_ROSTER_TMP" <<HEREDOC

### ${name}
- Description: ${description}
- Load: \`sub/${slug}/subskill.md\`
- Source: \`${category}/${source_name}\`
HEREDOC
}

# Aider and Windsurf are single-file formats — accumulate into temp files
# then write at the end.
AIDER_TMP="$(mktemp)"
WINDSURF_TMP="$(mktemp)"
trap 'rm -f "$AIDER_TMP" "$WINDSURF_TMP" "$CODEX_ROSTER_TMP"' EXIT

# Write Aider/Windsurf headers once
cat > "$AIDER_TMP" <<'HEREDOC'
# The Agency — AI Agent Conventions
#
# This file provides Aider with the full roster of specialized AI agents from
# The Agency (https://github.com/msitarzewski/agency-agents).
#
# To activate an agent, reference it by name in your Aider session prompt, e.g.:
#   "Use the Frontend Developer agent to review this component."
#
# Generated by scripts/convert.sh — do not edit manually.

HEREDOC

cat > "$WINDSURF_TMP" <<'HEREDOC'
# The Agency — AI Agent Rules for Windsurf
#
# Full roster of specialized AI agents from The Agency.
# To activate an agent, reference it by name in your Windsurf conversation.
#
# Generated by scripts/convert.sh — do not edit manually.

HEREDOC

accumulate_aider() {
  local file="$1"
  local name description body

  name="$(get_field "name" "$file")"
  description="$(get_field "description" "$file")"
  body="$(get_body "$file")"

  cat >> "$AIDER_TMP" <<HEREDOC

---

## ${name}

> ${description}

${body}
HEREDOC
}

accumulate_windsurf() {
  local file="$1"
  local name description body

  name="$(get_field "name" "$file")"
  description="$(get_field "description" "$file")"
  body="$(get_body "$file")"

  cat >> "$WINDSURF_TMP" <<HEREDOC

================================================================================
## ${name}
${description}
================================================================================

${body}

HEREDOC
}

# --- Main loop ---

run_conversions() {
  local tool="$1"
  local count=0

  if [[ "$tool" == "codex" ]]; then
    init_codex
  fi

  for dir in "${AGENT_DIRS[@]}"; do
    local dirpath="$REPO_ROOT/$dir"
    [[ -d "$dirpath" ]] || continue

    while IFS= read -r -d '' file; do
      # Skip files without frontmatter (non-agent docs like QUICKSTART.md)
      local first_line
      first_line="$(head -1 "$file")"
      [[ "$first_line" == "---" ]] || continue

      local name
      name="$(get_field "name" "$file")"
      [[ -n "$name" ]] || continue

      case "$tool" in
        codex)        convert_codex        "$file" ;;
        antigravity) convert_antigravity "$file" ;;
        gemini-cli)  convert_gemini_cli  "$file" ;;
        opencode)    convert_opencode    "$file" ;;
        cursor)      convert_cursor      "$file" ;;
        aider)       accumulate_aider    "$file" ;;
        windsurf)    accumulate_windsurf "$file" ;;
      esac

      (( count++ )) || true
    done < <(find "$dirpath" -maxdepth 1 -name "*.md" -type f -print0 | sort -z)
  done

  echo "$count"
}

write_single_file_outputs() {
  # Aider
  mkdir -p "$OUT_DIR/aider"
  cp "$AIDER_TMP" "$OUT_DIR/aider/CONVENTIONS.md"

  # Windsurf
  mkdir -p "$OUT_DIR/windsurf"
  cp "$WINDSURF_TMP" "$OUT_DIR/windsurf/.windsurfrules"
}

write_codex_outputs() {
  local dest="$OUT_DIR/codex/$CODEX_SKILL_NAME"

  mkdir -p "$dest/references" "$dest/agents"

  cat > "$dest/SKILL.md" <<'HEREDOC'
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
HEREDOC

  cat > "$dest/agents/openai.yaml" <<'HEREDOC'
interface:
  display_name: "The Agency"
  short_description: "Agency Codex meta-skill with NEXUS orchestration"
  default_prompt: "Use $agency-agents to pick the right Agency specialist or run a NEXUS-style multi-role workflow inside Codex."
HEREDOC

  cp "$CODEX_ROSTER_TMP" "$dest/references/roster.md"
  cp -R "$REPO_ROOT/strategy" "$dest/references/"
  cp -R "$REPO_ROOT/examples" "$dest/references/"
}

# --- Entry point ---

main() {
  local tool="all"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --tool) tool="${2:?'--tool requires a value'}"; shift 2 ;;
      --out)  OUT_DIR="${2:?'--out requires a value'}"; shift 2 ;;
      --help|-h) usage ;;
      *) error "Unknown option: $1"; usage ;;
    esac
  done

  local valid_tools=("codex" "antigravity" "gemini-cli" "opencode" "cursor" "aider" "windsurf" "all")
  local valid=false
  for t in "${valid_tools[@]}"; do [[ "$t" == "$tool" ]] && valid=true && break; done
  if ! $valid; then
    error "Unknown tool '$tool'. Valid: ${valid_tools[*]}"
    exit 1
  fi

  header "The Agency -- Converting agents to tool-specific formats"
  echo "  Repo:   $REPO_ROOT"
  echo "  Output: $OUT_DIR"
  echo "  Tool:   $tool"
  echo "  Date:   $TODAY"

  local tools_to_run=()
  if [[ "$tool" == "all" ]]; then
    tools_to_run=("codex" "antigravity" "gemini-cli" "opencode" "cursor" "aider" "windsurf")
  else
    tools_to_run=("$tool")
  fi

  local total=0
  for t in "${tools_to_run[@]}"; do
    header "Converting: $t"
    local count
    count="$(run_conversions "$t")"
    total=$(( total + count ))

    # Gemini CLI also needs the extension manifest
    if [[ "$t" == "gemini-cli" ]]; then
      mkdir -p "$OUT_DIR/gemini-cli"
      cat > "$OUT_DIR/gemini-cli/gemini-extension.json" <<'HEREDOC'
{
  "name": "agency-agents",
  "version": "1.0.0"
}
HEREDOC
      info "Wrote gemini-extension.json"
    fi

    if [[ "$t" == "codex" ]]; then
      write_codex_outputs
      info "Wrote Codex skill package"
    fi

    info "Converted $count agents for $t"
  done

  # Write single-file outputs after accumulation
  if [[ "$tool" == "all" || "$tool" == "aider" || "$tool" == "windsurf" ]]; then
    write_single_file_outputs
    info "Wrote integrations/aider/CONVENTIONS.md"
    info "Wrote integrations/windsurf/.windsurfrules"
  fi

  echo ""
  info "Done. Total conversions: $total"
}

main "$@"
