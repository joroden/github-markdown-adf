export interface AdfToMdOptions {
  /**
   * Whether to render ADF mention nodes as tagged mentions. When `true`
   * (default), a mention renders as the display text if available, otherwise
   * as `@{id}`. When `false`, it renders as plain text: the display text if
   * available, otherwise just the bare `{id}` without the `@` prefix.
   * @default true
   */
  mentions?: boolean;
}
