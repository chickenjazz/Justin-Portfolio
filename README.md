# Justin Manuzon Portfolio

A React + Vite portfolio, written in **JavaScript and JSX**. There is no Next.js, App Router, or TypeScript setup to learn.

## Run the website

Use Node.js 20.19+ or 22.12+ (Node 24 is supported).

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal, normally **http://localhost:5173**. Saving a source file updates the browser automatically.

## Where to edit things

| What you want to change | File or folder |
| --- | --- |
| Biography, projects, education, credentials, skills, contact links | `src/content/site.js` |
| Which sections appear and their order | `src/App.jsx` |
| A section's layout or text presentation | `src/components/sections/` |
| Colors, spacing, typography, responsive layout | `src/styles.css` and `src/theme.css` |
| Project carousel and detailed views | `src/components/sections/Projects.jsx` and `src/components/ProjectDetails.jsx` |
| Browser title, description, and search indexing | `index.html` |
| Product requirements and architecture | `docs/PRD.md` and `docs/ARCHITECTURE.md` |

For example, change your introduction in `src/content/site.js`. To change how it is displayed, open `src/components/sections/About.jsx`.

## Project structure

```text
index.html                 Browser page and metadata
vite.config.js             Vite configuration
src/
  main.jsx                 Starts React
  App.jsx                  Assembles the sections
  styles.css               Styling
  content/site.js          Your portfolio content
  components/
    ProjectProgress.jsx    Viewed-state behavior
    sections/              Header, Hero, About, Projects, etc.
  render.jsx               Build-only HTML rendering
scripts/build.js           Builds the static website
docs/                      Requirements, architecture, content checklist
```

JSX is HTML-like markup inside JavaScript. Each section is a React function that returns its markup. The content file contains ordinary objects and arrays.

## Build and preview

```sh
npm run build
npm run preview
```

The publishable website is in **`dist/`**. Upload that folder to a static host; there is no application server to run in production. `npm run preview` is only for checking the build locally.

The build also writes the React content into the HTML so the page remains readable with JavaScript disabled. `.prerender/` is an ignored build cache, not a folder you need to edit or deploy. During development React renders the page normally; in production it adds the interactive behavior to the existing HTML.

Use `npm run format` to keep the source readable. Dependencies are pinned in `package-lock.json`; use `npm ci` for a reproducible install.

## Current status

Your supplied profile, projects, study results, education, credentials, and contact links are included. Projects use full-screen horizontal slides with arrow, dot, swipe, and keyboard navigation. View project opens the full case study in a modal; native expandable details are the no-JavaScript fallback. The mascot, gallery photos, resume, and missing project URLs remain explicitly marked placeholders.

Interactive 3D, a gallery lightbox, full production content validation, and the complete accessibility/performance audit remain future work. The site stays `noindex` until launch content is ready. `docs/CONTENT.md` records outstanding assets.

The repository's existing `.gitignore` excludes `docs/`; those local documents are authoritative but are not currently versioned. Do not put sensitive evidence in public content files: all imported portfolio data ships to the browser.
