import {
  Group,
  SegmentedControl,
  Tooltip,
  useMantineColorScheme,
  useComputedColorScheme,
  Center,
  ActionIcon,
} from '@mantine/core';
import { IconBrandGithub, IconDatabase, IconHelp, IconMoon, IconSun } from '@tabler/icons-react';

/** Theme, help, stored data, GitHub — for the top slim bar. */
export function AppChromeSlimFooter({
  onOpenStoredData,
  onOpenHelp,
}: {
  onOpenStoredData: () => void;
  onOpenHelp: () => void;
}) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme('light');
  const themeMode = colorScheme === 'auto' ? computedScheme : colorScheme;

  return (
    <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
      <Tooltip label="How to use this tool">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          radius="xl"
          aria-label="Open documentation"
          onClick={onOpenHelp}
        >
          <IconHelp size={18} stroke={1.5} aria-hidden />
        </ActionIcon>
      </Tooltip>
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
