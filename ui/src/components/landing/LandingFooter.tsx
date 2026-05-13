import { Anchor, Box, Divider, SimpleGrid, Stack, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

import { FLEXIBLE_EDITOR_PATH, USE_CASES } from '../../seo/useCases';

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <Box component="footer" mt="xl" pt="xl" pb="xl">
      <Divider mb="xl" />
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
        <Stack gap="xs">
          <Text fw={700} size="md">
            Generators
          </Text>
          {USE_CASES.map((uc) => {
            const label = uc.pageTitle.split(' —')[0].trim();
            return (
              <Anchor key={uc.path} component={Link} to={uc.path} size="md">
                {label}
              </Anchor>
            );
          })}
          <Anchor component={Link} to={FLEXIBLE_EDITOR_PATH} size="md">
            Grammar editor
          </Anchor>
        </Stack>
        <Stack gap="xs">
          <Text fw={700} size="md">
            About
          </Text>
          <Text size="md" c="dimmed" lh={1.5}>
            Created by{' '}
            <Anchor
              href="https://danipolani.github.io/en/"
              target="_blank"
              rel="noopener noreferrer"
              size="md"
              fw={500}
              c="primary"
            >
              Dani
            </Anchor>
            . See{' '}
            <Anchor
              href="https://danipolani.github.io/en/blog/tools/"
              target="_blank"
              rel="noopener noreferrer"
              size="md"
              fw={500}
              c="primary"
            >
              other tools
            </Anchor>{' '}
            for linguistics and conlanging.
          </Text>
        </Stack>
        <Stack gap="xs">
          <Text fw={700} size="md">
            Resources
          </Text>
          <Anchor href="#tally-open=eqKGEx" size="md">
            Feedback
          </Anchor>
          <Anchor component={Link} to="/privacy" size="md">
            Privacy policy
          </Anchor>
          <Anchor href="https://github.com/tinygodsdev/metatracery" target="_blank" rel="noopener noreferrer" size="md">
            GitHub repository
          </Anchor>
          <Anchor href="https://github.com/galaxykate/tracery" target="_blank" rel="noopener noreferrer" size="md">
            Tracery (original)
          </Anchor>
          <Text size="sm" c="dimmed">
            MIT License · {year}
          </Text>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
