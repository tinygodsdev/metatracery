import {
  Group,
  Anchor,
  Text,
  Box,
  SegmentedControl,
  useMantineColorScheme,
  useComputedColorScheme,
  Center,
  ActionIcon,
} from '@mantine/core';
import { IconBrandGithub, IconDatabase, IconMoon, IconSun } from '@tabler/icons-react';

/** Theme, stored data, GitHub icon, and attribution — for the top slim bar. */
export function AppChromeSlimFooter({ onOpenStoredData }: { onOpenStoredData: () => void }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme('light');
  const themeMode = colorScheme === 'auto' ? computedScheme : colorScheme;

  return (
    <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
      <Box visibleFrom="sm" miw={0} style={{ maxWidth: 200 }}>
        <Text size="xs" c="dimmed" truncate>
          Created by{' '}
          <Anchor
            href="https://danipolani.github.io/en/"
            target="_blank"
            rel="noopener noreferrer"
            size="xs"
            fw={500}
            c="dimmed"
            style={{ whiteSpace: 'nowrap' }}
          >
            Dani
          </Anchor>
        </Text>
      </Box>
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
        size="sm"
        radius="xl"
        aria-label="Data stored in this browser"
        title="Data stored in this browser"
        onClick={onOpenStoredData}
      >
        <IconDatabase size={16} stroke={1.5} />
      </ActionIcon>
      <ActionIcon
        component="a"
        href="https://github.com/tinygodsdev"
        target="_blank"
        rel="noopener noreferrer"
        variant="subtle"
        color="gray"
        size="sm"
        radius="xl"
        aria-label="GitHub repository"
        title="GitHub"
      >
        <IconBrandGithub size={18} stroke={1.2} aria-hidden />
      </ActionIcon>
    </Group>
  );
}
