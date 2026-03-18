import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type {
  AdfDoc,
  TableNode,
  TableRowNode,
  TableHeaderNode,
  TableCellNode,
  ParagraphNode,
  HeadingNode,
  BulletListNode,
  ListItemNode,
  OrderedListNode,
  BlockquoteNode,
  CodeBlockNode,
  TextNode,
} from '../../src/types/index.js';

describe('Group 1: Empty cells in GitHub Markdown tables → ADF', () => {
  const md = '|  | Name | Value |\n| --- | --- | --- |\n| row1 |  | 42 |';

  it('empty first header cell has paragraph with empty content', () => {
    const doc = mdToAdf(md);
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    const firstHeader = headerRow.content[0] as TableHeaderNode;
    expect(firstHeader.content[0]).toEqual({ type: 'paragraph', content: [] });
  });

  it('empty body cell has paragraph with empty content', () => {
    const doc = mdToAdf(md);
    const table = doc.content[0] as TableNode;
    const bodyRow = table.content[1] as TableRowNode;
    const emptyCell = bodyRow.content[1] as TableCellNode;
    expect(emptyCell.content[0]).toEqual({ type: 'paragraph', content: [] });
  });

  it('all-empty header row: every header has empty paragraph', () => {
    const doc = mdToAdf('|  |  |  |\n| --- | --- | --- |\n| a | b | c |');
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    expect(headerRow.content).toHaveLength(3);
    for (const cell of headerRow.content) {
      expect((cell as TableHeaderNode).content[0]).toEqual({
        type: 'paragraph',
        content: [],
      });
    }
  });

  it('all-empty body row: every cell has empty paragraph', () => {
    const doc = mdToAdf('| A | B | C |\n| --- | --- | --- |\n|  |  |  |');
    const table = doc.content[0] as TableNode;
    const bodyRow = table.content[1] as TableRowNode;
    expect(bodyRow.content).toHaveLength(3);
    for (const cell of bodyRow.content) {
      expect((cell as TableCellNode).content[0]).toEqual({
        type: 'paragraph',
        content: [],
      });
    }
  });

  it('single column with only empty cells has empty paragraphs throughout', () => {
    const doc = mdToAdf('|  |\n| --- |\n|  |\n|  |');
    const table = doc.content[0] as TableNode;
    expect(table.content).toHaveLength(3);
    const headerCell = (table.content[0] as TableRowNode)
      .content[0] as TableHeaderNode;
    const bodyCell1 = (table.content[1] as TableRowNode)
      .content[0] as TableCellNode;
    const bodyCell2 = (table.content[2] as TableRowNode)
      .content[0] as TableCellNode;
    expect(headerCell.content[0]).toEqual({ type: 'paragraph', content: [] });
    expect(bodyCell1.content[0]).toEqual({ type: 'paragraph', content: [] });
    expect(bodyCell2.content[0]).toEqual({ type: 'paragraph', content: [] });
  });
});

describe('Group 2: Full GitHub issue description → ADF → Markdown roundtrip', () => {
  const issue = [
    '# Bug Report: Parser fails on nested lists',
    '',
    '## Summary',
    '',
    'The parser has a **critical** issue with *nested* lists.',
    'It can handle ***bold italic*** and ~~strikethrough~~ content.',
    'Use `mdToAdf()` to convert.',
    '',
    '## Steps to Reproduce',
    '',
    '1. Install the package',
    '2. Call the function',
    '3. Observe the error',
    '',
    '## Checklist',
    '',
    '- [x] Reproduced locally',
    '- [ ] Fix merged',
    '- [ ] Tests updated',
    '',
    '## Example Table',
    '',
    '| Feature | Status | Notes |',
    '| --- | --- | --- |',
    '| **Bold** | Working | See [docs](https://example.com) |',
    '| Tables | Broken | Fix needed |',
    '',
    '## Code Example',
    '',
    '```typescript',
    'const result = mdToAdf(markdown)',
    '```',
    '',
    '> [!WARNING]',
    '> This is a breaking change',
    '',
    '> This is a regular blockquote',
    '',
    'Line one\\',
    'Line two',
    '',
    '[Visit GitHub](https://github.com)',
  ].join('\n');

  const result = adfToMd(mdToAdf(issue));

  it('H1 title is preserved', () => {
    expect(result).toContain('# Bug Report: Parser fails on nested lists');
  });

  it('H2 sections are preserved', () => {
    expect(result).toContain('## Summary');
    expect(result).toContain('## Steps to Reproduce');
    expect(result).toContain('## Checklist');
    expect(result).toContain('## Example Table');
    expect(result).toContain('## Code Example');
  });

  it('bold text is preserved', () => {
    expect(result).toContain('**critical**');
  });

  it('italic text is preserved', () => {
    expect(result).toContain('*nested*');
  });

  it('bold italic text is preserved', () => {
    expect(result).toContain('***bold italic***');
  });

  it('strikethrough is preserved', () => {
    expect(result).toContain('~~strikethrough~~');
  });

  it('inline code is preserved', () => {
    expect(result).toContain('`mdToAdf()`');
  });

  it('ordered list items are preserved', () => {
    expect(result).toContain('1. Install the package');
    expect(result).toContain('2. Call the function');
    expect(result).toContain('3. Observe the error');
  });

  it('task list checked item is preserved', () => {
    expect(result).toContain('- [x] Reproduced locally');
  });

  it('task list unchecked items are preserved', () => {
    expect(result).toContain('- [ ] Fix merged');
    expect(result).toContain('- [ ] Tests updated');
  });

  it('table structure is preserved', () => {
    expect(result).toContain('| Feature | Status | Notes |');
    expect(result).toContain('| --- | --- | --- |');
  });

  it('table cell bold content is preserved', () => {
    expect(result).toContain('**Bold**');
  });

  it('table cell link content is preserved', () => {
    expect(result).toContain('[docs](https://example.com)');
  });

  it('fenced code block is preserved', () => {
    expect(result).toContain('```typescript');
    expect(result).toContain('const result = mdToAdf(markdown)');
  });

  it('GitHub WARNING alert is preserved', () => {
    expect(result).toContain('> [!WARNING]');
    expect(result).toContain('This is a breaking change');
  });

  it('blockquote is preserved', () => {
    expect(result).toContain('> This is a regular blockquote');
  });

  it('hard line break content is preserved', () => {
    expect(result).toContain('Line one');
    expect(result).toContain('Line two');
  });

  it('link is preserved', () => {
    expect(result).toContain('[Visit GitHub](https://github.com)');
  });

  it('no raw ADF JSON leaks into output', () => {
    expect(result).not.toContain('"type":');
    expect(result).not.toContain('"content":');
    expect(result).not.toContain('"version":');
  });
});

describe('Group 3: Full ADF document → Markdown', () => {
  const adf: AdfDoc = {
    version: 1,
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Top Heading' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Second Level' }],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Third Level' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'strong', marks: [{ type: 'strong' }] },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'em', marks: [{ type: 'em' }] },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'strike', marks: [{ type: 'strike' }] },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'code', marks: [{ type: 'code' }] },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'underline', marks: [{ type: 'underline' }] },
          { type: 'text', text: ' ' },
          {
            type: 'text',
            text: 'link',
            marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
          },
          { type: 'text', text: ' ' },
          {
            type: 'text',
            text: 'sub',
            marks: [{ type: 'subsup', attrs: { type: 'sub' } }],
          },
          { type: 'text', text: ' ' },
          {
            type: 'text',
            text: 'sup',
            marks: [{ type: 'subsup', attrs: { type: 'sup' } }],
          },
          { type: 'hardBreak' },
          { type: 'text', text: 'after break' },
        ],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'top item' }],
              },
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'nested item' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'orderedList',
        attrs: { order: 5 },
        content: [
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'fifth' }] },
            ],
          },
          {
            type: 'listItem',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'sixth' }] },
            ],
          },
        ],
      },
      {
        type: 'taskList',
        attrs: { localId: 'tl-1' },
        content: [
          {
            type: 'taskItem',
            attrs: { localId: 'ti-1', state: 'TODO' },
            content: [{ type: 'text', text: 'pending task' }],
          },
          {
            type: 'taskItem',
            attrs: { localId: 'ti-2', state: 'DONE' },
            content: [{ type: 'text', text: 'done task' }],
          },
        ],
      },
      {
        type: 'decisionList',
        attrs: { localId: 'dl-1' },
        content: [
          {
            type: 'decisionItem',
            attrs: { localId: 'di-1', state: 'DECIDED' },
            content: [{ type: 'text', text: 'approved decision' }],
          },
        ],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'python' },
        content: [{ type: 'text', text: 'print("hello")' }],
      },
      { type: 'rule' },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'quoted text' }],
          },
        ],
      },
      {
        type: 'panel',
        attrs: { panelType: 'note' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'note content' }],
          },
        ],
      },
      {
        type: 'panel',
        attrs: { panelType: 'info' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'info content' }],
          },
        ],
      },
      {
        type: 'panel',
        attrs: { panelType: 'warning' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'warning content' }],
          },
        ],
      },
      {
        type: 'panel',
        attrs: { panelType: 'error' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'error content' }],
          },
        ],
      },
      {
        type: 'panel',
        attrs: { panelType: 'success' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'success content' }],
          },
        ],
      },
      {
        type: 'panel',
        attrs: { panelType: 'tip' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'tip content' }],
          },
        ],
      },
      {
        type: 'expand',
        attrs: { title: 'Click to expand' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hidden paragraph one' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hidden paragraph two' }],
          },
        ],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Col A' }],
                  },
                ],
              },
              {
                type: 'tableHeader',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Col B' }],
                  },
                ],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'val',
                        marks: [{ type: 'strong' }],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'plain' }],
                  },
                ],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [] }],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'inlineCard',
            attrs: { url: 'https://inlinecard.example.com' },
          },
        ],
      },
      { type: 'blockCard', attrs: { url: 'https://blockcard.example.com' } },
      {
        type: 'paragraph',
        content: [
          { type: 'mention', attrs: { id: 'user-42', text: '@alice' } },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'emoji', attrs: { shortName: ':rocket:', text: '🚀' } },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'status', attrs: { text: 'In Progress', color: 'blue' } },
        ],
      },
      {
        type: 'paragraph',
        content: [{ type: 'date', attrs: { timestamp: '1700000000000' } }],
      },
    ],
  };

  const md = adfToMd(adf);

  it('h1 heading marker is present', () => {
    expect(md).toContain('# Top Heading');
  });

  it('h2 heading marker is present', () => {
    expect(md).toContain('## Second Level');
  });

  it('h3 heading marker is present', () => {
    expect(md).toContain('### Third Level');
  });

  it('bold mark renders as **', () => {
    expect(md).toContain('**strong**');
  });

  it('italic mark renders as *', () => {
    expect(md).toContain('*em*');
  });

  it('strikethrough renders as ~~', () => {
    expect(md).toContain('~~strike~~');
  });

  it('code mark renders as backtick', () => {
    expect(md).toContain('`code`');
  });

  it('underline renders as <ins>', () => {
    expect(md).toContain('<ins>underline</ins>');
  });

  it('link mark renders as markdown link', () => {
    expect(md).toContain('[link](https://example.com)');
  });

  it('sub renders as <sub>', () => {
    expect(md).toContain('<sub>sub</sub>');
  });

  it('sup renders as <sup>', () => {
    expect(md).toContain('<sup>sup</sup>');
  });

  it('hardBreak renders as backslash-newline', () => {
    expect(md).toContain('after break');
    expect(md).toMatch(/\\\n/);
  });

  it('nested bullet list content is present', () => {
    expect(md).toContain('top item');
    expect(md).toContain('nested item');
  });

  it('nested bullet list item is indented', () => {
    const lines = md.split('\n');
    const topLine = lines.find((l) => l.includes('top item'));
    const nestedLine = lines.find((l) => l.includes('nested item'));
    expect(topLine).toBeDefined();
    expect(nestedLine).toBeDefined();
    expect(nestedLine!.length).toBeGreaterThan(topLine!.length);
  });

  it('ordered list with custom order starts at 5', () => {
    expect(md).toContain('5. fifth');
    expect(md).toContain('6. sixth');
  });

  it('task list TODO renders as - [ ]', () => {
    expect(md).toContain('- [ ] pending task');
  });

  it('task list DONE renders as - [x]', () => {
    expect(md).toContain('- [x] done task');
  });

  it('decision list item content is present', () => {
    expect(md).toContain('approved decision');
  });

  it('python code block renders with fence and language', () => {
    expect(md).toContain('```python');
    expect(md).toContain('print("hello")');
  });

  it('rule renders as ---', () => {
    expect(md).toContain('---');
  });

  it('blockquote renders with >', () => {
    expect(md).toContain('> quoted text');
  });

  it('note panel renders as > [!NOTE]', () => {
    expect(md).toContain('> [!NOTE]');
    expect(md).toContain('note content');
  });

  it('info panel renders as > [!TIP]', () => {
    expect(md).toContain('> [!TIP]');
    expect(md).toContain('info content');
  });

  it('warning panel renders as > [!WARNING]', () => {
    expect(md).toContain('> [!WARNING]');
    expect(md).toContain('warning content');
  });

  it('error panel renders as > [!CAUTION]', () => {
    expect(md).toContain('> [!CAUTION]');
    expect(md).toContain('error content');
  });

  it('success panel content is present', () => {
    expect(md).toContain('success content');
  });

  it('tip panel content is present', () => {
    expect(md).toContain('tip content');
  });

  it('expand renders as <details> with title', () => {
    expect(md).toContain('<details>');
    expect(md).toContain('<summary>Click to expand</summary>');
    expect(md).toContain('Hidden paragraph one');
    expect(md).toContain('Hidden paragraph two');
    expect(md).toContain('</details>');
  });

  it('table renders with | separator', () => {
    expect(md).toContain('| Col A | Col B |');
    expect(md).toContain('| --- |');
  });

  it('table bold cell renders **', () => {
    expect(md).toContain('**val**');
  });

  it('inlineCard renders as angle-bracket URL', () => {
    expect(md).toContain('<https://inlinecard.example.com>');
  });

  it('blockCard renders as markdown link', () => {
    expect(md).toContain(
      '[https://blockcard.example.com](https://blockcard.example.com)',
    );
  });

  it('mention renders as @name', () => {
    expect(md).toContain('@alice');
  });

  it('emoji renders as emoji character', () => {
    expect(md).toContain('🚀');
  });

  it('status renders as backtick-wrapped [text]', () => {
    expect(md).toContain('`[In Progress]`');
  });

  it('date renders as timestamp string', () => {
    expect(md).toContain('1700000000000');
  });

  it('no raw ADF JSON leaks into output', () => {
    expect(md).not.toContain('"type":');
    expect(md).not.toContain('"version":');
  });
});

describe('Group 4: Deeply nested lists', () => {
  const md4Level = '- level 1\n  - level 2\n    - level 3\n      - level 4';

  it('parses to a 4-level nested bullet list structure', () => {
    const doc = mdToAdf(md4Level);
    const list1 = doc.content[0] as BulletListNode;
    expect(list1.type).toBe('bulletList');

    const item1 = list1.content[0] as ListItemNode;
    const list2 = item1.content[1] as BulletListNode;
    expect(list2.type).toBe('bulletList');

    const item2 = list2.content[0] as ListItemNode;
    const list3 = item2.content[1] as BulletListNode;
    expect(list3.type).toBe('bulletList');

    const item3 = list3.content[0] as ListItemNode;
    const list4 = item3.content[1] as BulletListNode;
    expect(list4.type).toBe('bulletList');

    const item4 = list4.content[0] as ListItemNode;
    const para4 = item4.content[0] as ParagraphNode;
    expect(para4.content[0]).toMatchObject({ type: 'text', text: 'level 4' });
  });

  it('roundtrip MD→ADF→MD contains all 4 level texts', () => {
    const result = adfToMd(mdToAdf(md4Level));
    expect(result).toContain('level 1');
    expect(result).toContain('level 2');
    expect(result).toContain('level 3');
    expect(result).toContain('level 4');
  });

  it('nested levels are progressively more indented in roundtrip', () => {
    const result = adfToMd(mdToAdf(md4Level));
    const lines = result.split('\n');
    const l1 = lines.find((l) => l.includes('level 1'))!;
    const l2 = lines.find((l) => l.includes('level 2'))!;
    const l3 = lines.find((l) => l.includes('level 3'))!;
    const l4 = lines.find((l) => l.includes('level 4'))!;
    expect(l2.length).toBeGreaterThan(l1.length);
    expect(l3.length).toBeGreaterThan(l2.length);
    expect(l4.length).toBeGreaterThan(l3.length);
  });
});

describe('Group 5: Table cells with rich inline content', () => {
  it('cell with bold+link: text node has strong and link marks', () => {
    const doc = mdToAdf(
      '| [**GitHub**](https://github.com) | value |\n| --- | --- |\n| a | b |',
    );
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    const cell = headerRow.content[0] as TableHeaderNode;
    const para = cell.content[0] as ParagraphNode;
    const textNode = para.content[0] as TextNode;
    expect(textNode.text).toBe('GitHub');
    expect(textNode.marks).toContainEqual({ type: 'strong' });
    expect(textNode.marks).toContainEqual(
      expect.objectContaining({ type: 'link' }),
    );
  });

  it('bold+link cell roundtrip preserves text and URL', () => {
    const md =
      '| [**GitHub**](https://github.com) | value |\n| --- | --- |\n| a | b |';
    const result = adfToMd(mdToAdf(md));
    expect(result).toContain('GitHub');
    expect(result).toContain('https://github.com');
  });

  it('cell with inline code has code mark', () => {
    const doc = mdToAdf(
      '| `npm install` | description |\n| --- | --- |\n| a | b |',
    );
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    const cell = headerRow.content[0] as TableHeaderNode;
    const para = cell.content[0] as ParagraphNode;
    const textNode = para.content[0] as TextNode;
    expect(textNode.text).toBe('npm install');
    expect(textNode.marks).toContainEqual({ type: 'code' });
  });

  it('inline code cell roundtrip preserves backtick formatting', () => {
    const md = '| `npm install` | description |\n| --- | --- |\n| a | b |';
    const result = adfToMd(mdToAdf(md));
    expect(result).toContain('`npm install`');
  });

  it('cell with strikethrough has strike mark', () => {
    const doc = mdToAdf('| ~~old~~ | new |\n| --- | --- |\n| a | b |');
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    const cell = headerRow.content[0] as TableHeaderNode;
    const para = cell.content[0] as ParagraphNode;
    const textNode = para.content[0] as TextNode;
    expect(textNode.text).toBe('old');
    expect(textNode.marks).toContainEqual({ type: 'strike' });
  });

  it('strikethrough cell roundtrip preserves ~~ formatting', () => {
    const md = '| ~~old~~ | new |\n| --- | --- |\n| a | b |';
    const result = adfToMd(mdToAdf(md));
    expect(result).toContain('~~old~~');
  });

  it('table with 10 columns produces 10 header cells', () => {
    const headers = Array.from({ length: 10 }, (_, i) => `Col${i + 1}`).join(
      ' | ',
    );
    const separator = Array.from({ length: 10 }, () => '---').join(' | ');
    const md = `| ${headers} |\n| ${separator} |`;
    const doc = mdToAdf(md);
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    expect(headerRow.content).toHaveLength(10);
  });

  it('table with only header row produces valid ADF table', () => {
    const md = '| Name | Value |\n| --- | --- |';
    const doc = mdToAdf(md);
    const table = doc.content[0] as TableNode;
    expect(table.type).toBe('table');
    expect(table.content).toHaveLength(1);
    const row = table.content[0] as TableRowNode;
    expect(row.content).toHaveLength(2);
    for (const cell of row.content) {
      expect(cell.type).toBe('tableHeader');
    }
  });

  it('header-only table renders with header row and separator', () => {
    const md = '| Name | Value |\n| --- | --- |';
    const result = adfToMd(mdToAdf(md));
    expect(result).toContain('| Name | Value |');
    expect(result).toContain('| --- | --- |');
  });
});

describe('Group 6: Ordered list starting at non-1', () => {
  it('list starting at 7 produces attrs.order = 7', () => {
    const doc = mdToAdf('7. item seven\n8. item eight\n9. item nine');
    const list = doc.content[0] as OrderedListNode;
    expect(list.type).toBe('orderedList');
    expect(list.attrs).toEqual({ order: 7 });
  });

  it('list starting at 7 has 3 items with correct text', () => {
    const doc = mdToAdf('7. item seven\n8. item eight\n9. item nine');
    const list = doc.content[0] as OrderedListNode;
    expect(list.content).toHaveLength(3);
    const firstItem = list.content[0] as ListItemNode;
    const para = firstItem.content[0] as ParagraphNode;
    expect(para.content[0]).toMatchObject({ type: 'text', text: 'item seven' });
  });

  it('roundtrip preserves starting number 7', () => {
    const md = '7. item seven\n8. item eight\n9. item nine';
    const result = adfToMd(mdToAdf(md));
    expect(result).toContain('7. item seven');
    expect(result).toContain('8. item eight');
    expect(result).toContain('9. item nine');
  });

  it('list starting at 1 has no attrs', () => {
    const doc = mdToAdf('1. first\n2. second');
    const list = doc.content[0] as OrderedListNode;
    expect(list.attrs).toBeUndefined();
  });
});

describe('Group 7: Blockquote containing a list', () => {
  const md = '> - item 1\n> - item 2\n> - item 3';

  it('produces a blockquote node', () => {
    const doc = mdToAdf(md);
    const bq = doc.content[0] as BlockquoteNode;
    expect(bq.type).toBe('blockquote');
  });

  it('blockquote contains a bulletList', () => {
    const doc = mdToAdf(md);
    const bq = doc.content[0] as BlockquoteNode;
    expect(bq.content[0]!.type).toBe('bulletList');
  });

  it('bulletList inside blockquote has 3 items', () => {
    const doc = mdToAdf(md);
    const bq = doc.content[0] as BlockquoteNode;
    const list = bq.content[0] as BulletListNode;
    expect(list.content).toHaveLength(3);
  });

  it('list items inside blockquote have correct text', () => {
    const doc = mdToAdf(md);
    const bq = doc.content[0] as BlockquoteNode;
    const list = bq.content[0] as BulletListNode;
    const texts = list.content.map((item) => {
      const li = item as ListItemNode;
      const para = li.content[0] as ParagraphNode;
      return (para.content[0] as TextNode).text;
    });
    expect(texts).toEqual(['item 1', 'item 2', 'item 3']);
  });
});

describe('Group 8: Code block language aliases', () => {
  const aliases: Array<[string, string]> = [
    ['js', 'javascript'],
    ['ts', 'typescript'],
    ['py', 'python'],
    ['sh', 'bash'],
    ['yml', 'yaml'],
    ['dockerfile', 'docker'],
  ];

  for (const [alias, expected] of aliases) {
    it(`\`\`\`${alias} maps to language '${expected}'`, () => {
      const doc = mdToAdf(`\`\`\`${alias}\ncode\n\`\`\``);
      const block = doc.content[0] as CodeBlockNode;
      expect(block.type).toBe('codeBlock');
      expect(block.attrs?.language).toBe(expected);
    });
  }

  it('unknown language cobol passes through unchanged', () => {
    const doc = mdToAdf('```cobol\nIDENTIFICATION DIVISION\n```');
    const block = doc.content[0] as CodeBlockNode;
    expect(block.attrs?.language).toBe('cobol');
  });

  it('no language produces codeBlock with no attrs', () => {
    const doc = mdToAdf('```\nplain code\n```');
    const block = doc.content[0] as CodeBlockNode;
    expect(block.attrs).toBeUndefined();
  });
});

describe('Group 9: Empty/edge headings', () => {
  it('heading with no text has empty content array', () => {
    const doc = mdToAdf('# ');
    const heading = doc.content[0] as HeadingNode;
    expect(heading.type).toBe('heading');
    expect(heading.attrs.level).toBe(1);
    expect(heading.content).toEqual([]);
  });

  it('all 6 heading levels are parsed with correct level attribute', () => {
    for (let level = 1; level <= 6; level++) {
      const doc = mdToAdf(`${'#'.repeat(level)} Title`);
      const heading = doc.content[0] as HeadingNode;
      expect(heading.type).toBe('heading');
      expect(heading.attrs.level).toBe(level);
    }
  });

  it('all 6 heading levels roundtrip with correct # markers', () => {
    for (let level = 1; level <= 6; level++) {
      const mdInput = `${'#'.repeat(level)} Title`;
      const result = adfToMd(mdToAdf(mdInput));
      expect(result).toBe(mdInput);
    }
  });

  it('heading text content is preserved in roundtrip', () => {
    const doc = mdToAdf('## My Section');
    const heading = doc.content[0] as HeadingNode;
    expect(heading.content?.[0]).toMatchObject({
      type: 'text',
      text: 'My Section',
    });
  });
});

describe('Group 10: Multi-mark text nodes', () => {
  it('***[text](url)*** produces text node with em, strong, and link marks', () => {
    const doc = mdToAdf('***[bold italic link](https://url.com)***');
    const para = doc.content[0] as ParagraphNode;
    const textNode = para.content[0] as TextNode;
    expect(textNode.text).toBe('bold italic link');
    const markTypes = textNode.marks?.map((m) => m.type) ?? [];
    expect(markTypes).toContain('em');
    expect(markTypes).toContain('strong');
    expect(markTypes).toContain('link');
  });

  it('bold italic text ***text*** has both strong and em marks', () => {
    const doc = mdToAdf('***bold italic***');
    const para = doc.content[0] as ParagraphNode;
    const textNode = para.content[0] as TextNode;
    expect(textNode.marks).toContainEqual({ type: 'strong' });
    expect(textNode.marks).toContainEqual({ type: 'em' });
  });

  it('bold italic link roundtrip preserves text and URL', () => {
    const md = '***[bold italic link](https://url.com)***';
    const result = adfToMd(mdToAdf(md));
    expect(result).toContain('bold italic link');
    expect(result).toContain('https://url.com');
    expect(result).toMatch(/\*+bold italic link\*+/);
  });
});
