# Ink Novels Story Bible

A polished, mobile-friendly static website for building a webnovel story bible chapter by chapter.

## What it does

- Paste a chapter into the ingestion form.
- The browser extracts likely characters, locations, organizations, systems, artifacts, terms, and event beats.
- Everything is stored locally in `localStorage` so the bible keeps growing between sessions.
- The UI cross-links entities by co-occurrence and visualizes them in an animated relationship graph.
- The site now ships with a seeded Chapter 1 dossier for **The train is About to Depart, May You All Live Forever** so the bible starts populated instead of empty.
- You can export the bible as JSON and import it later.

## Free hosting

This project is static HTML/CSS/JS, so it can be hosted for free on:

- **GitHub Pages**
- Netlify
- Cloudflare Pages

### Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the main branch (or your preferred branch) and the `/ (root)` folder.
5. Save. GitHub will publish the site at a `github.io` URL.

## Local preview

You can preview locally with any static server, for example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Notes about extraction

The current extractor is heuristic and fully client-side so it can run on free static hosting without a backend.
If you later want stronger automatic extraction, this UI can be upgraded to call an LLM-backed API or GitHub Actions workflow.
