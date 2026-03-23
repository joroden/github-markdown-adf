import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import type { Root } from 'mdast';

const markdownParseOptions = {
  extensions: [gfm()],
  mdastExtensions: [gfmFromMarkdown()],
};

export function parseMarkdown(markdown: string): Root {
  return fromMarkdown(markdown, markdownParseOptions);
}
