import { Anchor, Box, useMantineTheme, useComputedColorScheme } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { getUseCaseByPath } from '../seo/useCases';
import { UsecaseCardOrnament } from './usecaseOrnaments';
import classes from './AppHeader.module.css';

export function SiteBrandLink({ compact }: { compact?: boolean }) {
  const { pathname } = useLocation();
  const ornamentPath = pathname === '/' ? '/writing-prompts' : pathname;

  return (
    <Anchor
      component={Link}
      to="/"
      fw={700}
      size={compact ? 'sm' : 'md'}
      c="var(--mantine-color-text)"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 6 : 8,
        minWidth: 0,
        flex: compact ? '1 1 auto' : undefined,
      }}
    >
      <UsecaseCardOrnament path={ornamentPath} width={compact ? 20 : 24} height={compact ? 16 : 20} />
      Generative Grammar Engine
    </Anchor>
  );
}

/** Use-case accent line under the slim bar. */
export function AppHeaderAccentStrip() {
  const { pathname } = useLocation();
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const useCase = getUseCaseByPath(pathname);
  if (!useCase) return null;
  const primaryColor = useCase.ui?.primaryColor ?? 'teal';
  const shade = colorScheme === 'dark' ? 5 : 6;
  const accentStripBg =
    theme.colors[primaryColor]?.[shade] ?? theme.colors.teal[shade];

  return <Box className={classes.accentStrip} style={{ background: accentStripBg }} />;
}
