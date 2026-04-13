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
  ActionIcon,
} from '@mantine/core';
import { IconDatabase, IconMoon, IconSun } from '@tabler/icons-react';

interface FooterProps {
  onOpenStoredData: () => void;
}

export function Footer({ onOpenStoredData }: FooterProps) {
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
          <Group gap="xs" wrap="nowrap">
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
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="xl"
              aria-label="Data stored in this browser"
              title="Data stored in this browser"
              onClick={onOpenStoredData}
            >
              <IconDatabase size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
          <Anchor
            href="https://github.com/tinygodsdev"
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
