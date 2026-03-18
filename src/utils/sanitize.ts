export function stripNullBytes(text: string): string {
  return text.replace(/\0/g, '');
}

export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function trimTrailingWhitespace(text: string): string {
  return text.replace(/[^\S\n]+$/gm, '');
}

export function collapseBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n');
}

export function sanitizeMarkdown(text: string): string {
  return collapseBlankLines(
    trimTrailingWhitespace(normalizeNewlines(stripNullBytes(text))),
  );
}

export function sanitizeText(text: string): string {
  return stripNullBytes(normalizeNewlines(text));
}
