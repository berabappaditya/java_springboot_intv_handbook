# Java & Spring Boot Interview Handbook

Interactive single-page study tool. No build step — just open `index.html`.

## Running

Double-click `index.html`, or from a terminal:

```bash
# macOS / Linux
open interview-handbook/index.html

# Windows
start interview-handbook/index.html
```

If you need CORS-free loading for future ES-module use, serve it locally:

```bash
# Python 3
python -m http.server 8080 --directory interview-handbook
# then open http://localhost:8080
```

## Adding your real Q&A content

Open `js/data.js`. The file exports a single array `HANDBOOK_DATA`. Each entry is a **category**:

```js
{
  id: "my-category",       // unique slug (used for URL state / filtering)
  title: "My Category",   // displayed in sidebar
  icon: "🔥",              // emoji shown next to title
  questions: [ ... ]
}
```

Each **question** inside the array:

```js
{
  id: "mc-1",                    // unique id — used to persist "reviewed" state
  question: "What is X?",       // the question text shown in the accordion header
  answer: `Markdown-ish text.   // supports **bold**, \`inline code\`,
                                 // \`\`\`java ... \`\`\` fenced code blocks,
                                 // | table | rows |, - bullet lists, 1. numbered lists`,
  difficulty: "easy",            // "easy" | "medium" | "hard"
  tags: ["spring", "beans"]     // array of keyword strings (searchable)
}
```

### Supported answer formatting

| Syntax | Renders as |
|--------|-----------|
| `**text**` | **Bold** |
| `` `code` `` | Inline monospace |
| ```` ```java\n...\n``` ```` | Syntax-highlighted code block with Copy button |
| `\| col \| col \|` (markdown table) | HTML table |
| `- item` or `* item` | Bullet list |
| `1. item` | Numbered list |
| Blank line | Paragraph break |

## Features

- **Sidebar navigation** — click a category to filter; "All" shows everything
- **Live search** — filters by question text, answer content, and tags; highlights matches
- **Difficulty filter** — Easy / Medium / Hard pills
- **Accordion cards** — click to expand/collapse; keyboard accessible
- **Mark as Reviewed** — checkbox on each card; progress bar at top; persists in localStorage
- **Expand All / Collapse All** — bulk toggle buttons
- **Dark / Light theme** — toggle in top-right; persists in localStorage
- **Copy button** — on every code block
- **Mobile responsive** — sidebar becomes a hamburger drawer on small screens

## Project structure

```
interview-handbook/
├── index.html                        Main Q&A app shell
├── java_collections_framework.html   Topic handbook: Collections
├── java-evolution-handbook.html      Topic handbook: Java 8 → 25
├── spring-boot-handbook.html         Topic handbook: Spring Boot notes
├── css/
│   ├── tokens.css      Design tokens — single source of truth for
│   │                   colors/fonts/radii (dark default + light)
│   ├── components.css  Shared components (site topbar, badges, tables, tabs)
│   └── styles.css      Main-app styles, consumes tokens
└── js/
    ├── theme.js        Shared dark/light toggle (localStorage, all pages)
    ├── data.js         ← PASTE YOUR Q&A HERE
    ├── search.js       Filter / highlight logic
    └── app.js          Rendering, state, event wiring
```

## Design system

All pages share one theme. `css/tokens.css` defines the palette
(dark is the default; `[data-theme="light"]` overrides it). Each topic
handbook keeps its own page-local CSS variable names but remaps them onto
the shared tokens in its `:root` block — restyle the whole site by editing
`tokens.css` only. Every page loads `js/theme.js`, so the theme choice
persists across pages (`?theme=light|dark` in the URL also works).
