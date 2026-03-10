# LifePro MVP — Sprint Prioritization

## NEXUS Pipeline Context
- **Mode**: NEXUS-Micro (1-5 days)
- **Agent**: Sprint Prioritizer (Phase 0)
- **Date**: 2026-03-10
- **Methodology**: RICE Scoring + MoSCoW Classification

---

## Prioritization Rationale

A NEXUS-Micro cycle of 1-5 days with a single development agent means roughly 30-40 productive development hours. Building 6 features in that window guarantees all six are shallow and brittle. The better strategy: build 2-3 features deeply — with solid data persistence, proper state management, and actual usability — so the app demonstrates real value and provides a stable foundation to extend.

The prioritization below selects features that (a) deliver the most standalone user value, (b) establish the architectural patterns every other feature will reuse, and (c) minimize technical risk for a Micro cycle.

---

## RICE Scoring — All 6 Core Features

### Scoring Definitions (calibrated for Micro cycle)

| Dimension | Scale | Notes |
|-----------|-------|-------|
| **Reach** | 1-10 | Proportion of target users who would use this feature daily. 10 = every user, every session. |
| **Impact** | 0.25 / 0.5 / 1 / 2 / 3 | How much this feature moves the needle on the core value proposition. 3 = massive. |
| **Confidence** | 50%-100% | How certain we are in the Reach and Impact estimates, and that we can deliver in-cycle. |
| **Effort** | Person-days | Estimated development time including data layer, UI, and basic testing. |
| **RICE Score** | (R x I x C) / E | Higher = prioritize first. |

---

### Feature Scores

| # | Feature | Reach | Impact | Confidence | Effort (days) | RICE Score | Rank |
|---|---------|-------|--------|------------|---------------|------------|------|
| 1 | **Habit Tracker** | 9 | 3 | 90% | 1.5 | **16.2** | 1 |
| 2 | **Life Dashboard** | 10 | 2 | 70% | 2.0 | **7.0** | 2 |
| 3 | **Goal Setting & Progress** | 7 | 2 | 80% | 2.0 | **5.6** | 3 |
| 4 | **Health & Wellness** | 6 | 1 | 85% | 1.5 | **3.4** | 4 |
| 5 | **Personal Finance Snapshot** | 4 | 1 | 80% | 1.5 | **2.1** | 5 |
| 6 | **Insights Engine** | 5 | 3 | 40% | 3.0 | **2.0** | 6 |

---

## Scoring Justification

### 1. Habit Tracker — RICE 16.2 (Rank 1)

- **Reach (9)**: Habit tracking is the single highest-frequency interaction. Every persona in the spec uses this daily. It is the reason users open the app.
- **Impact (3)**: Habits are the atomic unit of the entire LifePro model. Goals decompose into habits, wellness is tracked through habits, and the dashboard aggregates habit data. This is the keystone feature.
- **Confidence (90%)**: CRUD operations + streak logic + calendar view are well-understood patterns. SQLite schema is straightforward. Low technical risk.
- **Effort (1.5 days)**: Habit model, today view, habit list with create/edit/delete, streak calculation, and visual streak calendar.

### 2. Life Dashboard — RICE 7.0 (Rank 2)

- **Reach (10)**: Every user sees the dashboard on every app open. It is the home screen.
- **Impact (2)**: The dashboard is the core differentiator — the "unified view" that justifies LifePro over separate apps. However, its value is derivative: it displays data from other features. With only habits populated, it is still useful but not at full power.
- **Confidence (70%)**: The life balance wheel visualization requires charting (victory-native) and aggregation logic. Some complexity in making it look good with partial data. Moderate risk.
- **Effort (2.0 days)**: Navigation shell, quick-entry widgets, life balance wheel chart, today's habits summary, daily score calculation.

### 3. Goal Setting & Progress — RICE 5.6 (Rank 3)

- **Reach (7)**: Not every user sets goals daily, but goal check-ins are a 3-4x/week interaction. Strong overlap with the "Ambitious Professional" persona.
- **Impact (2)**: Goals provide the motivational framework that gives habits meaning. The goal-to-habit linking is a differentiating feature. Solid value but not as immediately gratifying as habit streaks.
- **Confidence (80%)**: SMART goal wizard and milestone tracking are standard patterns. Goal-to-habit linking adds some complexity but is achievable.
- **Effort (2.0 days)**: Goal model, creation wizard, milestone tracking, progress visualization, goal-to-habit linking.

### 4. Health & Wellness — RICE 3.4 (Rank 4)

- **Reach (6)**: The "Health-Conscious Parent" persona cares deeply, but the other two personas treat it as secondary. Mood and sleep logging are quick but not the primary hook.
- **Impact (1)**: Without integrations (Apple Health, Google Fit — explicitly out of scope for MVP), this is manual logging only. Useful but not transformative.
- **Confidence (85%)**: Simple 1-5 scale inputs and logs. Technically straightforward.
- **Effort (1.5 days)**: Mood tracker, sleep log, nutrition quick-log, wellness history view.

### 5. Personal Finance Snapshot — RICE 2.1 (Rank 5)

- **Reach (4)**: Financial tracking is the least daily-use feature. Users may log expenses a few times per week. Only the "Self-Improvement Enthusiast" persona actively wants this in the same app.
- **Impact (1)**: Manual expense logging without bank integration is a downgrade from existing free tools. It adds breadth but not depth.
- **Confidence (80%)**: Simple CRUD for transactions and basic category aggregation. Low technical risk.
- **Effort (1.5 days)**: Transaction model, add transaction form, savings goals, monthly category view.

### 6. Insights Engine — RICE 2.0 (Rank 6)

- **Reach (5)**: Weekly summaries are compelling, but this is a passive-consumption feature. Users check insights maybe 1-2x/week.
- **Impact (3)**: Cross-domain correlations are the highest-value differentiator in the entire app ("Your sleep improves when you exercise 3+ days/week"). This is the long-term moat.
- **Confidence (40%)**: Meaningful correlations require (a) sufficient data volume (which a new user does not have), (b) statistical logic that is non-trivial to implement correctly, and (c) data from multiple features to correlate. In a Micro cycle, this would be superficial at best.
- **Effort (3.0 days)**: Correlation logic, weekly summary generation, trend visualizations, cross-domain data aggregation. This is the most complex feature by far.

---

## Priority Tiers

### P0 — Must-Have for MVP (Build These)

| Feature | Effort | Rationale |
|---------|--------|-----------|
| **Habit Tracker** | 1.5 days | Highest RICE score by a wide margin. Establishes the core data model, CRUD patterns, and Zustand store architecture that every other feature will reuse. This is what users open the app for. |
| **Life Dashboard** | 2.0 days | The home screen and navigation shell. Without this, there is no app — just disconnected screens. The dashboard ties everything together and delivers the "unified view" promise. Even with only habit data, the balance wheel and daily score provide immediate value. |

**Total P0 effort: ~3.5 days**

This leaves 0.5-1.5 days of buffer within the Micro cycle for navigation setup, data layer initialization, design tokens, and bug fixes — all necessary infrastructure work.

### P1 — Nice-to-Have (Build If Time Allows)

| Feature | Effort | Rationale |
|---------|--------|-----------|
| **Goal Setting & Progress** | 2.0 days | Third-highest RICE score. Goal-to-habit linking is a differentiator. If the P0 features land early, this is the highest-value addition. Realistically, a stripped-down version (goal creation + progress bar, without the full SMART wizard) could be built in ~1 day. |

### P2 — Defer to Next Cycle

| Feature | Effort | Rationale |
|---------|--------|-----------|
| **Health & Wellness** | 1.5 days | Useful but generic. Without device integrations (non-goal for MVP), manual mood/sleep/nutrition logging doesn't differentiate LifePro. Better to build this when Apple Health/Google Fit integration is in scope. |
| **Personal Finance Snapshot** | 1.5 days | Lowest reach of any feature. Manual expense logging competes poorly against mature free tools. Adds breadth without depth. Defer until the core tracking loop is proven. |
| **Insights Engine** | 3.0 days | Highest long-term potential but lowest confidence for a Micro cycle. Requires data from multiple features to be meaningful, and users won't have enough data on day one. Build this when there's real user data to analyze. |

---

## Capacity Plan

```
Day 1:  Project scaffolding + navigation shell + design tokens + data layer setup
Day 2:  Habit Tracker (model, CRUD, today view, streak logic)
Day 3:  Habit Tracker (streak calendar, polish) + Dashboard (layout, quick-entry)
Day 4:  Dashboard (life balance wheel, daily score) + integration testing
Day 5:  Bug fixes, QA loop, polish — OR begin Goal Setting if ahead of schedule
```

### Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Victory-native charting takes longer than expected | Medium | Fall back to simple progress bars for balance wheel; add chart in polish phase |
| SQLite schema changes mid-cycle | Low | Design the habit model to be extensible from day 1; use migrations |
| Scope creep into P1/P2 features | High | Strict adherence to P0 scope. No Goal Setting work before Habit Tracker and Dashboard pass QA. |

---

## Decision Summary

For a 1-5 day Micro cycle, LifePro ships with two deeply-built, well-tested features:

1. **Habit Tracker** — the daily engagement driver
2. **Life Dashboard** — the unified view that is the app's identity

These two features together deliver the core promise: "track and visualize your life from one app." They establish every architectural pattern (SQLite models, Zustand stores, React Navigation, chart components) that P1 and P2 features will reuse in subsequent cycles.

The Insights Engine — while strategically the most important long-term feature — is explicitly deferred because it cannot deliver meaningful value without weeks of accumulated user data and data from multiple tracking domains.

---

*Prioritization completed: 2026-03-10*
*Agent: Sprint Prioritizer | Pipeline: NEXUS-Micro | Project: LifePro*
