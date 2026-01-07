import { describe, it, expect } from 'vitest';
import { cleanGeneratedText, sanitizeMermaidChart } from './documentation';

describe('cleanGeneratedText', () => {
  it('should remove ```markdown tags from the beginning', () => {
    const input = '```markdown\n# Hello World\n\nThis is content';
    const result = cleanGeneratedText(input);
    expect(result).not.toContain('```markdown');
    expect(result).toContain('# Hello World');
  });

  it('should remove AI preamble phrases', () => {
    const input = 'Of course, I\'d be happy to help!\n\n# Documentation\n\nContent here';
    const result = cleanGeneratedText(input);
    expect(result).not.toContain('Of course');
    expect(result).toContain('# Documentation');
  });

  it('should remove "Certainly" phrases', () => {
    const input = 'Certainly! Here is the documentation.\n\n# Title\n\nBody text';
    const result = cleanGeneratedText(input);
    expect(result).not.toContain('Certainly');
    expect(result).toContain('# Title');
  });

  it('should remove "as a software documentation expert" phrases', () => {
    const input = 'As a software documentation expert, I will help you.\n\n# Real Content';
    const result = cleanGeneratedText(input);
    expect(result).not.toContain('software documentation expert');
    expect(result).toContain('# Real Content');
  });

  it('should handle empty input', () => {
    expect(cleanGeneratedText('')).toBe('');
  });

  it('should handle null/undefined gracefully', () => {
    expect(cleanGeneratedText(null as unknown as string)).toBeFalsy();
    expect(cleanGeneratedText(undefined as unknown as string)).toBeFalsy();
  });

  it('should preserve normal content', () => {
    const input = '# Documentation\n\nThis is a test.\n\n## Section 2\n\nMore content.';
    const result = cleanGeneratedText(input);
    expect(result).toContain('# Documentation');
    expect(result).toContain('## Section 2');
    expect(result).toContain('More content.');
  });
});

describe('sanitizeMermaidChart', () => {
  it('should handle empty input', () => {
    expect(sanitizeMermaidChart('')).toBe('');
  });

  it('should preserve valid mermaid syntax', () => {
    const input = 'graph TD\n  A[Start] --> B[End]';
    const result = sanitizeMermaidChart(input);
    expect(result).toContain('graph TD');
    expect(result).toContain('A[');
    expect(result).toContain('B[');
  });

  it('should sanitize special characters in labels', () => {
    const input = 'graph TD\n  A[Test<script>] --> B[Normal]';
    const result = sanitizeMermaidChart(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
  });

  it('should handle double bracket syntax', () => {
    const input = 'graph TD\n  A[[Subroutine]] --> B[End]';
    const result = sanitizeMermaidChart(input);
    expect(result).toContain('[[');
    expect(result).toContain(']]');
  });
});
