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
    pageTitle: 'Writing prompt generator — Generative Grammar Engine',
    metaDescription:
      'Free writing prompt generator and random prompt ideas: short scenes, story seeds, and warm-ups with Tracery-style rules and modifiers. Browser-based grammar engine.',
    h1: 'Writing prompt generator',
    intro:
      'Draft quick prompts, random writing prompts, and tiny narrative hooks using generative rules. Turn on modifiers in Results to apply chains like #noun.a# or #phrase.capitalize#. Generate a handful of variants at a time and read multiline output in the table.',
    outro:
      'Edit the grammar or load bundled examples tuned for this page. Your draft for this route can be saved when you leave; the next visit may offer to restore it.',
    cardSummary: 'Prompts & random prompt ideas — multiline results, modifiers optional.',
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
      'Fantasy name generator and character name ideas for D&D-style games: tiefling, elf, orc, dwarf, dragon, human, halfling. Rule-based syllable grammars in your browser.',
    h1: 'Fantasy name generator',
    intro:
      'Roll character names for players or NPCs using small grammars tuned per fantasy type — including tiefling names and elf name generator-style syllables (plain a–z). Pick a race preset, adjust rules, then generate variants in Results.',
    outro:
      'Combine or fork the bundled examples to add surnames, clans, or honorifics. Modifiers stay optional here; names are meant to read cleanly as plain text.',
    cardSummary: 'Character & fantasy names — races presets, line output.',
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
      'Place name generator for fantasy maps and fiction: random town names, city names, kingdoms, and realm titles. Old-English and elvish-flavored syllable rules — browser-based.',
    h1: 'Place name generator',
    intro:
      'Name cities, towns, hamlets, and kingdoms for maps and stories. Mix prefixes, cores, and suffixes into settlement names, or roll realm-style titles. Output is one place per line — tweak the JSON to match your world.',
    outro:
      'Duplicate a preset to build regional styles (coastal vs mountain) or add rivers and roads in the grammar. Export CSV when you need a batch for a map key.',
    cardSummary: 'Towns, cities, kingdoms — line results.',
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
      'Generate random sentences and bite-sized paragraphs by composing subjects, verbs, and tails. Use multiline results to scan several variants; enable Modifiers for #word.a#-style chains on compatible grammars.',
    outro:
      'Swap in your own word lists for genre (noir, cozy, sci-fi) or chain multiple rules into longer passages in the JSON view.',
    cardSummary: 'Sentences & micro-scenes — multiline.',
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
      'Generate SVG in the browser from grammar rules: heraldry-style sigils and emblems, or tiled dot/grid patterns for CSS backgrounds. Copy or download each SVG; JSON editor with graph mode.',
    h1: 'SVG generator',
    intro:
      'Use this page for vector output from your rules: single emblem-style sigils (circles, polygons, palettes) and repeatable tiled patterns (dots, grids) for CSS backgrounds or design tools. Load the bundled examples to switch between styles; edit JSON to change geometry, colors, or repeat size. Each card supports Copy / Download; previews are sanitized.',
    outro:
      'Pair with place or character pages for factions and houses, or export patterns for UI mockups — keep viewBox and defs consistent when you scale or tile.',
    cardSummary: 'Sigils, emblems & tiled patterns — SVG copy & download.',
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
      'Results render as Markdown: headings, bold labels, and a quoted hook. Edit the grammar to add skills, bonds, or inventory lines. Copy the raw markdown or read the preview below.',
    outro:
      'Paste output into Obsidian, Notion, or your VTT notes. For crunch-heavy stats, extend the grammar with tables or lists using standard Markdown syntax in rule strings.',
    cardSummary: 'Markdown NPC sheets — preview + copy.',
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
