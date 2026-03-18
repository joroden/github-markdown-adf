import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { ParagraphNode, TextNode } from '../../src/types/index.js';

describe('marks', () => {
  describe('bold', () => {
    it('converts **bold**', () => {
      const doc = mdToAdf('**bold**');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'bold',
        marks: [{ type: 'strong' }],
      });
    });
  });

  describe('italic', () => {
    it('converts *italic*', () => {
      const doc = mdToAdf('*italic*');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'italic',
        marks: [{ type: 'em' }],
      });
    });

    it('converts _italic_', () => {
      const doc = mdToAdf('_italic_');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'italic',
        marks: [{ type: 'em' }],
      });
    });
  });

  describe('strikethrough', () => {
    it('converts ~~strike~~', () => {
      const doc = mdToAdf('~~strike~~');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'strike',
        marks: [{ type: 'strike' }],
      });
    });
  });

  describe('inline code', () => {
    it('converts `code`', () => {
      const doc = mdToAdf('`code`');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'code',
        marks: [{ type: 'code' }],
      });
    });

    it('code mark strips other marks except link', () => {
      const doc = mdToAdf('**`code`**');
      const para = doc.content[0] as ParagraphNode;
      const textNode = para.content[0] as TextNode;
      expect(textNode.marks).toEqual([{ type: 'code' }]);
      expect(textNode.marks?.find((m) => m.type === 'strong')).toBeUndefined();
    });
  });

  describe('links', () => {
    it('converts [text](url)', () => {
      const doc = mdToAdf('[visit](https://example.com)');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'visit',
        marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
      });
    });

    it('converts link with title', () => {
      const doc = mdToAdf('[visit](https://example.com "My Title")');
      const para = doc.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'visit',
        marks: [
          {
            type: 'link',
            attrs: { href: 'https://example.com', title: 'My Title' },
          },
        ],
      });
    });

    it('link without title has no title attr', () => {
      const doc = mdToAdf('[visit](https://example.com)');
      const para = doc.content[0] as ParagraphNode;
      const textNode = para.content[0] as TextNode;
      const linkMark = textNode.marks?.find((m) => m.type === 'link') as {
        type: 'link';
        attrs: { href: string; title?: string };
      };
      expect(linkMark?.attrs.title).toBeUndefined();
    });
  });

  describe('bold + italic combined', () => {
    it('converts ***bold italic***', () => {
      const doc = mdToAdf('***bold italic***');
      const para = doc.content[0] as ParagraphNode;
      const textNode = para.content[0] as TextNode;
      expect(textNode.text).toBe('bold italic');
      expect(textNode.marks).toContainEqual({ type: 'strong' });
      expect(textNode.marks).toContainEqual({ type: 'em' });
    });

    it('converts **_bold italic_**', () => {
      const doc = mdToAdf('**_bold italic_**');
      const para = doc.content[0] as ParagraphNode;
      const textNode = para.content[0] as TextNode;
      expect(textNode.text).toBe('bold italic');
      expect(textNode.marks).toContainEqual({ type: 'strong' });
      expect(textNode.marks).toContainEqual({ type: 'em' });
    });
  });

  describe('underline via <ins>', () => {
    it('converts <ins>text</ins> to underline mark', () => {
      const doc = mdToAdf('<ins>underlined</ins>');
      const para = doc.content[0] as ParagraphNode;
      const underlineNode = para.content.find(
        (n) =>
          n.type === 'text' &&
          (n as TextNode).marks?.some((m) => m.type === 'underline'),
      ) as TextNode | undefined;
      expect(underlineNode).toBeDefined();
      expect(underlineNode?.text).toBe('underlined');
      expect(underlineNode?.marks).toContainEqual({ type: 'underline' });
    });
  });

  describe('subscript via <sub>', () => {
    it('converts <sub>text</sub> to subsup sub mark', () => {
      const doc = mdToAdf('H<sub>2</sub>O');
      const para = doc.content[0] as ParagraphNode;
      const subNode = para.content.find(
        (n) =>
          n.type === 'text' &&
          (n as TextNode).marks?.some((m) => m.type === 'subsup'),
      ) as TextNode | undefined;
      expect(subNode).toBeDefined();
      expect(subNode?.text).toBe('2');
      expect(subNode?.marks).toContainEqual({
        type: 'subsup',
        attrs: { type: 'sub' },
      });
    });
  });

  describe('superscript via <sup>', () => {
    it('converts <sup>text</sup> to subsup sup mark', () => {
      const doc = mdToAdf('x<sup>2</sup>');
      const para = doc.content[0] as ParagraphNode;
      const supNode = para.content.find(
        (n) =>
          n.type === 'text' &&
          (n as TextNode).marks?.some((m) => m.type === 'subsup'),
      ) as TextNode | undefined;
      expect(supNode).toBeDefined();
      expect(supNode?.text).toBe('2');
      expect(supNode?.marks).toContainEqual({
        type: 'subsup',
        attrs: { type: 'sup' },
      });
    });
  });
});
