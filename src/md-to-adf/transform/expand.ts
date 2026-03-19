import type { BlockContent } from 'mdast';
import type { AdfTopLevelBlockNode, ExpandContent } from '../../types/index.js';
import { parseMarkdown } from '../parser.js';

const DETAILS_OPENER =
  /^<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*$/i;
const DETAILS_CLOSER = /^<\/details>\s*$/i;

const EXPAND_CONTENT_TYPES = new Set<string>([
  'paragraph', 'heading', 'bulletList', 'orderedList', 'codeBlock',
  'blockquote', 'panel', 'rule', 'table', 'mediaGroup', 'mediaSingle', 'nestedExpand',
]);

function isExpandContent(node: AdfTopLevelBlockNode | ExpandContent): node is ExpandContent {
  return EXPAND_CONTENT_TYPES.has(node.type);
}

function parseSingleDetails(
  html: string,
): { title: string; body: string } | null {
  const detailsOpenMatch = /^<details[^>]*>\s*/i.exec(html);
  if (!detailsOpenMatch) return null;

  let offset = detailsOpenMatch[0].length;
  const afterDetailsOpen = html.slice(offset);

  const summaryOpenMatch = /^<summary[^>]*>/i.exec(afterDetailsOpen);
  if (!summaryOpenMatch) return null;

  offset += summaryOpenMatch[0].length;
  const afterSummaryOpen = html.slice(offset);

  const summaryCloseIdx = afterSummaryOpen.search(/<\/summary>/i);
  if (summaryCloseIdx === -1) return null;

  const title = afterSummaryOpen.slice(0, summaryCloseIdx);
  offset += summaryCloseIdx + '</summary>'.length;

  const bodyStart = offset;

  const openRe = /<details[^>]*>/gi;
  const closeRe = /<\/details>/gi;
  let depth = 1;
  openRe.lastIndex = bodyStart;
  closeRe.lastIndex = bodyStart;
  let closingIndex = -1;

  while (depth > 0) {
    const nextOpen = openRe.exec(html);
    const nextClose = closeRe.exec(html);
    if (!nextClose) return null;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      closeRe.lastIndex = openRe.lastIndex;
      continue;
    }
    depth--;
    if (depth === 0) {
      closingIndex = nextClose.index;
      offset = nextClose.index + nextClose[0].length;
      break;
    }
    openRe.lastIndex = closeRe.lastIndex;
  }

  if (closingIndex === -1) return null;
  if (html.slice(offset).trim().length > 0) return null;

  return { title, body: html.slice(bodyStart, closingIndex) };
}

function buildDetailsPairs(nodes: BlockContent[]): Map<number, number> {
  const pairs = new Map<number, number>();
  const stack: number[] = [];
  for (let idx = 0; idx < nodes.length; idx++) {
    const n = nodes[idx]!;
    if (n.type === 'html') {
      const value = (n as { value: string }).value;
      if (DETAILS_OPENER.test(value)) {
        stack.push(idx);
      } else if (DETAILS_CLOSER.test(value)) {
        const openerIdx = stack.pop();
        if (openerIdx !== undefined) {
          pairs.set(openerIdx, idx);
        }
      }
    }
  }
  return pairs;
}

export function transformExpandNodes(
  nodes: BlockContent[],
  transformBlock: (node: BlockContent) => AdfTopLevelBlockNode | null,
): ExpandContent[] {
  const result: ExpandContent[] = [];
  const pairs = buildDetailsPairs(nodes);
  let i = 0;
  while (i < nodes.length) {
    const expand = tryTransformExpand(nodes, i, pairs, transformBlock);
    if (expand) {
      if (isExpandContent(expand.node)) {
        result.push(expand.node);
      }
      i = expand.next;
      continue;
    }
    const transformed = transformBlock(nodes[i]!);
    if (transformed && isExpandContent(transformed)) {
      result.push(transformed);
    }
    i++;
  }
  return result;
}

export function tryTransformExpand(
  nodes: BlockContent[],
  i: number,
  detailsPairs: Map<number, number>,
  transformBlock: (node: BlockContent) => AdfTopLevelBlockNode | null,
): { node: AdfTopLevelBlockNode; next: number } | null {
  const node = nodes[i]!;
  if (node.type !== 'html') return null;

  const parsedDetails = parseSingleDetails(node.value);
  if (parsedDetails) {
    const title = parsedDetails.title.trim();
    const innerContent = parsedDetails.body.trim();
    const content = innerContent
      ? transformExpandNodes(
          parseMarkdown(innerContent).children as BlockContent[],
          transformBlock,
        )
      : [];
    return { node: { type: 'expand', attrs: { title }, content }, next: i + 1 };
  }

  const openerMatch = DETAILS_OPENER.exec(node.value);
  if (openerMatch) {
    const title = (openerMatch[1] ?? '').trim();
    const closerIdx = detailsPairs.get(i) ?? -1;
    if (closerIdx !== -1) {
      const content = transformExpandNodes(
        nodes.slice(i + 1, closerIdx),
        transformBlock,
      );
      return {
        node: { type: 'expand', attrs: { title }, content },
        next: closerIdx + 1,
      };
    }
  }

  return null;
}

export { buildDetailsPairs };
