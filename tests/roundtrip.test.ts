import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../src/md-to-adf/index.js';
import { adfToMd } from '../src/adf-to-md/index.js';
import type {
  AdfDoc,
  HeadingNode,
  ParagraphNode,
  BulletListNode,
  TaskListNode,
  TableNode,
  PanelNode,
  BlockquoteNode,
  CodeBlockNode,
} from '../src/types/index.js';

function roundtripMdToAdf(md: string): string {
  return adfToMd(mdToAdf(md));
}

function roundtripAdfToMd(adf: AdfDoc): AdfDoc {
  return mdToAdf(adfToMd(adf));
}

describe('MD → ADF → MD roundtrips', () => {
  describe('headings', () => {
    it('h1 roundtrips exactly', () => {
      expect(roundtripMdToAdf('# Hello World')).toBe('# Hello World');
    });

    it('h2 roundtrips exactly', () => {
      expect(roundtripMdToAdf('## Section')).toBe('## Section');
    });

    it('h3 through h6 roundtrip', () => {
      for (const level of [3, 4, 5, 6] as const) {
        const md = `${'#'.repeat(level)} Title`;
        expect(roundtripMdToAdf(md)).toBe(md);
      }
    });
  });

  describe('paragraphs', () => {
    it('plain paragraph roundtrips', () => {
      expect(roundtripMdToAdf('Hello world')).toBe('Hello world');
    });

    it('multiple paragraphs roundtrip', () => {
      const md = 'First paragraph\n\nSecond paragraph';
      expect(roundtripMdToAdf(md)).toBe(md);
    });
  });

  describe('inline marks', () => {
    it('bold roundtrips', () => {
      expect(roundtripMdToAdf('**bold text**')).toBe('**bold text**');
    });

    it('italic roundtrips', () => {
      expect(roundtripMdToAdf('*italic text*')).toBe('*italic text*');
    });

    it('strikethrough roundtrips', () => {
      expect(roundtripMdToAdf('~~struck~~')).toBe('~~struck~~');
    });

    it('inline code roundtrips', () => {
      expect(roundtripMdToAdf('use `const x = 1`')).toBe('use `const x = 1`');
    });

    it('link roundtrips', () => {
      expect(roundtripMdToAdf('[GitHub](https://github.com)')).toBe(
        '[GitHub](https://github.com)',
      );
    });

    it('link with title roundtrips', () => {
      expect(
        roundtripMdToAdf('[GitHub](https://github.com "GitHub Homepage")'),
      ).toBe('[GitHub](https://github.com "GitHub Homepage")');
    });
  });

  describe('code blocks', () => {
    it('fenced code block roundtrips (language alias expanded)', () => {
      const result = roundtripMdToAdf('```js\nconsole.log("hi")\n```');
      expect(result).toBe('```javascript\nconsole.log("hi")\n```');
    });

    it('fenced code block without language roundtrips', () => {
      expect(roundtripMdToAdf('```\nplain code\n```')).toBe(
        '```\nplain code\n```',
      );
    });

    it('multiline code block roundtrips', () => {
      const md = '```typescript\nconst a = 1\nconst b = 2\n```';
      expect(roundtripMdToAdf(md)).toBe(md);
    });
  });

  describe('lists', () => {
    it('bullet list roundtrips', () => {
      expect(roundtripMdToAdf('- alpha\n- beta\n- gamma')).toBe(
        '- alpha\n- beta\n- gamma',
      );
    });

    it('ordered list roundtrips', () => {
      expect(roundtripMdToAdf('1. first\n2. second\n3. third')).toBe(
        '1. first\n2. second\n3. third',
      );
    });

    it('ordered list with custom start roundtrips', () => {
      expect(roundtripMdToAdf('5. five\n6. six')).toBe('5. five\n6. six');
    });

    it('task list roundtrips (unchecked)', () => {
      const result = roundtripMdToAdf('- [ ] todo item');
      expect(result).toBe('- [ ] todo item');
    });

    it('task list roundtrips (checked)', () => {
      const result = roundtripMdToAdf('- [x] done item');
      expect(result).toBe('- [x] done item');
    });

    it('mixed task list roundtrips', () => {
      const result = roundtripMdToAdf('- [ ] pending\n- [x] completed');
      expect(result).toBe('- [ ] pending\n- [x] completed');
    });
  });

  describe('blockquotes', () => {
    it('simple blockquote roundtrips', () => {
      expect(roundtripMdToAdf('> A quoted line')).toBe('> A quoted line');
    });
  });

  describe('GitHub alerts → panels → alerts', () => {
    it('[!NOTE] roundtrips to > [!NOTE]', () => {
      const result = roundtripMdToAdf('> [!NOTE]\n> Important note here');
      expect(result).toContain('[!NOTE]');
      expect(result).toContain('Important note here');
    });

    it('[!TIP] roundtrips to > [!TIP]', () => {
      const result = roundtripMdToAdf('> [!TIP]\n> A helpful tip');
      expect(result).toContain('[!TIP]');
    });

    it('[!WARNING] roundtrips to > [!WARNING]', () => {
      const result = roundtripMdToAdf('> [!WARNING]\n> Be careful');
      expect(result).toContain('[!WARNING]');
    });

    it('[!CAUTION] roundtrips to > [!CAUTION]', () => {
      const result = roundtripMdToAdf('> [!CAUTION]\n> Danger ahead');
      expect(result).toContain('[!CAUTION]');
    });
  });

  describe('tables', () => {
    it('table content is preserved in roundtrip', () => {
      const md = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';
      const result = roundtripMdToAdf(md);
      expect(result).toContain('Name');
      expect(result).toContain('Age');
      expect(result).toContain('Alice');
      expect(result).toContain('30');
      expect(result).toContain('Bob');
      expect(result).toContain('25');
    });

    it('table structure is valid GFM after roundtrip', () => {
      const md = '| A | B |\n| --- | --- |\n| 1 | 2 |';
      const result = roundtripMdToAdf(md);
      expect(result).toMatch(/\|.*\|/);
      expect(result).toContain('---');
    });
  });

  describe('horizontal rule', () => {
    it('thematic break roundtrips', () => {
      expect(roundtripMdToAdf('---')).toBe('---');
    });
  });

  describe('images', () => {
    it('image becomes inlineCard and roundtrips to angle-bracket URL', () => {
      const result = roundtripMdToAdf('![alt](https://example.com/img.png)');
      expect(result).toContain('https://example.com/img.png');
    });
  });

  describe('complex documents', () => {
    it('mixed content document roundtrips without data loss', () => {
      const md = [
        '# My Issue',
        '',
        'A description paragraph.',
        '',
        '## Steps to reproduce',
        '',
        '1. First step',
        '2. Second step',
        '',
        '```bash',
        'npm install',
        '```',
        '',
        '> [!NOTE]',
        '> Check the logs first',
      ].join('\n');

      const result = roundtripMdToAdf(md);
      expect(result).toContain('# My Issue');
      expect(result).toContain('A description paragraph.');
      expect(result).toContain('## Steps to reproduce');
      expect(result).toContain('1. First step');
      expect(result).toContain('```bash');
      expect(result).toContain('[!NOTE]');
    });
  });
});

describe('ADF → MD → ADF roundtrips', () => {
  it('heading node survives roundtrip', () => {
    const adf: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Section' }],
        },
      ],
    };
    const result = roundtripAdfToMd(adf);
    const heading = result.content[0] as HeadingNode;
    expect(heading.type).toBe('heading');
    expect(heading.attrs.level).toBe(2);
    expect(heading.content?.[0]).toMatchObject({
      type: 'text',
      text: 'Section',
    });
  });

  it('paragraph with bold survives roundtrip', () => {
    const adf: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'bold', marks: [{ type: 'strong' }] },
          ],
        },
      ],
    };
    const result = roundtripAdfToMd(adf);
    const para = result.content[0] as ParagraphNode;
    expect(para.type).toBe('paragraph');
    expect(
      para.content?.some(
        (n) =>
          n.type === 'text' &&
          (n as import('../src/types/index.js').TextNode).marks?.some(
            (m) => m.type === 'strong',
          ),
      ),
    ).toBe(true);
  });

  it('bullet list survives roundtrip', () => {
    const adf: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'item one' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'item two' }],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = roundtripAdfToMd(adf);
    const list = result.content[0] as BulletListNode;
    expect(list.type).toBe('bulletList');
    expect(list.content).toHaveLength(2);
  });

  it('task list survives roundtrip', () => {
    const adf: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'taskList',
          attrs: { localId: 'list-1' },
          content: [
            {
              type: 'taskItem',
              attrs: { localId: 'item-1', state: 'TODO' },
              content: [{ type: 'text', text: 'pending' }],
            },
            {
              type: 'taskItem',
              attrs: { localId: 'item-2', state: 'DONE' },
              content: [{ type: 'text', text: 'done' }],
            },
          ],
        },
      ],
    };
    const result = roundtripAdfToMd(adf);
    const list = result.content[0] as TaskListNode;
    expect(list.type).toBe('taskList');
    expect(list.content[0]?.attrs.state).toBe('TODO');
    expect(list.content[1]?.attrs.state).toBe('DONE');
  });

  it('code block with language survives roundtrip', () => {
    const adf: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'typescript' },
          content: [{ type: 'text', text: 'const x: number = 42' }],
        },
      ],
    };
    const result = roundtripAdfToMd(adf);
    const code = result.content[0] as CodeBlockNode;
    expect(code.type).toBe('codeBlock');
    expect(code.attrs?.language).toBe('typescript');
    expect(code.content?.[0]?.text).toBe('const x: number = 42');
  });

  it('panel survives roundtrip as equivalent panel type', () => {
    const adf: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'panel',
          attrs: { panelType: 'note' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'This is a note' }],
            },
          ],
        },
      ],
    };
    const result = roundtripAdfToMd(adf);
    const panel = result.content[0] as PanelNode;
    expect(panel.type).toBe('panel');
    expect(panel.attrs.panelType).toBe('note');
  });

  it('table survives roundtrip with content intact', () => {
    const adf: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  attrs: {},
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Name' }],
                    },
                  ],
                },
                {
                  type: 'tableHeader',
                  attrs: {},
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Value' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: {},
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'foo' }],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: {},
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'bar' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = roundtripAdfToMd(adf);
    const table = result.content[0] as TableNode;
    expect(table.type).toBe('table');
    expect(table.content).toHaveLength(2);
  });

  it('blockquote survives roundtrip', () => {
    const adf: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'A wise quote' }],
            },
          ],
        },
      ],
    };
    const result = roundtripAdfToMd(adf);
    const bq = result.content[0] as BlockquoteNode;
    expect(bq.type).toBe('blockquote');
  });
});
