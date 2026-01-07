import { describe, it, expect } from 'vitest';
import {
  CODE_SECTIONS,
  REPORT_SECTIONS,
  CODE_SECTION_MAP,
  REPORT_SECTION_MAP,
  API_CONFIG,
  STORAGE_KEYS,
  VALID_CODE_EXTENSIONS,
  DEFAULT_TEMPLATES,
} from './constants';

describe('CODE_SECTIONS', () => {
  it('should have all required properties', () => {
    CODE_SECTIONS.forEach((section) => {
      expect(section).toHaveProperty('id');
      expect(section).toHaveProperty('label');
      expect(section).toHaveProperty('description');
      expect(typeof section.id).toBe('string');
      expect(typeof section.label).toBe('string');
      expect(typeof section.description).toBe('string');
    });
  });

  it('should have unique ids', () => {
    const ids = CODE_SECTIONS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should include common code documentation sections', () => {
    const ids = CODE_SECTIONS.map((s) => s.id);
    expect(ids).toContain('code_overview');
    expect(ids).toContain('api_endpoints');
    expect(ids).toContain('function_reference');
    expect(ids).toContain('setup_guide');
  });
});

describe('REPORT_SECTIONS', () => {
  it('should have all required properties', () => {
    REPORT_SECTIONS.forEach((section) => {
      expect(section).toHaveProperty('id');
      expect(section).toHaveProperty('label');
      expect(section).toHaveProperty('description');
    });
  });

  it('should have unique ids', () => {
    const ids = REPORT_SECTIONS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should include academic report sections', () => {
    const ids = REPORT_SECTIONS.map((s) => s.id);
    expect(ids).toContain('overview');
    expect(ids).toContain('methodology');
    expect(ids).toContain('literature_survey');
    expect(ids).toContain('conclusion');
  });
});

describe('Section Maps', () => {
  it('CODE_SECTION_MAP should contain all sections', () => {
    CODE_SECTIONS.forEach((section) => {
      expect(CODE_SECTION_MAP[section.id]).toEqual(section);
    });
  });

  it('REPORT_SECTION_MAP should contain all sections', () => {
    REPORT_SECTIONS.forEach((section) => {
      expect(REPORT_SECTION_MAP[section.id]).toEqual(section);
    });
  });
});

describe('API_CONFIG', () => {
  it('should have required configuration', () => {
    expect(API_CONFIG.BASE_URL).toBeDefined();
    expect(API_CONFIG.GENERATE_ENDPOINT).toBe('/generate');
    expect(API_CONFIG.REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
    expect(API_CONFIG.MAX_ZIP_SIZE_MB).toBeGreaterThan(0);
  });

  it('should have reasonable timeout', () => {
    expect(API_CONFIG.REQUEST_TIMEOUT_MS).toBeGreaterThanOrEqual(60000);
    expect(API_CONFIG.REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(600000);
  });
});

describe('STORAGE_KEYS', () => {
  it('should have all required storage keys', () => {
    expect(STORAGE_KEYS.DOCUMENTATION_RESULT).toBeDefined();
    expect(STORAGE_KEYS.CONFETTI_SHOWN).toBeDefined();
    expect(STORAGE_KEYS.HISTORY).toBeDefined();
    expect(STORAGE_KEYS.TEMPLATES).toBeDefined();
    expect(STORAGE_KEYS.THEME).toBeDefined();
  });
});

describe('VALID_CODE_EXTENSIONS', () => {
  it('should include common programming languages', () => {
    expect(VALID_CODE_EXTENSIONS).toContain('.js');
    expect(VALID_CODE_EXTENSIONS).toContain('.ts');
    expect(VALID_CODE_EXTENSIONS).toContain('.py');
    expect(VALID_CODE_EXTENSIONS).toContain('.java');
    expect(VALID_CODE_EXTENSIONS).toContain('.go');
    expect(VALID_CODE_EXTENSIONS).toContain('.rs');
  });

  it('should include web technologies', () => {
    expect(VALID_CODE_EXTENSIONS).toContain('.html');
    expect(VALID_CODE_EXTENSIONS).toContain('.css');
    expect(VALID_CODE_EXTENSIONS).toContain('.jsx');
    expect(VALID_CODE_EXTENSIONS).toContain('.tsx');
    expect(VALID_CODE_EXTENSIONS).toContain('.vue');
  });

  it('should include config files', () => {
    expect(VALID_CODE_EXTENSIONS).toContain('.json');
    expect(VALID_CODE_EXTENSIONS).toContain('.yaml');
    expect(VALID_CODE_EXTENSIONS).toContain('.toml');
  });
});

describe('DEFAULT_TEMPLATES', () => {
  it('should have multiple templates', () => {
    expect(DEFAULT_TEMPLATES.length).toBeGreaterThan(0);
  });

  it('should have required template properties', () => {
    DEFAULT_TEMPLATES.forEach((template) => {
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('codeSections');
      expect(template).toHaveProperty('reportSections');
      expect(Array.isArray(template.codeSections)).toBe(true);
      expect(Array.isArray(template.reportSections)).toBe(true);
    });
  });

  it('should have unique template ids', () => {
    const ids = DEFAULT_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
