import type {
  AdfNode,
  AdfTopLevelBlockNode,
  LayoutSectionNode,
} from '../../types/index.js';
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

export function serializeBlock(node: AdfTopLevelBlockNode | AdfNode): string {
  switch (node.type) {
    case 'paragraph':
      return serializeParagraph(node);
    case 'heading':
      return serializeHeading(node);
    case 'codeBlock':
      return serializeCodeBlock(node);
    case 'rule':
      return serializeRule(node);
    case 'blockquote':
      return serializeBlockquote(node, serializeBlock);
    case 'bulletList':
      return serializeBulletList(node);
    case 'orderedList':
      return serializeOrderedList(node);
    case 'taskList':
      return serializeTaskList(node);
    case 'decisionList':
      return serializeDecisionList(node);
    case 'table':
      return serializeTable(node);
    case 'panel':
      return serializePanel(node, serializeBlock);
    case 'expand':
      return serializeExpand(node, serializeBlock);
    case 'nestedExpand':
      return serializeExpand(node, serializeBlock);
    case 'mediaSingle':
      return serializeMediaSingle(node);
    case 'blockCard':
      return serializeBlockCard(node);
    case 'embedCard':
      return serializeEmbedCard(node);
    case 'layoutSection':
      return serializeLayoutSection(node);
    default:
      return '';
  }
}

function serializeLayoutSection(node: LayoutSectionNode): string {
  return node.content
    .map((col) =>
      col.content.map((child) => serializeBlock(child)).join('\n\n'),
    )
    .join('\n\n---\n\n');
}
