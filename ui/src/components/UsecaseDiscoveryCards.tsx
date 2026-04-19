import type { CSSProperties } from 'react';
import { SimpleGrid, Text, Stack, Box, Group } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { UseCaseDefinition } from '../seo/useCases';
import { USE_CASES } from '../seo/useCases';
import { UsecaseCardOrnament, useUseCaseAccentColor } from './usecaseOrnaments';
import classes from './UsecaseDiscoveryCards.module.css';

function UseCaseCard({ uc, compact }: { uc: UseCaseDefinition; compact?: boolean }) {
  const primaryColor: MantineColor = uc.ui?.primaryColor ?? 'blue';
  const accent = useUseCaseAccentColor(primaryColor);
  const label = uc.cardTitle ?? uc.h1;

  return (
    <Link
      to={uc.path}
      className={classes.cardLink}
      style={
        {
          '--uc-accent': accent,
        } as CSSProperties
      }
    >
      <Group
        gap="sm"
        align="center"
        wrap="nowrap"
        p={compact ? 'sm' : 'md'}
        className={classes.cardBody}
      >
        <Box className={classes.cardIconChip} style={{ color: accent }} aria-hidden>
          <UsecaseCardOrnament path={uc.path} width={compact ? 32 : 36} height={compact ? 26 : 30} />
        </Box>
        <Text fw={600} size="sm" lh={1.35} lineClamp={3} className={classes.cardTitle}>
          {label}
        </Text>
      </Group>
    </Link>
  );
}

export type UsecaseDiscoveryPlacement = 'top' | 'bottom';

interface UsecaseDiscoveryCardsProps {
  /** `top`: home hero zone; `bottom`: below page content (default). */
  placement?: UsecaseDiscoveryPlacement;
  compact?: boolean;
}

export function UsecaseDiscoveryCards({ placement = 'bottom', compact }: UsecaseDiscoveryCardsProps) {
  const isTop = placement === 'top';
  return (
    <Stack
      gap="sm"
      mt={compact ? (isTop ? 0 : 'sm') : isTop ? 0 : 'xl'}
      mb={compact ? 'sm' : isTop ? { base: 'md', md: 'lg' } : 'md'}
    >
      <SimpleGrid
        cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 6 }}
        spacing={{ base: 'xs', sm: 'xs' }}
      >
        {USE_CASES.map((uc) => (
          <UseCaseCard key={uc.path} uc={uc} compact={compact} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
