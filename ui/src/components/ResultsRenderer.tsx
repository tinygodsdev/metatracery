import { useMemo, type CSSProperties } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Code,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  Tooltip,
  type MantineColor,
  type MantineTheme,
  rem,
  useComputedColorScheme,
} from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { marked } from 'marked';
import { notifications } from '@mantine/notifications';
import type { GenerationResult, ModifierApplication } from '../engine/types';
import type { UseCasePreviewConfig, UseCaseResultsContentVariant } from '../seo/useCases';
import { sanitizeHtml, sanitizeSvg } from '../lib/sanitize';
import classes from './ResultsRenderer.module.css';

export interface ResultsRendererProps {
  contentVariant: UseCaseResultsContentVariant;
  results: GenerationResult[];
  theme: MantineTheme;
  preview?: UseCasePreviewConfig;
  /** When false, hides per-result parameter summaries (all content variants). Default false. */
  showParameters?: boolean;
  getRelevantParameters: (result: GenerationResult) => Record<string, unknown>;
  getModifierApplications: (result: GenerationResult) => ModifierApplication[];
}

async function copyText(label: string, text: string, color: MantineColor) {
  try {
    await navigator.clipboard.writeText(text);
    notifications.show({ message: `${label} copied`, color });
  } catch {
    notifications.show({ message: 'Could not copy', color: 'red' });
  }
}

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Inline dimmed parameter list — avoids a grid of bordered badges. */
function ParameterLine({
  result,
  getRelevantParameters,
  getModifierApplications,
}: Pick<
  ResultsRendererProps,
  'getRelevantParameters' | 'getModifierApplications'
> & { result: GenerationResult }) {
  const params = Object.entries(getRelevantParameters(result));
  const mods = getModifierApplications(result);

  return (
    <Stack gap={6}>
      {params.length > 0 && (
        <Text size="xs" c="dimmed" lh={1.45}>
          {params.map(([key, value], i) => (
            <span key={key}>
              {i > 0 && ' · '}
              <Text component="span" tt="uppercase" fz={11} fw={600}>
                {key}
              </Text>
              <Text component="span" tt="none">
                : {String(value)}
              </Text>
            </span>
          ))}
        </Text>
      )}
      {mods.length > 0 && (
        <Group gap={6} wrap="wrap">
          {mods.map((app, i) => (
            <Badge key={`mod-${i}`} size="xs" variant="light" color="gray" title={`${app.expandedText} → ${app.resultText}`}>
              {app.rule}: {app.modifiers.join('.')}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  );
}

function previewShellStyle(
  preview: UseCasePreviewConfig | undefined,
  theme: MantineTheme,
  colorScheme: 'light' | 'dark',
): CSSProperties {
  const minH = preview?.minHeight ?? 160;
  const ar = preview?.aspectRatio ?? 1;
  const bg = preview?.background ?? 'default';
  const stripe = colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2];
  const stripeBg = colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0];

  const base: CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: minH,
    aspectRatio: `${ar}`,
    maxHeight: 420,
    borderRadius: 'var(--mantine-radius-sm)',
    overflow: 'hidden',
    border: '1px solid var(--app-soft-border)',
  };

  if (bg === 'checker') {
    return {
      ...base,
      backgroundColor: stripeBg,
      backgroundImage: `
        linear-gradient(45deg, ${stripe} 25%, transparent 25%),
        linear-gradient(-45deg, ${stripe} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${stripe} 75%),
        linear-gradient(-45deg, transparent 75%, ${stripe} 75%)`,
      backgroundSize: '14px 14px',
      backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0',
    };
  }
  if (bg === 'dark') {
    return {
      ...base,
      backgroundColor: theme.colors.dark[7],
    };
  }
  return {
    ...base,
    backgroundColor: 'var(--app-surface-2)',
  };
}

export function ResultsRenderer({
  contentVariant,
  results,
  theme,
  preview,
  showParameters = false,
  getRelevantParameters,
  getModifierApplications,
}: ResultsRendererProps) {
  const colorScheme = useComputedColorScheme('light');
  const scheme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
  const shell = useMemo(() => previewShellStyle(preview, theme, scheme), [preview, theme, scheme]);

  const nestedPaperProps = {
    withBorder: false as const,
    bg: 'var(--app-surface-2)',
    radius: 'sm' as const,
  };

  if (contentVariant === 'multiline') {
    return (
      <ScrollArea.Autosize mah={520} type="auto" offsetScrollbars>
        <Stack gap="md">
          {results.map((result, index) => (
            <Paper key={index} {...nestedPaperProps} p="md">
              <Stack gap="sm">
                <Text size="sm" tt="uppercase" c="dimmed" fw={600}>
                  Content
                </Text>
                <Box pos="relative">
                  <Tooltip label="Copy to clipboard">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      pos="absolute"
                      top={8}
                      right={8}
                      style={{ zIndex: 1 }}
                      aria-label="Copy content"
                      onClick={() => copyText('Content', result.content, theme.primaryColor)}
                    >
                      <IconCopy size={16} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                  <Textarea
                    value={result.content}
                    readOnly
                    autosize
                    minRows={3}
                    maxRows={18}
                    size="sm"
                    styles={{
                      input: {
                        fontWeight: 500,
                        cursor: 'default',
                        width: '100%',
                        fontSize: 'var(--mantine-font-size-md)',
                        lineHeight: 1.55,
                        paddingRight: rem(40),
                        paddingTop: rem(10),
                      },
                    }}
                  />
                </Box>
                {showParameters && (
                  <>
                    <Text size="sm" tt="uppercase" c="dimmed" fw={600}>
                      Parameters
                    </Text>
                    <ParameterLine
                      result={result}
                      getRelevantParameters={getRelevantParameters}
                      getModifierApplications={getModifierApplications}
                    />
                  </>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    );
  }

  if (contentVariant === 'code') {
    return (
      <ScrollArea.Autosize mah={520} type="auto" offsetScrollbars>
        <Stack gap="md">
          {results.map((result, index) => (
            <Paper key={index} {...nestedPaperProps} p="md">
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="sm" tt="uppercase" c="dimmed" fw={600}>
                    Source
                  </Text>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => copyText('Source', result.content, theme.primaryColor)}
                  >
                    Copy
                  </Button>
                </Group>
                <Code
                  block
                  fz="md"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 360,
                    overflow: 'auto',
                    lineHeight: 1.55,
                  }}
                >
                  {result.content}
                </Code>
                {showParameters && (
                  <ParameterLine
                    result={result}
                    getRelevantParameters={getRelevantParameters}
                    getModifierApplications={getModifierApplications}
                  />
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    );
  }

  if (contentVariant === 'svg') {
    return (
      <ScrollArea.Autosize mah={560} type="auto" offsetScrollbars>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {results.map((result, index) => {
            const safe = sanitizeSvg(result.content.trim());
            return (
              <Paper key={index} {...nestedPaperProps} p="sm">
                <Stack gap="xs">
                  <Box style={shell}>
                    <Box
                      className={classes.svgEmbed}
                      p="xs"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%',
                      }}
                      dangerouslySetInnerHTML={{ __html: safe }}
                    />
                  </Box>
                  <Group gap="xs" wrap="wrap">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => copyText('SVG', result.content, theme.primaryColor)}
                    >
                      Copy source
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => downloadText(`result-${index + 1}.svg`, result.content, 'image/svg+xml')}
                    >
                      Download .svg
                    </Button>
                  </Group>
                  {showParameters && (
                    <ParameterLine
                      result={result}
                      getRelevantParameters={getRelevantParameters}
                      getModifierApplications={getModifierApplications}
                    />
                  )}
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>
      </ScrollArea.Autosize>
    );
  }

  if (contentVariant === 'html') {
    return (
      <ScrollArea.Autosize mah={560} type="auto" offsetScrollbars>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {results.map((result, index) => (
            <Paper key={index} {...nestedPaperProps} p="sm">
              <Stack gap="xs">
                <Box
                  style={{
                    ...shell,
                    minHeight: preview?.minHeight ?? 200,
                  }}
                >
                  <iframe
                    title={`HTML preview ${index + 1}`}
                    sandbox=""
                    loading="lazy"
                    srcDoc={result.content}
                    style={{
                      border: 'none',
                      width: '100%',
                      height: '100%',
                      minHeight: preview?.minHeight ?? 200,
                    }}
                  />
                </Box>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => copyText('HTML', result.content, theme.primaryColor)}
                >
                  Copy source
                </Button>
                {showParameters && (
                  <ParameterLine
                    result={result}
                    getRelevantParameters={getRelevantParameters}
                    getModifierApplications={getModifierApplications}
                  />
                )}
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </ScrollArea.Autosize>
    );
  }

  if (contentVariant === 'markdown') {
    return (
      <ScrollArea.Autosize mah={520} type="auto" offsetScrollbars>
        <Stack gap="md">
          {results.map((result, index) => {
            const rawHtml = marked.parse(result.content, { async: false }) as string;
            const safe = sanitizeHtml(rawHtml);
            return (
              <Paper key={index} {...nestedPaperProps} p="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
                    <div
                      className={classes.markdownBody}
                      dangerouslySetInnerHTML={{ __html: safe }}
                    />
                    <Button
                      size="xs"
                      variant="light"
                      style={{ flexShrink: 0 }}
                      onClick={() => copyText('Markdown', result.content, theme.primaryColor)}
                    >
                      Copy markdown
                    </Button>
                  </Group>
                  {showParameters && (
                    <ParameterLine
                      result={result}
                      getRelevantParameters={getRelevantParameters}
                      getModifierApplications={getModifierApplications}
                    />
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
    );
  }

  /* line (default) */
  return (
    <ScrollArea.Autosize mah={400} type="auto" offsetScrollbars>
      <Table highlightOnHover withTableBorder={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Content</Table.Th>
            {showParameters && <Table.Th>Parameters</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {results.map((result, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Group gap={6} wrap="wrap" align="center" justify="flex-start">
                  <Text fz="md" lh={1.55} fw={500} component="span" style={{ wordBreak: 'break-word' }}>
                    {result.content}
                  </Text>
                  <Tooltip label="Copy to clipboard">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      style={{ flexShrink: 0 }}
                      aria-label="Copy content"
                      onClick={() => copyText('Content', result.content, theme.primaryColor)}
                    >
                      <IconCopy size={16} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
              {showParameters && (
                <Table.Td>
                  <ParameterLine
                    result={result}
                    getRelevantParameters={getRelevantParameters}
                    getModifierApplications={getModifierApplications}
                  />
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>
  );
}
