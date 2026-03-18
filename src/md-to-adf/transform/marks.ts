import type { PhrasingContent } from 'mdast';
import type { AdfInlineNode, AdfMark, TextNode } from '../../types/index.js';

const OPEN_HTML_TAG = /^<(ins|sub|sup)>$/i;
const CLOSE_HTML_TAG = /^<\/(ins|sub|sup)>$/i;

function htmlTagToMark(tag: string): AdfMark | null {
  const t = tag.toLowerCase();
  if (t === 'ins') return { type: 'underline' };
  if (t === 'sub') return { type: 'subsup', attrs: { type: 'sub' } };
  if (t === 'sup') return { type: 'subsup', attrs: { type: 'sup' } };
  return null;
}

export function phrasingToInlineNodes(
  nodes: PhrasingContent[],
): AdfInlineNode[] {
  const markStack: AdfMark[] = [];
  const result: AdfInlineNode[] = [];

  for (const node of nodes) {
    if (node.type === 'html') {
      const openMatch = OPEN_HTML_TAG.exec(node.value);
      if (openMatch) {
        const mark = htmlTagToMark(openMatch[1] ?? '');
        if (mark) markStack.push(mark);
        continue;
      }
      const closeMatch = CLOSE_HTML_TAG.exec(node.value);
      if (closeMatch) {
        markStack.pop();
        continue;
      }
    }
    result.push(...phrasingToInline(node, markStack.slice()));
  }

  return result;
}

function phrasingToInline(
  node: PhrasingContent,
  inheritedMarks: AdfMark[],
): AdfInlineNode[] {
  switch (node.type) {
    case 'text':
      if (!node.value) return [];
      return [makeText(node.value, inheritedMarks)];
    case 'inlineCode': {
      const marks: AdfMark[] = [
        ...inheritedMarks.filter((m) => m.type === 'link'),
        { type: 'code' },
      ];
      return [makeText(node.value, marks)];
    }
    case 'strong':
      return node.children.flatMap((c) =>
        phrasingToInline(c, [...inheritedMarks, { type: 'strong' }]),
      );
    case 'emphasis':
      return node.children.flatMap((c) =>
        phrasingToInline(c, [...inheritedMarks, { type: 'em' }]),
      );
    case 'delete':
      return node.children.flatMap((c) =>
        phrasingToInline(c, [...inheritedMarks, { type: 'strike' }]),
      );
    case 'link': {
      const linkMark: AdfMark = {
        type: 'link',
        attrs: { href: node.url, ...(node.title ? { title: node.title } : {}) },
      };
      return node.children.flatMap((c) =>
        phrasingToInline(c, [...inheritedMarks, linkMark]),
      );
    }
    case 'image':
      return [{ type: 'inlineCard', attrs: { url: node.url } }];
    case 'break':
      return [{ type: 'hardBreak' }];
    case 'html':
      return parseHtmlInline(node.value, inheritedMarks);
    case 'linkReference':
    case 'imageReference':
      return [];
    default:
      return [];
  }
}

function makeText(value: string, marks: AdfMark[]): TextNode {
  const node: TextNode = { type: 'text', text: value };
  if (marks.length > 0) node.marks = marks;
  return node;
}

function parseHtmlInline(
  html: string,
  inheritedMarks: AdfMark[],
): AdfInlineNode[] {
  const stripped = html.replace(/<[^>]+>/g, '');
  if (stripped) return [makeText(stripped, inheritedMarks)];
  return [];
}
