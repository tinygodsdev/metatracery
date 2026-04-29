import { useCallback, useState, type ReactNode } from 'react';
import { ActionIcon, Anchor, Box, Collapse, Group, Text, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconChevronDown } from '@tabler/icons-react';
import { AppHeaderAccentStrip, SiteBrandLink } from './AppHeader';
import { AppChromeSlimFooter } from './Footer';

const CHROME_EXPANDED_KEY = 'gge-workspace-chrome-expanded';

function readChromeExpanded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CHROME_EXPANDED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeChromeExpanded(value: boolean) {
  try {
    localStorage.setItem(CHROME_EXPANDED_KEY, value ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export interface CollapsibleWorkspaceChromeProps {
  /** Full header block: site header, hero, discovery cards, alerts (scrolls when expanded). */
  expandedContent: ReactNode;
  /** Main workspace: editor + results columns (fills remaining viewport height). */
  workspace: ReactNode;
  onOpenStoredData: () => void;
  onOpenHelp: () => void;
  /** When set, shows an error hint on the slim bar while chrome is collapsed. */
  collapsedErrorMessage?: string | null;
}

export function CollapsibleWorkspaceChrome({
  expandedContent,
  workspace,
  onOpenStoredData,
  onOpenHelp,
  collapsedErrorMessage,
}: CollapsibleWorkspaceChromeProps) {
  const [expanded, setExpanded] = useState(readChromeExpanded);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      writeChromeExpanded(next);
      return next;
    });
  }, []);

  return (
    <Box
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          flexShrink: 0,
          background: 'var(--app-surface-1)',
          borderBottom: '1px solid var(--app-soft-border)',
          zIndex: 5,
        }}
      >
        <Group justify="space-between" wrap="nowrap" align="center" gap="xs" px="xs" h={40}>
          <Group gap={4} wrap="nowrap" align="center" style={{ minWidth: 0, flexShrink: 1 }}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={toggle}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse page header' : 'Expand page header'}
              title={expanded ? 'Collapse' : 'Expand header, hero, and use cases'}
            >
              <IconChevronDown
                size={18}
                stroke={1.5}
                style={{
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 160ms ease',
                }}
              />
            </ActionIcon>
            <SiteBrandLink compact />
          </Group>
          <Box
            visibleFrom="sm"
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              justifyContent: 'center',
              paddingInline: 4,
            }}
          >
            <Text
              size="xs"
              ta="center"
              lh={1.25}
              truncate
              maw="min(42vw, 28rem)"
            >
              Created by{' '}
              <Anchor
                href="https://danipolani.github.io/en/"
                target="_blank"
                rel="noopener noreferrer"
                size="xs"
                fw={500}
                c="primary"
              >
                Dani
              </Anchor>
              . See{' '}
              <Anchor
                href="https://danipolani.github.io/en/blog/tools/"
                target="_blank"
                rel="noopener noreferrer"
                size="xs"
                fw={500}
                c="primary"
              >
                other tools
              </Anchor>{' '}
              for linguistics and conlanging.
            </Text>
          </Box>
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            {collapsedErrorMessage && !expanded && (
              <Tooltip label={collapsedErrorMessage} multiline maw={320} withArrow>
                <IconAlertCircle size={18} color="var(--mantine-color-red-6)" aria-label="Error" />
              </Tooltip>
            )}
            <AppChromeSlimFooter onOpenStoredData={onOpenStoredData} onOpenHelp={onOpenHelp} />
          </Group>
        </Group>
        <AppHeaderAccentStrip />
        <Collapse in={expanded}>
          <Box
            style={{
              maxHeight: 'min(44dvh, 480px)',
              overflowY: 'auto',
              borderTop: '1px solid var(--app-soft-border)',
            }}
            px="sm"
            pb="sm"
            pt="xs"
          >
            {expandedContent}
          </Box>
        </Collapse>
      </Box>

      <Box
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {workspace}
      </Box>
    </Box>
  );
}
