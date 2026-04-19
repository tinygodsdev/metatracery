import type { CSSProperties } from 'react';
import { SimpleGrid, Text, Title, Stack, Box, Group } from '@mantine/core';
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
      <Stack gap="sm" p="md" className={classes.cardBody}>
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <Box className={classes.cardIconChip} style={{ color: accent }} aria-hidden>
            <UsecaseCardOrnament path={uc.path} width={36} height={30} />
          </Box>
          <Text fw={600} size="sm" lh={1.35} lineClamp={2} className={classes.cardTitle}>
            {uc.h1}
          </Text>
        </Group>
        <Text size="sm" c="dimmed" lineClamp={2} lh={1.4}>
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
        cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 6 }}
        spacing={{ base: 'xs', sm: 'xs' }}
      >
        {USE_CASES.map((uc) => (
          <UseCaseCard key={uc.path} uc={uc} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
