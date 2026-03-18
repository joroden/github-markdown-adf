import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type {
  BulletListNode,
  ListItemNode,
  OrderedListNode,
  TaskItemNode,
  TaskListNode,
} from '../../src/types/index.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('bullet lists', () => {
  it('converts single-item bullet list', () => {
    const doc = mdToAdf('- item one');
    expect(doc.content[0]).toEqual({
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'item one' }],
            },
          ],
        },
      ],
    });
  });

  it('converts multi-item bullet list', () => {
    const doc = mdToAdf('- alpha\n- beta\n- gamma');
    const list = doc.content[0] as BulletListNode;
    expect(list.type).toBe('bulletList');
    expect(list.content).toHaveLength(3);
    expect((list.content[0] as ListItemNode).content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'alpha' }],
    });
    expect((list.content[2] as ListItemNode).content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'gamma' }],
    });
  });

  it('converts nested bullet list', () => {
    const doc = mdToAdf('- outer\n  - inner');
    const list = doc.content[0] as BulletListNode;
    const outerItem = list.content[0] as ListItemNode;
    expect(outerItem.content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'outer' }],
    });
    const nestedList = outerItem.content[1] as BulletListNode;
    expect(nestedList.type).toBe('bulletList');
    expect((nestedList.content[0] as ListItemNode).content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'inner' }],
    });
  });
});

describe('ordered lists', () => {
  it('converts ordered list with default start (no attrs)', () => {
    const doc = mdToAdf('1. first\n2. second');
    const list = doc.content[0] as OrderedListNode;
    expect(list.type).toBe('orderedList');
    expect((list as any).attrs).toBeUndefined();
    expect(list.content).toHaveLength(2);
  });

  it('ordered list items have paragraph children', () => {
    const doc = mdToAdf('1. item');
    const list = doc.content[0] as OrderedListNode;
    expect((list.content[0] as ListItemNode).content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'item' }],
    });
  });

  it('converts ordered list with start != 1 → sets attrs.order', () => {
    const doc = mdToAdf('3. third\n4. fourth');
    const list = doc.content[0] as OrderedListNode;
    expect(list.type).toBe('orderedList');
    expect(list.attrs).toEqual({ order: 3 });
    expect(list.content).toHaveLength(2);
  });

  it('ordered list with start=1 has no attrs', () => {
    const doc = mdToAdf('1. first');
    const list = doc.content[0] as OrderedListNode;
    expect((list as any).attrs).toBeUndefined();
  });
});

describe('task lists', () => {
  it('converts unchecked task → state TODO', () => {
    const doc = mdToAdf('- [ ] todo item');
    const list = doc.content[0] as TaskListNode;
    expect(list.type).toBe('taskList');
    const item = list.content[0] as TaskItemNode;
    expect(item.type).toBe('taskItem');
    expect(item.attrs.state).toBe('TODO');
  });

  it('converts checked task → state DONE', () => {
    const doc = mdToAdf('- [x] done item');
    const list = doc.content[0] as TaskListNode;
    const item = list.content[0] as TaskItemNode;
    expect(item.attrs.state).toBe('DONE');
  });

  it('task item content has the text', () => {
    const doc = mdToAdf('- [ ] my task');
    const list = doc.content[0] as TaskListNode;
    const item = list.content[0] as TaskItemNode;
    expect(item.content).toEqual([{ type: 'text', text: 'my task' }]);
  });

  it('mixed checked and unchecked items', () => {
    const doc = mdToAdf('- [x] done\n- [ ] todo');
    const list = doc.content[0] as TaskListNode;
    expect((list.content[0] as TaskItemNode).attrs.state).toBe('DONE');
    expect((list.content[1] as TaskItemNode).attrs.state).toBe('TODO');
  });

  it('taskList has a UUID localId', () => {
    const doc = mdToAdf('- [ ] task');
    const list = doc.content[0] as TaskListNode;
    expect(list.attrs.localId).toMatch(UUID_REGEX);
  });

  it('each taskItem has a UUID localId', () => {
    const doc = mdToAdf('- [ ] a\n- [x] b');
    const list = doc.content[0] as TaskListNode;
    for (const item of list.content) {
      expect((item as TaskItemNode).attrs.localId).toMatch(UUID_REGEX);
    }
  });

  it('taskList and taskItem have different UUIDs', () => {
    const doc = mdToAdf('- [ ] task');
    const list = doc.content[0] as TaskListNode;
    const item = list.content[0] as TaskItemNode;
    expect(list.attrs.localId).not.toBe(item.attrs.localId);
  });

  it('multiple task items have unique UUIDs', () => {
    const doc = mdToAdf('- [ ] a\n- [ ] b\n- [ ] c');
    const list = doc.content[0] as TaskListNode;
    const ids = list.content.map((i) => (i as TaskItemNode).attrs.localId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
