import { Anchor, Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { FLEXIBLE_EDITOR_PATH, USE_CASES } from '../../seo/useCases';

export function LandingFinalCTA() {
  return (
    <section aria-labelledby="final-cta-heading">
      <Stack
        gap="lg"
        p="xl"
        style={{
          borderRadius: 'var(--mantine-radius-lg)',
          border: '1px solid var(--app-soft-border)',
          background: 'var(--app-accent-tint)',
        }}
      >
        <Title order={2} id="final-cta-heading" size="h3">
          Pick a generator or start blank
        </Title>
        <Text size="lg" c="dimmed" maw={720} lh={1.55}>
          Jump into a preset below, or open the full editor for every fixture, the graph, and all display modes.
        </Text>
        <Group>
          <Button
            component={Link}
            to={FLEXIBLE_EDITOR_PATH}
            rightSection={<IconArrowRight size={18} />}
          >
            Open the editor
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
          {USE_CASES.map((uc) => {
            const anchorText = uc.pageTitle.split(' —')[0].trim();
            return (
              <Anchor key={uc.path} component={Link} to={uc.path} size="md" fw={500}>
                {anchorText} →
              </Anchor>
            );
          })}
        </SimpleGrid>
      </Stack>
    </section>
  );
}
