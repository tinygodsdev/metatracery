import { Anchor, Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { FLEXIBLE_EDITOR_PATH } from '../../seo/useCases';
import { LandingMiniDemo } from './LandingMiniDemo';

export function LandingHero() {
  const scrollToGenerators = () => {
    document.getElementById('generators')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box component="section" aria-labelledby="hero-heading">
      <Box
        style={{
          display: 'grid',
          gap: 'var(--mantine-spacing-xl)',
          alignItems: 'start',
        }}
        className="landing-hero-grid"
      >
        <Stack gap="lg" style={{ maxWidth: 560 }}>
          <Title order={1} id="hero-heading" fz={{ base: '1.65rem', sm: '2rem', md: '2.35rem' }} lh={1.15}>
            Build your own random text generators — no code, no AI
          </Title>
          <Text size="lg" c="dimmed" lh={1.55}>
            A free, browser-based generator builder for names, prompts, places, SVG sigils, and Markdown RPG notes.
            Write simple rules, roll endless variants — yours to share as JSON.
          </Text>
          <Group gap="sm" wrap="wrap">
            <Button
              component={Link}
              to={FLEXIBLE_EDITOR_PATH}
              size="md"
              rightSection={<IconArrowRight size={18} />}
            >
              Open the editor
            </Button>
            <Button variant="default" size="md" onClick={scrollToGenerators}>
              Browse generators
            </Button>
          </Group>
          <Text size="sm" c="dimmed">
            Free · No account ·{' '}
            <Anchor href="https://github.com/tinygodsdev/metatracery" target="_blank" rel="noopener noreferrer" size="sm">
              MIT license
            </Anchor>
            {' · '}
            Runs entirely on your device · Tracery-compatible JSON
          </Text>
        </Stack>
        <LandingMiniDemo />
      </Box>
      <style>{`
        @media (min-width: 62em) {
          .landing-hero-grid {
            grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
          }
        }
      `}</style>
    </Box>
  );
}
