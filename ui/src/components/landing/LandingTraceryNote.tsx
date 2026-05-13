import { Anchor, List, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

import { FLEXIBLE_EDITOR_PATH } from '../../seo/useCases';

export function LandingTraceryNote() {
  return (
    <section id="tracery" aria-labelledby="tracery-heading">
      <Stack gap="md">
        <Title order={2} id="tracery-heading" size="h3">
          A modern Tracery alternative
        </Title>
        <Text size="md" c="dimmed" lh={1.55}>
          If you know{' '}
          <Anchor href="https://github.com/galaxykate/tracery" target="_blank" rel="noopener noreferrer">
            Tracery
          </Anchor>
          , the JSON shape will feel familiar. This workspace adds a{' '}
          <Anchor component={Link} to={FLEXIBLE_EDITOR_PATH}>
            Tracery-style online editor
          </Anchor>{' '}
          with graph and JSON views, batch tooling, and richer previews — a practical alternative when you want a better
          Tracery UI in the browser.
        </Text>
        <List spacing="sm" size="md" c="dimmed">
          <List.Item>Interactive grammar graph alongside the JSON editor</List.Item>
          <List.Item>Batch rolls and parameter exploration with CSV export</List.Item>
          <List.Item>SVG, Markdown, and HTML result previews</List.Item>
          <List.Item>Built-in modifiers compatible with the usual Tracery-style chains</List.Item>
        </List>
      </Stack>
    </section>
  );
}
