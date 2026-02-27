# AGENTS.md

## Cursor Cloud specific instructions

**Cosmic Dust Studio v4.0** is a zero-dependency, zero-build static web application (HTML/CSS/JS + WebGL shaders). It runs entirely in the browser.

### Project structure

- `index.html` — Main page with dashboard and designer UI
- `main.js` — `VisualEngine` (Three.js wrapper) and `StudioManager` (app controller)
- `shaders.js` — GLSL fragment shader library (14 visual styles)
- `style.css` — Full application styling

### Running the dev server

Serve the static files on any port with any HTTP server. The simplest option:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080` in Chrome. WebGL support is required (Chrome works in the cloud VM).

### Key caveats

- Three.js r128 is loaded from CDN (`cdnjs.cloudflare.com`); internet access is needed on first load.
- There is no build step, no linter, no test suite, and no package manager.
- All project data is stored in `localStorage` under key `COSMIC_STUDIO_VAULT_V4`.
- The `file://` protocol may not work for WebGL; always use an HTTP server.
