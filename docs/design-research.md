# Design research

Principles only. No layout, asset, copy or code is borrowed from any site below.

## What I could and could not read

| Source                                                                   | Result                                                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| awwwards.com/websites/portfolio/                                         | Read (via a scraper). Listing only: names and thumbnails, no award or stack metadata. |
| awwwards.com/websites/gsap/ (and /three-js, /webgl, /anime-js, /next-js) | HTTP 502 on fetch. Not read directly. Supplemented with the secondary sources below.  |
| wallofportfolios.in                                                      | Read. Categories and Portfolio-of-the-Month reasoning.                                |
| github.com/emmabostian/developer-portfolios                              | Read. Format trends and role taglines.                                                |
| hontran.dev "award-winning websites 2026" (juror write-up)               | Read. Source for most of the motion and performance points.                           |

Individual Awwwards winners were not opened one by one, so the notes below are
about patterns, not teardowns of specific sites.

## What wins

1. **Art direction first.** Static frames must hold up with motion switched off.
   One idea drives type, colour and grid. Decorated templates lose.
2. **Directed motion.** Motion paces a story: scroll sequences that reveal in
   order, transitions that carry meaning, hover states that reward attention.
   A motion library without pacing reads as noise.
3. **Performance is a judging criterion.** Jurors test on real mid-range phones.
   A 3D hero that drops to 18fps caps the score. Atmosphere beats spectacle.
4. **Case studies carry business or technical impact.** Portfolio-of-the-Month
   picks frame problem -> approach -> measurable outcome, with consistent art
   direction across projects. (wallofportfolios.in)
5. **Accessibility reads as craft.** `prefers-reduced-motion` fallbacks and a
   static hero frame that works without animation are rewarded.

## Patterns to borrow

- Oversized editorial type that stays legible while it moves; kinetic type on a
  GSAP timeline, one effect per heading, not three.
- Weighted smooth scroll (Lenis) driving a GSAP ScrollTrigger timeline.
- Continuous surfaces between states: a shared-element transition from gallery
  card to case study instead of a hard route swap.
- WebGL as atmosphere: a particle or graph field that frames the content and
  reacts to cursor and scroll, with a cheap CSS fallback.
- A single memorable signature interaction. Mine: a role switcher that
  re-orders the whole site for SDE / Data / AI, plus an "Ask my portfolio" chat.
- Format ideas from the developer-portfolios list worth a nod: terminal mode,
  chat-style Q&A, OS-style command palette. Role taglines are trending toward
  "Full Stack & AI Engineer", "Gen AI / LLM Engineer", "Agentic AI Systems".

## Patterns to avoid

- Animation that hides content or delays reading (long preloaders, text that
  only becomes legible at the end of a scrub).
- Heavy WebGL with no mobile or low-power fallback; anything that collapses
  under 4x CPU throttle.
- Ignoring `prefers-reduced-motion`.
- The default React Bits demo look. Components get restyled to the tokens in
  `design/tokens.md` or they do not ship.
- Skill-logo walls and "I am passionate about" copy. No fake testimonials, no
  invented metrics.
- Effects layered to cover for weak hierarchy.

## Decisions this research drives

- Dark-first, one accent, restrained secondary palette (see `design/tokens.md`).
- 3D is lazy-loaded, pauses off-screen, caps DPR, and has a static fallback.
- Preloader under 2.5s and skippable.
- Every case study uses the same problem -> approach -> result template.
- Lighthouse numbers are measured and published in the README, not claimed.
