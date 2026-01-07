import { describe, it, expect } from 'vitest';
import {
  extractSearchKeywords,
  buildArxivQuery,
  formatPapersForPrompt,
  ArxivPaper,
} from './arxiv';

describe('arxiv utilities', () => {
  describe('extractSearchKeywords', () => {
    it('should extract keywords from GitHub URL', () => {
      const keywords = extractSearchKeywords('https://github.com/user/react-machine-learning-app');
      expect(keywords).toContain('react');
      expect(keywords).toContain('machine');
      expect(keywords).toContain('learning');
      expect(keywords).toContain('app');
    });

    it('should extract keywords from project description', () => {
      const keywords = extractSearchKeywords(undefined, 'A deep learning framework for natural language processing');
      expect(keywords).toContain('deep learning');
      expect(keywords).toContain('natural language processing');
    });

    it('should combine keywords from both sources', () => {
      const keywords = extractSearchKeywords(
        'https://github.com/user/nlp-toolkit',
        'A machine learning toolkit for NLP tasks'
      );
      expect(keywords).toContain('nlp');
      expect(keywords).toContain('toolkit');
      expect(keywords).toContain('machine learning');
    });

    it('should return empty array when no inputs provided', () => {
      const keywords = extractSearchKeywords();
      expect(keywords).toEqual([]);
    });

    it('should limit keywords to 8', () => {
      const longDescription = 'machine learning deep learning neural network transformer nlp computer vision reinforcement learning generative api microservices kubernetes docker';
      const keywords = extractSearchKeywords(undefined, longDescription);
      expect(keywords.length).toBeLessThanOrEqual(8);
    });
  });

  describe('buildArxivQuery', () => {
    it('should build query from keywords', () => {
      const query = buildArxivQuery(['machine learning', 'nlp']);
      expect(query).toContain('all:"machine learning"');
      expect(query).toContain('all:nlp');
      expect(query).toContain('OR');
      expect(query).toContain('cat:cs.*');
    });

    it('should return default CS category for empty keywords', () => {
      const query = buildArxivQuery([]);
      expect(query).toBe('cat:cs.SE');
    });
  });

  describe('formatPapersForPrompt', () => {
    it('should format papers correctly', () => {
      const papers: ArxivPaper[] = [
        {
          id: '2303.08774',
          title: 'GPT-4 Technical Report',
          authors: ['OpenAI', 'Author Two', 'Author Three', 'Author Four'],
          summary: 'We report the development of GPT-4, a large-scale, multimodal model.',
          published: '2023-03-15T00:00:00Z',
          updated: '2023-03-15T00:00:00Z',
          pdfUrl: 'https://arxiv.org/pdf/2303.08774.pdf',
          categories: ['cs.CL', 'cs.AI'],
        },
      ];

      const formatted = formatPapersForPrompt(papers);
      expect(formatted).toContain('GPT-4 Technical Report');
      expect(formatted).toContain('OpenAI, Author Two, Author Three et al.');
      expect(formatted).toContain('arXiv: 2303.08774');
      expect(formatted).toContain('2023');
    });

    it('should handle empty papers array', () => {
      const formatted = formatPapersForPrompt([]);
      expect(formatted).toContain('No relevant papers found');
    });

    it('should truncate long summaries', () => {
      const longSummary = 'A'.repeat(500);
      const papers: ArxivPaper[] = [
        {
          id: 'test-id',
          title: 'Test Paper',
          authors: ['Author'],
          summary: longSummary,
          published: '2023-01-01T00:00:00Z',
          updated: '2023-01-01T00:00:00Z',
          pdfUrl: 'https://arxiv.org/pdf/test-id.pdf',
          categories: ['cs.SE'],
        },
      ];

      const formatted = formatPapersForPrompt(papers);
      expect(formatted).toContain('...');
      expect(formatted.length).toBeLessThan(longSummary.length + 200);
    });
  });
});
