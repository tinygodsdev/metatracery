import {
  ALLOWED_PATHNAMES,
  USE_CASES,
  WRITING_PROMPTS_FIXTURE_NAME,
  FANTASY_NAMES_DEFAULT_FIXTURE_NAME,
  PLACE_NAMES_DEFAULT_FIXTURE_NAME,
  getUseCaseByPath,
  isAllowedPath,
} from '../useCases';

describe('useCases routes and UI config', () => {
  test('six use cases with unique paths', () => {
    expect(USE_CASES).toHaveLength(6);
    const paths = USE_CASES.map((u) => u.path);
    expect(new Set(paths).size).toBe(6);
  });

  test('allowed paths include home and all use case routes', () => {
    expect(ALLOWED_PATHNAMES).toContain('/');
    expect(ALLOWED_PATHNAMES).toContain('/writing-prompts');
    expect(ALLOWED_PATHNAMES).toContain('/fantasy-names');
    expect(ALLOWED_PATHNAMES).toContain('/place-names');
    expect(ALLOWED_PATHNAMES).toContain('/character-sheet');
    expect(ALLOWED_PATHNAMES).toContain('/svg-generator');
  });

  test('getUseCaseByPath returns entry for use case routes', () => {
    expect(getUseCaseByPath('/place-names')?.h1).toBe('Place name generator');
    expect(getUseCaseByPath('/')).toBeUndefined();
  });

  test('writing-prompts use case has writing-prompt UI defaults', () => {
    const u1 = getUseCaseByPath('/writing-prompts');
    expect(u1?.h1).toBe('Writing prompt generator');
    expect(u1?.ui?.defaultProcessModifiers).toBe(true);
    expect(u1?.ui?.resultsContentVariant).toBe('multiline');
    expect(u1?.ui?.maxGenerateMany).toBe(5);
    expect(u1?.ui?.showGenerateAll ?? true).toBe(true);
    expect(u1?.ui?.defaultFixtureName).toBe(WRITING_PROMPTS_FIXTURE_NAME);
    expect(u1?.ui?.exampleFixtureNames).toContain(WRITING_PROMPTS_FIXTURE_NAME);
  });

  test('fantasy-names use case has fantasy name fixtures and UI defaults', () => {
    const u2 = getUseCaseByPath('/fantasy-names');
    expect(u2?.h1).toBe('Fantasy name generator');
    expect(u2?.ui?.defaultProcessModifiers).toBe(false);
    expect(u2?.ui?.resultsContentVariant).toBe('line');
    expect(u2?.ui?.defaultFixtureName).toBe(FANTASY_NAMES_DEFAULT_FIXTURE_NAME);
    expect(u2?.ui?.exampleFixtureNames).toContain('Orc names');
    expect(u2?.ui?.exampleFixtureNames).toContain('Dragon names');
    expect(u2?.ui?.exampleFixtureNames).toContain('Tiefling names');
  });

  test('place-names use case defaults to Fantasy places fixture', () => {
    const u = getUseCaseByPath('/place-names');
    expect(u?.ui?.defaultFixtureName).toBe(PLACE_NAMES_DEFAULT_FIXTURE_NAME);
    expect(u?.ui?.resultsContentVariant).toBe('line');
  });

  test('svg-generator uses svg result variant, json default view, and both SVG examples', () => {
    const u = getUseCaseByPath('/svg-generator');
    expect(u?.ui?.resultsContentVariant).toBe('svg');
    expect(u?.ui?.defaultGrammarViewMode).toBe('json');
    expect(u?.ui?.exampleFixtureNames).toEqual(
      expect.arrayContaining(['Simple sigil', 'SVG pattern', 'Simple']),
    );
  });

  test('character-sheet uses markdown result variant', () => {
    const u = getUseCaseByPath('/character-sheet');
    expect(u?.ui?.resultsContentVariant).toBe('markdown');
  });

  test('isAllowedPath rejects unknown routes', () => {
    expect(isAllowedPath('/')).toBe(true);
    expect(isAllowedPath('/fantasy-names')).toBe(true);
    expect(isAllowedPath('/unknown')).toBe(false);
  });

  test('each use case has concise SEO fields (title ≤60 chars, description ≤160 chars)', () => {
    for (const u of USE_CASES) {
      expect(u.pageTitle.length).toBeLessThanOrEqual(60);
      expect(u.metaDescription.length).toBeLessThanOrEqual(160);
    }
  });

  test('writing-prompts and fantasy-names page titles use SEO modifiers without brand suffix', () => {
    expect(getUseCaseByPath('/writing-prompts')?.pageTitle).toBe(
      'Writing prompt generator — story seeds & warm-ups',
    );
    expect(getUseCaseByPath('/fantasy-names')?.pageTitle).toBe(
      'Fantasy name generator — D&D-style races & syllables',
    );
  });

  test('card summaries are benefit-led (sample)', () => {
    expect(getUseCaseByPath('/writing-prompts')?.cardSummary).toContain('Story seeds');
    expect(getUseCaseByPath('/svg-generator')?.cardSummary).toContain('sigils');
  });
});
