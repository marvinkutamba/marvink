# LifePro — Project Specification

## NEXUS Pipeline Configuration
- **Mode**: NEXUS-Micro (1-5 days)
- **Active Agents**: 8 (see Section 4)
- **Phases**: 0 (condensed) → 1 → 2 → 3 → Quality Gate

---

## 1. Project Overview

**LifePro** is an all-in-one life optimizer mobile application for B2C consumers. It consolidates health tracking, goal setting, habit building, financial awareness, and personal development into a single, cohesive mobile experience.

### Problem Statement
Consumers juggle multiple apps for fitness (MyFitnessPal), habits (Habitica), goals (Strides), finances (Mint), and personal development (Headspace). This fragmentation leads to:
- Context switching between 5-7 apps daily
- No unified view of life progress
- Disconnected data silos that miss cross-domain insights
- Subscription fatigue from multiple paid apps

### Solution
LifePro provides a unified mobile platform where users track, optimize, and visualize all dimensions of their life from one app, with cross-domain intelligence that reveals how habits in one area affect outcomes in another.

---

## 2. Target Users

**Primary**: B2C consumers aged 25-45 who are actively seeking self-improvement across multiple life dimensions.

### Personas

| Persona | Description | Key Need |
|---------|-------------|----------|
| **Ambitious Professional** | 28-35, career-focused, wants work-life balance | Unified dashboard, time-efficient tracking |
| **Health-Conscious Parent** | 30-42, managing family + personal wellness | Simple input, family-aware goals |
| **Self-Improvement Enthusiast** | 25-40, reads self-help, tracks everything | Deep analytics, cross-domain insights |

---

## 3. Core Features (MVP Scope)

### 3.1 Life Dashboard
- Unified view of all life dimensions (Health, Goals, Habits, Finance, Growth)
- Daily score / life balance wheel visualization
- Quick-entry widgets for rapid data input

### 3.2 Habit Tracker
- Create and track daily/weekly habits
- Streak tracking with visual feedback
- Habit stacking suggestions

### 3.3 Goal Setting & Progress
- SMART goal creation wizard
- Milestone tracking with progress visualization
- Goal-to-habit linking (goals decompose into daily habits)

### 3.4 Health & Wellness
- Daily mood tracking (simple 1-5 scale + tags)
- Sleep quality logging
- Water/nutrition quick-log
- Integration-ready for Apple Health / Google Fit

### 3.5 Personal Finance Snapshot
- Manual income/expense logging
- Savings goal tracking
- Monthly spending category view

### 3.6 Insights Engine
- Cross-domain correlations ("Your sleep improves when you exercise 3+ days/week")
- Weekly summary reports
- Trend visualizations across all dimensions

---

## 4. NEXUS-Micro Agent Roster

| # | Agent | Role in LifePro | Phase Active |
|---|-------|-----------------|--------------|
| 1 | **Agents Orchestrator** | Pipeline coordination, handoffs, Dev↔QA loops | All |
| 2 | **UX Architect** | User flows, navigation, information architecture | 0-1 |
| 3 | **UI Designer** | Visual design, component library, design tokens | 1-2 |
| 4 | **Mobile App Builder** | React Native implementation, core features | 2-3 |
| 5 | **Backend Architect** | API design, data models, storage architecture | 1-2 |
| 6 | **Senior Developer** | Code review, architectural decisions, complex logic | 2-3 |
| 7 | **Evidence Collector** | QA testing, acceptance verification, evidence gathering | 3 |
| 8 | **Sprint Prioritizer** | Feature prioritization, scope management | 0-1 |

---

## 5. Technical Architecture

### Platform
- **Framework**: React Native (Expo managed workflow)
- **Language**: TypeScript
- **State Management**: Zustand
- **Local Storage**: AsyncStorage + SQLite (via expo-sqlite)
- **Navigation**: React Navigation v6

### Backend (MVP: Local-first)
- Local SQLite database for all user data
- No cloud backend for MVP (privacy-first approach)
- Export/import via JSON for data portability

### Key Dependencies
- `expo` — managed workflow for rapid development
- `react-native` — cross-platform mobile framework
- `react-navigation` — screen navigation
- `zustand` — lightweight state management
- `expo-sqlite` — local structured data storage
- `victory-native` — data visualization / charts
- `react-native-reanimated` — smooth animations

---

## 6. Information Architecture

```
LifePro App
├── Dashboard (Home)
│   ├── Life Balance Wheel
│   ├── Today's Habits
│   ├── Active Goals Progress
│   └── Quick-Entry Widgets
├── Habits
│   ├── Today View
│   ├── Habit List (CRUD)
│   ├── Streak Calendar
│   └── Habit Details
├── Goals
│   ├── Active Goals
│   ├── Goal Creation Wizard
│   ├── Milestone Tracker
│   └── Completed Goals Archive
├── Wellness
│   ├── Mood Tracker
│   ├── Sleep Log
│   ├── Nutrition Quick-Log
│   └── Wellness History
├── Finance
│   ├── Overview
│   ├── Add Transaction
│   ├── Savings Goals
│   └── Monthly Report
├── Insights
│   ├── Weekly Summary
│   ├── Correlations
│   └── Trends
└── Settings
    ├── Profile
    ├── Notifications
    ├── Data Export/Import
    └── Theme (Light/Dark)
```

---

## 7. Quality Gates (NEXUS-Micro Adapted)

### Gate 0→1: Discovery Gate (Condensed)
- [ ] Problem validated with persona definitions
- [ ] Feature scope defined and prioritized
- [ ] No blocking technical constraints identified

### Gate 1→2: Architecture Gate
- [ ] Information architecture defined
- [ ] Tech stack selected and validated
- [ ] Data model designed
- [ ] Navigation flow documented

### Gate 2→3: Foundation Gate
- [ ] Expo project initialized and running
- [ ] Navigation skeleton functional
- [ ] Core data layer (SQLite + Zustand) operational
- [ ] Design tokens and base components created

### Gate 3→Done: Feature Gate
- [ ] All MVP features implemented
- [ ] Dev↔QA loop passed for each feature
- [ ] No critical bugs
- [ ] App runs on iOS and Android simulators

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| App launches without crash | 100% | Manual testing |
| All 6 core features functional | 6/6 | Evidence Collector verification |
| Navigation between all screens | Smooth, <300ms | Manual testing |
| Data persists across app restarts | 100% | SQLite verification |
| Code quality | No TypeScript errors | `tsc --noEmit` |

---

## 9. Constraints & Non-Goals

### Constraints
- MVP is local-only (no cloud sync)
- No user authentication required for MVP
- Must work offline-first

### Non-Goals (Future phases)
- Cloud sync / multi-device support
- Social features / community
- AI-powered coaching
- Third-party integrations (Apple Health, etc.)
- Push notifications
- App store deployment

---

*Specification created: 2026-03-10*
*NEXUS Mode: Micro | Pipeline: lifepro*
