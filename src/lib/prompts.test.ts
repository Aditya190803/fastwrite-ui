import { describe, it, expect } from 'vitest';
import { generateDocumentationPrompt } from './prompts';

describe('generateDocumentationPrompt', () => {
  it('should generate prompt for github source', () => {
    const result = generateDocumentationPrompt({
      sourceType: 'github',
      githubUrl: 'https://github.com/user/repo',
      selectedCodeSections: ['code_overview'],
      selectedReportSections: [],
      literatureSource: 'auto',
    });

    expect(result).toContain('Source code from the repository');
    expect(result).toContain('OVERVIEW: High-level summary');
    expect(result).toContain('High-level summary');
  });

  it('should generate prompt for zip source', () => {
    const result = generateDocumentationPrompt({
      sourceType: 'zip',
      selectedCodeSections: [],
      selectedReportSections: ['overview'],
      literatureSource: 'auto',
    });

    expect(result).toContain('Source code from the uploaded ZIP file');
    expect(result).toContain('OVERVIEW: Executive summary');
  });

  it('should include manual references when provided', () => {
    const result = generateDocumentationPrompt({
      sourceType: 'github',
      selectedCodeSections: [],
      selectedReportSections: ['literature_survey'],
      literatureSource: 'manual',
      manualReferences: 'arXiv:2303.08774',
    });

    expect(result).toContain('arXiv:2303.08774');
    expect(result).toContain('manually provided references');
  });

  it('should include auto literature search when selected', () => {
    const result = generateDocumentationPrompt({
      sourceType: 'github',
      selectedCodeSections: [],
      selectedReportSections: ['literature_survey'],
      literatureSource: 'auto',
    });

    // When no arxivReferences provided, falls back to generic search instruction
    expect(result).toContain('Search for and include relevant academic papers');
  });

  it('should include arXiv references when provided', () => {
    const result = generateDocumentationPrompt({
      sourceType: 'github',
      selectedCodeSections: [],
      selectedReportSections: ['literature_survey'],
      literatureSource: 'auto',
      arxivReferences: 'The following relevant papers were found on arXiv:\n1. Test Paper',
    });

    expect(result).toContain('The following relevant papers were found on arXiv');
    expect(result).toContain('Test Paper');
  });

  it('should include project description when provided', () => {
    const result = generateDocumentationPrompt({
      sourceType: 'github',
      projectDescription: 'A test project',
      selectedCodeSections: [],
      selectedReportSections: [],
      literatureSource: 'auto',
    });

    expect(result).toContain('A test project');
  });

  it('should include multiple sections correctly', () => {
    const result = generateDocumentationPrompt({
      sourceType: 'github',
      selectedCodeSections: ['code_overview', 'api_endpoints', 'function_reference'],
      selectedReportSections: ['overview', 'methodology'],
      literatureSource: 'auto',
    });

    expect(result).toContain('OVERVIEW: High-level summary');
    expect(result).toContain('API: Documentation');
    expect(result).toContain('FUNCTIONS: Detailed documentation');
    expect(result).toContain('OVERVIEW: Executive summary');
    expect(result).toContain('METHODOLOGY: Development approach');
  });

  it('should always include visualization instructions', () => {
    const result = generateDocumentationPrompt({
      sourceType: 'github',
      selectedCodeSections: [],
      selectedReportSections: [],
      literatureSource: 'auto',
    });

    expect(result).toContain('Mermaid.js');
    expect(result).toContain('visual elements');
  });
});
