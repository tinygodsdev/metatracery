import { Group, Anchor, Menu, Box, useMantineTheme, useComputedColorScheme } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { IconChevronDown } from '@tabler/icons-react';
import { USE_CASES, getUseCaseByPath } from '../seo/useCases';
import { UsecaseCardOrnament } from './usecaseOrnaments';
import classes from './AppHeader.module.css';

export function AppHeader() {
  const { pathname } = useLocation();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const useCase = getUseCaseByPath(pathname);
  const ornamentPath = pathname === '/' ? '/writing-prompts' : pathname;
  const primaryColor = useCase?.ui?.primaryColor ?? 'teal';
  const shade = colorScheme === 'dark' ? 5 : 6;
  const accentStripBg =
    theme.colors[primaryColor]?.[shade] ?? theme.colors.teal[shade];

  return (
    <Box component="header" bg="var(--app-surface-1)">
      <Group justify="space-between" wrap="nowrap" align="center" py="sm" px="sm">
        <Anchor
          component={Link}
          to="/"
          fw={700}
          size="md"
          c="var(--mantine-color-text)"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <UsecaseCardOrnament path={ornamentPath} width={24} height={20} />
          Generative Grammar Engine
        </Anchor>
        <Menu shadow="md" width={220}>
          <Menu.Target>
            <Anchor
              component="button"
              type="button"
              size="md"
              c="dimmed"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Use cases
              <IconChevronDown size={16} stroke={1.5} />
            </Anchor>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item component={Link} to="/">
              Home
            </Menu.Item>
            {USE_CASES.map((uc) => (
              <Menu.Item
                key={uc.path}
                component={Link}
                to={uc.path}
                style={{
                  fontWeight: pathname === uc.path ? 600 : undefined,
                }}
              >
                {uc.h1}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Box
        style={{
          height: 1,
          background: 'var(--app-soft-border)',
        }}
      />
      {useCase && <Box className={classes.accentStrip} style={{ background: accentStripBg }} />}
    </Box>
  );
}
