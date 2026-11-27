# Gardner M-1 Rezoning (Case 26-303-02)

A simple, fast, mobile-first static website about a request to rezone about **460 acres** east of Clare Road, between W 178th St and 191st St, from Johnson County **RUR** to City of Gardner **M-1** (Restricted Industrial). **Case 26-303-02** is a straight M-1 request: no development plan has been submitted with it. The Gardner Planning Commission public hearing is **Tuesday, December 15, 2026, at 7:00 p.m.** at Gardner City Hall.

Pages from the May 2026 data center debate — the old homepage, proposal, myths, resources, and meeting timeline — live under **Archive**. Those pages describe the earlier proposal, which was withdrawn.

This is a community project. It is **not** affiliated with any government agency or developer.

## Stack

Intentionally simple — no build step, no framework, no dependencies.

- Plain **HTML**, **CSS**, and a small bit of vanilla **JavaScript**
- Google Fonts (Inter) over the network
- Statically hosted on **Vercel** (free tier)
- Source on **GitHub**

That's it. The site is plain HTML pages plus shared CSS/JS.

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
├── index.html                      # Home — Case 26-303-02
├── meetings.html                   # Dec 15, 2026 Planning Commission hearing
├── take-action.html                # Get Involved
├── representatives.html            # Mayor / Council / Planning Commission / County Commissioner
├── archive.html                    # May 2026 archive hub
├── archive-home-2026-05.html       # May 2026 homepage
├── archive-meetings-2026-05.html   # May–June 2026 meeting timeline
├── the-proposal.html               # Archive — earlier data center proposal
├── myths.html                      # Archive — myths and facts
├── resources.html                  # Archive — documents and reporting
├── styles.css                      # Mobile-first stylesheet
├── script.js                       # Nav, hearing banner, petition slot, .ics downloads
├── logo.png                        # M-1 brand mark
├── sitemap.xml                     # SEO sitemap
├── robots.txt                      # SEO robots
├── vercel.json                     # Static deploy config (clean URLs + cache + security headers)
├── ATTRIBUTIONS.md                 # Logo, photo, and content credits
├── .gitignore
└── README.md
```

## Maintaining shared chrome across pages

The header, urgent banner placeholder (`#urgentBanner`), nav, and footer are **duplicated** in each HTML file between the comments `<!-- BEGIN SHARED CHROME -->` / `<!-- END SHARED CHROME -->` and `<!-- BEGIN SHARED FOOTER -->` / `<!-- END SHARED FOOTER -->`. If you change the nav (or footer links), update every page. Search for `BEGIN SHARED` to find all occurrences quickly.

The **top banner** is built by `buildBanner()` in `script.js`. It links to the December 15, 2026 Planning Commission hearing.

## Updating meeting dates

All meetings live in a single `MEETINGS` array near the top of `script.js`. Each entry needs an `id`, `title`, `start` (ISO 8601 with timezone), `durationMinutes`, `location`, and `description`. Adding or moving a meeting:

1. Edit the `MEETINGS` array in `script.js`.
2. (Optional) Reflect the change on `meetings.html`, which renders meeting entries in static HTML for SEO. The `data-ics="<id>"` attribute on each "Apple Calendar" link wires up to the corresponding meeting in the `MEETINGS` array.

The December 15 hearing uses Central Standard Time (`-06:00`). Older May 2026 entries stay in the array so the archive meetings page can still offer calendar files.

## Petition link

`PETITION_URL` near the top of `script.js` is the only place to set a petition URL. Leave it as `""` until one exists. Elements with `data-petition-slot` then stay the static text "Petition coming soon" and are not links. Paste an `https://` URL into `PETITION_URL` to turn every slot into a "Join the petition" link.

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

Current copy lives on `index.html`, `meetings.html`, and `take-action.html`. May 2026 pages are linked from `archive.html`.

- **Headlines / hero copy** — `index.html`, `class="hero"`.
- **Meetings** — `meetings.html`. The May 2026 timeline is `archive-meetings-2026-05.html`.
- **Get Involved** — `take-action.html`.
- **The Proposal, Myths, Resources** — archive pages. Each one starts with the May 2026 notice.
- **Archive hub** — `archive.html`.

Colors, spacing, and typography are controlled by CSS custom properties at the top of `styles.css` under `:root`.

## Accessibility & performance notes

- Mobile-first responsive layout (single column → 2 → 3/4 columns).
- Sticky, accessible nav with hamburger toggle, ARIA attributes, and Escape-to-close.
- Skip-to-main-content link.
- Respects `prefers-reduced-motion`.
- No JavaScript framework. Plausible analytics and Meta Pixel are included.

## License

Content and code are released to the community. Use, fork, and share freely.
