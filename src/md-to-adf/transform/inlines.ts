import type { Html } from 'mdast';
import type { ParagraphNode } from '../../types/index.js';

export function transformHtmlBlock(node: Html): ParagraphNode | null {
  const stripped = node.value.replace(/<[^>]+>/g, '').trim();
  if (!stripped) return null;
  return { type: 'paragraph', content: [{ type: 'text', text: stripped }] };
}
