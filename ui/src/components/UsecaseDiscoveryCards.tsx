import { SimpleGrid, Text, Title, Stack, Box, Center } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { USE_CASES } from '../seo/useCases';
import classes from './UsecaseDiscoveryCards.module.css';

function CardImagePlaceholder({ mediaClassName }: { mediaClassName: string }) {
  return (
    <Box
      className={mediaClassName}
      h={64}
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--mantine-color-default-hover)',
      }}
    >
      <Center h="100%">
        <IconPhoto size={26} stroke={1.2} color="var(--mantine-color-dimmed)" aria-hidden />
      </Center>
    </Box>
  );
}

export function UsecaseDiscoveryCards() {
  return (
    <Stack gap="sm" mt="xl" mb="md">
      <Title order={2} size="h4">
        Use cases
      </Title>
      <Text size="sm" c="dimmed">
        Same engine on every page — different titles and examples as you refine SEO.
      </Text>
      <SimpleGrid cols={{ base: 2, lg: 5 }} spacing={{ base: 'xs', sm: 'sm' }}>
        {USE_CASES.map((uc) => (
          <Link key={uc.path} to={uc.path} className={classes.cardLink}>
            <CardImagePlaceholder mediaClassName={classes.cardMedia} />
            <Stack gap={6} p="sm">
              <Text fw={600} size="sm" lh={1.35} lineClamp={2}>
                {uc.h1}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={3} lh={1.4}>
                {uc.cardSummary}
              </Text>
            </Stack>
          </Link>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
