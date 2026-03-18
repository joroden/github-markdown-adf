import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { BlockquoteNode, ParagraphNode } from '../../src/types/index.js';

describe('blockquotes', () => {
  it('converts simple blockquote', () => {
    const doc = mdToAdf('> hello world');
    expect(doc.content[0]).toEqual({
      type: 'blockquote',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'hello world' }] },
      ],
    });
  });

  it('blockquote wraps content in paragraph', () => {
    const doc = mdToAdf('> text');
    const bq = doc.content[0] as BlockquoteNode;
    expect(bq.type).toBe('blockquote');
    expect(bq.content[0]!.type).toBe('paragraph');
  });

  it('nested blockquote', () => {
    const doc = mdToAdf('> > inner');
    const outer = doc.content[0] as BlockquoteNode;
    expect(outer.type).toBe('blockquote');
    const inner = outer.content[0] as unknown as BlockquoteNode;
    expect(inner.type).toBe('blockquote');
    expect((inner.content[0] as ParagraphNode).content[0]).toEqual({
      type: 'text',
      text: 'inner',
    });
  });

  it('blockquote with multiple paragraphs', () => {
    const doc = mdToAdf('> para one\n>\n> para two');
    const bq = doc.content[0] as BlockquoteNode;
    expect(bq.type).toBe('blockquote');
    expect(bq.content).toHaveLength(2);
    expect((bq.content[0] as ParagraphNode).content[0]).toEqual({
      type: 'text',
      text: 'para one',
    });
    expect((bq.content[1] as ParagraphNode).content[0]).toEqual({
      type: 'text',
      text: 'para two',
    });
  });
});
