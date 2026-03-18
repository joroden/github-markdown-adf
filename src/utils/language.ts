const LANGUAGE_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  zsh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
  rs: 'rust',
  kt: 'kotlin',
  tf: 'hcl',
  dockerfile: 'docker',
};

export function normalizeLanguage(
  lang: string | null | undefined,
): string | undefined {
  if (!lang) return undefined;
  const lower = lang.toLowerCase().trim();
  if (!lower) return undefined;
  return LANGUAGE_ALIASES[lower] ?? lower;
}
