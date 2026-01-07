// arXiv API integration for automatic literature search

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  updated: string;
  pdfUrl: string;
  categories: string[];
}

export interface ArxivSearchResult {
  papers: ArxivPaper[];
  query: string;
  totalResults: number;
}

/**
 * Extracts keywords from a GitHub URL or project description for arXiv search
 */
export function extractSearchKeywords(
  githubUrl?: string,
  projectDescription?: string
): string[] {
  const keywords: string[] = [];
  
  // Extract repo name from GitHub URL
  if (githubUrl) {
    const match = githubUrl.match(/github\.com\/[\w-]+\/([\w-]+)/i);
    if (match) {
      // Split repo name by hyphens and underscores
      const repoName = match[1];
      const repoKeywords = repoName
        .split(/[-_]+/)
        .filter(word => word.length > 2)
        .map(word => word.toLowerCase());
      keywords.push(...repoKeywords);
    }
  }
  
  // Extract keywords from project description
  if (projectDescription) {
    // Common technical terms to look for
    const techTerms = [
      'machine learning', 'deep learning', 'neural network', 'transformer',
      'natural language processing', 'nlp', 'computer vision', 'cv',
      'reinforcement learning', 'generative', 'gpt', 'bert', 'llm',
      'api', 'microservices', 'kubernetes', 'docker', 'cloud',
      'react', 'vue', 'angular', 'node', 'python', 'rust', 'go',
      'database', 'sql', 'nosql', 'mongodb', 'postgresql',
      'authentication', 'security', 'encryption', 'blockchain',
      'real-time', 'streaming', 'websocket', 'graphql', 'rest',
      'mobile', 'ios', 'android', 'flutter', 'react native',
      'testing', 'ci/cd', 'devops', 'automation',
      'data science', 'analytics', 'visualization', 'dashboard',
      'image processing', 'audio', 'video', 'multimedia',
      'distributed systems', 'scalability', 'performance',
      'algorithm', 'optimization', 'parallel computing'
    ];
    
    const lowerDesc = projectDescription.toLowerCase();
    
    for (const term of techTerms) {
      if (lowerDesc.includes(term)) {
        keywords.push(term);
      }
    }
    
    // Also extract significant words (nouns, technical terms)
    const words = projectDescription
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4)
      .map(word => word.toLowerCase())
      .filter(word => !['about', 'which', 'their', 'there', 'would', 'could', 'should', 'these', 'those'].includes(word));
    
    // Add unique words not already in keywords
    for (const word of words.slice(0, 10)) {
      if (!keywords.includes(word)) {
        keywords.push(word);
      }
    }
  }
  
  // Remove duplicates and limit
  return [...new Set(keywords)].slice(0, 8);
}

/**
 * Builds an arXiv API query from keywords
 */
export function buildArxivQuery(keywords: string[]): string {
  if (keywords.length === 0) {
    return 'cat:cs.SE'; // Default to Software Engineering
  }
  
  // Build query with OR operator for broader results
  const searchTerms = keywords.map(kw => {
    // Multi-word terms need to be quoted
    if (kw.includes(' ')) {
      return `all:"${kw}"`;
    }
    return `all:${kw}`;
  });
  
  // Also search in Computer Science categories
  const csCategories = 'cat:cs.*';
  
  return `(${searchTerms.join(' OR ')}) AND ${csCategories}`;
}

/**
 * Parses arXiv Atom XML response into structured data
 */
function parseArxivResponse(xmlText: string): ArxivPaper[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  
  const entries = doc.querySelectorAll('entry');
  const papers: ArxivPaper[] = [];
  
  entries.forEach((entry) => {
    const id = entry.querySelector('id')?.textContent || '';
    const title = entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const summary = entry.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const published = entry.querySelector('published')?.textContent || '';
    const updated = entry.querySelector('updated')?.textContent || '';
    
    // Get authors
    const authorElements = entry.querySelectorAll('author name');
    const authors: string[] = [];
    authorElements.forEach((author) => {
      if (author.textContent) {
        authors.push(author.textContent);
      }
    });
    
    // Get PDF link
    const links = entry.querySelectorAll('link');
    let pdfUrl = '';
    links.forEach((link) => {
      if (link.getAttribute('title') === 'pdf') {
        pdfUrl = link.getAttribute('href') || '';
      }
    });
    
    // Get categories
    const categoryElements = entry.querySelectorAll('category');
    const categories: string[] = [];
    categoryElements.forEach((cat) => {
      const term = cat.getAttribute('term');
      if (term) {
        categories.push(term);
      }
    });
    
    // Extract arXiv ID from the full URL
    const arxivId = id.replace('http://arxiv.org/abs/', '').replace('https://arxiv.org/abs/', '');
    
    papers.push({
      id: arxivId,
      title,
      authors,
      summary,
      published,
      updated,
      pdfUrl: pdfUrl || `https://arxiv.org/pdf/${arxivId}.pdf`,
      categories,
    });
  });
  
  return papers;
}

/**
 * Searches arXiv API for relevant papers
 * @param keywords - Search keywords
 * @param maxResults - Maximum number of results (default 5)
 * @returns Promise with search results
 */
export async function searchArxiv(
  keywords: string[],
  maxResults: number = 5
): Promise<ArxivSearchResult> {
  const query = buildArxivQuery(keywords);
  
  // arXiv API endpoint
  const baseUrl = 'https://export.arxiv.org/api/query';
  const params = new URLSearchParams({
    search_query: query,
    start: '0',
    max_results: String(maxResults),
    sortBy: 'relevance',
    sortOrder: 'descending',
  });
  
  const url = `${baseUrl}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`arXiv API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const papers = parseArxivResponse(xmlText);
    
    // Get total results from response
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    const totalResultsElement = doc.querySelector('opensearch\\:totalResults, totalResults');
    const totalResults = parseInt(totalResultsElement?.textContent || '0', 10);
    
    return {
      papers,
      query,
      totalResults,
    };
  } catch (error) {
    console.error('arXiv search failed:', error);
    // Return empty results on error rather than throwing
    return {
      papers: [],
      query,
      totalResults: 0,
    };
  }
}

/**
 * Formats arXiv papers into a string suitable for the documentation prompt
 */
export function formatPapersForPrompt(papers: ArxivPaper[]): string {
  if (papers.length === 0) {
    return 'No relevant papers found. Please provide a general literature survey based on the project topic.';
  }
  
  const formatted = papers.map((paper, index) => {
    const authorList = paper.authors.slice(0, 3).join(', ');
    const hasMoreAuthors = paper.authors.length > 3 ? ' et al.' : '';
    const year = new Date(paper.published).getFullYear();
    
    return `${index + 1}. **${paper.title}**
   - Authors: ${authorList}${hasMoreAuthors}
   - arXiv: ${paper.id} (${year})
   - Summary: ${paper.summary.slice(0, 300)}${paper.summary.length > 300 ? '...' : ''}`;
  });
  
  return `The following relevant papers were found on arXiv. Use these as references in the literature survey section:\n\n${formatted.join('\n\n')}`;
}

/**
 * Main function to search arXiv and format results for documentation
 */
export async function getArxivReferencesForProject(
  githubUrl?: string,
  projectDescription?: string,
  maxResults: number = 5
): Promise<{ papers: ArxivPaper[]; formattedText: string; keywords: string[] }> {
  const keywords = extractSearchKeywords(githubUrl, projectDescription);
  
  if (keywords.length === 0) {
    return {
      papers: [],
      formattedText: 'Unable to extract keywords for literature search. Please provide a project description.',
      keywords: [],
    };
  }
  
  const result = await searchArxiv(keywords, maxResults);
  const formattedText = formatPapersForPrompt(result.papers);
  
  return {
    papers: result.papers,
    formattedText,
    keywords,
  };
}
