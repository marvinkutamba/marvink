#!/usr/bin/env bash
#
# setup-project.sh — Bootstrap a project's .kiro/ directory with role-based agents.
#
# Interactive: shows available profiles, lets you pick which agents to install.
# Non-interactive: pass profile names as arguments.
#
# Usage:
#   ./integrations/kiro/setup-project.sh                    # interactive
#   ./integrations/kiro/setup-project.sh fullstack-dev qa   # non-interactive
#   ./integrations/kiro/setup-project.sh --list             # show profiles
#   ./integrations/kiro/setup-project.sh --dir /path/to/project fullstack-dev

set -euo pipefail

# --- Colours ---
if [[ -t 1 ]]; then
  GREEN=$'\033[0;32m'; CYAN=$'\033[0;36m'; YELLOW=$'\033[1;33m'
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  GREEN=''; CYAN=''; YELLOW=''; BOLD=''; DIM=''; RESET=''
fi

info()   { printf "${GREEN}✓${RESET} %s\n" "$*"; }
warn()   { printf "${YELLOW}!${RESET} %s\n" "$*"; }
header() { printf "\n${BOLD}%s${RESET}\n" "$*"; }

# --- Paths ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGENTS_SRC="$SCRIPT_DIR/agents/project"
SKILLS_LIB="${HOME}/.kiro/skills-library"
PROJECT_DIR="$(pwd)"

# --- Profile list from generated agents ---
get_profiles() {
  ls "$AGENTS_SRC"/*.json 2>/dev/null | xargs -I{} basename {} .json | sort
}

show_profiles() {
  header "Available project profiles"
  echo ""
  for p in $(get_profiles); do
    local desc
    desc=$(python3 -c "import json; print(json.load(open('$AGENTS_SRC/$p.json'))['description'])" 2>/dev/null || echo "")
    printf "  ${CYAN}%-20s${RESET} %s\n" "$p" "$desc"
  done
  echo ""
}

# --- Install a profile into project ---
install_profile() {
  local profile="$1" target="$2"
  local src="$AGENTS_SRC/$profile.json"

  if [[ ! -f "$src" ]]; then
    warn "Profile '$profile' not found, skipping"
    return 1
  fi

  mkdir -p "$target/agents"
  cp "$src" "$target/agents/$profile.json"
  info "Installed agent: $profile"
}

# --- Interactive selector ---
interactive_select() {
  local profiles=()
  mapfile -t profiles < <(get_profiles)
  local count=${#profiles[@]}

  if [[ $count -eq 0 ]]; then
    warn "No project profiles found. Run ./scripts/convert.sh --tool kiro first."
    exit 1
  fi

  header "Kiro CLI — Project Setup"
  echo "  Project: $PROJECT_DIR"
  echo ""
  echo "  Select profiles to install (space-separated numbers, or 'a' for all):"
  echo ""

  for i in "${!profiles[@]}"; do
    local p="${profiles[$i]}"
    local desc
    desc=$(python3 -c "import json; print(json.load(open('$AGENTS_SRC/$p.json'))['description'])" 2>/dev/null || echo "")
    printf "  ${CYAN}%2d)${RESET} %-20s ${DIM}%s${RESET}\n" $((i+1)) "$p" "$desc"
  done

  echo ""
  printf "  ${BOLD}Choose [1-%d/a/q]:${RESET} " "$count"
  read -r choice

  if [[ "$choice" == "q" ]]; then
    echo "Cancelled."
    exit 0
  fi

  local selected=()
  if [[ "$choice" == "a" ]]; then
    selected=("${profiles[@]}")
  else
    for num in $choice; do
      if [[ "$num" =~ ^[0-9]+$ ]] && (( num >= 1 && num <= count )); then
        selected+=("${profiles[$((num-1))]}")
      fi
    done
  fi

  if [[ ${#selected[@]} -eq 0 ]]; then
    warn "No valid selection."
    exit 1
  fi

  local target="$PROJECT_DIR/.kiro"
  mkdir -p "$target/agents"

  for p in "${selected[@]}"; do
    install_profile "$p" "$target"
  done

  echo ""
  info "Project bootstrapped: $target/"
  echo ""
  echo "  Switch agents in Kiro CLI:"
  for p in "${selected[@]}"; do
    echo "    /agent swap $p"
  done
  echo ""
}

# --- Main ---
main() {
  local list_only=false
  local profiles=()

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --list|-l) list_only=true; shift ;;
      --dir|-d)  PROJECT_DIR="${2:?'--dir requires a path'}"; shift 2 ;;
      --help|-h)
        echo "Usage: setup-project.sh [--list] [--dir PATH] [PROFILE ...]"
        exit 0 ;;
      -*) echo "Unknown option: $1"; exit 1 ;;
      *)  profiles+=("$1"); shift ;;
    esac
  done

  # Check prerequisites
  if [[ ! -d "$AGENTS_SRC" ]]; then
    warn "Agent configs not found. Run ./scripts/convert.sh --tool kiro first."
    exit 1
  fi

  if $list_only; then
    show_profiles
    exit 0
  fi

  # Check skills-library exists
  if [[ ! -d "$SKILLS_LIB" ]]; then
    warn "Skills library not found at $SKILLS_LIB"
    echo "  Run ./scripts/install.sh --tool kiro first to install the skills library."
    exit 1
  fi

  if [[ ${#profiles[@]} -eq 0 ]]; then
    interactive_select
  else
    local target="$PROJECT_DIR/.kiro"
    mkdir -p "$target/agents"
    for p in "${profiles[@]}"; do
      install_profile "$p" "$target"
    done
    info "Installed ${#profiles[@]} profile(s) to $target/"
  fi
}

main "$@"
