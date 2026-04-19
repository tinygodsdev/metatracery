import type { CSSVariablesResolver } from '@mantine/core';
import { defaultCssVariablesResolver } from '@mantine/core';

/**
 * Semantic app backgrounds — only Mantine theme tokens (gray / dark scale + white).
 * Mapped per color scheme in the resolver so light and dark stay consistent with the design system.
 *
 * Hierarchy (darkest → lightest):
 * - --app-surface-0: full-page chrome behind the app
 * - --app-surface-1: header, discovery cards, accordion wells
 * - --app-surface-2: main column panels (Grammar / Results)
 * - --app-surface-3: nested “raised” blocks (results output area)
 */
export const appSurfaceVariablesResolver: CSSVariablesResolver = (theme) => {
  const base = defaultCssVariablesResolver(theme);
  return {
    variables: {
      ...base.variables,
    },
    light: {
      ...base.light,
      '--app-surface-0': theme.colors.gray[1],
      '--app-surface-1': theme.white,
      '--app-surface-2': theme.colors.gray[0],
      '--app-surface-3': theme.colors.gray[1],
      '--app-accent-tint': 'color-mix(in srgb, var(--mantine-primary-color-filled) 3%, transparent)',
      '--app-soft-border': 'color-mix(in srgb, var(--mantine-color-default-border) 55%, transparent)',
    },
    dark: {
      ...base.dark,
      '--app-surface-0': 'var(--mantine-color-dark-9)',
      '--app-surface-1': 'var(--mantine-color-dark-7)',
      '--app-surface-2': 'var(--mantine-color-dark-6)',
      '--app-surface-3': 'var(--mantine-color-dark-5)',
      '--app-accent-tint': 'color-mix(in srgb, var(--mantine-primary-color-filled) 5%, transparent)',
      '--app-soft-border': 'color-mix(in srgb, var(--mantine-color-default-border) 55%, transparent)',
    },
  };
};
