import type {
  BlockContent,
  Blockquote,
  Code,
  Heading,
  Paragraph,
  ThematicBreak,
} from 'mdast';
import type {
  AdfTopLevelBlockNode,
  BlockquoteNode,
  CodeBlockNode,
  HeadingNode,
  PanelNode,
  PanelType,
  ParagraphNode,
  RuleNode,
} from '../../types/index.js';
import { normalizeLanguage } from '../../utils/language.js';
import { phrasingToInlineNodes } from './marks.js';

export function transformHeading(node: Heading): HeadingNode {
  return {
    type: 'heading',
    attrs: { level: node.depth as 1 | 2 | 3 | 4 | 5 | 6 },
    content: phrasingToInlineNodes(node.children),
  };
}

export function transformParagraph(node: Paragraph): ParagraphNode {
  const content = phrasingToInlineNodes(node.children);
  return { type: 'paragraph', content };
}

export function transformCode(node: Code): CodeBlockNode {
  const result: CodeBlockNode = { type: 'codeBlock' };
  const lang = normalizeLanguage(node.lang);
  if (lang) result.attrs = { language: lang };
  if (node.value) result.content = [{ type: 'text', text: node.value }];
  return result;
}

export function transformThematicBreak(_node: ThematicBreak): RuleNode {
  return { type: 'rule' };
}

const ALERT_PATTERN = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

const ALERT_TO_PANEL: Record<string, PanelType> = {
  NOTE: 'note',
  TIP: 'info',
  IMPORTANT: 'warning',
  WARNING: 'warning',
  CAUTION: 'error',
};

function buildPanelContent(
  firstChild: Paragraph,
  restChildren: BlockContent[],
  transformChildren: (nodes: BlockContent[]) => AdfTopLevelBlockNode[],
): AdfTopLevelBlockNode[] {
  const firstText = firstChild.children[0] as { type: 'text'; value: string };
  const remainingText = firstText.value.replace(ALERT_PATTERN, '').trim();
  const remainingInlines = firstChild.children.slice(1);

  const contentNodes: AdfTopLevelBlockNode[] = [];

  if (remainingText || remainingInlines.length > 0) {
    const paragraph: Paragraph = {
      type: 'paragraph',
      children: [
        ...(remainingText ? [{ type: 'text' as const, value: remainingText }] : []),
        ...remainingInlines,
      ],
    };
    if (paragraph.children.length > 0) {
      contentNodes.push(transformParagraph(paragraph));
    }
  }

  contentNodes.push(
    ...(transformChildren(restChildren) as Array<PanelNode['content'][number]>),
  );

  if (contentNodes.length === 0) {
    contentNodes.push({ type: 'paragraph', content: [] });
  }

  return contentNodes;
}

function tryTransformAlert(
  node: Blockquote,
  transformChildren: (nodes: BlockContent[]) => AdfTopLevelBlockNode[],
): PanelNode | null {
  const firstChild = node.children[0];
  if (firstChild?.type !== 'paragraph') return null;

  const firstText = firstChild.children[0];
  if (firstText?.type !== 'text') return null;

  const match = ALERT_PATTERN.exec(firstText.value);
  if (!match) return null;

  const alertType = (match[1] ?? 'NOTE').toUpperCase();
  const panelType: PanelType = ALERT_TO_PANEL[alertType] ?? 'info';
  const restChildren = node.children.slice(1) as BlockContent[];
  const content = buildPanelContent(firstChild, restChildren, transformChildren);

  return { type: 'panel', attrs: { panelType }, content: content as PanelNode['content'] };
}

export function transformBlockquote(
  node: Blockquote,
  transformChildren: (nodes: BlockContent[]) => AdfTopLevelBlockNode[],
): BlockquoteNode | PanelNode {
  const panel = tryTransformAlert(node, transformChildren);
  if (panel) return panel;

  const content = transformChildren(
    node.children as BlockContent[],
  ) as BlockquoteNode['content'];
  return {
    type: 'blockquote',
    content: content.length > 0 ? content : [{ type: 'paragraph', content: [] }],
  };
}
