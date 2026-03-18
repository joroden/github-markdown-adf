import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

describe('code blocks', () => {
  it('codeBlock with language produces fenced block with language tag', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'javascript' },
          content: [{ type: 'text', text: 'const x = 1;' }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('```javascript\nconst x = 1;\n```');
  });

  it('codeBlock without language produces plain fenced block', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          content: [{ type: 'text', text: 'hello' }],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('```\nhello\n```');
  });

  it('codeBlock with no content produces empty fenced block', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [{ type: 'codeBlock', attrs: { language: 'ts' } }],
    };
    expect(adfToMd(doc)).toBe('```ts\n\n```');
  });

  it('multi-line code block preserves newlines', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'python' },
          content: [
            {
              type: 'text',
              text: 'def foo():\n    return 1\n\ndef bar():\n    return 2',
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe(
      '```python\ndef foo():\n    return 1\n\ndef bar():\n    return 2\n```',
    );
  });

  it('code block inside blockquote has each line prefixed with >', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'codeBlock',
              attrs: { language: 'javascript' },
              content: [{ type: 'text', text: 'const x = 1;' }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('> ```javascript\n> const x = 1;\n> ```');
  });

  it('blockquote with paragraph', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Quoted text' }],
            },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('> Quoted text');
  });
});
