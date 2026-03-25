import type { MentionNode } from './adf.js';

export interface MdToAdfOptions {
  /**
   * Controls how plain `@username` mentions in Markdown are converted.
   *
   * When omitted or `false` (default), mention-like text stays as plain text.
   * When `true`, `@alice` becomes a mention node with
   * `{ id: 'alice', text: '@alice' }`.
   * When set to a function, that transformer receives the username without the
   * `@` prefix and should return mention attrs. Returning `null` or
   * `undefined` leaves the original markdown text unchanged.
   * @default false
   */
  mentions?:
    | boolean
    | ((username: string) => MentionNode['attrs'] | null | undefined);
}

export interface AdfToMdOptions {
  /**
   * Controls how ADF mention nodes are rendered.
   *
   * When `true` (default), a mention renders as the display text if available,
   * otherwise as `@{id}`. When `false`, it renders as plain text: the display
   * text if available, otherwise just the bare `{id}` without the `@` prefix.
   * When set to a function, that transformer receives the mention attributes
   * and its return value is used as-is.
   * @default true
   */
  mentions?: boolean | ((attrs: MentionNode['attrs']) => string);
}
