import type { Table, TableRow } from 'mdast';
import type {
  TableCellNode,
  TableHeaderNode,
  TableNode,
  TableRowNode,
} from '../../types/index.js';
import { phrasingToInlineNodes } from './marks.js';

export function transformTable(node: Table): TableNode {
  const rows = node.children;
  if (rows.length === 0) return { type: 'table', content: [] };

  const headerRow = rows[0];
  const bodyRows = rows.slice(1);

  const adfRows: TableRowNode[] = [];

  if (headerRow) {
    adfRows.push({
      type: 'tableRow',
      content: headerRow.children.map((cell) => transformTableHeader(cell)),
    });
  }

  for (const row of bodyRows) {
    adfRows.push({
      type: 'tableRow',
      content: row.children.map((cell) => transformTableCell(cell)),
    });
  }

  return { type: 'table', content: adfRows };
}

function transformTableHeader(
  cell: TableRow['children'][number],
): TableHeaderNode {
  const inlines = phrasingToInlineNodes(cell.children);
  return {
    type: 'tableHeader',
    attrs: {},
    content: [
      { type: 'paragraph', content: inlines.length > 0 ? inlines : [] },
    ],
  };
}

function transformTableCell(cell: TableRow['children'][number]): TableCellNode {
  const inlines = phrasingToInlineNodes(cell.children);
  return {
    type: 'tableCell',
    attrs: {},
    content: [
      { type: 'paragraph', content: inlines.length > 0 ? inlines : [] },
    ],
  };
}
