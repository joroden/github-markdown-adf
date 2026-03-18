import type { ParagraphNode, TableNode } from '../../types/index.js';
import { serializeInlineNodes } from './inlines.js';

export function serializeTable(node: TableNode): string {
  const rows = node.content;
  if (rows.length === 0) return '';

  const firstRow = rows[0];
  if (!firstRow) return '';

  const isHeaderRow = firstRow.content.some((c) => c.type === 'tableHeader');

  const serializeCell = (cell: {
    content: import('../../types/index.js').AdfTableCellContent[];
  }): string => {
    const para = cell.content.find((c) => c.type === 'paragraph') as
      | ParagraphNode
      | undefined;
    if (!para) return ' ';
    return serializeInlineNodes(para.content).trim() || ' ';
  };

  const lines: string[] = [];

  if (isHeaderRow) {
    const headerCells = firstRow.content.map(serializeCell);
    lines.push(`| ${headerCells.join(' | ')} |`);
    lines.push(`| ${headerCells.map(() => '---').join(' | ')} |`);
    for (const row of rows.slice(1)) {
      const cells = row.content.map(serializeCell);
      lines.push(`| ${cells.join(' | ')} |`);
    }
  } else {
    const colCount = firstRow.content.length;
    const headerPlaceholders = Array<string>(colCount).fill(' ');
    lines.push(`| ${headerPlaceholders.join(' | ')} |`);
    lines.push(`| ${headerPlaceholders.map(() => '---').join(' | ')} |`);
    for (const row of rows) {
      const cells = row.content.map(serializeCell);
      lines.push(`| ${cells.join(' | ')} |`);
    }
  }

  return lines.join('\n');
}
