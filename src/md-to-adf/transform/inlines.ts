import type { Html } from 'mdast';
import type { ParagraphNode } from '../../types/index.js';

export function transformHtmlBlock(node: Html): ParagraphNode | null {
  const detailsMatch =
    /<details[^>]*>\s*<summary[^>]*>(.*?)<\/summary>([\s\S]*?)<\/details>/i.exec(
      node.value,
    );
  if (detailsMatch) {
    const title = (detailsMatch[1] ?? '').trim();
    return { type: 'paragraph', content: [{ type: 'text', text: title }] };
  }
  const stripped = node.value.replace(/<[^>]+>/g, '').trim();
  if (!stripped) return null;
  return { type: 'paragraph', content: [{ type: 'text', text: stripped }] };
}
