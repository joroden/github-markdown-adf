import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { ExpandNode } from '../../src/types/index.js';

describe('expand (details/summary)', () => {
  it('converts details/summary to expand node', () => {
    const doc = mdToAdf(
      '<details>\n<summary>Click me</summary>\n\nHidden content\n</details>',
    );
    expect(doc.content[0]).toEqual({
      type: 'expand',
      attrs: { title: 'Click me' },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hidden content' }],
        },
      ],
    });
  });

  it('expand with empty summary produces empty title', () => {
    const doc = mdToAdf(
      '<details>\n<summary></summary>\n\nSome content\n</details>',
    );
    const expand = doc.content[0] as ExpandNode;
    expect(expand.type).toBe('expand');
    expect(expand.attrs.title).toBe('');
  });

  it('expand with no content produces empty content array', () => {
    const doc = mdToAdf('<details>\n<summary>Title</summary>\n</details>');
    const expand = doc.content[0] as ExpandNode;
    expect(expand.type).toBe('expand');
    expect(expand.attrs.title).toBe('Title');
    expect(expand.content).toEqual([]);
  });

  it('expand content can contain multiple paragraphs', () => {
    const doc = mdToAdf(
      '<details>\n<summary>Multi</summary>\n\nFirst\n\nSecond\n</details>',
    );
    const expand = doc.content[0] as ExpandNode;
    expect(expand.type).toBe('expand');
    expect(expand.content).toHaveLength(2);
    expect(expand.content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'First' }],
    });
    expect(expand.content[1]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Second' }],
    });
  });

  it('expand content can contain a code block', () => {
    const doc = mdToAdf(
      '<details>\n<summary>Code</summary>\n\n```js\nconsole.log(1);\n```\n\n</details>',
    );
    const expand = doc.content[0] as ExpandNode;
    expect(expand.type).toBe('expand');
    expect(expand.content[0]).toMatchObject({ type: 'codeBlock' });
  });

  it('converts single-form details (no blank line) to expand node', () => {
    const doc = mdToAdf(
      '<details><summary>Inline</summary>Some content</details>',
    );
    const expand = doc.content[0] as ExpandNode;
    expect(expand.type).toBe('expand');
    expect(expand.attrs.title).toBe('Inline');
    expect(expand.content).toHaveLength(1);
    expect(expand.content[0]).toMatchObject({ type: 'paragraph' });
  });

  it('converts details with attributes on the tag', () => {
    const doc = mdToAdf(
      '<details open class="foo">\n<summary>Attrs</summary>\n\nContent\n</details>',
    );
    const expand = doc.content[0] as ExpandNode;
    expect(expand.type).toBe('expand');
    expect(expand.attrs.title).toBe('Attrs');
  });

  it('converts multiple sequential split-form expand blocks', () => {
    const doc = mdToAdf(
      '<details>\n<summary>First</summary>\n\nA\n</details>\n\n<details>\n<summary>Second</summary>\n\nB\n</details>',
    );
    expect(doc.content).toHaveLength(2);
    expect((doc.content[0] as ExpandNode).attrs.title).toBe('First');
    expect((doc.content[1] as ExpandNode).attrs.title).toBe('Second');
  });
});
