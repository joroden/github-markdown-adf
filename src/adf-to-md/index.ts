import type { AdfDoc, AdfToMdOptions } from '../types/index.js';
import { sanitizeMarkdown } from '../utils/sanitize.js';
import { serializeBlock } from './serialize/index.js';

export function adfToMd(adf: AdfDoc, options?: AdfToMdOptions): string {
  const parts = adf.content.map((node) => serializeBlock(node, options));
  const joined = parts.filter((p) => p.length > 0).join('\n\n');
  return sanitizeMarkdown(joined);
}
