import type { AdfDoc } from '../types/index.js';
import { sanitizeMarkdown } from '../utils/sanitize.js';
import { serializeBlock } from './serialize/index.js';

export function adfToMd(adf: AdfDoc): string {
  const parts = adf.content.map((node) => serializeBlock(node));
  const joined = parts.filter((p) => p.length > 0).join('\n\n');
  return sanitizeMarkdown(joined);
}
