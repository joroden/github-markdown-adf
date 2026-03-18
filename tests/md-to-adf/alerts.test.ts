import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { PanelNode, ParagraphNode } from '../../src/types/index.js';

describe('GitHub alerts → panels', () => {
  describe('alert type mapping', () => {
    it('[!NOTE] maps to panelType note', () => {
      const doc = mdToAdf('> [!NOTE]\n> message');
      const panel = doc.content[0] as PanelNode;
      expect(panel.type).toBe('panel');
      expect(panel.attrs.panelType).toBe('note');
    });

    it('[!TIP] maps to panelType info', () => {
      const doc = mdToAdf('> [!TIP]\n> message');
      const panel = doc.content[0] as PanelNode;
      expect(panel.attrs.panelType).toBe('info');
    });

    it('[!IMPORTANT] maps to panelType warning', () => {
      const doc = mdToAdf('> [!IMPORTANT]\n> message');
      const panel = doc.content[0] as PanelNode;
      expect(panel.attrs.panelType).toBe('warning');
    });

    it('[!WARNING] maps to panelType warning', () => {
      const doc = mdToAdf('> [!WARNING]\n> message');
      const panel = doc.content[0] as PanelNode;
      expect(panel.attrs.panelType).toBe('warning');
    });

    it('[!CAUTION] maps to panelType error', () => {
      const doc = mdToAdf('> [!CAUTION]\n> message');
      const panel = doc.content[0] as PanelNode;
      expect(panel.attrs.panelType).toBe('error');
    });
  });

  describe('case insensitivity', () => {
    it('[!note] (lowercase) maps to panelType note', () => {
      const doc = mdToAdf('> [!note]\n> message');
      const panel = doc.content[0] as PanelNode;
      expect(panel.type).toBe('panel');
      expect(panel.attrs.panelType).toBe('note');
    });

    it('[!Note] (mixed case) maps to panelType note', () => {
      const doc = mdToAdf('> [!Note]\n> message');
      const panel = doc.content[0] as PanelNode;
      expect(panel.attrs.panelType).toBe('note');
    });
  });

  describe('alert content', () => {
    it('alert with content on following line has paragraph with that text', () => {
      const doc = mdToAdf('> [!NOTE]\n> the message');
      const panel = doc.content[0] as PanelNode;
      expect(panel.content[0]!.type).toBe('paragraph');
      const para = panel.content[0] as ParagraphNode;
      expect(para.content).toContainEqual(
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('the message'),
        }),
      );
    });

    it('alert with content on same line after marker', () => {
      const doc = mdToAdf('> [!NOTE] inline content');
      const panel = doc.content[0] as PanelNode;
      expect(panel.type).toBe('panel');
      expect(panel.attrs.panelType).toBe('note');
      const para = panel.content[0] as ParagraphNode;
      expect(para.content[0]).toEqual({ type: 'text', text: 'inline content' });
    });

    it('alert with no content has an empty paragraph', () => {
      const doc = mdToAdf('> [!NOTE]');
      const panel = doc.content[0] as PanelNode;
      expect(panel.type).toBe('panel');
      expect(panel.content[0]).toEqual({ type: 'paragraph', content: [] });
    });

    it('alert is not converted to blockquote', () => {
      const doc = mdToAdf('> [!NOTE]\n> message');
      expect(doc.content[0]!.type).not.toBe('blockquote');
    });
  });
});
