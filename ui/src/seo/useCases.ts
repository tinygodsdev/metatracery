import type { MantineColor } from '@mantine/core';

export type UseCaseResultsContentVariant =
  | 'line'
  | 'multiline'
  | 'code'
  | 'svg'
  | 'html'
  | 'markdown';

export type UseCasePreviewBackground = 'default' | 'checker' | 'dark';

export interface UseCasePreviewConfig {
  aspectRatio?: number;
  minHeight?: number;
  background?: UseCasePreviewBackground;
}

/** Optional UI behavior for a use case route (home `/` has no use case entry). */
export interface UseCaseUiConfig {
  /**
   * Mantine default palette name for primary (buttons, links, focus rings) on this route.
   * Nested theme inherits the app theme and overrides only primaryColor.
   */
  primaryColor?: MantineColor;
  /** When set, sync the Results "Modifiers" switch and engine on enter. */
  defaultProcessModifiers?: boolean;
  /** Render result cells as multiline read-only text areas, code, SVG, HTML, or rendered markdown. */
  resultsContentVariant?: UseCaseResultsContentVariant;
  /** Upper bound (1–5) for "Generate many" count. */
  maxGenerateMany?: number;
  /** When false, hide "Generate all". Default true. */
  showGenerateAll?: boolean;
  /** If set, "Load example" lists only these fixture names (registry `name` values). */
  exampleFixtureNames?: string[];
  /** Optional fixture `name` to load as the default grammar for this page. */
  defaultFixtureName?: string;
  /** Preview layout for svg/html/markdown rich results. */
  preview?: UseCasePreviewConfig;
  /** Default tab in the grammar editor for routes heavy on XML/markdown in JSON. */
  defaultGrammarViewMode?: 'json' | 'graph';
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

export const PLACE_NAMES_DEFAULT_FIXTURE_NAME = 'Fantasy places';
export const RANDOM_SENTENCES_DEFAULT_FIXTURE_NAME = 'Random sentences';
/** Registry name for the sigil / emblem SVG example */
export const SIMPLE_SIGIL_FIXTURE_NAME = 'Simple sigil';
/** Registry name for the tiled pattern SVG example */
export const SVG_PATTERN_FIXTURE_NAME = 'SVG pattern';
/** Default grammar on `/svg-generator` */
export const SVG_GENERATOR_DEFAULT_FIXTURE_NAME = SIMPLE_SIGIL_FIXTURE_NAME;
export const CHARACTER_SHEET_DEFAULT_FIXTURE_NAME = 'NPC character sheet';

export const USE_CASES: UseCaseDefinition[] = [
  {
    path: '/writing-prompts',
    pageTitle: 'Writing prompt generator — story seeds & warm-ups',
    metaDescription:
      'Free writing prompt generator: short scenes, story seeds, and daily warm-ups built from Tracery-style grammar rules. Runs in your browser.',
    h1: 'Writing prompt generator',
    intro:
      'A writing prompt generator for daily warm-ups, story sparks, and scene seeds. The page ships with a multi-line prompt grammar; tweak word lists or load other examples to match your genre.',
    outro:
      'Edit the grammar or load bundled examples tuned for this page. Your draft for this route can be saved when you leave; the next visit may offer to restore it.',
    cardSummary: 'Story seeds, scene starters and daily warm-ups for writers.',
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
    pageTitle: 'Fantasy name generator — D&D-style races & syllables',
    metaDescription:
      'Fantasy name generator for D&D-style games: tiefling, elf, orc, dwarf, dragon, human, halfling. Syllable grammars in your browser.',
    h1: 'Fantasy name generator',
    intro:
      'A fantasy name generator for tabletop characters and fiction. Switch between elf, orc, dwarf, dragon, human, halfling, and tiefling presets, then roll a batch and pick the ones that fit your world.',
    outro:
      'Combine or fork the bundled examples to add surnames, clans, or honorifics. Modifiers stay optional here; names are meant to read cleanly as plain text.',
    cardSummary: 'Names for elves, orcs, dwarves, dragons, halflings, tieflings.',
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
    path: '/place-names',
    pageTitle: 'Place name generator — fantasy towns & kingdoms',
    metaDescription:
      'Place name generator for fantasy maps: towns, cities, kingdoms, and realm titles. Old-English and elvish-flavored syllables — browser-based.',
    h1: 'Place name generator',
    intro:
      'Name fantasy towns, cities, and kingdoms for maps, campaigns, and stories. Mix prefixes, cores, and suffixes from the bundled grammar, or fork it for regional styles.',
    outro:
      'Duplicate a preset to build regional styles (coastal vs mountain) or add rivers and roads in the grammar. Export CSV when you need a batch for a map key.',
    cardSummary: 'Towns, cities, kingdoms and realms for maps and fiction.',
    ui: {
      primaryColor: 'cyan',
      defaultProcessModifiers: false,
      resultsContentVariant: 'line',
      maxGenerateMany: 20,
      showGenerateAll: false,
      exampleFixtureNames: [PLACE_NAMES_DEFAULT_FIXTURE_NAME, 'Simple'],
      defaultFixtureName: PLACE_NAMES_DEFAULT_FIXTURE_NAME,
    },
  },
  {
    path: '/random-sentences',
    pageTitle: 'Random sentence generator — lines & mini paragraphs',
    metaDescription:
      'Random sentence generator for writers: short lines and tiny scenes from composable grammar rules. Optional Tracery modifiers. Runs entirely in the browser.',
    h1: 'Random sentence generator',
    intro:
      'Generate random sentences and tiny scenes from composable subjects, verbs, and tails. Useful for warm-up writing, copy mockups, and quick filler when you need readable strings.',
    outro:
      'Swap in your own word lists for genre (noir, cozy, sci-fi) or chain multiple rules into longer passages in the JSON view.',
    cardSummary: 'Random sentences and bite-sized scenes from your word lists.',
    ui: {
      primaryColor: 'indigo',
      defaultProcessModifiers: false,
      resultsContentVariant: 'multiline',
      maxGenerateMany: 10,
      showGenerateAll: false,
      exampleFixtureNames: [RANDOM_SENTENCES_DEFAULT_FIXTURE_NAME, 'Modifiers (Tracery)', 'Simple'],
      defaultFixtureName: RANDOM_SENTENCES_DEFAULT_FIXTURE_NAME,
    },
  },
  {
    path: '/svg-generator',
    pageTitle: 'SVG generator — sigils, patterns & vector snippets',
    metaDescription:
      'Generate SVG in the browser from grammar rules: heraldry-style sigils, emblems, and tiled dot or grid patterns. Copy or download each result.',
    h1: 'SVG generator',
    intro:
      'Generate SVG from grammar rules: emblem-style sigils for factions, or tiled dot and grid patterns for backgrounds. Switch between bundled examples and edit JSON to change geometry, colors, or repeat size.',
    outro:
      'Pair with place or character pages for factions and houses, or export patterns for UI mockups — keep viewBox and defs consistent when you scale or tile.',
    cardSummary: 'Heraldry-style sigils and tiled vector patterns, ready to copy.',
    ui: {
      primaryColor: 'grape',
      defaultProcessModifiers: false,
      resultsContentVariant: 'svg',
      maxGenerateMany: 6,
      showGenerateAll: false,
      defaultGrammarViewMode: 'json',
      exampleFixtureNames: [
        SIMPLE_SIGIL_FIXTURE_NAME,
        SVG_PATTERN_FIXTURE_NAME,
        'Simple',
      ],
      defaultFixtureName: SVG_GENERATOR_DEFAULT_FIXTURE_NAME,
      preview: { aspectRatio: 1, minHeight: 160, background: 'checker' },
    },
  },
  {
    path: '/character-sheet',
    pageTitle: 'NPC character sheet — markdown stat block generator',
    metaDescription:
      'Generate lightweight NPC character sheets in Markdown: name, race, class, traits, and story hooks for tabletop RPGs and fiction. Rule-based, no AI.',
    h1: 'NPC character sheet generator',
    intro:
      'Roll lightweight NPC character sheets as Markdown — name, race, class, traits, and a short hook. Paste straight into Obsidian, Notion, or your VTT notes.',
    outro:
      'Paste output into Obsidian, Notion, or your VTT notes. For crunch-heavy stats, extend the grammar with tables or lists using standard Markdown syntax in rule strings.',
    cardSummary: 'Lightweight NPC stat blocks rendered as Markdown.',
    ui: {
      primaryColor: 'orange',
      defaultProcessModifiers: false,
      resultsContentVariant: 'markdown',
      maxGenerateMany: 4,
      showGenerateAll: false,
      exampleFixtureNames: [CHARACTER_SHEET_DEFAULT_FIXTURE_NAME, 'Simple'],
      defaultFixtureName: CHARACTER_SHEET_DEFAULT_FIXTURE_NAME,
    },
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
