import type {
  AdfNode,
  AdfTopLevelBlockNode,
  LayoutSectionNode,
} from '../../types/index.js';
import type { AdfToMdOptions } from '../../types/index.js';
import {
  serializeBlockquote,
  serializeCodeBlock,
  serializeHeading,
  serializeParagraph,
  serializeRule,
} from './blocks.js';
import {
  serializeBulletList,
  serializeDecisionList,
  serializeOrderedList,
  serializeTaskList,
} from './lists.js';
import {
  serializeBlockCard,
  serializeEmbedCard,
  serializeExpand,
  serializeMediaSingle,
  serializePanel,
} from './panels.js';
import { serializeTable } from './tables.js';

export function serializeBlock(node: AdfTopLevelBlockNode | AdfNode, options?: AdfToMdOptions): string {
  switch (node.type) {
    case 'paragraph':
      return serializeParagraph(node, options);
    case 'heading':
      return serializeHeading(node, options);
    case 'codeBlock':
      return serializeCodeBlock(node);
    case 'rule':
      return serializeRule(node);
    case 'blockquote':
      return serializeBlockquote(node, (n) => serializeBlock(n, options));
    case 'bulletList':
      return serializeBulletList(node, 0, options);
    case 'orderedList':
      return serializeOrderedList(node, 0, options);
    case 'taskList':
      return serializeTaskList(node, 0, options);
    case 'decisionList':
      return serializeDecisionList(node, 0, options);
    case 'table':
      return serializeTable(node);
    case 'panel':
      return serializePanel(node, (n) => serializeBlock(n, options));
    case 'expand':
      return serializeExpand(node, (n) => serializeBlock(n, options));
    case 'nestedExpand':
      return serializeExpand(node, (n) => serializeBlock(n, options));
    case 'mediaSingle':
      return serializeMediaSingle(node);
    case 'blockCard':
      return serializeBlockCard(node);
    case 'embedCard':
      return serializeEmbedCard(node);
    case 'layoutSection':
      return serializeLayoutSection(node, options);
    default:
      return '';
  }
}

function serializeLayoutSection(node: LayoutSectionNode, options?: AdfToMdOptions): string {
  return node.content
    .map((col) =>
      col.content.map((child) => serializeBlock(child, options)).join('\n\n'),
    )
    .join('\n\n---\n\n');
}
