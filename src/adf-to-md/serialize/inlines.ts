import type { AdfInlineNode } from '../../types/index.js';
import type { AdfToMdOptions } from '../../types/index.js';
import { escapeMarkdown } from '../../utils/escape.js';
import { applyMarks } from './marks.js';

export function serializeInlineNodes(
  nodes: AdfInlineNode[] | undefined,
  options?: AdfToMdOptions,
): string {
  if (!nodes || nodes.length === 0) return '';
  return nodes.map((node) => serializeInline(node, options)).join('');
}

function serializeInline(node: AdfInlineNode, options?: AdfToMdOptions): string {
  switch (node.type) {
    case 'text':
      return applyMarks(escapeMarkdown(node.text), node.marks);
    case 'hardBreak':
      return '\\\n';
    case 'mention':
      if (options?.mentions === false) return node.attrs.text ?? node.attrs.id;
      if (typeof options?.mentions === 'function') return options.mentions(node.attrs);
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
