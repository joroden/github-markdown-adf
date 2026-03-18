import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

function para(marks: import('../../src/types/index.js').AdfMark[]): AdfDoc {
  return {
    version: 1,
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'hello', marks }] },
    ],
  };
}

describe('marks', () => {
  it('strong wraps text in double asterisks', () => {
    expect(adfToMd(para([{ type: 'strong' }]))).toBe('**hello**');
  });

  it('em wraps text in single asterisks', () => {
    expect(adfToMd(para([{ type: 'em' }]))).toBe('*hello*');
  });

  it('strike wraps text in double tildes', () => {
    expect(adfToMd(para([{ type: 'strike' }]))).toBe('~~hello~~');
  });

  it('code wraps text in backticks', () => {
    expect(adfToMd(para([{ type: 'code' }]))).toBe('`hello`');
  });

  it('link without title', () => {
    expect(
      adfToMd(para([{ type: 'link', attrs: { href: 'https://example.com' } }])),
    ).toBe('[hello](https://example.com)');
  });

  it('link with title', () => {
    expect(
      adfToMd(
        para([
          {
            type: 'link',
            attrs: { href: 'https://example.com', title: 'My Link' },
          },
        ]),
      ),
    ).toBe('[hello](https://example.com "My Link")');
  });

  it('underline wraps text in ins tags', () => {
    expect(adfToMd(para([{ type: 'underline' }]))).toBe('<ins>hello</ins>');
  });

  it('subsup sub wraps text in sub tags', () => {
    expect(adfToMd(para([{ type: 'subsup', attrs: { type: 'sub' } }]))).toBe(
      '<sub>hello</sub>',
    );
  });

  it('subsup sup wraps text in sup tags', () => {
    expect(adfToMd(para([{ type: 'subsup', attrs: { type: 'sup' } }]))).toBe(
      '<sup>hello</sup>',
    );
  });

  it('combined bold and italic produces triple asterisks', () => {
    expect(adfToMd(para([{ type: 'strong' }, { type: 'em' }]))).toBe(
      '***hello***',
    );
  });

  it('code mark with link produces linked code span', () => {
    expect(
      adfToMd(
        para([
          { type: 'code' },
          { type: 'link', attrs: { href: 'https://example.com' } },
        ]),
      ),
    ).toBe('[`hello`](https://example.com)');
  });

  it('textColor mark leaves text unchanged', () => {
    expect(
      adfToMd(para([{ type: 'textColor', attrs: { color: '#ff0000' } }])),
    ).toBe('hello');
  });

  it('backgroundColor mark leaves text unchanged', () => {
    expect(
      adfToMd(para([{ type: 'backgroundColor', attrs: { color: '#ff0000' } }])),
    ).toBe('hello');
  });

  it('multiple text nodes in paragraph concatenate', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'plain ' },
            { type: 'text', text: 'bold', marks: [{ type: 'strong' }] },
            { type: 'text', text: ' and ' },
            { type: 'text', text: 'italic', marks: [{ type: 'em' }] },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('plain **bold** and *italic*');
  });
});
