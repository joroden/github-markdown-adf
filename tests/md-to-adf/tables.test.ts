import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type {
  TableNode,
  TableRowNode,
  TableHeaderNode,
  TableCellNode,
  ParagraphNode,
} from '../../src/types/index.js';

describe('tables', () => {
  const basicTable =
    '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';

  it('produces a table node', () => {
    const doc = mdToAdf(basicTable);
    expect(doc.content[0]!.type).toBe('table');
  });

  it('first row contains tableHeader nodes', () => {
    const doc = mdToAdf(basicTable);
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    expect(headerRow.type).toBe('tableRow');
    for (const cell of headerRow.content) {
      expect(cell.type).toBe('tableHeader');
    }
  });

  it('body rows contain tableCell nodes', () => {
    const doc = mdToAdf(basicTable);
    const table = doc.content[0] as TableNode;
    const bodyRow = table.content[1] as TableRowNode;
    for (const cell of bodyRow.content) {
      expect(cell.type).toBe('tableCell');
    }
  });

  it('every header cell has a paragraph child', () => {
    const doc = mdToAdf(basicTable);
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    for (const cell of headerRow.content) {
      const header = cell as TableHeaderNode;
      expect(header.content[0]!.type).toBe('paragraph');
    }
  });

  it('every data cell has a paragraph child', () => {
    const doc = mdToAdf(basicTable);
    const table = doc.content[0] as TableNode;
    for (const row of table.content.slice(1)) {
      for (const cell of (row as TableRowNode).content) {
        expect((cell as TableCellNode).content[0]!.type).toBe('paragraph');
      }
    }
  });

  it('header cell text is inside paragraph', () => {
    const doc = mdToAdf(basicTable);
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    const firstHeader = headerRow.content[0] as TableHeaderNode;
    const para = firstHeader.content[0] as ParagraphNode;
    expect(para.content[0]).toEqual({ type: 'text', text: 'Name' });
  });

  it('data cell text is inside paragraph', () => {
    const doc = mdToAdf(basicTable);
    const table = doc.content[0] as TableNode;
    const firstBodyRow = table.content[1] as TableRowNode;
    const firstCell = firstBodyRow.content[0] as TableCellNode;
    const para = firstCell.content[0] as ParagraphNode;
    expect(para.content[0]).toEqual({ type: 'text', text: 'Alice' });
  });

  it('empty cell produces paragraph with empty content', () => {
    const doc = mdToAdf('| A | B |\n| --- | --- |\n| | val |');
    const table = doc.content[0] as TableNode;
    const bodyRow = table.content[1] as TableRowNode;
    const emptyCell = bodyRow.content[0] as TableCellNode;
    expect(emptyCell.content[0]).toEqual({ type: 'paragraph', content: [] });
  });

  it('cell with bold text has strong mark inside paragraph', () => {
    const doc = mdToAdf('| **bold** |\n| --- |\n| plain |');
    const table = doc.content[0] as TableNode;
    const headerRow = table.content[0] as TableRowNode;
    const header = headerRow.content[0] as TableHeaderNode;
    const para = header.content[0] as ParagraphNode;
    expect(para.content[0]).toEqual({
      type: 'text',
      text: 'bold',
      marks: [{ type: 'strong' }],
    });
  });

  it('table has correct number of rows', () => {
    const doc = mdToAdf(basicTable);
    const table = doc.content[0] as TableNode;
    expect(table.content).toHaveLength(3);
  });

  it('header cells have attrs object', () => {
    const doc = mdToAdf('| H |\n| --- |\n| d |');
    const table = doc.content[0] as TableNode;
    const header = (table.content[0] as TableRowNode)
      .content[0] as TableHeaderNode;
    expect(header.attrs).toBeDefined();
  });

  it('data cells have attrs object', () => {
    const doc = mdToAdf('| H |\n| --- |\n| d |');
    const table = doc.content[0] as TableNode;
    const cell = (table.content[1] as TableRowNode).content[0] as TableCellNode;
    expect(cell.attrs).toBeDefined();
  });
});
