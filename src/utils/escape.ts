const INLINE_ESCAPE = /([\\`*_[\]~|<])/g;

export function escapeMarkdown(text: string): string {
  let result = text.replace(INLINE_ESCAPE, '\\$1');
  result = result.replace(/^(#{1,6} )/m, '\\$1');
  result = result.replace(/^([-+]) /m, '\\$1 ');
  result = result.replace(/^> /m, '\\> ');
  result = result.replace(/^(\d+)\./m, '$1\\.');
  return result;
}

export function escapePipeInTableCell(text: string): string {
  return text.replace(/\|/g, '\\|');
}

export function unescapeMarkdown(text: string): string {
  return text.replace(/\\([\\`*_[\]~|#\->+<])/g, '$1');
}
