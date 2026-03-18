export type AdfMarkType =
  | 'strong'
  | 'em'
  | 'strike'
  | 'code'
  | 'link'
  | 'underline'
  | 'subsup'
  | 'textColor'
  | 'backgroundColor'
  | 'alignment'
  | 'indentation'
  | 'breakout'
  | 'border'
  | 'annotation'
  | 'dataConsumer'
  | 'fragment';

export interface StrongMark {
  type: 'strong';
}
export interface EmMark {
  type: 'em';
}
export interface StrikeMark {
  type: 'strike';
}
export interface CodeMark {
  type: 'code';
}
export interface UnderlineMark {
  type: 'underline';
}

export interface LinkMark {
  type: 'link';
  attrs: {
    href: string;
    title?: string;
    id?: string;
    collection?: string;
    occurrenceKey?: string;
  };
}

export interface SubsupMark {
  type: 'subsup';
  attrs: { type: 'sub' | 'sup' };
}

export interface TextColorMark {
  type: 'textColor';
  attrs: { color: string };
}

export interface BackgroundColorMark {
  type: 'backgroundColor';
  attrs: { color: string };
}

export interface AlignmentMark {
  type: 'alignment';
  attrs: { align: 'center' | 'end' | 'start' | 'justify' };
}

export interface IndentationMark {
  type: 'indentation';
  attrs: { level: number };
}

export interface BreakoutMark {
  type: 'breakout';
  attrs: { mode: 'wide' | 'full-width' };
}

export interface BorderMark {
  type: 'border';
  attrs: { color: string; size: number };
}

export interface AnnotationMark {
  type: 'annotation';
  attrs: { id: string; annotationType: string };
}

export interface DataConsumerMark {
  type: 'dataConsumer';
  attrs: { sources: string[] };
}

export interface FragmentMark {
  type: 'fragment';
  attrs: { localId: string; name?: string };
}

export type AdfMark =
  | StrongMark
  | EmMark
  | StrikeMark
  | CodeMark
  | UnderlineMark
  | LinkMark
  | SubsupMark
  | TextColorMark
  | BackgroundColorMark
  | AlignmentMark
  | IndentationMark
  | BreakoutMark
  | BorderMark
  | AnnotationMark
  | DataConsumerMark
  | FragmentMark;

export interface TextNode {
  type: 'text';
  text: string;
  marks?: AdfMark[];
}

export interface HardBreakNode {
  type: 'hardBreak';
  attrs?: { text?: '\n' };
}

export interface MentionNode {
  type: 'mention';
  attrs: {
    id: string;
    text?: string;
    userType?: 'DEFAULT' | 'SPECIAL' | 'APP';
    accessLevel?: 'NONE' | 'SITE' | 'APPLICATION' | 'CONTAINER';
  };
}

export interface EmojiNode {
  type: 'emoji';
  attrs: {
    shortName: string;
    id?: string;
    text?: string;
  };
}

export interface DateNode {
  type: 'date';
  attrs: { timestamp: string };
}

export interface StatusNode {
  type: 'status';
  attrs: {
    text: string;
    color: 'neutral' | 'purple' | 'blue' | 'red' | 'yellow' | 'green';
    localId?: string;
    style?: string;
  };
}

export interface InlineCardNode {
  type: 'inlineCard';
  attrs: { url?: string; data?: Record<string, unknown> };
}

export interface MediaInlineNode {
  type: 'mediaInline';
  attrs: {
    id: string;
    collection: string;
    type?: 'file' | 'link' | 'image';
    alt?: string;
    width?: number;
    height?: number;
    occurrenceKey?: string;
  };
  marks?: AdfMark[];
}

export type AdfInlineNode =
  | TextNode
  | HardBreakNode
  | MentionNode
  | EmojiNode
  | DateNode
  | StatusNode
  | InlineCardNode
  | MediaInlineNode;

export interface ParagraphNode {
  type: 'paragraph';
  content: AdfInlineNode[];
  attrs?: { localId?: string };
}

export interface HeadingNode {
  type: 'heading';
  attrs: { level: 1 | 2 | 3 | 4 | 5 | 6; localId?: string };
  content: AdfInlineNode[];
}

export interface RuleNode {
  type: 'rule';
  attrs?: { localId?: string };
}

export interface CodeBlockNode {
  type: 'codeBlock';
  attrs?: { language?: string; localId?: string; uniqueId?: string };
  content?: TextNode[];
}

export interface MediaNode {
  type: 'media';
  attrs: {
    id: string;
    type: 'file' | 'link' | 'image';
    collection: string;
    alt?: string;
    width?: number;
    height?: number;
    occurrenceKey?: string;
  };
  marks?: AdfMark[];
}

export interface MediaSingleNode {
  type: 'mediaSingle';
  attrs: {
    layout:
      | 'wrap-left'
      | 'center'
      | 'wrap-right'
      | 'wide'
      | 'full-width'
      | 'align-start'
      | 'align-end';
    width?: number;
    widthType?: 'pixel' | 'percentage';
    localId?: string;
  };
  content: [MediaNode];
}

export interface MediaGroupNode {
  type: 'mediaGroup';
  content: MediaNode[];
}

export type AdfTableCellContent =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | OrderedListNode
  | CodeBlockNode
  | BlockquoteNode
  | PanelNode
  | RuleNode
  | NestedExpandNode
  | MediaGroupNode
  | MediaSingleNode;

export interface TableCellNode {
  type: 'tableCell';
  attrs?: {
    colspan?: number;
    rowspan?: number;
    colwidth?: number[];
    background?: string;
    localId?: string;
  };
  content: AdfTableCellContent[];
}

export interface TableHeaderNode {
  type: 'tableHeader';
  attrs?: {
    colspan?: number;
    rowspan?: number;
    colwidth?: number[];
    background?: string;
    localId?: string;
  };
  content: AdfTableCellContent[];
}

export interface TableRowNode {
  type: 'tableRow';
  content: Array<TableHeaderNode | TableCellNode>;
}

export interface TableNode {
  type: 'table';
  attrs?: {
    isNumberColumnEnabled?: boolean;
    layout?: 'center' | 'align-start' | 'wide' | 'full-width' | 'default';
    width?: number;
    displayMode?: 'default' | 'fixed';
    localId?: string;
  };
  content: TableRowNode[];
}

export interface ListItemNode {
  type: 'listItem';
  content: Array<
    | ParagraphNode
    | BulletListNode
    | OrderedListNode
    | CodeBlockNode
    | MediaSingleNode
  >;
  attrs?: { localId?: string };
}

export interface BulletListNode {
  type: 'bulletList';
  content: ListItemNode[];
  attrs?: { localId?: string };
}

export interface OrderedListNode {
  type: 'orderedList';
  content: ListItemNode[];
  attrs?: { order?: number; localId?: string };
}

export interface TaskItemNode {
  type: 'taskItem';
  attrs: { localId: string; state: 'TODO' | 'DONE' };
  content?: AdfInlineNode[];
}

export interface TaskListNode {
  type: 'taskList';
  attrs: { localId: string };
  content: TaskItemNode[];
}

export interface DecisionItemNode {
  type: 'decisionItem';
  attrs: { localId: string; state: 'DECIDED' | 'UNDECIDED' };
  content?: AdfInlineNode[];
}

export interface DecisionListNode {
  type: 'decisionList';
  attrs: { localId: string };
  content: DecisionItemNode[];
}

export interface BlockquoteNode {
  type: 'blockquote';
  content: Array<
    | ParagraphNode
    | BulletListNode
    | OrderedListNode
    | CodeBlockNode
    | MediaGroupNode
    | MediaSingleNode
  >;
  attrs?: { localId?: string };
}

export type PanelType =
  | 'info'
  | 'note'
  | 'warning'
  | 'success'
  | 'error'
  | 'tip'
  | 'custom';

export interface PanelNode {
  type: 'panel';
  attrs: {
    panelType: PanelType;
    panelIcon?: string;
    panelIconId?: string;
    panelIconText?: string;
    panelColor?: string;
    localId?: string;
  };
  content: Array<
    ParagraphNode | HeadingNode | BulletListNode | OrderedListNode
  >;
}

export type ExpandContent =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | OrderedListNode
  | CodeBlockNode
  | BlockquoteNode
  | PanelNode
  | RuleNode
  | TableNode
  | MediaGroupNode
  | MediaSingleNode
  | NestedExpandNode;

export interface ExpandNode {
  type: 'expand';
  attrs: { title?: string; localId?: string };
  content: ExpandContent[];
}

export interface NestedExpandNode {
  type: 'nestedExpand';
  attrs: { title?: string; localId?: string };
  content: Array<
    ParagraphNode | HeadingNode | MediaGroupNode | MediaSingleNode
  >;
}

export interface BlockCardNode {
  type: 'blockCard';
  attrs: { url?: string; data?: Record<string, unknown> };
}

export interface EmbedCardNode {
  type: 'embedCard';
  attrs: {
    url: string;
    layout:
      | 'wide'
      | 'full-width'
      | 'center'
      | 'wrap-left'
      | 'wrap-right'
      | 'align-start'
      | 'align-end';
  };
}

export interface LayoutColumnNode {
  type: 'layoutColumn';
  attrs: { width: number };
  content: AdfTopLevelBlockNode[];
}

export interface LayoutSectionNode {
  type: 'layoutSection';
  content: LayoutColumnNode[];
  attrs?: { localId?: string };
}

export interface CaptionNode {
  type: 'caption';
  content: AdfInlineNode[];
}

export interface ExtensionNode {
  type: 'extension';
  attrs: {
    extensionType: string;
    extensionKey: string;
    parameters?: Record<string, unknown>;
    text?: string;
    localId?: string;
  };
}

export interface BodiedExtensionNode {
  type: 'bodiedExtension';
  attrs: {
    extensionType: string;
    extensionKey: string;
    parameters?: Record<string, unknown>;
    text?: string;
    localId?: string;
  };
  content: AdfTopLevelBlockNode[];
}

export interface PlaceholderNode {
  type: 'placeholder';
  attrs: { text: string };
}

export type AdfTopLevelBlockNode =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | OrderedListNode
  | TaskListNode
  | DecisionListNode
  | BlockquoteNode
  | CodeBlockNode
  | RuleNode
  | TableNode
  | PanelNode
  | ExpandNode
  | MediaSingleNode
  | MediaGroupNode
  | BlockCardNode
  | EmbedCardNode
  | LayoutSectionNode
  | ExtensionNode
  | BodiedExtensionNode;

export type AdfNode =
  | AdfTopLevelBlockNode
  | AdfInlineNode
  | ListItemNode
  | TaskItemNode
  | DecisionItemNode
  | TableRowNode
  | TableCellNode
  | TableHeaderNode
  | LayoutColumnNode
  | MediaNode
  | NestedExpandNode
  | CaptionNode
  | PlaceholderNode;

export interface AdfDoc {
  version: 1;
  type: 'doc';
  content: AdfTopLevelBlockNode[];
}
