import linguistic from './linguistic.json';
import mathematical from './mathematical.json';
import biological from './biological.json';
import simple from './simple.json';
import emoji from './emoji.json';
import basic from './basic.json';
import syllable from './syllable.json';
import ipa from './ipa.json';
import ipa2 from './ipa2.json';

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
  }
];

export default fixtures;
