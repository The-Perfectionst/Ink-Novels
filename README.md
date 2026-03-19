# Ink Novels — Arabic Translation Studio

A lightweight web prototype for translating large amounts of novel text into Arabic with an AI-first workflow.

## What it does

- Accepts long-form source text for a chapter or scene.
- Splits the text into paragraph-aware chunks for safer batching.
- Tracks glossary entries for names, places, ranks, and invented terminology.
- Generates a reusable prompt optimized for accurate Arabic novel translation.
- Estimates throughput so you can tune chunk size for faster batch runs.
- Exports the chunk plan as JSON for later automation.

## Why this is a strong starting point

High-quality fiction translation needs more than a single “translate this” prompt. This prototype focuses on the main quality levers:

1. **Stable chunking** so scenes and dialogue do not get broken in awkward places.
2. **Glossary locking** to keep character names and worldbuilding terms consistent.
3. **Style constraints** so the Arabic reads like a novel, not a literal machine translation.
4. **QA instructions** so each chunk gets checked for omissions and tone drift.

## Recommended production architecture

If you want to evolve this into a real app, the next best steps are:

- Add a backend queue that sends chunks to your preferred AI model in parallel.
- Save glossary memory and previous chapter context in a database.
- Run a second-pass QA model that compares English and Arabic outputs for omissions.
- Add human review tools for approving glossary changes and fixing edge cases.
- Store translation history so later chapters remain stylistically consistent.

## Running locally

Because this version is dependency-free, you can open `index.html` directly in a browser or serve it with a tiny local server.

Example using Python:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
