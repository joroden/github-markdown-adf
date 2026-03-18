import type { AdfInlineNode } from '../../types/index.js';
import { escapeMarkdown } from '../../utils/escape.js';
import { applyMarks } from './marks.js';

export function serializeInlineNodes(
  nodes: AdfInlineNode[] | undefined,
): string {
  if (!nodes || nodes.length === 0) return '';
  return nodes.map(serializeInline).join('');
}

function serializeInline(node: AdfInlineNode): string {
  switch (node.type) {
    case 'text':
      return applyMarks(escapeMarkdown(node.text), node.marks);
    case 'hardBreak':
      return '\\\n';
    case 'mention':
      return node.attrs.text ?? `@${node.attrs.id}`;
    case 'emoji':
      return node.attrs.text ?? `:${node.attrs.shortName}:`;
    case 'date':
      return node.attrs.timestamp;
    case 'status':
      return `\`[${node.attrs.text}]\``;
    case 'inlineCard':
      return node.attrs.url ? `<${node.attrs.url}>` : '';
    case 'mediaInline':
      return '';
    default:
      return '';
  }
}
