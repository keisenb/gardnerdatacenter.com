# Say No to the Gardner Data Center

A simple, fast, mobile-first static website with public information about the proposed industrial-scale data center near Gardner, Kansas. Built so that any community member can quickly learn the facts and take action.

This is a community project. It is **not** affiliated with any government agency or developer.

## Stack

Intentionally simple — no build step, no framework, no dependencies.

- Plain **HTML**, **CSS**, and a small bit of vanilla **JavaScript**
- Google Fonts (Inter + Fraunces) over the network
- Statically hosted on **Vercel** (free tier)
- Source on **GitHub**

That's it. The whole site is three files plus this README.

## Local development

Open `index.html` directly in a browser, or serve the folder with any static file server. A couple of one-liners:

```bash
# Python 3
python3 -m http.server 8000

# Node (with npx)
npx --yes serve .
```

Then visit `http://localhost:8000` (or the port your server prints).

## Project structure

```
.
├── index.html              # Home — overview + CTAs into deeper pages
├── whats-proposed.html     # What's actually being proposed (specifics)
├── concerns.html           # Detailed impact concerns (water, power, noise, ...)
├── timeline.html           # Key public meeting dates with .ics download
├── myths.html              # Myths & facts
├── take-action.html        # Three steps: sign petition, email reps, attend meeting
├── representatives.html    # Mayor / Council / Planning Commission / County Commissioner
├── resources.html          # Local docs, regulators, other community fights, reporting
├── styles.css              # Mobile-first stylesheet
├── script.js               # Nav, banner, sticky CTA, .ics downloads, mailto helper
├── logo.png                # M-1 brand mark
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots
├── vercel.json             # Static deploy config (clean URLs + cache + security headers)
├── ATTRIBUTIONS.md         # Logo, photo, and content credits
├── .gitignore
└── README.md
```

## Maintaining shared chrome across pages

The header, urgent banner placeholder (`#urgentBanner`), nav, and footer are **duplicated** in each HTML file between the comments `<!-- BEGIN SHARED CHROME -->` / `<!-- END SHARED CHROME -->` and `<!-- BEGIN SHARED FOOTER -->` / `<!-- END SHARED FOOTER -->`. If you change the nav (or footer links), update every page. Search for `BEGIN SHARED` to find all occurrences quickly.

The **next-meeting banner** and **sticky "Take Action" CTA** are injected by `script.js` — no HTML edits needed when meetings change.

## Updating meeting dates

All meetings live in a single `MEETINGS` array near the top of `script.js`. Each entry needs an `id`, `title`, `start` (ISO 8601 with timezone), `durationMinutes`, `location`, and `description`. Adding or moving a meeting:

1. Edit the `MEETINGS` array in `script.js`.
2. (Optional) Reflect the change on `timeline.html`, which renders timeline entries in static HTML for SEO. The `data-ics="<id>"` attribute on each "Add to calendar" link wires up to the corresponding meeting in the `MEETINGS` array.

The top banner automatically picks the soonest upcoming meeting.

## Deploying to Vercel

The site deploys as a pure static site — there is no build step.

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com/new), import the GitHub repo.
3. When asked for a framework preset, choose **Other**.
4. Leave **Build Command** empty and set the **Output Directory** to `./` (the project root).
5. Click **Deploy**.

Once it's live you can attach a custom domain from the Vercel project settings under **Domains**.

If you prefer the Vercel CLI:

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

## Editing the content

All copy lives in `index.html` and is grouped by `<section>`. To update:

- **Headlines / hero copy** — search for `class="hero"`.
- **Concerns** — search for `id="concerns"`. Each concern is a `<article class="concern-card">`.
- **Myths vs Facts** — search for `id="facts"`. Each row is a `<article class="myth-card">`.
- **Resources** — search for `id="resources"`. Each link is a `<a class="resource-card">`.
- **Take Action** — search for `id="action"`.

Colors, spacing, and typography are controlled by CSS custom properties at the top of `styles.css` under `:root`.

## Accessibility & performance notes

- Mobile-first responsive layout (single column → 2 → 3/4 columns).
- Sticky, accessible nav with hamburger toggle, ARIA attributes, and Escape-to-close.
- Skip-to-main-content link.
- Respects `prefers-reduced-motion`.
- No JavaScript framework, no tracking, minimal network requests.

## License

Content and code are released to the community. Use, fork, and share freely.
