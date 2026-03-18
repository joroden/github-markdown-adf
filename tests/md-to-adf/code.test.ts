import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { CodeBlockNode } from '../../src/types/index.js';

describe('code blocks', () => {
  describe('language normalization', () => {
    it('normalizes js to javascript', () => {
      const doc = mdToAdf('```js\nconsole.log("hi")\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.attrs?.language).toBe('javascript');
    });

    it('normalizes ts to typescript', () => {
      const doc = mdToAdf('```ts\nconst x: number = 1\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.attrs?.language).toBe('typescript');
    });

    it('normalizes py to python', () => {
      const doc = mdToAdf('```py\nprint("hi")\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.attrs?.language).toBe('python');
    });

    it('normalizes sh to bash', () => {
      const doc = mdToAdf('```sh\necho hi\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.attrs?.language).toBe('bash');
    });

    it('keeps unrecognized language as-is', () => {
      const doc = mdToAdf('```haskell\nmain = putStrLn "hi"\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.attrs?.language).toBe('haskell');
    });
  });

  describe('no language', () => {
    it('produces no attrs when language is omitted', () => {
      const doc = mdToAdf('```\nsome code\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.type).toBe('codeBlock');
      expect(block.attrs).toBeUndefined();
    });
  });

  describe('content', () => {
    it('wraps code value in a text node', () => {
      const doc = mdToAdf('```js\nhello\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.content).toEqual([{ type: 'text', text: 'hello' }]);
    });

    it('handles multi-line code', () => {
      const doc = mdToAdf('```\nline1\nline2\nline3\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.content).toEqual([
        { type: 'text', text: 'line1\nline2\nline3' },
      ]);
    });

    it('empty fenced block has no content', () => {
      const doc = mdToAdf('```\n```');
      const block = doc.content[0] as CodeBlockNode;
      expect(block.content).toBeUndefined();
    });
  });

  it('code block has correct type', () => {
    const doc = mdToAdf('```python\npass\n```');
    expect(doc.content[0]!.type).toBe('codeBlock');
  });
});
