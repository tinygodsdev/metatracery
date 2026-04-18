import type { MantineColor } from '@mantine/core';

export type UseCaseResultsContentVariant = 'line' | 'multiline';

/** Optional UI behavior for a use case route (home `/` has no use case entry). */
export interface UseCaseUiConfig {
  /**
   * Mantine default palette name for primary (buttons, links, focus rings) on this route.
   * Nested theme inherits the app theme and overrides only primaryColor.
   */
  primaryColor?: MantineColor;
  /** When set, sync the Results "Modifiers" switch and engine on enter. */
  defaultProcessModifiers?: boolean;
  /** Render result cells as multiline read-only text areas. */
  resultsContentVariant?: UseCaseResultsContentVariant;
  /** Upper bound (1–5) for "Generate many" count. */
  maxGenerateMany?: number;
  /** When false, hide "Generate all" to avoid huge combination tables. */
  showGenerateAll?: boolean;
  /** If set, "Load example" lists only these fixture names (registry `name` values). */
  exampleFixtureNames?: string[];
  /** Optional fixture `name` to load as the default grammar for this page. */
  defaultFixtureName?: string;
}

export interface UseCaseDefinition {
  /** URL path slug (e.g. /writing-prompts) */
  path: string;
  pageTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  outro: string;
  /** Short blurb for discovery cards */
  cardSummary: string;
  /** Per-route tool defaults and result layout; omit for generic placeholder pages. */
  ui?: UseCaseUiConfig;
}

export const WRITING_PROMPTS_FIXTURE_NAME = 'Writing prompts';

/** Default example on `/fantasy-names` — elf-flavored syllable grammar. */
export const FANTASY_NAMES_DEFAULT_FIXTURE_NAME = 'Elf names';

export const USE_CASES: UseCaseDefinition[] = [
  {
    path: '/writing-prompts',
    pageTitle: 'Writing prompt generator — Generative Grammar Engine',
    metaDescription:
      'Spin up short writing prompts and mini-scenes with Tracery-style rules and modifiers. Browser-based grammar engine for creative warm-ups and story seeds.',
    h1: 'Writing prompt generator',
    intro:
      'Draft quick prompts and tiny narrative hooks using generative rules. Turn on modifiers in Results to apply chains like #noun.a# or #phrase.capitalize#. Generate a handful of variants at a time and read multiline output in the table.',
    outro:
      'Edit the grammar or load bundled examples tuned for this page. Your draft for this route can be saved when you leave; the next visit may offer to restore it.',
    cardSummary:
      'Rule-based writing prompts with modifiers, filtered examples, and multiline results.',
    ui: {
      primaryColor: 'lime',
      defaultProcessModifiers: true,
      resultsContentVariant: 'multiline',
      maxGenerateMany: 5,
      showGenerateAll: false,
      exampleFixtureNames: [WRITING_PROMPTS_FIXTURE_NAME, 'Modifiers (Tracery)', 'Simple'],
      defaultFixtureName: WRITING_PROMPTS_FIXTURE_NAME,
    },
  },
  {
    path: '/fantasy-names',
    pageTitle: 'Fantasy name generator — Generative Grammar Engine',
    metaDescription:
      'Fantasy name generator for D&D-style characters: tiefling, elf, orc, dwarf, dragon, human, halfling. Tiefling names use infernal-flavored syllables; each race has its own simple a–z grammar — in your browser.',
    h1: 'Fantasy name generator',
    intro:
      'Roll names for player or NPC characters using small grammars tuned per fantasy type — including tiefling names (a common search for D&D-style infernal-flavored syllables, loosely inspired by Player’s Handbook patterns). Also pick elf, orc, dwarf, dragon, human, or halfling. Everything uses plain a–z syllable chunks (no IPA symbols). Adjust rules to match your setting, then generate variants in Results.',
    outro:
      'Combine or fork the bundled examples to add surnames, clans, or honorifics. Modifiers stay optional here; names are meant to read cleanly as plain text.',
    cardSummary:
      'Tiefling, elf, orc, dwarf, dragon, human, halfling — character names from simple syllable grammars.',
    ui: {
      primaryColor: 'violet',
      defaultProcessModifiers: false,
      resultsContentVariant: 'line',
      maxGenerateMany: 12,
      showGenerateAll: false,
      exampleFixtureNames: [
        FANTASY_NAMES_DEFAULT_FIXTURE_NAME,
        'Orc names',
        'Dwarf names',
        'Dragon names',
        'Human names',
        'Halfling names',
        'Tiefling names',
      ],
      defaultFixtureName: FANTASY_NAMES_DEFAULT_FIXTURE_NAME,
    },
  },
  {
    path: '/usecase3',
    pageTitle: 'Use case 3 — Generative Grammar Engine',
    metaDescription:
      'Generative grammar use case: compose rules, run the engine, export or iterate. English UI; Tracery-inspired rule syntax where applicable.',
    h1: 'Use case 3',
    intro:
      'Neutral SEO copy for a third scenario. Mentioning Tracery only as a familiar reference point — not a competitive claim.',
    outro:
      'All use case routes share one implementation; differentiation is content, defaults, and metadata.',
    cardSummary: 'Placeholder workflow C — extend with your own keywords and sample grammar.',
  },
  {
    path: '/usecase4',
    pageTitle: 'Use case 4 — Generative Grammar Engine',
    metaDescription:
      'Rule-based text generation in the browser: define nonterminals, alternatives, and modifiers. Suitable for writers, researchers, and tooling experiments.',
    h1: 'Use case 4',
    intro:
      'Fourth abstract landing. Ideal for long-tail pages once you map queries from your SEO research.',
    outro:
      'Bottom copy can hold FAQs or links to docs later; keep the main tool unchanged.',
    cardSummary: 'Placeholder workflow D — reserved for a future vertical.',
  },
  {
    path: '/usecase5',
    pageTitle: 'Use case 5 — Generative Grammar Engine',
    metaDescription:
      'Fifth use case route for the Generative Grammar Engine — same core tool, tailored page title and description for search.',
    h1: 'Use case 5',
    intro:
      'Fifth placeholder. Pair with analytics and Search Console to see which use cases merit richer examples.',
    outro:
      'Sitemap and robots.txt list these URLs for crawlers; prerender may be added later if needed.',
    cardSummary: 'Placeholder workflow E — swap copy when semantics are decided.',
  },
];

const BY_PATH = new Map(USE_CASES.map((u) => [u.path, u]));

export function getUseCaseByPath(pathname: string): UseCaseDefinition | undefined {
  return BY_PATH.get(pathname);
}

export const ALLOWED_PATHNAMES = ['/', ...USE_CASES.map((u) => u.path)] as const;

export function isAllowedPath(pathname: string): boolean {
  return (ALLOWED_PATHNAMES as readonly string[]).includes(pathname);
}

/** Old URLs → canonical use-case paths (client-side redirect for bookmarks). */
export const LEGACY_USE_CASE_REDIRECTS: Record<string, string> = {
  '/usecase1': '/writing-prompts',
  '/usecase2': '/fantasy-names',
};

export function getLegacyUseCaseRedirect(pathname: string): string | undefined {
  return LEGACY_USE_CASE_REDIRECTS[pathname];
}
