import {
  ALLOWED_PATHNAMES,
  USE_CASES,
  WRITING_PROMPTS_FIXTURE_NAME,
  FANTASY_NAMES_DEFAULT_FIXTURE_NAME,
  getLegacyUseCaseRedirect,
  getUseCaseByPath,
  isAllowedPath,
} from '../useCases';

describe('useCases SEO config', () => {
  test('five use cases with unique paths', () => {
    expect(USE_CASES).toHaveLength(5);
    const paths = USE_CASES.map((u) => u.path);
    expect(new Set(paths).size).toBe(5);
  });

  test('allowed paths include home, writing-prompts, fantasy-names, and usecase3-5', () => {
    expect(ALLOWED_PATHNAMES).toContain('/');
    expect(ALLOWED_PATHNAMES).toContain('/writing-prompts');
    expect(ALLOWED_PATHNAMES).toContain('/fantasy-names');
    expect(ALLOWED_PATHNAMES).toContain('/usecase5');
  });

  test('getUseCaseByPath returns entry for use case routes', () => {
    expect(getUseCaseByPath('/usecase3')?.h1).toBe('Use case 3');
    expect(getUseCaseByPath('/')).toBeUndefined();
  });

  test('writing-prompts use case has writing-prompt UI defaults', () => {
    const u1 = getUseCaseByPath('/writing-prompts');
    expect(u1?.h1).toBe('Writing prompt generator');
    expect(u1?.ui?.defaultProcessModifiers).toBe(true);
    expect(u1?.ui?.resultsContentVariant).toBe('multiline');
    expect(u1?.ui?.maxGenerateMany).toBe(5);
    expect(u1?.ui?.showGenerateAll).toBe(false);
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

  test('isAllowedPath rejects unknown routes', () => {
    expect(isAllowedPath('/')).toBe(true);
    expect(isAllowedPath('/fantasy-names')).toBe(true);
    expect(isAllowedPath('/usecase2')).toBe(false);
    expect(isAllowedPath('/unknown')).toBe(false);
  });

  test('legacy /usecase1 redirects to /writing-prompts', () => {
    expect(getLegacyUseCaseRedirect('/usecase1')).toBe('/writing-prompts');
    expect(getLegacyUseCaseRedirect('/writing-prompts')).toBeUndefined();
  });

  test('legacy /usecase2 redirects to /fantasy-names', () => {
    expect(getLegacyUseCaseRedirect('/usecase2')).toBe('/fantasy-names');
    expect(getLegacyUseCaseRedirect('/fantasy-names')).toBeUndefined();
  });
});
