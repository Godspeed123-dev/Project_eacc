# E/ACC

## Structure

```
.
├── frontend/
│   └── public/          Static site (HTML, CSS, JS, images/gifs/gallery).
│                         No build step — plain files, deployable anywhere.
│       ├── index.html
│       ├── gallery.html
│       ├── css/style.css
│       ├── js/main.js
│       └── images/ gifs/ gallery/ ...
│
└── backend/
    └── src/
        ├── server.js         Express app: serves frontend/public + mounts /api
        ├── routes/price.js   GET /api/price
        └── services/
            └── coingecko.js  Fetches + caches price data from CoinGecko
```

The split exists so each half can be worked on, deployed, or replaced
independently:

- **frontend/public** has zero dependency on the backend to *render* — you
  can open `index.html` directly or host the folder on any static host
  (Netlify, Vercel, GitHub Pages, S3, Cloudflare Pages). The only feature
  that needs the backend is the live price widget (`/api/price`); without
  it, that widget just shows "Error loading data" and the rest of the site
  works normally.
- **backend** is a small Express app whose only real job today is proxying
  and caching the CoinGecko price call server-side (avoids CORS issues,
  rate limits, and keeps the coin ID configurable via `.env` instead of
  hardcoded in client JS). It also serves the frontend, so in production
  you can run one process and one port.

## Running locally

```bash
cd backend
npm install
cp .env.example .env   # then edit COINGECKO_COIN_ID to your real token's ID
npm start               # http://localhost:3000
```

That's it — the backend serves `frontend/public` directly, so visiting
`http://localhost:3000` gives you the full site with a working price widget.

For frontend-only work (styling, copy, images) with no backend running,
just open `frontend/public/index.html` in a browser, or serve that folder
with any static server, e.g. `npx serve frontend/public`.

## Deploying

**Together (simplest):** deploy `backend/` to any Node host (Render,
Railway, Fly.io, a VPS, etc.) with the environment variables from
`.env.example` set. It serves the frontend itself.

**Separately:** deploy `frontend/public/` to a static host, and `backend/`
to a Node host. If they're on different domains, point the frontend's
`fetch("/api/price")` call in `js/main.js` at the backend's full URL, and
add CORS headers in `backend/src/server.js` (`app.use(require("cors")())`
after `npm install cors`).

## Adding to the backend

`backend/src/routes/` and `backend/src/services/` are split so new
endpoints follow the same pattern as `price.js` /  `coingecko.js`: a
route file handles HTTP, a service file handles the external
call/caching/business logic. Mount new routers in `server.js`.

## Extending the frontend

There's no bundler or framework — `css/style.css` and `js/main.js` are
shared between `index.html` and `gallery.html`, so edits to either apply
to both pages. Add new pages the same way: link `css/style.css`, and add
a `<script>` tag for `js/main.js` (or a new file) at the bottom of
`<body>`.
