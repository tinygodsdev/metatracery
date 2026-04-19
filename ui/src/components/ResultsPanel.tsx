import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Stack,
  Button,
  Group,
  Text,
  Title,
  Divider,
  Accordion,
  Code,
  Alert,
  Loader,
  Center,
  NumberInput,
  NativeSelect,
  Switch,
  useMantineTheme,
  Collapse,
  Tooltip,
  Paper,
  Box,
  Checkbox,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { GrammarProcessor } from '../engine/GrammarEngine';
import type { GenerationResult } from '../engine/types';
import type { GenerationStrategy } from '../engine/Engine';
import type { UseCasePreviewConfig, UseCaseResultsContentVariant } from '../seo/useCases';
import { ResultsRenderer } from './ResultsRenderer';
import { UsecaseCardOrnament } from './usecaseOrnaments';

const RESULT_DISPLAY_MODE_OPTIONS: { value: UseCaseResultsContentVariant; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'multiline', label: 'Multiline' },
  { value: 'code', label: 'Code' },
  { value: 'svg', label: 'SVG' },
  { value: 'html', label: 'HTML' },
  { value: 'markdown', label: 'Markdown' },
];

const MODIFIERS_TOOLTIP =
  'When on, the engine runs Tracery-style modifier chains in placeholders like #noun.a# or #phrase.capitalize# (English helpers: a/an, plural -s, capitalization, ed/ing, and more). Turn off for plain expansion without post-processing.';

interface ResultsPanelProps {
  engine: GrammarProcessor | null;
  results: GenerationResult[];
  isLoading: boolean;
  onGenerate: (parameters: Record<string, string>) => void;
  onGenerateAll: (selectedParameters: Record<string, string>) => void;
  onGenerateMany: (parameters: Record<string, string>, count: number) => void;
  strategy: GenerationStrategy;
  onStrategyChange: (strategy: GenerationStrategy) => void;
  processModifiers: boolean;
  onProcessModifiersChange: (value: boolean) => void;
  /** Default `line` — single-line text cells. */
  contentVariant?: UseCaseResultsContentVariant;
  /** Preview layout for svg/html/markdown. */
  preview?: UseCasePreviewConfig;
  /** When set, caps "Generate many" (1–5 in strict use cases). */
  maxGenerateMany?: number;
  /** When false, hides "Generate all". Default true. */
  showGenerateAll?: boolean;
  /** Home page: expanded; use-case routes: collapsed by default. */
  parameterControlsDefaultExpanded?: boolean;
  /** Home only: show display mode control wired to parent state. */
  showResultDisplayModeControl?: boolean;
  homeResultDisplayMode?: UseCaseResultsContentVariant;
  onHomeResultDisplayModeChange?: (value: UseCaseResultsContentVariant) => void;
}

export function ResultsPanel({
  engine,
  results,
  isLoading,
  onGenerate,
  onGenerateAll,
  onGenerateMany,
  strategy,
  onStrategyChange,
  processModifiers,
  onProcessModifiersChange,
  contentVariant = 'line',
  preview,
  maxGenerateMany,
  showGenerateAll = true,
  parameterControlsDefaultExpanded = true,
  showResultDisplayModeControl = false,
  homeResultDisplayMode = 'line',
  onHomeResultDisplayModeChange,
}: ResultsPanelProps) {
  const theme = useMantineTheme();
  const { pathname } = useLocation();
  const ornamentPath = pathname === '/' ? '/writing-prompts' : pathname;

  const [selectedParameters, setSelectedParameters] = useState<Record<string, string>>({});
  const [generateCount, setGenerateCount] = useState<number>(10);
  const [parameterControlsOpen, setParameterControlsOpen] = useState(parameterControlsDefaultExpanded);
  const [showResultParameters, setShowResultParameters] = useState(false);

  const parameters = engine?.getParameters() || {};
  const stats = engine?.getParameterStatistics();

  /** Drop selections that no longer match the current grammar (e.g. after renames). */
  const validatedParameterConstraints = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(selectedParameters)) {
      const param = parameters[k];
      if (!param || !param.values.includes(v)) continue;
      out[k] = v;
    }
    return out;
  }, [parameters, selectedParameters]);

  const filterableParameters = Object.entries(parameters).filter(([_, param]) => param.values.length > 1);
  const singleValueParameters = Object.entries(parameters).filter(([_, param]) => param.values.length === 1);

  const getActualCombinationCount = (): number => {
    if (!engine) return 0;
    try {
      return engine.getTotalCombinations('origin', selectedParameters);
    } catch (err) {
      console.error('Error calculating combination count:', err);
      return 0;
    }
  };

  const actualCombinations = getActualCombinationCount();

  const generateManyHardMax = maxGenerateMany !== undefined ? Math.min(maxGenerateMany, 100) : 100;
  const generateManyMax = Math.min(generateManyHardMax, Math.max(1, actualCombinations));

  const getRelevantParameters = (result: GenerationResult): Record<string, unknown> =>
    result.metadata.relevantParameters || {};

  const getModifierApplications = (result: GenerationResult) => result.metadata.modifierApplications ?? [];

  useEffect(() => {
    setSelectedParameters({});
  }, [engine]);

  useEffect(() => {
    setGenerateCount((c) => Math.min(Math.max(1, c), generateManyMax));
  }, [generateManyMax, engine]);

  const handleParameterChange = (paramName: string, value: string) => {
    setSelectedParameters((prev) => {
      if (value === '') {
        const { [paramName]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [paramName]: value };
    });
  };

  const handleGenerateWithParams = () => {
    const allParameters = { ...validatedParameterConstraints };
    singleValueParameters.forEach(([name, param]) => {
      allParameters[name] = param.values[0];
    });
    onGenerate(allParameters);
  };

  const handleGenerateMany = () => {
    const allParameters = { ...validatedParameterConstraints };
    singleValueParameters.forEach(([name, param]) => {
      allParameters[name] = param.values[0];
    });
    const n = Math.min(Math.max(1, generateCount), generateManyMax);
    onGenerateMany(allParameters, n);
  };

  const exportResults = () => {
    if (results.length === 0) return;

    const allParamNames = new Set<string>();
    results.forEach((result) => {
      const relevantParams = getRelevantParameters(result) as Record<string, unknown>;
      Object.keys(relevantParams).forEach((param) => allParamNames.add(param));
    });

    const headers = [
      'index',
      'generated_text',
      ...Array.from(allParamNames).sort(),
      'generation_time_ms',
      'generation_path',
    ];

    const csvRows = [headers.join(',')];

    results.forEach((result, index) => {
      const relevantParams = getRelevantParameters(result) as Record<string, string>;
      const row = [
        index + 1,
        `"${result.content.replace(/"/g, '""')}"`,
        ...Array.from(allParamNames)
          .sort()
          .map((paramName) => `"${(relevantParams[paramName] ?? '').toString().replace(/"/g, '""')}"`),
        result.metadata.generationTime || 0,
        `"${result.metadata.generationPath.join(' → ').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grammar-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalCombinations = engine ? engine.getTotalCombinations('origin') : 0;

  const parametersBlock =
    filterableParameters.length === 0 ? (
      <Text size="sm" c="dimmed">
        No adjustable parameters.
      </Text>
    ) : (
      <Box
        maw={1200}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 'var(--mantine-spacing-md)',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        {filterableParameters.map(([name, param]) => (
          <Stack
            key={name}
            gap={6}
            style={{ minWidth: 0 }}
          >
            <Text fw={500} size="sm">
              {name}
            </Text>
            <NativeSelect
              size="xs"
              value={selectedParameters[name] ?? ''}
              onChange={(e) => handleParameterChange(name, e.currentTarget.value)}
              data={[
                { value: '', label: 'Random' },
                ...param.values.map((value) => ({ value, label: value })),
              ]}
            />
          </Stack>
        ))}
      </Box>
    );

  if (!engine) {
    return (
      <Alert color="blue">
        <Text size="sm">Load a valid grammar to start generating results.</Text>
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
        <Group gap="md" align="center" wrap="wrap">
          <Title order={2} size="h3" fw={600} style={{ lineHeight: 1.2 }}>
            Results
          </Title>
          {showResultDisplayModeControl && onHomeResultDisplayModeChange && (
            <Group gap={6} align="center" wrap="nowrap">
              <Text size="sm" c="dimmed">
                Display
              </Text>
              <NativeSelect
                size="xs"
                w={160}
                aria-label="Result display mode"
                title="How each generated cell is shown (home page only)"
                value={homeResultDisplayMode}
                onChange={(e) =>
                  onHomeResultDisplayModeChange(e.currentTarget.value as UseCaseResultsContentVariant)
                }
                data={RESULT_DISPLAY_MODE_OPTIONS}
              />
            </Group>
          )}
          <Checkbox
            size="sm"
            label="Show parameters"
            checked={showResultParameters}
            onChange={(e) => setShowResultParameters(e.currentTarget.checked)}
          />
        </Group>
        {results.length > 0 && (
          <Button size="sm" variant="default" onClick={exportResults}>
            Export CSV ({results.length})
          </Button>
        )}
      </Group>

      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="xs" align="center" wrap="wrap">
          <Button size="sm" variant="filled" onClick={handleGenerateWithParams} disabled={isLoading}>
            Generate
          </Button>
          <Group gap="xs" wrap="nowrap">
            <NumberInput
              size="sm"
              value={generateCount}
              onChange={(value) => setGenerateCount(typeof value === 'number' ? value : generateManyMax)}
              min={1}
              max={generateManyMax}
              w={80}
              placeholder="Count"
              title={`Generate multiple results (1–${generateManyMax})`}
            />
            <Button
              size="sm"
              variant="default"
              onClick={handleGenerateMany}
              disabled={isLoading || generateCount < 1 || generateCount > generateManyMax}
              title={`Generate ${Math.min(generateCount, generateManyMax)} results`}
            >
              Generate Many ({Math.min(generateCount, generateManyMax)})
            </Button>
          </Group>
          {showGenerateAll && (
            <Button
              size="sm"
              variant="subtle"
              onClick={() => onGenerateAll(validatedParameterConstraints)}
              disabled={isLoading || actualCombinations > 100}
              title={
                actualCombinations > 100
                  ? `Too many combinations (${actualCombinations}). Use more specific parameters.`
                  : undefined
              }
            >
              Generate All ({actualCombinations})
            </Button>
          )}
        </Group>

        <Button
          variant="subtle"
          size="sm"
          rightSection={
            parameterControlsOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />
          }
          aria-expanded={parameterControlsOpen}
          aria-label={parameterControlsOpen ? 'Collapse Advanced' : 'Expand Advanced'}
          onClick={() => setParameterControlsOpen((o) => !o)}
        >
          Advanced
        </Button>
      </Group>

      <Collapse in={parameterControlsOpen}>
        <Stack gap="md" pt="xs">
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            {singleValueParameters.length > 0 ? (
              <Text
                size="sm"
                c="dimmed"
                lh={1.4}
                title={`Fixed parameters: ${singleValueParameters.map(([name, param]) => `${name}=${param.values[0]}`).join(', ')}`}
              >
                {singleValueParameters.length} fixed parameter{singleValueParameters.length !== 1 ? 's' : ''}
              </Text>
            ) : (
              <div />
            )}
            <Group gap={6} align="center" wrap="wrap">
              <NativeSelect
                size="xs"
                w={120}
                value={strategy}
                onChange={(e) => onStrategyChange(e.currentTarget.value as GenerationStrategy)}
                title="Generation strategy: Uniform gives equal probability to each option, Weighted favors options that generate more strings"
                data={[
                  { value: 'uniform', label: 'Uniform' },
                  { value: 'weighted', label: 'Weighted' },
                ]}
              />
              <Tooltip label={MODIFIERS_TOOLTIP} multiline w={280} position="bottom" withArrow>
                <Switch
                  size="xs"
                  checked={processModifiers}
                  onChange={(e) => onProcessModifiersChange(e.currentTarget.checked)}
                  label="Modifiers"
                />
              </Tooltip>
            </Group>
          </Group>

          <Stack gap="xs">
            <Text fw={600} size="sm">
              Parameters ({filterableParameters.length})
            </Text>
            {parametersBlock}
          </Stack>

          {stats && (
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Total combinations: {totalCombinations}
              </Text>
              <Text
                size="sm"
                c={actualCombinations !== totalCombinations ? 'primary' : 'dimmed'}
              >
                With selected parameters: {actualCombinations}
              </Text>
              {singleValueParameters.length > 0 && (
                <Text size="sm" c="dimmed">
                  Fixed: {singleValueParameters.map(([name, param]) => `${name}=${param.values[0]}`).join(', ')}
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Collapse>

      <Paper p="md" radius="md" bg="var(--app-surface-3)" withBorder={false} shadow="xs">
        {isLoading ? (
          <Center h={200}>
            <Stack align="center">
              <Loader size="md" color={theme.primaryColor} />
              <Text size="sm" c="dimmed">
                Generating results...
              </Text>
            </Stack>
          </Center>
        ) : results.length === 0 ? (
          <Box ta="center" py="xl">
            <Box style={{ opacity: 0.18, color: 'var(--mantine-primary-color-filled)' }}>
              <UsecaseCardOrnament path={ornamentPath} width={96} height={80} />
            </Box>
            <Text size="sm" c="dimmed" mt="md">
              No results yet — press Generate to start.
            </Text>
          </Box>
        ) : (
          <ResultsRenderer
            contentVariant={contentVariant}
            results={results}
            theme={theme}
            preview={preview}
            showParameters={showResultParameters}
            getRelevantParameters={getRelevantParameters}
            getModifierApplications={(r) => getModifierApplications(r) ?? []}
          />
        )}
      </Paper>

      {results.length > 0 && (
        <Accordion
          variant="default"
          styles={{
            item: {
              backgroundColor: 'var(--app-surface-1)',
              border: 'none',
              borderRadius: 'var(--mantine-radius-md)',
            },
            control: {
              borderRadius: 'var(--mantine-radius-md)',
            },
            panel: {
              paddingTop: 0,
            },
          }}
        >
          <Accordion.Item value="metadata">
            <Accordion.Control>
              <Text size="sm">Generation Details</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                {results.map((result, index) => (
                  <Stack key={index} gap="xs">
                    <Text size="sm" fw={500} mb="xs">
                      Result {index + 1}
                    </Text>
                    <Stack gap="xs">
                      <div>
                        <Text size="sm" c="dimmed">
                          Generation Path:
                        </Text>
                        <Code>{result.metadata.generationPath.join(' → ')}</Code>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed" mb={4}>
                          Relevant Parameters:
                        </Text>
                        <Text size="xs" c="dimmed" lh={1.45}>
                          {Object.entries(getRelevantParameters(result)).map(([key, value], i) => (
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
                      </div>
                      {getModifierApplications(result).length > 0 && (
                        <div>
                          <Text size="sm" c="dimmed">
                            Modifiers applied:
                          </Text>
                          <Stack gap={6} mt={4}>
                            {getModifierApplications(result).map((app, i) => (
                              <Text key={i} size="sm">
                                <Text component="span" fw={600}>
                                  #{app.rule}.{app.modifiers.join('.')}#
                                </Text>
                                {' — '}
                                <Code>{app.expandedText}</Code>
                                {' → '}
                                <Code>{app.resultText}</Code>
                              </Text>
                            ))}
                          </Stack>
                        </div>
                      )}
                      <div>
                        <Text size="sm" c="dimmed">
                          Applied Rules:
                        </Text>
                        <Text size="sm">{result.metadata.appliedRules.length} rules</Text>
                      </div>
                      {result.metadata.structure && (
                        <div>
                          <Text size="sm" c="dimmed">
                            Structure:
                          </Text>
                          <Text size="sm">
                            Length: {result.metadata.structure.length}, Words: {result.metadata.structure.wordCount}
                          </Text>
                        </div>
                      )}
                    </Stack>
                    {index < results.length - 1 && <Divider />}
                  </Stack>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
    </Stack>
  );
}
