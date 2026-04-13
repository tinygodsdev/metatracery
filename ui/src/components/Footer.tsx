import {
  Container,
  Group,
  Text,
  Anchor,
  Stack,
  SegmentedControl,
  useMantineColorScheme,
  useComputedColorScheme,
  Center,
} from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function Footer() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme('light');
  const themeMode =
    colorScheme === 'auto' ? computedScheme : colorScheme;

  return (
    <Container fluid px="sm" py="md" mt="md">
      <Group justify="space-between" align="flex-end" wrap="wrap">
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
          <SegmentedControl
            size="xs"
            value={themeMode}
            onChange={(value) =>
              setColorScheme(value as 'light' | 'dark')
            }
            data={[
              {
                value: 'light',
                label: (
                  <Center>
                    <IconSun size={14} stroke={1.5} aria-hidden />
                  </Center>
                ),
              },
              {
                value: 'dark',
                label: (
                  <Center>
                    <IconMoon size={14} stroke={1.5} aria-hidden />
                  </Center>
                ),
              },
            ]}
            aria-label="Color scheme"
          />
          <Anchor
            href="https://github.com/tinygodsdev/metatracery"
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
          >
            View on GitHub
          </Anchor>
          <Text size="xs" c="dimmed">
            Generative Grammar Engine
          </Text>
        </Stack>
      </Group>
    </Container>
  );
}
