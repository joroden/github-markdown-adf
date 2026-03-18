import type { AdfMark } from '../../types/index.js';

export function applyMarks(text: string, marks: AdfMark[] | undefined): string {
  if (!marks || marks.length === 0) return text;
  let result = text;
  const hasCode = marks.some((m) => m.type === 'code');
  if (hasCode) {
    const linkMark = marks.find(
      (m): m is Extract<AdfMark, { type: 'link' }> => m.type === 'link',
    );
    result = `\`${result}\``;
    if (linkMark) result = `[${result}](${linkMark.attrs.href})`;
    return result;
  }
  for (const mark of marks) {
    switch (mark.type) {
      case 'strong':
        result = `**${result}**`;
        break;
      case 'em':
        result = `*${result}*`;
        break;
      case 'strike':
        result = `~~${result}~~`;
        break;
      case 'underline':
        result = `<ins>${result}</ins>`;
        break;
      case 'subsup':
        result =
          mark.attrs.type === 'sub'
            ? `<sub>${result}</sub>`
            : `<sup>${result}</sup>`;
        break;
      case 'link':
        result = `[${result}](${mark.attrs.href}${mark.attrs.title ? ` "${mark.attrs.title}"` : ''})`;
        break;
      case 'textColor':
      case 'backgroundColor':
      case 'alignment':
      case 'indentation':
      case 'breakout':
      case 'border':
      case 'annotation':
      case 'dataConsumer':
      case 'fragment':
        break;
    }
  }
  return result;
}
