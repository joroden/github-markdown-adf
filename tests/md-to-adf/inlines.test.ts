import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { ParagraphNode, TextNode } from '../../src/types/index.js';

describe('inline nodes', () => {
  describe('hard break', () => {
    it('two trailing spaces produce a hardBreak node', () => {
      const doc = mdToAdf('line one  \nline two');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content).toContainEqual({ type: 'hardBreak' });
    });

    it('content before and after hard break is preserved', () => {
      const doc = mdToAdf('before  \nafter');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({ type: 'text', text: 'before' });
      expect(para.content[1]).toEqual({ type: 'hardBreak' });
      expect(para.content[2]).toEqual({ type: 'text', text: 'after' });
    });
  });

  describe('inline HTML', () => {
    it('<ins> tag produces underline mark', () => {
      const doc = mdToAdf('<ins>underlined</ins>');
      const para = doc.content[0] as ParagraphNode;
      const underlineNode = para.content.find(
        (n) =>
          n.type === 'text' &&
          (n as TextNode).marks?.some((m) => m.type === 'underline'),
      ) as TextNode | undefined;
      expect(underlineNode).toBeDefined();
      expect(underlineNode?.text).toBe('underlined');
    });

    it('<sub> tag produces subsup sub mark', () => {
      const doc = mdToAdf('H<sub>2</sub>O');
      const para = doc.content[0] as ParagraphNode;
      const subNode = para.content.find(
        (n) =>
          n.type === 'text' &&
          (n as TextNode).marks?.some(
            (m) => m.type === 'subsup' && (m as any).attrs?.type === 'sub',
          ),
      ) as TextNode | undefined;
      expect(subNode).toBeDefined();
      expect(subNode?.text).toBe('2');
    });

    it('<sup> tag produces subsup sup mark', () => {
      const doc = mdToAdf('E=mc<sup>2</sup>');
      const para = doc.content[0] as ParagraphNode;
      const supNode = para.content.find(
        (n) =>
          n.type === 'text' &&
          (n as TextNode).marks?.some(
            (m) => m.type === 'subsup' && (m as any).attrs?.type === 'sup',
          ),
      ) as TextNode | undefined;
      expect(supNode).toBeDefined();
      expect(supNode?.text).toBe('2');
    });
  });
});
