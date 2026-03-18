import type {
  AdfNode,
  AdfTopLevelBlockNode,
  BlockquoteNode,
  CodeBlockNode,
  HeadingNode,
  ParagraphNode,
  RuleNode,
} from '../../types/index.js';
import { serializeInlineNodes } from './inlines.js';

export type SerializeBlockFn = (node: AdfTopLevelBlockNode | AdfNode) => string;

export function serializeHeading(node: HeadingNode): string {
  const prefix = '#'.repeat(node.attrs.level);
  return `${prefix} ${serializeInlineNodes(node.content)}`;
}

export function serializeParagraph(node: ParagraphNode): string {
  return serializeInlineNodes(node.content);
}

export function serializeCodeBlock(node: CodeBlockNode): string {
  const lang = node.attrs?.language ?? '';
  const code = node.content?.map((t) => t.text).join('') ?? '';
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

export function serializeRule(_node: RuleNode): string {
  return '---';
}

export function serializeBlockquote(
  node: BlockquoteNode,
  serializeBlock: SerializeBlockFn,
): string {
  const lines = node.content.map((child) => serializeBlock(child)).join('\n\n');
  return lines
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}
