import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

const TIMEOUT_MS = 800;
const PIPELINE_TIMEOUT_MS = 1500;

describe('ReDoS resistance', () => {
  describe('Group 1: HTML tag regex in mdToAdf', () => {
    it('handles 10K unclosed < chars without timing out', () => {
      const input = '<'.repeat(10000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles 5K <ins> tags without timing out', () => {
      const input = '<ins>'.repeat(5000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles 1K open/close HTML pairs without timing out', () => {
      const input = '<ins>text</ins>'.repeat(1000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles <details> block without closing tag (50K content) without timing out', () => {
      const input = '<details><summary>title</summary>' + 'a'.repeat(50000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles deeply nested unclosed details without timing out', () => {
      const input = '<details><summary>'.repeat(100) + 'content'.repeat(1000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles split <details> opener with 50K content and no closer without timing out', () => {
      const opener = '<details>\n<summary>title</summary>\n\n';
      const input = opener + 'a'.repeat(50000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles 500 sequential <details> blocks without timing out', () => {
      const block = '<details>\n<summary>S</summary>\n\nContent\n</details>\n\n';
      const input = block.repeat(500);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(PIPELINE_TIMEOUT_MS);
    });
  });

  describe('Group 2: Alert pattern in mdToAdf', () => {
    it('handles "> " prefix with 10K random chars (no alert keyword) without timing out', () => {
      const input = '> ' + 'x'.repeat(10000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles "> [!" with 10K chars (partial match) without timing out', () => {
      const input = '> [!' + 'a'.repeat(10000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles blockquote with 1000 lines without timing out', () => {
      const input = '> line\n'.repeat(1000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });
  });

  describe('Group 3: Escape functions via adfToMd', () => {
    it('handles ADF text node with 50K asterisks without timing out', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '*'.repeat(50000) }],
          },
        ],
      };
      const start = performance.now();
      adfToMd(doc);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles ADF text node with 50K pipe characters without timing out', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '|'.repeat(50000) }],
          },
        ],
      };
      const start = performance.now();
      adfToMd(doc);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles ADF text node starting with repeated "# " without timing out', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '# '.repeat(10000) }],
          },
        ],
      };
      const start = performance.now();
      adfToMd(doc);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles ADF text node with 100K mixed special markdown chars without timing out', () => {
      const chars = '\\`*_[]~|';
      let text = '';
      for (let i = 0; i < 100000; i++) {
        text += chars[i % chars.length];
      }
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      };
      const start = performance.now();
      adfToMd(doc);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });
  });

  describe('Group 4: Sanitize patterns via mdToAdf/adfToMd', () => {
    it('handles 50K null bytes in mdToAdf without timing out and strips them', () => {
      const input = '\0'.repeat(50000);
      const start = performance.now();
      const result = mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
      const text = JSON.stringify(result);
      expect(text).not.toContain('\0');
    });

    it('handles 20K CRLF sequences in mdToAdf without timing out', () => {
      const input = '\r\n'.repeat(20000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles 100K trailing spaces per line (many lines) in mdToAdf without timing out', () => {
      const line = 'text' + ' '.repeat(100);
      const input = (line + '\n').repeat(1000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });
  });

  describe('Group 5: Full pipeline with maximum-size inputs', () => {
    it('parses a 1000-row table in under 1500ms', () => {
      const header = '| col1 | col2 | col3 |\n| --- | --- | --- |\n';
      const row = '| cell1 | cell2 | cell3 |\n';
      const input = header + row.repeat(1000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(PIPELINE_TIMEOUT_MS);
    });

    it('parses 10K lines of regular text in under 1500ms', () => {
      const input = 'hello world\n\n'.repeat(5000);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(PIPELINE_TIMEOUT_MS);
    });

    it('parses 500 flat bullet list items in under 1500ms', () => {
      const input = '- item\n'.repeat(500);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(PIPELINE_TIMEOUT_MS);
    });
  });

  describe('Group 6: parseSingleDetails nesting-aware loop', () => {
    it('handles single-form with 100 nested <details> blocks without timing out', () => {
      const open = '<details><summary>L</summary>';
      const close = '</details>';
      const input = open.repeat(100) + 'deep' + close.repeat(100);
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });

    it('handles single-form with a 50K char summary without timing out', () => {
      const input = `<details><summary>${'x'.repeat(50000)}</summary>body</details>`;
      const start = performance.now();
      mdToAdf(input);
      expect(performance.now() - start).toBeLessThan(TIMEOUT_MS);
    });
  });
});
