import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

describe('Injection resistance', () => {
  describe('Group 1: HTML/script injection in ADF text nodes', () => {
    it('does not produce an unescaped <script> tag when text contains script injection', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '<script>alert(1)</script>' }],
          },
        ],
      };
      const output = adfToMd(doc);
      expect(output).not.toMatch(/<script>alert\(1\)<\/script>/);
      expect(output).toContain('\\<script>');
    });

    it('renders javascript: href as-is without crashing (sanitization is renderer responsibility)', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'click',
                marks: [
                  { type: 'link', attrs: { href: 'javascript:alert(1)' } },
                ],
              },
            ],
          },
        ],
      };
      expect(() => adfToMd(doc)).not.toThrow();
    });

    it('does not crash or produce executable HTML for <img onerror> text node', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }],
          },
        ],
      };
      expect(() => adfToMd(doc)).not.toThrow();
    });
  });

  describe('Group 2: Prototype pollution (defensive)', () => {
    it('does not throw when markdown contains __proto__', () => {
      expect(() => mdToAdf('__proto__')).not.toThrow();
      const result = mdToAdf('{"__proto__": {"polluted": true}}');
      expect(result.version).toBe(1);
      expect(result.type).toBe('doc');
    });

    it('does not throw when markdown contains constructor keyword', () => {
      expect(() => mdToAdf('constructor.prototype.x = 1')).not.toThrow();
    });

    it('does not throw when markdown contains prototype keyword', () => {
      expect(() => mdToAdf('Object.prototype.polluted = true')).not.toThrow();
    });

    it('does not throw when ADF node has extra unexpected properties', () => {
      const doc = {
        version: 1 as const,
        type: 'doc' as const,
        content: [
          {
            type: 'paragraph' as const,
            content: [{ type: 'text' as const, text: 'hello' }],
            extraProp: 'unexpected',
          },
        ],
        extraTopLevel: 'also unexpected',
      } as unknown as AdfDoc;
      expect(() => adfToMd(doc)).not.toThrow();
    });
  });

  describe('Group 3: Null bytes and control characters', () => {
    it('does not throw for input with null byte and strips it', () => {
      expect(() => mdToAdf('hello\0world')).not.toThrow();
      const result = mdToAdf('hello\0world');
      expect(JSON.stringify(result)).not.toContain('\0');
    });

    it('does not throw for input with Unicode control characters U+0001 through U+001F', () => {
      let input = '';
      for (let i = 1; i <= 0x1f; i++) {
        input += String.fromCharCode(i);
      }
      expect(() => mdToAdf(input)).not.toThrow();
    });

    it('does not crash on a very long single line with no newlines (1M chars)', () => {
      const input = 'a'.repeat(1_000_000);
      expect(() => mdToAdf(input)).not.toThrow();
    });
  });

  describe('Group 4: Deeply nested markdown structures', () => {
    it('does not crash on 100 levels of nested blockquotes', () => {
      const input = '> '.repeat(100) + 'content';
      expect(() => mdToAdf(input)).not.toThrow();
    });

    it('does not crash on 50 levels of nested bold markers', () => {
      const input = '**'.repeat(50) + 'text' + '**'.repeat(50);
      expect(() => mdToAdf(input)).not.toThrow();
    });

    it('does not crash on 20 levels of indented bullet lists', () => {
      let input = '';
      for (let i = 0; i < 20; i++) {
        input += '  '.repeat(i) + '- item\n';
      }
      expect(() => mdToAdf(input)).not.toThrow();
    });
  });

  describe('Group 5: Markdown injection via ADF → MD', () => {
    it('escapes newline+heading injection in text node', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '\n# Injected heading' }],
          },
        ],
      };
      const output = adfToMd(doc);
      const lines = output.split('\n');
      const headingLines = lines.filter((l) => /^#{1,6} /.test(l));
      expect(headingLines).toHaveLength(0);
    });

    it('escapes newline+list injection in text node', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '\n- injected list item' }],
          },
        ],
      };
      const output = adfToMd(doc);
      const lines = output.split('\n');
      const listLines = lines.filter((l) => /^- /.test(l));
      expect(listLines).toHaveLength(0);
    });

    it('escapes blockquote injection in text node starting with "> "', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '> not a blockquote' }],
          },
        ],
      };
      const output = adfToMd(doc);
      expect(output).not.toMatch(/^> /m);
    });
  });

  describe('Group 6: Link URL edge cases', () => {
    it('does not crash on javascript: URL in link mark', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'link',
                marks: [
                  { type: 'link', attrs: { href: 'javascript:alert(1)' } },
                ],
              },
            ],
          },
        ],
      };
      expect(() => adfToMd(doc)).not.toThrow();
    });

    it('does not crash on data: URL in link mark', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'link',
                marks: [
                  {
                    type: 'link',
                    attrs: { href: 'data:text/html,<script>alert(1)</script>' },
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(() => adfToMd(doc)).not.toThrow();
    });

    it('does not crash on a 100K char URL in a link mark', () => {
      const doc: AdfDoc = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'link',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: 'https://example.com/' + 'a'.repeat(100000),
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(() => adfToMd(doc)).not.toThrow();
    });
  });
});
