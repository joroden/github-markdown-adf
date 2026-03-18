import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { ParagraphNode } from '../../src/types/index.js';

describe('images', () => {
  it('converts image to inlineCard inside paragraph', () => {
    const doc = mdToAdf('![alt text](https://example.com/img.png)');
    const para = doc.content[0] as ParagraphNode;
    expect(para.type).toBe('paragraph');
    expect(para.content[0]).toEqual({
      type: 'inlineCard',
      attrs: { url: 'https://example.com/img.png' },
    });
  });

  it('inlineCard uses the src URL', () => {
    const url = 'https://cdn.example.com/photo.jpg';
    const doc = mdToAdf(`![](${url})`);
    const para = doc.content[0] as ParagraphNode;
    expect((para.content[0] as any).attrs.url).toBe(url);
  });

  it('alt text is discarded', () => {
    const doc = mdToAdf('![ignored alt](https://example.com/img.png)');
    const para = doc.content[0] as ParagraphNode;
    const card = para.content[0] as any;
    expect(card.attrs.alt).toBeUndefined();
  });

  it('image inline with text produces mixed paragraph content', () => {
    const doc = mdToAdf('See ![img](https://example.com/a.png) here');
    const para = doc.content[0] as ParagraphNode;
    expect(para.content).toHaveLength(3);
    expect(para.content[1]).toEqual({
      type: 'inlineCard',
      attrs: { url: 'https://example.com/a.png' },
    });
  });
});
