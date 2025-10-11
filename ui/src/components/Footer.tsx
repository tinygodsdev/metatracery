import { Group, Text, Anchor, Stack } from '@mantine/core';

export function Footer() {
  return (
    <Group justify="space-between" p="md" mt="xl">
      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          Created by <Text component="span" fw={500}>Dani Polani</Text> from{' '}
          <Anchor href="https://tinygods.dev" target="_blank" rel="noopener noreferrer">
            TinyGods.Dev
          </Anchor>
        </Text>
        <Text size="xs" c="dimmed">
          Inspired by{' '}
          <Anchor href="https://github.com/galaxykate/tracery" target="_blank" rel="noopener noreferrer">
            Tracery.js
          </Anchor>
        </Text>
      </Stack>
      
      <Stack gap="xs" align="flex-end">
        <Anchor 
          href="https://github.com/tinygodsdev/metatracery" 
          target="_blank" 
          rel="noopener noreferrer"
          size="sm"
        >
          View on GitHub
        </Anchor>
        <Text size="xs" c="dimmed">
          Scientific Grammar Engine
        </Text>
      </Stack>
    </Group>
  );
}
