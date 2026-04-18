# Deploying the UI (grammar.tinygods.dev)

This app is a **single-page application** with client-side routing (`/`, `/writing-prompts`, `/fantasy-names`, … `/usecase5`).

Configure the web server so **every path** serves **`index.html`** (fallback for `history` API / `BrowserRouter`). Without this, a direct visit or refresh on `/writing-prompts` returns **404** from the server even though the client router knows the route.

Examples:

- **nginx**: `try_files $uri $uri/ /index.html;`
- **Netlify / Vercel / Cloudflare Pages**: default SPA behavior or a `_redirects` / rewrite rule to `index.html`.

Static files under `public/` (`robots.txt`, `sitemap.xml`, `og.png`, `favicon_io/*`) are copied to the site root at build time.
