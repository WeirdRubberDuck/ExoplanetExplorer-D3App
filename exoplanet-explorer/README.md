# Exoplanet Explorer

## Chart Windows

Each chart toolbar has an **Open in New Window** control. It opens an independent
chart view using the current columns (including parallel-coordinates axis order
and expanded uncertainty axes),
OpenSpace endpoint, and incoming-filter sync setting. Browser preferences may open
a tab instead of a window.

You can also open a chart directly using URL query parameters:

```text
/exoplanetexplorer/1/?chart=parallelcoordinates&columns=pl_rade,pl_bmasse,sy_dist&uncertaintycolumns=pl_bmasse,sy_dist&host=192.168.1.100&autosync=true
/exoplanetexplorer/1/?chart=scatterplotmatrix&columns=pl_rade,pl_bmasse,pl_orbper&host=192.168.1.100&port=4682&autosync=false
```

| Parameter | Values and behavior |
| --- | --- |
| `chart` | `parallelcoordinates` or `scatterplotmatrix` (`cornerplot` is an alias). Omit it for the dashboard. |
| `columns` | Ordered, comma-separated dataset field IDs. Repeated parameters are combined; duplicates and whitespace are removed. Applies only to standalone charts. |
| `uncertaintycolumns` | Parallel coordinates only: comma-separated base field IDs whose uncertainty axes should start expanded, for example `pl_bmasse,sy_dist` (not `pl_bmasse_err`). Repeated parameters are combined; duplicates and whitespace are removed. Omit it or use an empty value to leave all collapsed. |
| `host` | IPv4 address or hostname of the OpenSpace API, not a URL. |
| `port` | Integer from 1 to 65535. |
| `autosync` | Exactly `true` or `false`; automatically applies filtering **from OpenSpace**. Default: `false`. Works in both standalone and dashboard views. |
| `hidetopbar` | Exactly `true` or `false`; hides the top bar containing chart settings and controls. Default: `false`. |

Endpoint precedence is per field: valid URL parameter, then the corresponding
`window.OpenSpaceEnvironment` value, then `localhost` / `4682`. Invalid parameters
show a warning and retain the fallback. Columns are validated against the loaded
dataset; scatterplot matrices accept only numeric columns. Invalid columns are
ignored, or chart defaults are retained if no valid columns remain. A matrix needs
at least two numeric columns to render.

Uncertainty expansions must refer to selected numeric columns with uncertainty
data. Unavailable or unselected entries are ignored with a warning; they do not
add main columns implicitly. When `columns` is omitted, validation uses the default
column selection. The existing uncertainty checkboxes remain editable after startup.

Parameters configure initial state. Changing controls does not rewrite the URL;
launching another chart window serializes the current configuration. Standalone
views retain chart settings, clear-filter controls, connection status, theme and
incoming-filter sync. Turn sync off to inspect the full dataset while disconnected.
With sync enabled, the chart waits for OpenSpace filtering; an empty remote
selection remains empty. Filtering is not automatically sent back to OpenSpace.

Windows do not share settings or selections directly. Launching does not copy
brushes, other visual settings, or uploaded CSV data: each window loads the bundled
dataset and connects to OpenSpace independently. OpenSpace filtering uses row
indices, so its dataset and row order must match the browser's dataset.

The installed API client uses insecure `ws://` sockets. HTTPS pages may be blocked
from connecting by mixed-content policy. Use compatible deployment settings;
the app does not bypass browser security. Popup controls must be triggered by a
user click and remain subject to browser popup policy.

## Development

Run commands from this directory:

```sh
npm run dev
npm test
npm run build
```

The development URL is typically `http://localhost:5173/exoplanetexplorer/1/`.
Tests use Node's built-in test runner and the existing TypeScript compiler.

## Vite Template Notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
