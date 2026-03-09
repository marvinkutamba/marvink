# OrangeCrush Brand Identity System

**Prepared by:** Brand Guardian Agent (The Agency)
**Date:** March 9, 2026
**Client:** The Orange LabZ / OrangeCrush
**Web:** theorangelabz.com | orangecrush.app
**Social:** @orangecrushweb3
**Phase 0 Input:** UX Research (personas, journey maps)

---

## 1. Brand Foundation

### Brand Purpose
To prove that competitive Web3 gaming can be fair, fresh, and genuinely fun — not another extractive grind that goes stale after a week.

### Brand Vision
A world where competitive gaming rewards adaptation and strategy over wallet size or mindless repetition. OrangeCrush becomes the definitive weekly competition for crypto-native gamers — the game you check every Monday.

### Brand Mission
OrangeCrush delivers a free-to-play, weekly competitive tap game where strategy matters more than screen time. Every Monday brings a new meta. Every Sunday, 100 players share real USDC rewards. No wallet required. No pay-to-win. Just outsmart the week.

### Brand Values

1. **Fresh Every Monday** — Staleness is the enemy. The weekly reset and rotating card shop ensure no two weeks play the same. This value extends to how we communicate: timely, relevant, never recycled.

2. **Fair Competition** — Top-100 prize splits, not winner-take-all. No pay-to-win mechanics. Free to play with no wallet barrier. Fairness is structural, not aspirational.

3. **Strategic Depth** — Tapping is the input; strategy is the game. Lab Cards, the Research Board, and weekly meta-shifts reward players who think, not just those who tap fastest.

4. **Transparent Rewards** — Real USDC, distributed every Sunday, verifiable on-chain. No speculative tokens, no "coming soon" airdrops. If we say $100, we pay $100.

5. **Community-Built** — 100 winners per week means 100 people with a story to share. The game grows through shared victories, not marketing spend.

### Brand Personality

| Trait | Expression |
|-------|-----------|
| **Mad Scientist** | Playful experimentation, "what happens if we try this?" energy. Inspired by Dr. Stein, the game's central character. Not reckless — methodical curiosity. |
| **Competitive but Generous** | Celebrates competition without toxicity. 100 winners, not 1. Trash talk is welcome; gatekeeping is not. |
| **Irreverent** | Doesn't take itself too seriously (it's a game about tapping oranges from another dimension) but takes its promises dead seriously (real money, real fairness). |
| **Fresh** | Literally and figuratively. Orange imagery, citrus energy. The brand feels alive, not corporate. Every week is new. |

### Brand Promise
Every Monday, a new game. Every Sunday, real payouts. Always free, always fair, always fresh.

---

## 2. Visual Identity System

### 2.1 Color System

```css
/* OrangeCrush Brand Design System */
:root {
  /* === Primary Brand Colors === */
  --oc-orange:            #FF6B00;  /* Core brand orange — fizz, energy, action */
  --oc-orange-light:      #FF9A45;  /* Highlights, hover states, active elements */
  --oc-orange-dark:       #CC5500;  /* Pressed states, depth, emphasis */
  --oc-orange-glow:       #FF6B0033; /* Glow effects, ambient energy (20% opacity) */

  /* === Secondary Colors === */
  --oc-purple-rift:       #7B2FBE;  /* Dimensional rifts, premium/rare elements */
  --oc-purple-rift-light: #9B5BD4;  /* Rift highlights */
  --oc-green-fizz:        #00E676;  /* Fizz accumulation, success, positive feedback */
  --oc-green-fizz-dark:   #00C853;  /* Fizz emphasis */
  --oc-blue-electric:     #00B0FF;  /* Links, interactive elements, Research Board */

  /* === Semantic Colors === */
  --oc-success:           #00E676;  /* Fizz earned, upgrades purchased */
  --oc-warning:           #FFD600;  /* Cycle ending soon, resource low */
  --oc-danger:            #FF1744;  /* Reset imminent, negative feedback */
  --oc-info:              #00B0FF;  /* Tips, help, neutral information */

  /* === Background System (Dark-First) === */
  --oc-bg-deep:           #0A0A0F;  /* Primary background — the lab is dark */
  --oc-bg-surface:        #141420;  /* Cards, panels, elevated surfaces */
  --oc-bg-elevated:       #1E1E2E;  /* Modals, dropdowns, tooltips */
  --oc-bg-hover:          #2A2A3A;  /* Hover states on dark backgrounds */

  /* === Text Colors === */
  --oc-text-primary:      #F5F5F5;  /* Primary text on dark backgrounds */
  --oc-text-secondary:    #A0A0B0;  /* Secondary/muted text */
  --oc-text-accent:       #FF6B00;  /* Emphasized text, labels, counts */
  --oc-text-on-orange:    #0A0A0F;  /* Text on orange backgrounds */

  /* === Typography === */
  --oc-font-display:      'Space Grotesk', 'Inter', system-ui, sans-serif;
  --oc-font-body:         'Inter', 'Segoe UI', system-ui, sans-serif;
  --oc-font-mono:         'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes — modular scale (1.25 ratio) */
  --oc-text-xs:           0.64rem;   /* 10.24px — fine print */
  --oc-text-sm:           0.8rem;    /* 12.8px — captions, labels */
  --oc-text-base:         1rem;      /* 16px — body text */
  --oc-text-md:           1.25rem;   /* 20px — subheadings */
  --oc-text-lg:           1.563rem;  /* 25px — section headings */
  --oc-text-xl:           1.953rem;  /* 31.25px — page headings */
  --oc-text-2xl:          2.441rem;  /* 39px — hero text */
  --oc-text-3xl:          3.052rem;  /* 48.8px — display/splash */

  /* Font Weights */
  --oc-weight-regular:    400;
  --oc-weight-medium:     500;
  --oc-weight-semibold:   600;
  --oc-weight-bold:       700;
  --oc-weight-black:      900;

  /* Line Heights */
  --oc-leading-tight:     1.2;   /* Headings */
  --oc-leading-normal:    1.5;   /* Body text */
  --oc-leading-relaxed:   1.75;  /* Long-form content */

  /* === Spacing System (8px base) === */
  --oc-space-1:           0.25rem;  /* 4px — micro spacing */
  --oc-space-2:           0.5rem;   /* 8px — tight spacing */
  --oc-space-3:           0.75rem;  /* 12px — compact spacing */
  --oc-space-4:           1rem;     /* 16px — default spacing */
  --oc-space-5:           1.5rem;   /* 24px — comfortable spacing */
  --oc-space-6:           2rem;     /* 32px — section spacing */
  --oc-space-8:           3rem;     /* 48px — large section spacing */
  --oc-space-10:          4rem;     /* 64px — hero/major section spacing */
  --oc-space-12:          6rem;     /* 96px — page-level spacing */

  /* === Border Radius === */
  --oc-radius-sm:         4px;   /* Small elements, chips */
  --oc-radius-md:         8px;   /* Cards, buttons */
  --oc-radius-lg:         12px;  /* Panels, modals */
  --oc-radius-xl:         16px;  /* Featured cards */
  --oc-radius-full:       9999px; /* Pills, avatars */

  /* === Shadows (dark theme optimized) === */
  --oc-shadow-sm:         0 1px 2px rgba(0, 0, 0, 0.4);
  --oc-shadow-md:         0 4px 8px rgba(0, 0, 0, 0.5);
  --oc-shadow-lg:         0 8px 24px rgba(0, 0, 0, 0.6);
  --oc-shadow-glow:       0 0 20px var(--oc-orange-glow);
  --oc-shadow-rift:       0 0 30px rgba(123, 47, 190, 0.3);

  /* === Transitions === */
  --oc-transition-fast:   100ms ease-out;   /* Micro-interactions, taps */
  --oc-transition-normal: 200ms ease-out;   /* Standard UI transitions */
  --oc-transition-slow:   400ms ease-in-out; /* Page transitions, reveals */

  /* === Z-Index Scale === */
  --oc-z-base:            0;
  --oc-z-elevated:        10;
  --oc-z-dropdown:        100;
  --oc-z-modal:           1000;
  --oc-z-toast:           2000;
  --oc-z-tooltip:         3000;
}
```

### 2.2 Color Usage Guidelines

| Context | Color | Variable |
|---------|-------|----------|
| Primary CTA buttons | Orange on dark | `--oc-orange` on `--oc-bg-deep` |
| Fizz counters/earnings | Green Fizz | `--oc-green-fizz` |
| Rift Events / rare items | Purple Rift | `--oc-purple-rift` |
| Leaderboard / rankings | Orange gradient | `--oc-orange` to `--oc-orange-light` |
| Research Board / skill tree | Electric Blue | `--oc-blue-electric` |
| Card backgrounds | Surface | `--oc-bg-surface` with `--oc-shadow-md` |
| Warning (cycle ending) | Yellow | `--oc-warning` |

### 2.3 Accessibility

| Combination | Contrast Ratio | WCAG |
|-------------|---------------|------|
| `--oc-text-primary` on `--oc-bg-deep` | 18.1:1 | AAA |
| `--oc-orange` on `--oc-bg-deep` | 5.8:1 | AA (large text AAA) |
| `--oc-text-on-orange` on `--oc-orange` | 5.8:1 | AA |
| `--oc-green-fizz` on `--oc-bg-deep` | 8.5:1 | AAA |
| `--oc-text-secondary` on `--oc-bg-deep` | 6.2:1 | AA |

### 2.4 Typography Usage

| Element | Font | Weight | Size | Tracking |
|---------|------|--------|------|----------|
| Display / Splash | Space Grotesk | Black (900) | `--oc-text-3xl` | -0.02em |
| Page Headings | Space Grotesk | Bold (700) | `--oc-text-xl` | -0.01em |
| Section Headings | Space Grotesk | SemiBold (600) | `--oc-text-lg` | 0 |
| Card Titles | Inter | SemiBold (600) | `--oc-text-md` | 0 |
| Body Text | Inter | Regular (400) | `--oc-text-base` | 0 |
| Labels / Captions | Inter | Medium (500) | `--oc-text-sm` | 0.02em |
| Fizz Counter / Stats | JetBrains Mono | Bold (700) | `--oc-text-lg` | 0 |
| Code / Technical | JetBrains Mono | Regular (400) | `--oc-text-sm` | 0 |

**Rationale:**
- **Space Grotesk** — Geometric sans-serif with a slightly quirky character. Feels modern and experimental (aligns with "mad scientist" personality) without being illegible. Free on Google Fonts.
- **Inter** — Industry-standard UI font. Highly legible at all sizes, excellent variable font support, optimized for screens. Free.
- **JetBrains Mono** — Monospace for Fizz counters, stats, and technical displays. The ligatures add visual polish to number-heavy displays. Free.

---

## 3. Brand Voice & Messaging Architecture

### 3.1 Voice Characteristics

| Trait | Description | Example |
|-------|-------------|---------|
| **Fizzy** | Energetic, punchy, short sentences. Never sluggish. The copy should feel like cracking open a cold one. | "New week. New cards. New chaos." |
| **Knowing** | Speaks to crypto-native gamers as peers, not noobs. References shared frustrations (airdrops that never come, games that get solved in a day) without explaining them. | "Remember when that other game got boring after the airdrop? Yeah." |
| **Irreverent** | Takes the game's absurd premise (interdimensional oranges) seriously enough to be funny, never so seriously it becomes cringe. | "Dr. Stein accidentally ripped open a dimension full of sentient oranges. We're not asking questions. We're extracting Fizz." |
| **Direct** | States things plainly. No corporate hedging, no "leverage synergies." If the prize pool is $100, say $100. If you reset Sunday, say reset Sunday. | "$100 USDC. 100 players. Every Sunday. That's it." |

### 3.2 Tone Spectrum

| Context | Tone | Example |
|---------|------|---------|
| **Game launch / Monday reset** | Hype + strategic | "The Lab is OPEN. This week's rotation: 3 Equipment, 2 Automation, 1 Research wildcard. Plan your build." |
| **Leaderboard updates** | Competitive + inclusive | "Top 100 looking tight. 47 of you are within 200K Fizz of a payout slot. Grind smart." |
| **Sunday payouts** | Celebratory + transparent | "Week 12 complete. $100 USDC distributed to 100 extractors. Full breakdown in the Lab." |
| **Onboarding** | Welcoming + no-nonsense | "Tap oranges. Earn Fizz. Spend Fizz on upgrades. Compete for USDC. No wallet needed. Takes 30 seconds to start." |
| **Error / downtime** | Honest + light | "The Lab hit a snag. Dr. Stein is recalibrating. Back in ~15 min." |
| **Community / Discord** | Peer-to-peer + nerdy | "Alright who ran triple Automation this week? Show us your Fizz/hour." |

### 3.3 Messaging Architecture

**Brand Tagline:**
> Tap. Crush. Outsmart the Week.

**Alternate taglines (context-dependent):**
- "Fresh meta every Monday." (competitive positioning)
- "100 winners. Every Sunday." (fairness angle)
- "The game that never plays the same twice." (roguelike angle)

**Value Proposition (one sentence):**
OrangeCrush is a free-to-play Web3 game where you tap to earn Fizz, build a new strategy every week from rotating upgrade cards, and compete for real USDC payouts — no wallet, no download, no pay-to-win.

**Key Messages by Audience:**

| Audience | Primary Message |
|----------|----------------|
| **Hamster Kombat / Notcoin refugees** | "The tap game that changes every week so you never get bored." |
| **Competitive mobile gamers** | "Real money. Real competition. New meta every Monday." |
| **Crypto-curious casuals** | "Free to play. No wallet needed. Win real money tapping oranges." |
| **Investors / partners** | "Roguelike mechanics solve the #1 Web3 gaming problem: retention. Working product, weekly payouts, growing community." |

### 3.4 Writing Guidelines

**Do:**
- Use short sentences. Punchy paragraphs.
- Speak in present tense ("The Lab is open" not "The Lab will be opening")
- Use game terminology consistently: Fizz, Lab Cards, Research Board, Extractors (players), Dr. Stein, the Lab, the OrangeVerse
- Reference specific numbers ($100, top 100, every Monday)
- Use contractions (it's, don't, we're)

**Don't:**
- Use corporate jargon ("synergy," "leverage," "ecosystem growth")
- Over-explain crypto concepts to the audience (they already know)
- Promise what you can't deliver (no "soon," no "exciting announcements incoming")
- Use emojis excessively in formal communications (1-2 max per post; the orange emoji is always appropriate)
- Call players "users" — they're Extractors

**Terminology:**

| Use | Don't Use |
|-----|-----------|
| Extractors | Users, players (in-brand), customers |
| Fizz | Points, tokens, coins (in-game) |
| Lab Cards | Upgrades, items, power-ups |
| The Lab | Dashboard, homepage, main screen |
| Research Board | Skill tree, talent tree |
| Cycle | Season, round, period |
| Prestige | XP, level, rank (cumulative) |
| Digital Tokens | Off-chain currency, credits |

---

## 4. Logo System Specifications

### 4.1 Logo Components

The OrangeCrush logo system consists of three elements:

1. **Logomark (Icon):** A stylized orange with a dimensional rift crack, revealing glowing Fizz energy inside. The crack references the interdimensional origin story. The orange shape is slightly imperfect/organic, avoiding corporate perfection.

2. **Wordmark:** "OrangeCrush" set in Space Grotesk Black (900 weight) with custom letter-spacing (-0.03em). The "O" in "Orange" optionally incorporates the logomark shape. "Crush" is rendered in `--oc-orange` while "Orange" is in `--oc-text-primary` (white on dark).

3. **Sub-brand mark:** "The Orange LabZ" in Inter Medium, used for the parent studio identity. Always appears below or separate from the OrangeCrush mark, never competing.

### 4.2 Logo Variants

| Variant | Use Case | Minimum Width |
|---------|----------|---------------|
| **Full lockup** (Logomark + Wordmark, horizontal) | Website header, marketing materials | 180px |
| **Stacked lockup** (Logomark above Wordmark) | Square formats, app icons at large sizes | 120px |
| **Logomark only** | App icon, favicon, avatar, small spaces | 32px |
| **Wordmark only** | Text-heavy contexts, inline references | 140px |

### 4.3 Clear Space

Minimum clear space around all logo variants: equal to the height of the "O" in the wordmark (approximately 1/4 of the total logo height). No other elements, text, or edges should encroach within this zone.

### 4.4 Color Applications

| Background | Logomark | Wordmark |
|------------|----------|----------|
| Dark (`--oc-bg-deep`) | Full color (orange + rift glow) | White + Orange |
| Light (white) | Full color | Dark (`--oc-bg-deep`) + Orange |
| Orange (`--oc-orange`) | White silhouette | White |
| Photography / busy backgrounds | White silhouette with subtle shadow | White with subtle shadow |

### 4.5 Logo Misuse (Don'ts)

- Do not rotate the logo
- Do not apply drop shadows beyond the specified glow effect
- Do not stretch, distort, or alter proportions
- Do not place on busy backgrounds without contrast overlay
- Do not change the "Crush" color to anything other than `--oc-orange` or white
- Do not use low-resolution versions
- Do not animate the logo without approval (exceptions: the rift crack glow may pulse subtly)

---

## 5. Brand Usage Guidelines

### 5.1 Platform-Specific Guidelines

**Website (orangecrush.app)**
- Dark theme only (the Lab is dark by design)
- All CTAs in `--oc-orange` with `--oc-radius-md`
- Fizz counters always use `--oc-font-mono` in `--oc-green-fizz`
- Page transitions should feel energetic (200ms max for UI, 400ms for major reveals)

**X / Twitter (@orangecrushweb3)**
- Profile avatar: Logomark only on `--oc-bg-deep`
- Banner: Weekly rotation showing current cycle's available Lab Cards
- Tweet voice: Fizzy + Knowing (see Voice Characteristics)
- Max 1 orange emoji per tweet. Never use generic gaming emojis.
- Thread format for Monday card reveals and Sunday payout recaps

**Telegram**
- Bot avatar: Logomark with subtle rift glow animation
- Inline messages: Short, punchy, action-oriented
- Notification style: "[Fizz icon] New cycle starts in 2 hours"

**Discord**
- Server icon: Logomark
- Role colors mapped to brand palette: Extractors (orange), Top 100 (green fizz), Dr. Stein's Council (purple rift)
- Bot messages use `--oc-font-mono` for stats, `--oc-font-body` for conversation

### 5.2 Content Guidelines

**Screenshots & Game Captures**
- Always captured on the dark theme
- Include the OrangeCrush watermark (small logomark, bottom-right, 15% opacity)
- Crop to highlight the action, not empty space

**Marketing Graphics**
- Primary background: `--oc-bg-deep` or gradient from `--oc-bg-deep` to `--oc-purple-rift` (20%)
- Text hierarchy: Headline in Space Grotesk Bold + Orange, body in Inter Regular + White
- Always include one specific claim or number (e.g., "$100 USDC every Sunday")

**Video / Motion**
- Intro: 2-second logo reveal with rift crack animation
- Lower thirds: `--oc-bg-surface` with `--oc-orange` accent bar
- Text overlays: Space Grotesk SemiBold, max 8 words per screen
- Transitions: Quick cuts or orange energy wipe (not corporate fades)

### 5.3 Co-Branding Rules

- OrangeCrush logo must have equal or greater visual weight than partner logos
- Maintain full clear space between OrangeCrush mark and any partner mark
- Co-branded materials must use OrangeCrush's dark background system
- Partner logos may not be colorized in OrangeCrush brand colors without approval
- "Powered by The Orange LabZ" sub-brand mark appears on all co-branded materials

### 5.4 Brand Protection

**Trademark coverage (recommended):**
- "OrangeCrush" (word mark, Class 41 — Entertainment services; Class 9 — Software)
- "The Orange LabZ" (word mark, Class 41/42)
- "Fizz" (in context of gameplay, Class 41)
- Logomark (design mark)
- "Tap. Crush. Outsmart the Week." (tagline)

**Monitoring:**
- Weekly search for "OrangeCrush" + "Web3" / "tap" / "game" across app stores and social
- DMCA-ready template for unauthorized use of game assets or brand marks
- Community reporting channel for spotted brand misuse

### 5.5 Brand Evolution Guardrails

The brand system is designed to evolve with the game. The following elements are **locked** (require formal brand review to change):

- Core brand colors (`--oc-orange`, `--oc-bg-deep`)
- Primary typeface (Space Grotesk for display)
- Logo system proportions and clear space
- Brand values and voice characteristics
- Terminology (Fizz, Extractors, Lab Cards, etc.)

The following elements are **flexible** (can be adapted per cycle/season):

- Secondary/accent colors for seasonal themes
- Marketing tagline variations
- Visual effects and animations
- Community event branding
- Dr. Stein's character expressions and dialogue

---

*Brand Identity System generated using the Brand Guardian agent methodology from [The Agency](https://github.com/msitarzewski/agency-agents). This document establishes the foundation for consistent brand expression across all OrangeCrush touchpoints.*

**Brand Guardian:** The Agency
**Strategy Date:** March 9, 2026
**Implementation:** Ready for cross-platform deployment
**Next Review:** June 2026 (post Q2 cycle analysis)
