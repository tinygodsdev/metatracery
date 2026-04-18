import { useMemo, type CSSProperties } from 'react';
import {
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
  type MantineColor,
  type MantineTheme,
  useComputedColorScheme,
} from '@mantine/core';
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

function ParameterBadges({
  result,
  getRelevantParameters,
  getModifierApplications,
  theme,
}: Pick<
  ResultsRendererProps,
  'getRelevantParameters' | 'getModifierApplications' | 'theme'
> & { result: GenerationResult }) {
  return (
    <Group gap={4} wrap="wrap">
      {Object.entries(getRelevantParameters(result)).map(([key, value]) => (
        <Badge key={key} size="xs" variant="light">
          {key}: {String(value)}
        </Badge>
      ))}
      {getModifierApplications(result).map((app, i) => (
        <Badge
          key={`mod-${i}`}
          size="xs"
          variant="outline"
          color={theme.primaryColor}
          title={`${app.expandedText} → ${app.resultText}`}
        >
          {app.rule}: {app.modifiers.join('.')}
        </Badge>
      ))}
    </Group>
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
    border: '1px solid var(--mantine-color-default-border)',
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
    backgroundColor: 'var(--mantine-color-body)',
  };
}

export function ResultsRenderer({
  contentVariant,
  results,
  theme,
  preview,
  getRelevantParameters,
  getModifierApplications,
}: ResultsRendererProps) {
  const colorScheme = useComputedColorScheme('light');
  const scheme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
  const shell = useMemo(() => previewShellStyle(preview, theme, scheme), [preview, theme, scheme]);

  if (contentVariant === 'multiline') {
    return (
      <ScrollArea.Autosize mah={520} type="auto" offsetScrollbars>
        <Stack gap="md">
          {results.map((result, index) => (
            <Paper key={index} withBorder p="md" radius="sm">
              <Stack gap="sm">
                <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                  Content
                </Text>
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
                    },
                  }}
                />
                <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
                  Parameters
                </Text>
                <ParameterBadges
                  result={result}
                  getRelevantParameters={getRelevantParameters}
                  getModifierApplications={getModifierApplications}
                  theme={theme}
                />
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
            <Paper key={index} withBorder p="md" radius="sm">
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
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
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 360,
                    overflow: 'auto',
                  }}
                >
                  {result.content}
                </Code>
                <ParameterBadges
                  result={result}
                  getRelevantParameters={getRelevantParameters}
                  getModifierApplications={getModifierApplications}
                  theme={theme}
                />
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
              <Paper key={index} withBorder p="sm" radius="sm">
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
                  <ParameterBadges
                    result={result}
                    getRelevantParameters={getRelevantParameters}
                    getModifierApplications={getModifierApplications}
                    theme={theme}
                  />
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
            <Paper key={index} withBorder p="sm" radius="sm">
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
                <ParameterBadges
                  result={result}
                  getRelevantParameters={getRelevantParameters}
                  getModifierApplications={getModifierApplications}
                  theme={theme}
                />
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
              <Paper key={index} withBorder p="md" radius="sm">
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
                  <ParameterBadges
                    result={result}
                    getRelevantParameters={getRelevantParameters}
                    getModifierApplications={getModifierApplications}
                    theme={theme}
                  />
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
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Content</Table.Th>
            <Table.Th>Parameters</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {results.map((result, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {result.content}
                </Text>
              </Table.Td>
              <Table.Td>
                <ParameterBadges
                  result={result}
                  getRelevantParameters={getRelevantParameters}
                  getModifierApplications={getModifierApplications}
                  theme={theme}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>
  );
}
