import type {
  BlockCardNode,
  EmbedCardNode,
  ExpandNode,
  MediaSingleNode,
  NestedExpandNode,
  PanelNode,
} from '../../types/index.js';
import type { SerializeBlockFn } from './blocks.js';
import { serializeInlineNodes } from './inlines.js';

const PANEL_TO_ALERT: Record<string, string> = {
  note: 'NOTE',
  info: 'TIP',
  tip: 'TIP',
  warning: 'WARNING',
  success: 'NOTE',
  error: 'CAUTION',
  custom: 'NOTE',
};

export function serializePanel(
  node: PanelNode,
  serializeBlock: SerializeBlockFn,
): string {
  const alertType = PANEL_TO_ALERT[node.attrs.panelType] ?? 'NOTE';
  const contentLines = node.content
    .map((child) => serializeBlock(child))
    .join('\n\n');
  const lines = [
    `> [!${alertType}]`,
    ...contentLines.split('\n').map((l) => `> ${l}`),
  ];
  return lines.join('\n');
}

export function serializeExpand(
  node: ExpandNode | NestedExpandNode,
  serializeBlock: SerializeBlockFn,
): string {
  const title = node.attrs.title ?? '';
  const contentLines = node.content
    .map((child) => serializeBlock(child))
    .join('\n\n');
  return `<details>\n<summary>${title}</summary>\n\n${contentLines}\n</details>`;
}

export function serializeMediaSingle(node: MediaSingleNode): string {
  const media = node.content[0];
  if (!media) return '';
  const alt = media.attrs.alt ?? 'image';
  if (media.attrs.type === 'link') {
    const url = (media.attrs as unknown as { url?: string }).url;
    if (url) return `![${alt}](${url})`;
  }
  return `[media: ${media.attrs.id}]`;
}

export function serializeBlockCard(node: BlockCardNode): string {
  const url = node.attrs.url;
  if (!url) return '';
  return `[${url}](${url})`;
}

export function serializeEmbedCard(node: EmbedCardNode): string {
  return `[${node.attrs.url}](${node.attrs.url})`;
}

export { serializeInlineNodes };
