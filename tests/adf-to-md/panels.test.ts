import { describe, it, expect } from 'vitest';
import { adfToMd } from '../../src/adf-to-md/index.js';
import type { AdfDoc } from '../../src/types/index.js';

function panelDoc(
  panelType: import('../../src/types/index.js').PanelType,
  text: string,
): AdfDoc {
  return {
    version: 1,
    type: 'doc',
    content: [
      {
        type: 'panel',
        attrs: { panelType },
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      },
    ],
  };
}

describe('panels', () => {
  it('panel type info maps to TIP alert', () => {
    expect(adfToMd(panelDoc('info', 'Info message'))).toBe(
      '> [!TIP]\n> Info message',
    );
  });

  it('panel type note maps to NOTE alert', () => {
    expect(adfToMd(panelDoc('note', 'Note message'))).toBe(
      '> [!NOTE]\n> Note message',
    );
  });

  it('panel type warning maps to WARNING alert', () => {
    expect(adfToMd(panelDoc('warning', 'Warning message'))).toBe(
      '> [!WARNING]\n> Warning message',
    );
  });

  it('panel type success maps to NOTE alert', () => {
    expect(adfToMd(panelDoc('success', 'Success message'))).toBe(
      '> [!NOTE]\n> Success message',
    );
  });

  it('panel type error maps to CAUTION alert', () => {
    expect(adfToMd(panelDoc('error', 'Error message'))).toBe(
      '> [!CAUTION]\n> Error message',
    );
  });

  it('panel type tip maps to TIP alert', () => {
    expect(adfToMd(panelDoc('tip', 'Tip message'))).toBe(
      '> [!TIP]\n> Tip message',
    );
  });

  it('panel with multi-paragraph content prefixes all lines with >', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'panel',
          attrs: { panelType: 'info' },
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
          ],
        },
      ],
    };
    expect(adfToMd(doc)).toBe('> [!TIP]\n> First\n>\n> Second');
  });

  it('all panel content lines are prefixed with >', () => {
    const doc: AdfDoc = {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'panel',
          attrs: { panelType: 'note' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Line content' }],
            },
          ],
        },
      ],
    };
    const result = adfToMd(doc);
    for (const line of result.split('\n')) {
      expect(line).toMatch(/^>/);
    }
  });
});
