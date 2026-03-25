import { describe, expect, it } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { ParagraphNode } from '../../src/types/index.js';

describe('mdToAdf options', () => {
  describe('mentions option', () => {
    it('default leaves mention-like text unchanged', () => {
      const doc = mdToAdf('Hello @alice!');
      const paragraph = doc.content[0] as ParagraphNode;

      expect(paragraph.content).toEqual([{ type: 'text', text: 'Hello @alice!' }]);
    });

    it('mentions: true converts plain @username text into mention nodes', () => {
      const doc = mdToAdf('Hello @alice!', { mentions: true });
      const paragraph = doc.content[0] as ParagraphNode;

      expect(paragraph.content).toEqual([
        { type: 'text', text: 'Hello ' },
        { type: 'mention', attrs: { id: 'alice', text: '@alice' } },
        { type: 'text', text: '!' },
      ]);
    });

    it('mentions transformer can map usernames to custom mention attrs', () => {
      const doc = mdToAdf('Assigned to @some-user', {
        mentions: (username) => ({
          id: 'jira-account-id',
          text: username === 'some-user' ? '@Some User' : `@${username}`,
        }),
      });
      const paragraph = doc.content[0] as ParagraphNode;

      expect(paragraph.content).toEqual([
        { type: 'text', text: 'Assigned to ' },
        {
          type: 'mention',
          attrs: { id: 'jira-account-id', text: '@Some User' },
        },
      ]);
    });

    it('mentions: true does not treat email addresses as mentions', () => {
      const doc = mdToAdf('Reach alice@example.com or @alice', {
        mentions: true,
      });
      const paragraph = doc.content[0] as ParagraphNode;

      expect(paragraph.content).toEqual([
        { type: 'text', text: 'Reach ' },
        {
          type: 'text',
          text: 'alice@example.com',
          marks: [{ type: 'link', attrs: { href: 'mailto:alice@example.com' } }],
        },
        { type: 'text', text: ' or ' },
        { type: 'mention', attrs: { id: 'alice', text: '@alice' } },
      ]);
    });
  });
});