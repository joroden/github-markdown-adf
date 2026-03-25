import type { BlockContent, Root } from 'mdast';
import type {
  AdfDoc,
  AdfTopLevelBlockNode,
  MdToAdfOptions,
} from '../../types/index.js';
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

export function transformRoot(root: Root, options?: MdToAdfOptions): AdfDoc {
  const content = transformNodes(root.children as BlockContent[], options);
  return { version: 1, type: 'doc', content };
}

function transformNodes(
  nodes: BlockContent[],
  options?: MdToAdfOptions,
): AdfTopLevelBlockNode[] {
  const result: AdfTopLevelBlockNode[] = [];
  const detailsPairs = buildDetailsPairs(nodes);
  let i = 0;
  while (i < nodes.length) {
    const expand = tryTransformExpand(nodes, i, detailsPairs, (node) =>
      transformBlock(node, options),
    );
    if (expand) {
      result.push(expand.node);
      i = expand.next;
      continue;
    }
    const transformed = transformBlock(nodes[i]!, options);
    if (transformed) result.push(transformed);
    i++;
  }
  return result;
}

export function transformBlock(
  node: BlockContent,
  options?: MdToAdfOptions,
): AdfTopLevelBlockNode | null {
  switch (node.type) {
    case 'heading':
      return transformHeading(node, options);
    case 'paragraph':
      return transformParagraph(node, options);
    case 'code':
      return transformCode(node);
    case 'thematicBreak':
      return transformThematicBreak(node);
    case 'blockquote':
      return transformBlockquote(node, (children) =>
        children.flatMap((c) => {
          const r = transformBlock(c, options);
          return r ? [r] : [];
        }),
        options,
      );
    case 'list':
      return transformList(node, (blockNode) => transformBlock(blockNode, options), options);
    case 'table':
      return transformTable(node, options);
    case 'html':
      return transformHtmlBlock(node);
    default:
      return null;
  }
}
