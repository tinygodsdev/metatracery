import type { CSSProperties } from 'react';
import { SimpleGrid, Text, Title, Stack, Box, Center } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { UseCaseDefinition } from '../seo/useCases';
import { USE_CASES } from '../seo/useCases';
import { UsecaseCardOrnament, useUseCaseAccentColor } from './usecaseOrnaments';
import classes from './UsecaseDiscoveryCards.module.css';

function UseCaseCard({ uc }: { uc: UseCaseDefinition }) {
  const primaryColor: MantineColor = uc.ui?.primaryColor ?? 'blue';
  const accent = useUseCaseAccentColor(primaryColor);

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
      <Box
        className={classes.cardMedia}
        pt="xs"
        style={{
          backgroundColor: 'transparent',
          color: accent,
        }}
      >
        <Center h={44}>
          <UsecaseCardOrnament path={uc.path} />
        </Center>
      </Box>
      <Stack gap={4} p="sm">
        <Text fw={600} size="xs" lh={1.35} lineClamp={2}>
          {uc.h1}
        </Text>
        <Text fz={11} c="dimmed" lineClamp={2} lh={1.35}>
          {uc.cardSummary}
        </Text>
      </Stack>
    </Link>
  );
}

export type UsecaseDiscoveryPlacement = 'top' | 'bottom';

interface UsecaseDiscoveryCardsProps {
  /** `top`: home hero zone; `bottom`: below page content (default). */
  placement?: UsecaseDiscoveryPlacement;
}

export function UsecaseDiscoveryCards({ placement = 'bottom' }: UsecaseDiscoveryCardsProps) {
  const isTop = placement === 'top';
  return (
    <Stack gap="sm" mt={isTop ? 0 : 'xl'} mb={isTop ? { base: 'md', md: 'lg' } : 'md'}>
      <Title order={2} size="h4">
        Use cases
      </Title>
      <SimpleGrid
        cols={{ base: 2, xs: 3, sm: 3, md: 4, lg: 5, xl: 6 }}
        spacing={{ base: 'xs', sm: 'xs' }}
      >
        {USE_CASES.map((uc) => (
          <UseCaseCard key={uc.path} uc={uc} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
