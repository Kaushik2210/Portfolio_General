# Redesign brief: "Hello, world" (v2)

Why: the first design had polite, small scroll effects that did not register, and
a hero that read as a tech-demo. The new direction is built around scroll as the
main event.

## What the best maximalist portfolios share

Sources read: a 2026 roundup of bold portfolio sites (Creative Giants, &Walsh,
Cappen, Prisma) and the GSAP community notes on curtain-style stacked sections.

- **Type is the image.** Words at 20vw, outlines against fills, overprinting.
- **Colour changes with the story.** Full-bleed colour worlds, not one theme.
- **Scroll is choreography, not decoration.** Pinned scenes, layers that slide over
  each other, type that travels, a persistent sense of "where am I".
- **One strong 3D object**, art-directed (colour, motion), not a tech demo.
- **Dense but organised.** Stickers, tape, numerals and HUD text sit on a grid.

## The system

- **Worlds**: `data-world="lime|violet|pink|cream|ember"` re-themes a section by
  overriding the CSS variables (`--bg`, `--fg`, `--accent`...). Components never
  hard-code colours, so every section works in every world.
- **Curtain stack**: on desktop each `data-stack` section pins at its bottom edge
  (`pinSpacing: false`) and scales back while the next section slides over it.
- **Hero**: pinned scene. The name tears apart and the 3D crystal grows as you
  scroll, then a lime iris opens to "Hello, world." and becomes the next section.
- **Work**: one full-screen panel per project, each in its own world, stacking.
- **Travelling type**: giant words scrubbed horizontally by scroll position.
- **HUD**: a fixed section counter so the scroll position always reads.

## Performance and responsiveness rules

- Pinning, stacking, the WebGL crystal and pointer effects are desktop only.
- Phones get the same colour worlds, huge type and reveals, with no pinning.
- `prefers-reduced-motion` removes pinning and scrub entirely.
