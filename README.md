# Portfolio

Personal portfolio of S V Kaushik (Bengaluru, India). Targets software, data
and AI/ML engineering roles.

> Work in progress. This README is expanded in the final phase (architecture,
> screenshots, Lighthouse results, data-update guide).

## Stack

Next.js (App Router) + TypeScript (strict) + Tailwind CSS v4. Motion and 3D
libraries are added phase by phase; see `docs/design-research.md` and
`design/tokens.md` for the design reasoning.

## Run it

```bash
npm install
cp .env.example .env.local   # fill in keys you have; the site degrades without them
npm run dev
```

## Scripts

| Script              | What it does     |
| ------------------- | ---------------- |
| `npm run dev`       | dev server       |
| `npm run build`     | production build |
| `npm run lint`      | ESLint           |
| `npm run typecheck` | `tsc --noEmit`   |
| `npm run format`    | Prettier         |
