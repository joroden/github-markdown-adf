import type { AdfDoc, MdToAdfOptions } from '../types/index.js';
import { parseMarkdown } from './parser.js';
import { transformRoot } from './transform/index.js';
import { sanitizeText } from '../utils/sanitize.js';

export function mdToAdf(markdown: string, options?: MdToAdfOptions): AdfDoc {
  const sanitized = sanitizeText(markdown);
  const mdast = parseMarkdown(sanitized);
  return transformRoot(mdast, options);
}
