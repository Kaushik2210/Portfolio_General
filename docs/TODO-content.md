# Content to fill in or verify

LinkedIn cannot be scraped (login wall, and against its terms), so nothing in
`data/linkedin.json` came from there. Every unverified field is the literal
string `"TODO_VERIFY"`. Run `npm run check:content` for the live list, and
`npm run check:content -- --strict` to fail the build while any remain.

## 1. `data/linkedin.json` (fill from LinkedIn, your resume, or the LinkedIn data export)

LinkedIn export: Settings -> Data privacy -> Get a copy of your data. Or drop a
resume at `./resume.pdf` and ask for it to be parsed into this file.

| Field              | What to put                                                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `headline`         | Your LinkedIn headline, or a one-line positioning statement                                                                                                                                  |
| `about`            | 2-4 sentences, first person, no filler                                                                                                                                                       |
| `experience[]`     | Employer, title, start/end (YYYY-MM or `present`), location, summary, 2-4 highlights with real numbers. Add one object per role; delete the placeholder if you have none (internships count) |
| `education[]`      | School, degree, field, dates, grade. A README in `Net-Sentinel` calls it an "MCA research project", which suggests an MCA, but that is an inference, so confirm                              |
| `certifications[]` | Name, issuer, date, credential URL                                                                                                                                                           |
| `achievements[]`   | Hackathons, awards, communities, with year and one line of detail                                                                                                                            |

The About stats counters (education, certs, hackathons, communities) read from
these arrays, so empty sections will hide their counter rather than show zero.

## 2. `data/projects.json`

All nine case studies are written from what each repo's README states. Not
invented, but incomplete:

- **`role`** on every project: was it solo or a team, and what did you own?
- **Metrics marked `TODO_VERIFY`**:
  - Orbital Sentinel: detection accuracy (and on what data split)
  - VeriFrame: benchmark results
  - PORTCULLIS: detection rate at a fixed false-positive rate (the eval report has it)
  - NetSentinel: detection results
  - Overrank: real-world usage (was it used by a real campus?)
  - GLYPHFORGE: performance numbers (fps, grid size)
- **`visual`**: every project is `TODO_SCREENSHOT`. Add images under
  `public/projects/<slug>.jpg` and set the path. READMEs for Overrank,
  PORTCULLIS and GLYPHFORGE already have screenshots you can reuse.
- **Case-study order and weights** (`weight.sde/data/ai`) are my judgement of
  which role each project best supports. Adjust freely.

## 3. Facts used elsewhere that I inferred

- **Full name** "Sodagum Venkata Kaushik" is derived from your LinkedIn URL
  slug; GitHub shows "S V Kaushik". Confirm spelling and which one to show.
- **Location** "Bengaluru, India": GitHub says "Bangalore".
- **Skills list** is evidenced by repo languages and topics only. The **Data**
  group is thin (Python, time-series anomaly detection, telemetry analysis,
  data visualisation). If you have SQL, pandas, Power BI, Tableau, statistics or
  ML coursework, add it under `group: "data"` or the Data role view will feel
  weak to a Data Analyst recruiter.
- **Resume**: no `RESUME_PDF` was provided. The "Resume" button needs
  `public/resume.pdf`.
- **Contact email** `svkaushik2210@gmail.com` is your git author email. Confirm
  you want it public (it will also be in the chatbot's fallback message and JSON-LD).

## 4. Public-facing decisions for you

- Custom domain (`DOMAIN`): none provided; deploys to a `*.vercel.app` URL.
- Your GitHub `blog` field points to an older Vercel portfolio
  (`my-portfolio-eosin-two-r79pc1zrgg.vercel.app`). Update it after launch.
- Repos shown on the site are my pick of your strongest nine. Several others
  (`Learn_python-`, `100-days-of-java`, `learn-os`, the FSD lab repos) are
  deliberately left off the featured list; they still appear in the GitHub
  section's live data.
