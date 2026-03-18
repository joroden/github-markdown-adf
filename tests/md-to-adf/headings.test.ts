import { describe, it, expect } from 'vitest';
import { mdToAdf } from '../../src/md-to-adf/index.js';
import type { HeadingNode } from '../../src/types/index.js';

describe('headings', () => {
  it('converts H1', () => {
    const doc = mdToAdf('# Hello');
    expect(doc.content[0]).toEqual({
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Hello' }],
    });
  });

  it('converts H2', () => {
    const doc = mdToAdf('## Hello');
    expect(doc.content[0]).toEqual({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Hello' }],
    });
  });

  it('converts H3', () => {
    const doc = mdToAdf('### Hello');
    expect(doc.content[0]).toEqual({
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Hello' }],
    });
  });

  it('converts H4', () => {
    const doc = mdToAdf('#### Hello');
    expect(doc.content[0]).toEqual({
      type: 'heading',
      attrs: { level: 4 },
      content: [{ type: 'text', text: 'Hello' }],
    });
  });

  it('converts H5', () => {
    const doc = mdToAdf('##### Hello');
    expect(doc.content[0]).toEqual({
      type: 'heading',
      attrs: { level: 5 },
      content: [{ type: 'text', text: 'Hello' }],
    });
  });

  it('converts H6', () => {
    const doc = mdToAdf('###### Hello');
    expect(doc.content[0]).toEqual({
      type: 'heading',
      attrs: { level: 6 },
      content: [{ type: 'text', text: 'Hello' }],
    });
  });

  it('converts heading with bold text inside', () => {
    const doc = mdToAdf('# **Bold Title**');
    expect(doc.content[0]).toEqual({
      type: 'heading',
      attrs: { level: 1 },
      content: [
        { type: 'text', text: 'Bold Title', marks: [{ type: 'strong' }] },
      ],
    });
  });

  it('converts heading with mixed inline content', () => {
    const doc = mdToAdf('## Plain **bold** plain');
    const heading = doc.content[0] as HeadingNode;
    expect(heading.type).toBe('heading');
    expect(heading.attrs.level).toBe(2);
    expect(heading.content).toEqual([
      { type: 'text', text: 'Plain ' },
      { type: 'text', text: 'bold', marks: [{ type: 'strong' }] },
      { type: 'text', text: ' plain' },
    ]);
  });

  it('returns correct doc structure', () => {
    const doc = mdToAdf('# Title');
    expect(doc).toEqual(expect.objectContaining({ version: 1, type: 'doc' }));
  });
});
