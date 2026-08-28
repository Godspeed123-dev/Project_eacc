# E/ACC Website

A static HTML/CSS/JavaScript website deployed with Cloudflare Pages.

## Structure

- `index.html` — main page
- `gallery.html` — gallery page
- `css/` — stylesheets
- `js/` — client-side JavaScript
- `images/`, `gallery/`, `gifs/` — media assets

## Price data

The live token data is requested directly from CoinGecko in the browser. This version does not require a Node/Express backend.

## Cloudflare Pages

For this repository's root deployment:

- Production branch: `main`
- Root directory: `/`
- Build command: leave empty
- Build output directory: `/` (root)

Connect this repository to the existing Cloudflare Pages project to keep the existing `project-eacc.pages.dev` domain.
