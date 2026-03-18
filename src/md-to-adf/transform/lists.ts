import type { List, ListItem } from 'mdast';
import type {
  BulletListNode,
  ListItemNode,
  OrderedListNode,
  ParagraphNode,
  TaskItemNode,
  TaskListNode,
} from '../../types/index.js';
import { generateId } from '../../utils/id.js';
import { phrasingToInlineNodes } from './marks.js';

type ListResult = BulletListNode | OrderedListNode | TaskListNode;

export function transformList(
  node: List,
  transformBlock: TransformBlockFn,
): ListResult {
  const isTask = node.children.some(
    (item) => item.checked !== null && item.checked !== undefined,
  );
  if (isTask) return transformTaskList(node);
  if (node.ordered) return transformOrderedList(node, transformBlock);
  return transformBulletList(node, transformBlock);
}

type TransformBlockFn = (
  node: import('mdast').BlockContent,
) => import('../../types/index.js').AdfTopLevelBlockNode | null;

function transformBulletList(
  node: List,
  transformBlock: TransformBlockFn,
): BulletListNode {
  return {
    type: 'bulletList',
    content: node.children.map((item) =>
      transformListItem(item, transformBlock),
    ),
  };
}

function transformOrderedList(
  node: List,
  transformBlock: TransformBlockFn,
): OrderedListNode {
  const result: OrderedListNode = {
    type: 'orderedList',
    content: node.children.map((item) =>
      transformListItem(item, transformBlock),
    ),
  };
  if (node.start !== null && node.start !== undefined && node.start !== 1) {
    result.attrs = { order: node.start };
  }
  return result;
}

function transformListItem(
  node: ListItem,
  transformBlock: TransformBlockFn,
): ListItemNode {
  const content: ListItemNode['content'] = [];
  for (const child of node.children) {
    if (child.type === 'paragraph') {
      content.push({
        type: 'paragraph',
        content: phrasingToInlineNodes(child.children),
      });
    } else if (child.type === 'list') {
      const nestedList = transformList(child, transformBlock);
      if (nestedList.type === 'taskList') {
        const para: ParagraphNode = { type: 'paragraph', content: [] };
        if (content.length === 0) content.push(para);
      } else {
        if (content.length === 0)
          content.push({ type: 'paragraph', content: [] });
        content.push(nestedList as BulletListNode | OrderedListNode);
      }
    } else if (child.type === 'code') {
      content.push({
        type: 'codeBlock',
        content: [{ type: 'text', text: child.value }],
        ...(child.lang ? { attrs: { language: child.lang } } : {}),
      });
    } else {
      const transformed = transformBlock(child as import('mdast').BlockContent);
      if (transformed) {
        if (transformed.type === 'paragraph')
          content.push(transformed as ParagraphNode);
      }
    }
  }
  if (content.length === 0) content.push({ type: 'paragraph', content: [] });
  return { type: 'listItem', content };
}

function transformTaskList(node: List): TaskListNode {
  const listId = generateId();
  const items: TaskItemNode[] = node.children.map((listItem) => {
    const state: 'TODO' | 'DONE' = listItem.checked === true ? 'DONE' : 'TODO';
    const inlineContent = listItem.children
      .filter((c) => c.type === 'paragraph')
      .flatMap((c) =>
        phrasingToInlineNodes((c as import('mdast').Paragraph).children),
      );
    const taskItem: TaskItemNode = {
      type: 'taskItem',
      attrs: { localId: generateId(), state },
    };
    if (inlineContent.length > 0) taskItem.content = inlineContent;
    return taskItem;
  });
  return { type: 'taskList', attrs: { localId: listId }, content: items };
}
