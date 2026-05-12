import type { CSSProperties } from 'react';
import { Anchor, Box, Card, Code, List, Stack, Text, Title } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { Link } from 'react-router-dom';

import type { UseCaseDefinition } from '../../seo/useCases';
import { USE_CASES } from '../../seo/useCases';
import { UsecaseCardOrnament, useUseCaseAccentColor } from '../usecaseOrnaments';

function GeneratorCard({ uc }: { uc: UseCaseDefinition }) {
  const primaryColor: MantineColor = uc.ui?.primaryColor ?? 'teal';
  const accent = useUseCaseAccentColor(primaryColor);
  const heading = uc.cardTitle ?? uc.h1;
  const anchorText = uc.pageTitle.split(' —')[0].trim();
  const samples = uc.landingSample ?? [];

  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      component="article"
      shadow="xs"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Stack gap="sm" style={{ flex: 1 }}>
        <Box style={{ '--uc-accent': accent } as CSSProperties} aria-hidden>
          <Box style={{ color: 'var(--uc-accent)' }}>
            <UsecaseCardOrnament path={uc.path} width={40} height={34} />
          </Box>
        </Box>
        <Title order={3} size="h4" lh={1.25}>
          {heading}
        </Title>
        <Text size="sm" c="dimmed">
          {uc.cardSummary}
        </Text>
        {samples.length > 0 ? (
          <List size="xs" c="dimmed" spacing={4} styles={{ item: { lineHeight: 1.4 } }}>
            {samples.map((line) => (
              <List.Item key={line}>
                <Code fz="xs" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {line}
                </Code>
              </List.Item>
            ))}
          </List>
        ) : null}
        <Anchor component={Link} to={uc.path} fw={600} size="sm" c={primaryColor} mt="auto" display="inline-block">
          {anchorText} →
        </Anchor>
      </Stack>
    </Card>
  );
}

export function LandingGeneratorsGrid() {
  return (
    <section id="generators" aria-labelledby="generators-heading">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={2} id="generators-heading" size="h3">
            Random generators ready to use
          </Title>
          <Text maw={820} c="dimmed">
            Each shortcut opens the same engine with a preset grammar and layout tuned for the task — names as single
            lines, prompts as paragraphs, SVG with live preview, and Markdown NPC blocks.
          </Text>
        </Stack>
        <Box
          style={{
            display: 'grid',
            gap: 'var(--mantine-spacing-md)',
            alignItems: 'stretch',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          }}
        >
          {USE_CASES.map((uc) => (
            <GeneratorCard key={uc.path} uc={uc} />
          ))}
        </Box>
      </Stack>
    </section>
  );
}
