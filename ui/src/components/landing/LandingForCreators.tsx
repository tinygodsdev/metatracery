import { Anchor, Card, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

import { FLEXIBLE_EDITOR_PATH } from '../../seo/useCases';

const CARDS = [
  {
    title: 'For writers',
    body:
      'Warm up with daily prompts, scene starters, and twist seeds — then tweak word lists to match your genre.',
    linkTo: '/writing-prompts',
    linkLabel: 'Writing prompt generator',
  },
  {
    title: 'For game masters',
    body:
      'Name towns and realms, sketch faction sigils as SVG, and drop Markdown NPC stat blocks into your notes.',
    linkTo: '/place-names',
    linkLabel: 'Place name generator',
  },
  {
    title: 'For worldbuilders & jam devs',
    body:
      'Fork bundled grammars, chain rules for lore snippets, and iterate without relying on an LLM pipeline.',
    linkTo: FLEXIBLE_EDITOR_PATH,
    linkLabel: 'Grammar editor',
  },
] as const;

export function LandingForCreators() {
  return (
    <section id="for-creators" aria-labelledby="for-creators-heading">
      <Stack gap="lg">
        <Title order={2} id="for-creators-heading" size="h3">
          Made for creative writers, GMs, and worldbuilders
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {CARDS.map((c) => (
            <Card key={c.title} withBorder padding="lg" radius="md" shadow="xs">
              <Stack gap="sm">
                <Title order={3} size="h5">
                  {c.title}
                </Title>
                <Text size="sm" c="dimmed" lh={1.55}>
                  {c.body}
                </Text>
                <Anchor component={Link} to={c.linkTo} size="sm" fw={600}>
                  {c.linkLabel} →
                </Anchor>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
        <Text size="sm" c="dimmed">
          GMs may also like the{' '}
          <Anchor component={Link} to="/svg-generator">
            SVG generator
          </Anchor>
          ,{' '}
          <Anchor component={Link} to="/character-sheet">
            NPC character sheet generator
          </Anchor>
          , and{' '}
          <Anchor component={Link} to="/random-sentences">
            random sentence generator
          </Anchor>
          .
        </Text>
      </Stack>
    </section>
  );
}
