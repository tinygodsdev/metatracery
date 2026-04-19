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
  /** Tighter spacing for collapsible workspace chrome. */
  compact?: boolean;
}

function HeroOrnamentPattern({
  path,
  patternId,
  accent,
  opacity,
  compact,
}: {
  path: string;
  patternId: string;
  accent: string;
  opacity: number;
  compact?: boolean;
}) {
  const tile = compact ? { w: 64, h: 52, tx: 12, ty: 10, sc: 0.68 } : { w: 80, h: 64, tx: 16, ty: 12, sc: 0.85 };
  return (
    <svg className={classes.patternSvg} aria-hidden width="100%" height="100%" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width={tile.w} height={tile.h} patternUnits="userSpaceOnUse">
          <g style={{ color: accent }} transform={`translate(${tile.tx}, ${tile.ty}) scale(${tile.sc})`}>
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
export function UsecaseHero({ path, primaryColor, h1, intro, compact }: UsecaseHeroProps) {
  const accent = useUseCaseAccentColor(primaryColor);
  const patternId = useId().replace(/:/g, '');
  const colorScheme = useComputedColorScheme('light');
  const patternOpacity = colorScheme === 'dark' ? 0.06 : 0.04;

  return (
    <Box component="header" mb={compact ? 0 : { base: 'xl', md: '2.5rem' }} px={{ base: 'xs', sm: 0 }}>
      <Box
        className={`${classes.heroPanel} ${compact ? classes.heroCompact : ''}`}
        bg="var(--app-accent-tint)"
        py={compact ? 'sm' : { base: 'lg', sm: 'xl', md: 48 }}
        px={compact ? 'sm' : { base: 'md', sm: 'lg', md: 'xl' }}
        style={{
          position: 'relative',
          borderRadius: 'var(--mantine-radius-lg)',
        }}
      >
        <HeroOrnamentPattern
          path={path}
          patternId={patternId}
          accent={accent}
          opacity={patternOpacity}
          compact={compact}
        />
        <Box className={classes.heroInner}>
          <Stack className={classes.heroCopy} gap={compact ? 6 : 'lg'}>
            <Text size={compact ? 'xs' : 'sm'} fw={600} c={primaryColor} tt="uppercase" lts={1}>
              Generator
            </Text>
            <Title
              order={1}
              fz={compact ? { base: 18, sm: 20 } : { base: 28, sm: 36, md: 44 }}
              lh={1.12}
              fw={700}
              style={{ letterSpacing: '-0.02em' }}
            >
              {h1}
            </Title>
            <Text
              size="lg"
              c="dimmed"
              lh={compact ? 1.45 : 1.6}
              fz={compact ? 'xs' : { base: 'md', md: 'lg' }}
              lineClamp={compact ? 3 : undefined}
            >
              {intro}
            </Text>
          </Stack>
          <Box aria-hidden className={classes.heroOrnamentSlot} style={{ color: accent }}>
            <Box className={`${classes.heroOrnamentSlotInner} ${compact ? classes.heroOrnamentSlotInnerCompact : ''}`}>
              <UsecaseCardOrnament path={path} variant="hero" className={classes.heroOrnament} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
