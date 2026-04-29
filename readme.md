# logseq-md-convert

A Logseq plugin that converts between Logseq blocks and standard GitHub-flavored Markdown (GFM).

## Features

- **Logseq → Markdown**: Copy a focused block and all its children as GFM markdown to the clipboard
- **Markdown → Logseq**: Paste GFM markdown into a panel and insert it as nested Logseq blocks

## Installation

### From the Marketplace
Search for **MD Convert** in the Logseq plugin marketplace.

### Load Unpacked (Development)
1. Clone this repo and run:
   ```bash
   npm install
   npm run build
   ```
2. In Logseq: **Settings → Plugins → Load unpacked plugin**
3. Select the `dist/` folder

## Usage

Two buttons appear in the Logseq toolbar:

| Button | Direction | What it does |
|--------|-----------|--------------|
| **⇢ MD** | Logseq → Markdown | Click into any block, then press this to copy it and all children as markdown to the clipboard |
| **MD ⇢** | Markdown → Logseq | Opens a panel; paste GFM markdown and click **Insert Blocks** to add it as children of the focused block |

Both actions are also available as slash commands:
- `/Copy block as Markdown`
- `/Insert Markdown as blocks`

## Conversion Reference

### Logseq → Markdown

| Logseq | Output |
|--------|--------|
| `TODO task` | `- [ ] task` |
| `DONE task` | `- [x] task` |
| Nested child blocks | Indented list items (`2` spaces per level) |
| `# Heading` block at root | `# Heading` (preserved as heading) |
| `[[page links]]`, `#tags`, `((refs))`, `key:: value` | Preserved as-is |

**Example:**

Logseq blocks:
```
- Project notes
  - TODO Write tests
  - DONE Set up repo
  - See [[Design Doc]] for context
```

Output markdown:
```markdown
- Project notes
  - [ ] Write tests
  - [x] Set up repo
  - See [[Design Doc]] for context
```

### Markdown → Logseq

| Markdown | Logseq block |
|----------|--------------|
| `- [ ] task` | `TODO task` |
| `- [x] task` | `DONE task` |
| `1. item` | `- item` (converted to bullet) |
| Nested list items | Child blocks |
| `# Heading` | Block with heading content |
| YAML frontmatter | `key:: value` properties block |
| Fenced code blocks | Single block with full fence preserved |

**Example:**

Input markdown:
```markdown
---
tags: project
---
# Project Notes
- [ ] Write tests
- [x] Set up repo
```

Inserted blocks:
```
tags:: project
# Project Notes
TODO Write tests
DONE Set up repo
```

## Development

```bash
pnpm run dev    # start dev server with HMR
pnpm run build  # production build to dist/
```

## License

MIT
