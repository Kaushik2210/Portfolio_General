# Design tokens

Concept: **signal from noise.** The hero starts as scattered particles and
resolves into a structured graph as you move or scroll. The palette is ink and
bone with one ember accent; a cool secondary is reserved for data.

All tokens live as CSS variables in `app/globals.css` and are exposed to
Tailwind v4 via `@theme`. This file is the reference.

## Colour

| Token          | Dark      | Light     | Use                                       |
| -------------- | --------- | --------- | ----------------------------------------- |
| `--bg`         | `#08090b` | `#f3f0ea` | page background                           |
| `--surface`    | `#101216` | `#ffffff` | cards, bento tiles                        |
| `--surface-2`  | `#171a20` | `#e9e5dd` | raised / hover surfaces                   |
| `--line`       | `#252932` | `#d6d1c6` | hairlines, borders                        |
| `--fg`         | `#ece8e1` | `#101216` | primary text                              |
| `--fg-muted`   | `#9a9ea8` | `#4d515a` | secondary text                            |
| `--accent`     | `#ff5a36` | `#d93a17` | signature ember: CTAs, focus, key numbers |
| `--accent-ink` | `#1a0803` | `#ffffff` | text on accent                            |
| `--data`       | `#6ee7d8` | `#0b7a6f` | charts, graph nodes, data role only       |

Contrast: `--fg` on `--bg` and `--fg-muted` on `--bg` pass WCAG AA for body text
in both themes; `--accent` is used for large text, icons and focus rings, with
`--accent-ink` on filled accent buttons.

Role tints (used by the role switcher): SDE `--accent`, Data `--data`, AI a
mix of the two (`color-mix(in oklab, var(--accent) 50%, var(--data))`).

## Type

| Role    | Family                                      | Notes                               |
| ------- | ------------------------------------------- | ----------------------------------- |
| Display | Bricolage Grotesque (variable, opsz + wdth) | headlines, wordmark, tight tracking |
| Sans    | Geist                                       | body, UI                            |
| Mono    | JetBrains Mono                              | labels, code, metadata, terminal    |

Scale (fluid, `clamp`): `--text-xs .75rem`, `--text-sm .875rem`,
`--text-base 1rem`, `--text-lg 1.25rem`, `--text-xl 1.75rem`,
`--text-2xl clamp(2rem, 4vw, 3rem)`, `--text-3xl clamp(2.75rem, 7vw, 6rem)`,
`--text-hero clamp(3.5rem, 13vw, 12rem)`. Display line-height 0.9, body 1.6.

## Spacing and layout

4px base: `--space-1..12` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256 px.
Page gutter `clamp(16px, 4vw, 48px)`; max content width 1280px; 12-col grid.
Radius: `--radius-sm 6px`, `--radius 12px`, `--radius-lg 24px`.

## Motion language

One vocabulary everywhere. Exposed in `lib/motion` and as CSS variables.

| Token           | Value                             | Use                           |
| --------------- | --------------------------------- | ----------------------------- |
| `--ease-out`    | `cubic-bezier(.16, 1, .3, 1)`     | default entrance, "expo out"  |
| `--ease-in-out` | `cubic-bezier(.65, 0, .35, 1)`    | state changes, layout (Flip)  |
| `--ease-snap`   | `cubic-bezier(.34, 1.56, .64, 1)` | small micro-interactions only |
| `--dur-fast`    | `150ms`                           | hover, press                  |
| `--dur-base`    | `400ms`                           | UI transitions                |
| `--dur-slow`    | `800ms`                           | section reveals               |
| `--dur-hero`    | `1200ms`                          | preloader handoff, hero intro |

GSAP names: `expo.out` (= `--ease-out`), `power3.inOut` (= `--ease-in-out`).
Stagger: 0.04s per character, 0.08s per word, 0.1s per card, never above 0.6s
total. Reveals translate at most 24px (60px for hero type). Scrubbed animation
uses `scrub: 0.6` and is replaced by a plain fade under
`prefers-reduced-motion`.

## Surfaces and texture

Grain: SVG noise overlay at 4-6% opacity, `mix-blend-mode: overlay`, fixed,
pointer-events none. It is static, so it stays on under reduced motion.
Glass: `backdrop-filter: blur(16px)` on `--surface` at 60% alpha, only for the
nav, command palette and chat panel. Bento tiles: solid `--surface` with a
1px `--line` border; no stacked drop shadows.

## Focus and state

Focus ring: 2px `--accent` outline, 3px offset, always visible on keyboard
focus. Hover never relies on colour alone.
