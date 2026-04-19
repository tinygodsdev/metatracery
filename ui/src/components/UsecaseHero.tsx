import { useId } from 'react';
import { Box, Stack, Text, Title, useComputedColorScheme } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { OrnamentInner, UsecaseCardOrnament, useUseCaseAccentColor } from './usecaseOrnaments';
import classes from './UsecaseHero.module.css';

interface UsecaseHeroProps {
  path: string;
  primaryColor: MantineColor;
  h1: string;
  intro: string;
}

function HeroOrnamentPattern({
  path,
  patternId,
  accent,
  opacity,
}: {
  path: string;
  patternId: string;
  accent: string;
  opacity: number;
}) {
  return (
    <svg className={classes.patternSvg} aria-hidden width="100%" height="100%" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width={80} height={64} patternUnits="userSpaceOnUse">
          <g style={{ color: accent }} transform="translate(16, 12) scale(0.85)">
            <OrnamentInner path={path} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/**
 * Wide use-case landing strip: copy on the left, vector ornament banner on the right (same motif as discovery cards).
 */
export function UsecaseHero({ path, primaryColor, h1, intro }: UsecaseHeroProps) {
  const accent = useUseCaseAccentColor(primaryColor);
  const patternId = useId().replace(/:/g, '');
  const colorScheme = useComputedColorScheme('light');
  const patternOpacity = colorScheme === 'dark' ? 0.06 : 0.04;

  return (
    <Box component="header" mb={{ base: 'xl', md: '2.5rem' }} px={{ base: 'xs', sm: 0 }}>
      <Box
        className={classes.heroPanel}
        bg="var(--app-accent-tint)"
        py={{ base: 'lg', sm: 'xl', md: 48 }}
        px={{ base: 'md', sm: 'lg', md: 'xl' }}
        style={{
          position: 'relative',
          borderRadius: 'var(--mantine-radius-lg)',
        }}
      >
        <HeroOrnamentPattern path={path} patternId={patternId} accent={accent} opacity={patternOpacity} />
        <Box className={classes.heroInner}>
          <Stack className={classes.heroCopy} gap="lg">
            <Text size="sm" fw={600} c={primaryColor} tt="uppercase" lts={1}>
              Generator
            </Text>
            <Title
              order={1}
              fz={{ base: 28, sm: 36, md: 44 }}
              lh={1.12}
              fw={700}
              style={{ letterSpacing: '-0.02em' }}
            >
              {h1}
            </Title>
            <Text size="lg" c="dimmed" lh={1.6} fz={{ base: 'md', md: 'lg' }}>
              {intro}
            </Text>
          </Stack>
          <Box aria-hidden className={classes.heroOrnamentSlot} style={{ color: accent }}>
            <Box className={classes.heroOrnamentSlotInner}>
              <UsecaseCardOrnament path={path} variant="hero" className={classes.heroOrnament} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
