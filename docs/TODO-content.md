# Content to fill in or verify

LinkedIn cannot be scraped (login wall, and against its terms), so nothing in
`data/linkedin.json` came from there. Every unverified field is the literal
string `"TODO_VERIFY"` and is **hidden from the live site**, not shown. Run
`npm run check:content` for the live list, and `npm run check:content -- --strict`
to fail while any remain.

## 1. `data/linkedin.json`

**Done (copied from the owner's own LinkedIn pages on 2026-10-08):** headline, four experience
entries (two Google Student Ambassador stints, Cybernetics Association, Sanskrit Association),
both degrees (MCA at Christ University, BCA at St Joseph's University) and nine certifications.
The profile has no About or honours section, so `about` and `achievements` stay unfilled.

Credential links for all nine certificates were also copied from LinkedIn.

**Still open:** `about` (a few sentences in your voice), `education[].grade`, `achievements[]`,
and 2-4 highlights with real numbers per role. Original guidance below.

LinkedIn export: Settings -> Data privacy -> Get a copy of your data.

| Field              | What to put                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `headline`         | Your LinkedIn headline, or a one-line positioning statement                                                                                                     |
| `about`            | 2-4 sentences, first person, no filler. Until filled, About uses a line built from your GitHub numbers                                                          |
| `experience[]`     | Employer, title, start/end (YYYY-MM or `present`), location, summary, 2-4 highlights with real numbers. Internships count                                       |
| `education[]`      | School, degree, field, dates, grade. A README in `Net-Sentinel` calls it an "MCA research project", which suggests an MCA, but that is an inference, so confirm |
| `certifications[]` | Name, issuer, date, credential URL                                                                                                                              |
| `achievements[]`   | Hackathons, awards, communities, with year and one line of detail                                                                                               |

Empty sections hide their counter and the timeline instead of showing zero.

## 2. `data/projects.json`

All nine case studies are written from what each repo's README states.

- **`role`**: filled from GitHub contributor data (sole contributor on eight repos; 85 of 104
  commits on gitVisualise). Edit if you want to say more about what you owned.
- **Metrics marked `TODO_VERIFY`**: Orbital Sentinel detection accuracy, VeriFrame
  benchmark results, PORTCULLIS detection rate at a fixed false-positive rate,
  NetSentinel detection results, Overrank real-world usage, GLYPHFORGE performance numbers.
- **`visual`**: real images for eight projects: five captured from live demos and three
  (ATTESTA, NetSentinel, PORTCULLIS) taken from the repos' own screenshots and demo GIF, in
  `public/projects/<slug>.jpg`. Only VeriFrame is still generated art (its repo has no
  screenshots and no public demo).
- **Order and weights** (`weight.sde/data/ai`) are my judgement of which role each
  project best supports. Adjust freely.

## 3. Facts I inferred

- **Full name** "Sodagum Venkata Kaushik" is confirmed by the LinkedIn profile; GitHub shows
  "S V Kaushik", which the site uses as the short display name.
- **Location** "Bengaluru, India": GitHub says "Bangalore".
- **Skills** are evidenced by repo languages and topics only. The **Data** group is
  thin (Python, time-series anomaly detection, telemetry analysis, data
  visualisation). If you have SQL, pandas, Power BI, Tableau or statistics, add it
  under `group: "data"` or a Data Analyst recruiter will find that view light.
- **Email** `svkaushik2210@gmail.com` is your git author email. It is public on the
  site, in the JSON-LD and in the assistant's fallback message. Confirm.

## 4. Things only you can do

- **Resume**: `public/resume.pdf` was generated from the verified data on this site (LinkedIn
  details, certificates, projects, evidence-based skills) with no invented content. Replace it with
  your own resume whenever you like; the hero Resume button picks up whatever is there.
- **Production env vars** in Vercel: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`,
  `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, optionally the Upstash pair. Until then the
  chat shows its offline state and the contact form points to email.
- **Verify the Resend sender**: the default `onboarding@resend.dev` only delivers to
  your own account email until you verify a domain.
- **GitHub auto-deploy**: done. The repo is connected to the Vercel project, so every push to
  `main` deploys to production (the CI deploy job stays inert unless a `VERCEL_TOKEN` secret is added).
- **Custom domain**: none provided. Currently `portfolio-general-ten.vercel.app`.
- Your GitHub `blog` field points at an older Vercel portfolio. Update it
  (GitHub -> Settings -> Public profile -> Website, or
  `gh api -X PATCH user -f blog=https://portfolio-general-ten.vercel.app`).
- Several repos (`Learn_python-`, `100-days-of-java`, `learn-os`, the FSD lab repos)
  are deliberately not featured. They still appear in the live GitHub section.
