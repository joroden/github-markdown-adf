# github-markdown-adf

[![npm version](https://img.shields.io/npm/v/github-markdown-adf)](https://www.npmjs.com/package/github-markdown-adf)
[![CI](https://github.com/joroden/github-markdown-adf/actions/workflows/ci.yml/badge.svg)](https://github.com/joroden/github-markdown-adf/actions)
[![Socket Badge](https://badge.socket.dev/npm/package/github-markdown-adf)](https://badge.socket.dev/npm/package/github-markdown-adf)
[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](https://unlicense.org)

Bidirectional **GitHub Flavored Markdown (GFM) to / from Atlassian Document Format (ADF)** converter. 

## AI Notice

This package has predominantly AI-generated code. Keep this in mind in case you have a strict policy against using ai-generated code in your project.

## Install

```bash
npm install github-markdown-adf
# or
pnpm add github-markdown-adf
# or
yarn add github-markdown-adf
```

## Usage

### Markdown → ADF

```typescript
import { mdToAdf } from 'github-markdown-adf';

const markdown = `
# Hello World

This is **bold** and _italic_ text.

- Item 1
- Item 2
`;

const adf = mdToAdf(markdown);
// adf is a fully typed AdfDoc object
console.log(JSON.stringify(adf, null, 2));
```

### ADF → Markdown

```typescript
import { adfToMd } from 'github-markdown-adf';

const adf = {
  version: 1,
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Paragraph Text' }]
    }
  ]
};

const markdown = adfToMd(adf);
```

## CDN / Browser (no bundler)

A self-contained browser bundle with all dependencies inlined is available via CDN:

**IIFE (`<script>` tag)**
```html
<script src="https://cdn.jsdelivr.net/npm/github-markdown-adf/dist/browser/index.iife.js"></script>
<script>
  const adf = GithubMarkdownAdf.mdToAdf('# Hello World');
  const md  = GithubMarkdownAdf.adfToMd(adf);
</script>
```

**ESM (`<script type="module">`)**
```html
<script type="module">
  import { mdToAdf, adfToMd } from 'https://cdn.jsdelivr.net/npm/github-markdown-adf/dist/browser/index.js';

  const adf = mdToAdf('# Hello World');
</script>
```

## Supported Features

### Markdown → ADF

| Feature | Syntax |
|---|---|
| Headings | `# H1` through `###### H6` |
| Paragraphs | Plain text blocks |
| Bold | `**bold**` |
| Italic | `_italic_` |
| Strikethrough | `~~strike~~` |
| Inline code | `` `code` `` |
| Underline | `<u>text</u>` |
| Subscript / Superscript | `<sub>x</sub>` / `<sup>2</sup>` |
| Links | `[text](url "title")` |
| Images | `![alt](url)` |
| Blockquotes | `> text` |
| Horizontal rules | `---` |
| Bullet lists | `- item` |
| Ordered lists | `1. item` |
| Nested lists | Indented list items |
| Task lists | `- [ ] todo` / `- [x] done` |
| Code blocks | ` ```lang ` fenced blocks |
| Tables | GFM pipe tables |
| Mentions | Plain `@username` text → ADF mention nodes when `mdToAdf` mentions option is enabled |
| GitHub Alerts | `> [!NOTE]`, `> [!WARNING]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!CAUTION]` → ADF Panels |
| Expandable sections | `<details><summary>…</summary>…</details>` → ADF Expand nodes |

### ADF → Markdown

| ADF Node / Mark | Output |
|---|---|
| Text marks | `bold`, `italic`, `strike`, `underline`, `` code ``, links, color, background |
| Panels (info, note, warning, success, error, tip) | GitHub-style `> [!NOTE]` alerts |
| Expand / NestedExpand | `<details><summary>…</summary>…</details>` |
| Tables | GFM pipe tables |
| Bullet / ordered lists | `- item` / `1. item` |
| Task lists | `- [ ]` / `- [x]` |
| Decision lists | `- [ ]` / `- [x]` |
| Mentions | `@accountId` |
| Emojis | Unicode emoji character |
| Hard breaks | `\` trailing newline |
| Media (single, group, inline) | Markdown image links |
| Block cards / embed cards / inline cards | Markdown links |
| Date | ISO date string |
| Status | Inline text |
| Layout sections | Rendered content (layout structure flattened) |

## API

```typescript
import { mdToAdf, adfToMd } from 'github-markdown-adf';
```

### `mdToAdf(markdown: string): AdfDoc`

Converts a GFM string to an ADF document object. Parses using mdast and micromark GFM extensions, with support for tables, task lists, strikethrough, and GitHub Alert syntax (`> [!NOTE]`, `> [!WARNING]`, etc.).

### `mdToAdf(markdown: string, options?: MdToAdfOptions): AdfDoc`

Converts a GFM string to an ADF document object, with optional parsing controls such as custom mention mapping.

### `adfToMd(adf: AdfDoc, options?: AdfToMdOptions): string`

Converts an ADF document object to a GFM string. Handles all standard ADF node and mark types and produces clean, readable output targeting GitHub Flavored Markdown.

## Options

`mdToAdf` and `adfToMd` accept an optional second argument to control mention handling and rendering behaviour.

### `MdToAdfOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `mentions` | `boolean \| ((username: string) => MentionNode['attrs'] \| null \| undefined)` | `false` | When omitted or `false`, plain `@username` text stays unchanged. When `true`, plain `@alice` text becomes `{ type: 'mention', attrs: { id: 'alice', text: '@alice' } }`. When a function is provided, it receives the username without the `@` prefix and should return mention attrs. Returning `null` or `undefined` leaves the original markdown text unchanged. |

### `AdfToMdOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `mentions` | `boolean \| ((attrs: MentionNode['attrs']) => string)` | `true` | When `true`, renders mention nodes as the display text if available, otherwise as `@{id}`. When `false`, renders as plain text: display text if available, otherwise just the bare `{id}` without an `@` prefix. When a function is provided, it receives the mention attrs and its return value is used as-is. |

### Usage example

```typescript
// Convert plain @mentions into ADF mention nodes
const adfDoc = mdToAdf('Assigned to @some-user', {
  mentions: (username) => ({
    id: 'jira-account-id',
    text: username === 'some-user' ? '@Some User' : `@${username}`,
  }),
});

// Render mentions as plain text instead of @-tagged references
const md = adfToMd(adfDoc, { mentions: false });

// Render mentions with a custom formatter
const mdWithCustomMentions = adfToMd(adfDoc, {
  mentions: (attrs) => `[@${attrs.text ?? attrs.id}](https://example.com/users/${attrs.id})`,
});
```

## TypeScript Types

All ADF types and option interfaces are exported for use in your own code:

```typescript
import type { AdfDoc, AdfNode, AdfMark, AdfInlineNode, AdfTopLevelBlockNode } from 'github-markdown-adf';
// Also available: ParagraphNode, HeadingNode, TableNode, PanelNode, CodeBlockNode,
// BulletListNode, OrderedListNode, TaskListNode, TextNode, MentionNode, ...and more

import type { AdfToMdOptions, MdToAdfOptions } from 'github-markdown-adf';
```

## Requirements

- Node.js ≥ 22, **or any modern browser** (Chrome 92+, Firefox 95+, Safari 15.2+)

## License

[Unlicense](https://unlicense.org) — public domain. No restrictions.
