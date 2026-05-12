import { Accordion, Stack, Title } from '@mantine/core';

export interface LandingFaqItem {
  question: string;
  answer: string;
}

/** Visible FAQ + source of truth for FAQPage JSON-LD (must match exactly). */
export const FAQ_ITEMS: LandingFaqItem[] = [
  {
    question: 'Is it free?',
    answer:
      'Yes. The tool is MIT-licensed and runs in your browser with no account or subscription.',
  },
  {
    question: 'Do my texts leave the browser?',
    answer:
      'No. Generation happens locally in your tab; nothing is sent to our servers for the grammar engine.',
  },
  {
    question: 'Can I import Tracery grammars?',
    answer:
      'Yes. Use the same JSON shape as classic Tracery-style rules (symbols mapped to arrays of strings).',
  },
  {
    question: 'Does it work offline?',
    answer:
      'After the first load, the app can keep working offline like a typical PWA — depending on your browser cache.',
  },
  {
    question: 'How is this different from ChatGPT or other AI generators?',
    answer:
      'Outputs are rule-based and reproducible: you control word lists and structure, with no API keys or model hallucinations.',
  },
  {
    question: 'Can I use the output commercially?',
    answer:
      'Yes. You own your grammars and the text they produce; check third-party assets you embed separately.',
  },
];

export function LandingFAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading">
      <Stack gap="lg">
        <Title order={2} id="faq-heading" size="h3">
          FAQ
        </Title>
        <Accordion variant="separated" radius="md">
          {FAQ_ITEMS.map((item) => (
            <Accordion.Item key={item.question} value={item.question}>
              <Accordion.Control>{item.question}</Accordion.Control>
              <Accordion.Panel>{item.answer}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Stack>
    </section>
  );
}
