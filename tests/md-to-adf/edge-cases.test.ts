import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type {
  BulletListNode,
  ListItemNode,
  ParagraphNode,
  TextNode,
} from '../../src/types/index.js';

describe('edge cases', () => {
  it('empty string produces minimal doc', () => {
    const doc = mdToAdf('');
    expect(doc).toEqual({ version: 1, type: 'doc', content: [] });
  });

  it('doc always has version 1 and type doc', () => {
    const doc = mdToAdf('hello');
    expect(doc.version).toBe(1);
    expect(doc.type).toBe('doc');
  });

  it('document with multiple block types', () => {
    const md = '# Heading\n\nParagraph\n\n- list item\n\n---';
    const doc = mdToAdf(md);
    expect(doc.content[0]!.type).toBe('heading');
    expect(doc.content[1]!.type).toBe('paragraph');
    expect(doc.content[2]!.type).toBe('bulletList');
    expect(doc.content[3]!.type).toBe('rule');
  });

  it('deeply nested bold inside italic', () => {
    const doc = mdToAdf('*outer **inner** outer*');
    const para = doc.content[0] as ParagraphNode;
    const boldItalicNode = para.content.find(
      (n) =>
        n.type === 'text' &&
        (n as TextNode).marks?.some((m) => m.type === 'strong') &&
        (n as TextNode).marks?.some((m) => m.type === 'em'),
    ) as TextNode | undefined;
    expect(boldItalicNode).toBeDefined();
    expect(boldItalicNode?.text).toBe('inner');
  });

  it('list item with nested bullet list', () => {
    const doc = mdToAdf('- parent\n  - child one\n  - child two');
    const list = doc.content[0] as BulletListNode;
    const parentItem = list.content[0] as ListItemNode;
    const nestedList = parentItem.content[1] as BulletListNode;
    expect(nestedList.type).toBe('bulletList');
    expect(nestedList.content).toHaveLength(2);
  });

  it('horizontal rule produces rule node', () => {
    const doc = mdToAdf('---');
    expect(doc.content[0]).toEqual({ type: 'rule' });
  });

  it('null bytes in input are stripped', () => {
    const doc = mdToAdf('hello\0world');
    const para = doc.content[0] as ParagraphNode;
    expect((para.content[0] as TextNode).text).toBe('helloworld');
  });

  it('Windows line endings are normalized', () => {
    const doc = mdToAdf('para one\r\n\r\npara two');
    expect(doc.content).toHaveLength(2);
  });
});
