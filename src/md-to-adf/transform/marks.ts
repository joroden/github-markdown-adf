import type { PhrasingContent } from 'mdast';
import type {
  AdfInlineNode,
  AdfMark,
  MdToAdfOptions,
  MentionNode,
  TextNode,
} from '../../types/index.js';

const OPEN_HTML_TAG = /^<(ins|sub|sup)>$/i;
const CLOSE_HTML_TAG = /^<\/(ins|sub|sup)>$/i;
const MENTION_PATTERN =
  /(^|[^A-Za-z0-9_@])@([A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)(?=$|[^A-Za-z0-9._@-])/g;

function htmlTagToMark(tag: string): AdfMark | null {
  const t = tag.toLowerCase();
  if (t === 'ins') return { type: 'underline' };
  if (t === 'sub') return { type: 'subsup', attrs: { type: 'sub' } };
  if (t === 'sup') return { type: 'subsup', attrs: { type: 'sup' } };
  return null;
}

export function phrasingToInlineNodes(
  nodes: PhrasingContent[],
  options?: MdToAdfOptions,
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
    result.push(...phrasingToInline(node, markStack.slice(), options));
  }

  return result;
}

function phrasingToInline(
  node: PhrasingContent,
  inheritedMarks: AdfMark[],
  options?: MdToAdfOptions,
): AdfInlineNode[] {
  switch (node.type) {
    case 'text':
      if (!node.value) return [];
      return textToInlineNodes(node.value, inheritedMarks, options);
    case 'inlineCode': {
      const marks: AdfMark[] = [
        ...inheritedMarks.filter((m) => m.type === 'link'),
        { type: 'code' },
      ];
      return [makeText(node.value, marks)];
    }
    case 'strong':
      return node.children.flatMap((c) =>
        phrasingToInline(c, [...inheritedMarks, { type: 'strong' }], options),
      );
    case 'emphasis':
      return node.children.flatMap((c) =>
        phrasingToInline(c, [...inheritedMarks, { type: 'em' }], options),
      );
    case 'delete':
      return node.children.flatMap((c) =>
        phrasingToInline(c, [...inheritedMarks, { type: 'strike' }], options),
      );
    case 'link': {
      const linkMark: AdfMark = {
        type: 'link',
        attrs: { href: node.url, ...(node.title ? { title: node.title } : {}) },
      };
      return node.children.flatMap((c) =>
        phrasingToInline(c, [...inheritedMarks, linkMark], options),
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

function textToInlineNodes(
  value: string,
  marks: AdfMark[],
  options?: MdToAdfOptions,
): AdfInlineNode[] {
  if (!options?.mentions || marks.length > 0) return [makeText(value, marks)];

  const result: AdfInlineNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(MENTION_PATTERN)) {
    const matchIndex = match.index ?? 0;
    const prefix = match[1] ?? '';
    const username = match[2];
    if (!username) continue;

    const mentionStart = matchIndex + prefix.length;
    const mentionEnd = matchIndex + match[0].length;

    appendTextNode(result, value.slice(lastIndex, mentionStart), marks);

    const mentionNode = makeMentionNode(username, options.mentions);
    if (mentionNode) {
      result.push(mentionNode);
    } else {
      appendTextNode(result, value.slice(mentionStart, mentionEnd), marks);
    }

    lastIndex = mentionEnd;
  }

  if (result.length === 0) return [makeText(value, marks)];

  appendTextNode(result, value.slice(lastIndex), marks);
  return result;
}

function makeText(value: string, marks: AdfMark[]): TextNode {
  const node: TextNode = { type: 'text', text: value };
  if (marks.length > 0) node.marks = marks;
  return node;
}

function appendTextNode(
  result: AdfInlineNode[],
  value: string,
  marks: AdfMark[],
): void {
  if (!value) return;

  const previousNode = result[result.length - 1];
  if (
    previousNode?.type === 'text' &&
    sameMarks((previousNode as TextNode).marks, marks)
  ) {
    previousNode.text += value;
    return;
  }

  result.push(makeText(value, marks));
}

function makeMentionNode(
  username: string,
  mentions: NonNullable<MdToAdfOptions['mentions']>,
): MentionNode | null {
  const attrs =
    typeof mentions === 'function'
      ? mentions(username)
      : { id: username, text: `@${username}` };

  if (!attrs) return null;
  return { type: 'mention', attrs };
}

function sameMarks(
  leftMarks: AdfMark[] | undefined,
  rightMarks: AdfMark[],
): boolean {
  const normalizedLeft = leftMarks ?? [];
  if (normalizedLeft.length !== rightMarks.length) return false;

  return normalizedLeft.every(
    (mark, index) => JSON.stringify(mark) === JSON.stringify(rightMarks[index]),
  );
}

function parseHtmlInline(
  html: string,
  inheritedMarks: AdfMark[],
): AdfInlineNode[] {
  const stripped = html.replace(/<[^>]+>/g, '');
  if (stripped) return [makeText(stripped, inheritedMarks)];
  return [];
}
