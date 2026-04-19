import {
  Container,
  Group,
  Text,
  Anchor,
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
  const themeMode = colorScheme === 'auto' ? computedScheme : colorScheme;

  return (
    <Container fluid px="sm" py="md" mt="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Text size="sm" c="dimmed">
          Created by{' '}
          <Anchor href="https://danipolani.github.io/en/" target="_blank" rel="noopener noreferrer" fw={500}>
            Dani Polani
          </Anchor>
          {' · '}
          Inspired by{' '}
          <Anchor href="https://github.com/galaxykate/tracery" target="_blank" rel="noopener noreferrer">
            Tracery.js
          </Anchor>
        </Text>

        <Group gap="xs" wrap="nowrap">
          <SegmentedControl
            size="xs"
            value={themeMode}
            onChange={(value) => setColorScheme(value as 'light' | 'dark')}
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
          <Anchor href="https://github.com/tinygodsdev" target="_blank" rel="noopener noreferrer" size="sm">
            View on GitHub
          </Anchor>
        </Group>
      </Group>
    </Container>
  );
}
