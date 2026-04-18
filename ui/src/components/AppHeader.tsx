import { Group, Anchor, Menu, Box } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { IconChevronDown } from '@tabler/icons-react';
import { USE_CASES } from '../seo/useCases';

export function AppHeader() {
  const { pathname } = useLocation();

  return (
    <Box
      component="header"
      py="xs"
      px="sm"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Anchor component={Link} to="/" fw={700} size="sm" c="var(--mantine-color-text)">
          Generative Grammar Engine
        </Anchor>
        <Menu shadow="md" width={220}>
          <Menu.Target>
            <Anchor
              component="button"
              type="button"
              size="sm"
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
              <IconChevronDown size={14} stroke={1.5} />
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
    </Box>
  );
}
