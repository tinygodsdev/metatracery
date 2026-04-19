import { Box } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import type { CSSProperties, ReactNode } from 'react';

/**
 * MantineThemeProvider updates theme.primaryColor in React context, but components that fall back to
 * global CSS vars (e.g. Button without explicit variant → `--mantine-primary-color-filled`) still read
 * the root `:root` values from the app MantineProvider. Re-map those aliases to the chosen palette so
 * the whole subtree matches the route primary color.
 */
export function RoutePrimaryCssScope({
  primaryColor,
  children,
}: {
  primaryColor: MantineColor;
  children: ReactNode;
}) {
  const style = {
    '--mantine-primary-color-filled': `var(--mantine-color-${primaryColor}-filled)`,
    '--mantine-primary-color-filled-hover': `var(--mantine-color-${primaryColor}-filled-hover)`,
    '--mantine-primary-color-light': `var(--mantine-color-${primaryColor}-light)`,
    '--mantine-primary-color-light-hover': `var(--mantine-color-${primaryColor}-light-hover)`,
    '--mantine-primary-color-light-color': `var(--mantine-color-${primaryColor}-light-color)`,
  } as CSSProperties;

  return (
    <Box
      style={{
        ...style,
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}
