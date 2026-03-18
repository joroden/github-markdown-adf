import type { BlockContent, Root } from 'mdast';
import type { AdfDoc, AdfTopLevelBlockNode } from '../../types/index.js';
import {
  transformBlockquote,
  transformCode,
  transformHeading,
  transformParagraph,
  transformThematicBreak,
} from './blocks.js';
import { transformHtmlBlock } from './inlines.js';
import { transformList } from './lists.js';
import { transformTable } from './tables.js';

export function transformRoot(root: Root): AdfDoc {
  const content = root.children.flatMap((node) => {
    const result = transformBlock(node as BlockContent);
    return result ? [result] : [];
  });
  return { version: 1, type: 'doc', content };
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
