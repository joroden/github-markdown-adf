import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc, AdfInlineNode, ParagraphNode } from '../../src/types/index.js';

function doc(...content: object[]): AdfDoc {
  return { version: 1, type: 'doc', content: content as AdfDoc['content'] };
}

function para(...inlines: object[]): ParagraphNode {
  return { type: 'paragraph', content: inlines as AdfInlineNode[] };
}

describe('adfToMd options', () => {
  describe('mentions option', () => {
    it('default renders mention with display text', () => {
      const result = adfToMd(doc(para({ type: 'mention', attrs: { id: 'abc123', text: 'Alice' } })));
      expect(result).toBe('Alice');
    });

    it('default renders mention without text as @id', () => {
      const result = adfToMd(doc(para({ type: 'mention', attrs: { id: 'abc123' } })));
      expect(result).toBe('@abc123');
    });

    it('mentions: true renders same as default', () => {
      const d = doc(para({ type: 'mention', attrs: { id: 'abc123', text: 'Alice' } }));
      expect(adfToMd(d, { mentions: true })).toBe('Alice');
    });

    it('mentions: false renders display text as plain text (no @ prefix)', () => {
      const result = adfToMd(
        doc(para({ type: 'mention', attrs: { id: 'abc123', text: 'Alice' } })),
        { mentions: false },
      );
      expect(result).toBe('Alice');
    });

    it('mentions: false with no display text renders bare id (no @ prefix)', () => {
      const result = adfToMd(
        doc(para({ type: 'mention', attrs: { id: 'abc123' } })),
        { mentions: false },
      );
      expect(result).toBe('abc123');
    });

    it('mentions: false in mixed paragraph strips only the @ tagging', () => {
      const result = adfToMd(
        doc(
          para(
            { type: 'text', text: 'Hello ' },
            { type: 'mention', attrs: { id: 'abc123', text: 'Alice' } },
            { type: 'text', text: '!' },
          ),
        ),
        { mentions: false },
      );
      expect(result).toBe('Hello Alice!');
    });
  });
});

