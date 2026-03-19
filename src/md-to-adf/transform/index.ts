import type { BlockContent, Root } from 'mdast';
import type { AdfDoc, AdfTopLevelBlockNode } from '../../types/index.js';
import {
  transformBlockquote,
  transformCode,
  transformHeading,
  transformParagraph,
  transformThematicBreak,
} from './blocks.js';
import { buildDetailsPairs, tryTransformExpand } from './expand.js';
import { transformHtmlBlock } from './inlines.js';
import { transformList } from './lists.js';
import { transformTable } from './tables.js';

export function transformRoot(root: Root): AdfDoc {
  const content = transformNodes(root.children as BlockContent[]);
  return { version: 1, type: 'doc', content };
}

function transformNodes(nodes: BlockContent[]): AdfTopLevelBlockNode[] {
  const result: AdfTopLevelBlockNode[] = [];
  const detailsPairs = buildDetailsPairs(nodes);
  let i = 0;
  while (i < nodes.length) {
    const expand = tryTransformExpand(nodes, i, detailsPairs, transformBlock);
    if (expand) {
      result.push(expand.node);
      i = expand.next;
      continue;
    }
    const transformed = transformBlock(nodes[i]!);
    if (transformed) result.push(transformed);
    i++;
  }
  return result;
}

export function transformBlock(
  node: BlockContent,
): AdfTopLevelBlockNode | null {
  switch (node.type) {
    case 'heading':
      return transformHeading(node);
    case 'paragraph':
      return transformParagraph(node);
    case 'code':
      return transformCode(node);
    case 'thematicBreak':
      return transformThematicBreak(node);
    case 'blockquote':
      return transformBlockquote(node, (children) =>
        children.flatMap((c) => {
          const r = transformBlock(c);
          return r ? [r] : [];
        }),
      );
    case 'list':
      return transformList(node, transformBlock);
    case 'table':
      return transformTable(node);
    case 'html':
      return transformHtmlBlock(node);
    default:
      return null;
  }
}
