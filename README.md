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
├── index.html      # All page content
├── styles.css      # Mobile-first stylesheet
├── script.js       # Mobile nav + share/copy link
├── vercel.json     # Static deploy config
├── .gitignore
└── README.md
```

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
