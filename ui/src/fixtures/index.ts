import linguistic from './linguistic.json';
import mathematical from './mathematical.json';
import biological from './biological.json';
import simple from './simple.json';
import emoji from './emoji.json';
import basic from './basic.json';
import syllable from './syllable.json';
import ipa from './ipa.json';
import ipa2 from './ipa2.json';
import modifiers from './modifiers.json';
import writingPrompts from './writingPrompts.json';
import fantasyElf from './fantasyElf.json';
import fantasyOrc from './fantasyOrc.json';
import fantasyDwarf from './fantasyDwarf.json';
import fantasyDragon from './fantasyDragon.json';
import fantasyHuman from './fantasyHuman.json';
import fantasyHalfling from './fantasyHalfling.json';
import fantasyTiefling from './fantasyTiefling.json';
import placeNames from './placeNames.json';
import randomSentences from './randomSentences.json';
import sigilSimple from './sigilSimple.json';
import svgPattern from './svgPattern.json';
import npcCharacterSheet from './npcCharacterSheet.json';

export interface Fixture {
  name: string;
  description: string;
  grammar: Record<string, string[]>;
}

export const fixtures: Fixture[] = [
  {
    name: 'Simple',
    description: 'Basic animal-action grammar for testing',
    grammar: simple
  },
  {
    name: 'Linguistic',
    description: 'Word order research with SVO, VSO, SOV patterns',
    grammar: linguistic
  },
  {
    name: 'Mathematical',
    description: 'Mathematical expressions with operators and brackets',
    grammar: mathematical
  },
  {
    name: 'Biological',
    description: 'DNA sequences with codons and gene structures',
    grammar: biological
  },
  {
    name: 'Emoji',
    description: 'Emoji combinations with happy, sad, and neutral groups',
    grammar: emoji
  },
  {
    name: 'Basic',
    description: 'Basic grammar with multiple S symbols',
    grammar: basic
  },
  {
    name: 'Syllable',
    description: 'Syllable combinations with vowels and consonants',
    grammar: syllable
  },
  {
    name: 'IPA',
    description: 'IPA symbols with vowels and consonants',
    grammar: ipa
  },
  {
    name: 'Lemu Legu',
    description: 'IPA symbols with vowels and consonants for Lemu Legu language',
    grammar: ipa2
  },
  {
    name: 'Modifiers (Tracery)',
    description:
      'Demonstrates #rule.mod# chains: a/an, capitalize, plural (s). Turn on the Modifiers switch in Results to apply them.',
    grammar: modifiers
  },
  {
    name: 'Writing prompts',
    description:
      'Short story seeds and scene hooks using #symbol.mod# chains — good with modifiers enabled in Results.',
    grammar: writingPrompts
  },
  {
    name: 'Elf names',
    description:
      'Light, vowel-rich syllable stacks for elven-sounding character names (plain English letters).',
    grammar: fantasyElf
  },
  {
    name: 'Orc names',
    description: 'Hard consonants and short nuclei for rough, guttural orc-style names.',
    grammar: fantasyOrc
  },
  {
    name: 'Dwarf names',
    description: 'Chunky syllables and earthy tails for sturdy dwarf names.',
    grammar: fantasyDwarf
  },
  {
    name: 'Dragon names',
    description: 'Longer, dramatic syllable chains for draconic names.',
    grammar: fantasyDragon
  },
  {
    name: 'Human names',
    description: 'Given + family-style pieces for generic fantasy human characters.',
    grammar: fantasyHuman
  },
  {
    name: 'Halfling names',
    description: 'Soft opens and homely endings for halfling-style names.',
    grammar: fantasyHalfling
  },
  {
    name: 'Tiefling names',
    description:
      'Infernal-style syllables (D&D-inspired): endings like -os/-on vs -a/-eis, harsh and melodic mixes — plain a–z only.',
    grammar: fantasyTiefling
  },
  {
    name: 'Fantasy places',
    description:
      'Settlement and realm names: prefixes, cores, and suffixes for maps and fiction (town, kingdom, duchy).',
    grammar: placeNames
  },
  {
    name: 'Random sentences',
    description: 'Short lines and tiny two-line paragraphs from subject / verb / object style rules.',
    grammar: randomSentences
  },
  {
    name: 'Simple sigil',
    description:
      'Self-contained SVG strings: background tile plus a random glyph (circle, polygon, path) and palette.',
    grammar: sigilSimple
  },
  {
    name: 'SVG pattern',
    description: 'Small SVG with dotted or grid fill for backgrounds and design experiments.',
    grammar: svgPattern
  },
  {
    name: 'NPC character sheet',
    description: 'Markdown block: heading with name, race, class, quirk, and a quoted story hook.',
    grammar: npcCharacterSheet
  }
];

export default fixtures;
