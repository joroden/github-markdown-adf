import type {
  BulletListNode,
  DecisionListNode,
  ListItemNode,
  OrderedListNode,
  TaskListNode,
} from '../../types/index.js';
import type { AdfToMdOptions } from '../../types/index.js';
import { serializeInlineNodes } from './inlines.js';

export function serializeBulletList(node: BulletListNode, depth = 0, options?: AdfToMdOptions): string {
  return node.content
    .map((item) => serializeListItem(item, '-', depth, options))
    .join('\n');
}

export function serializeOrderedList(node: OrderedListNode, depth = 0, options?: AdfToMdOptions): string {
  const start = node.attrs?.order ?? 1;
  return node.content
    .map((item, i) => serializeListItem(item, `${start + i}.`, depth, options))
    .join('\n');
}

export function serializeTaskList(node: TaskListNode, depth = 0, options?: AdfToMdOptions): string {
  return node.content
    .map((item) => {
      const indent = '  '.repeat(depth);
      const checkbox = item.attrs.state === 'DONE' ? '[x]' : '[ ]';
      const text = serializeInlineNodes(item.content, options);
      return `${indent}- ${checkbox} ${text}`;
    })
    .join('\n');
}

export function serializeDecisionList(
  node: DecisionListNode,
  depth = 0,
  options?: AdfToMdOptions,
): string {
  return node.content
    .map((item) => {
      const indent = '  '.repeat(depth);
      const text = serializeInlineNodes(item.content, options);
      return `${indent}- [x] ${text}`;
    })
    .join('\n');
}

function serializeListItem(
  node: ListItemNode,
  bullet: string,
  depth: number,
  options?: AdfToMdOptions,
): string {
  const indent = '  '.repeat(depth);
  const parts: string[] = [];
  for (const child of node.content) {
    if (child.type === 'paragraph') {
      parts.push(serializeInlineNodes(child.content, options));
    } else if (child.type === 'bulletList') {
      parts.push('\n' + serializeBulletList(child, depth + 1, options));
    } else if (child.type === 'orderedList') {
      parts.push('\n' + serializeOrderedList(child, depth + 1, options));
    } else if (child.type === 'codeBlock') {
      const lang = child.attrs?.language ?? '';
      const code = child.content?.map((t) => t.text).join('') ?? '';
      parts.push(`\n\`\`\`${lang}\n${code}\n\`\`\``);
    }
  }
  return `${indent}${bullet} ${parts.join('')}`;
}
