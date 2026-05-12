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
          <Text fw={700} size="sm">
            Generators
          </Text>
          {USE_CASES.map((uc) => {
            const label = uc.pageTitle.split(' —')[0].trim();
            return (
              <Anchor key={uc.path} component={Link} to={uc.path} size="sm">
                {label}
              </Anchor>
            );
          })}
          <Anchor component={Link} to={FLEXIBLE_EDITOR_PATH} size="sm">
            Grammar editor
          </Anchor>
        </Stack>
        <Stack gap="xs">
          <Text fw={700} size="sm">
            About
          </Text>
          <Text size="sm" c="dimmed" lh={1.5}>
            Created by{' '}
            <Anchor
              href="https://danipolani.github.io/en/"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
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
              size="sm"
              fw={500}
              c="primary"
            >
              other tools
            </Anchor>{' '}
            for linguistics and conlanging.
          </Text>
        </Stack>
        <Stack gap="xs">
          <Text fw={700} size="sm">
            Resources
          </Text>
          <Anchor href="#tally-open=eqKGEx" size="sm">
            Feedback
          </Anchor>
          <Anchor component={Link} to="/privacy" size="sm">
            Privacy policy
          </Anchor>
          <Anchor href="https://github.com/tinygodsdev/metatracery" target="_blank" rel="noopener noreferrer" size="sm">
            GitHub repository
          </Anchor>
          <Anchor href="https://github.com/galaxykate/tracery" target="_blank" rel="noopener noreferrer" size="sm">
            Tracery (original)
          </Anchor>
          <Text size="xs" c="dimmed">
            MIT License · {year}
          </Text>
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
