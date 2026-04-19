import { useState, useEffect, useMemo } from 'react';
import {
  Stack,
  Button,
  Group,
  Text,
  Title,
  Badge,
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
} from '@mantine/core';
import { IconAlertTriangle, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { GrammarProcessor } from '../engine/GrammarEngine';
import type { GenerationResult } from '../engine/types';
import type { GenerationStrategy } from '../engine/Engine';
import type { UseCasePreviewConfig, UseCaseResultsContentVariant } from '../seo/useCases';
import { ResultsRenderer } from './ResultsRenderer';

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
  const [selectedParameters, setSelectedParameters] = useState<Record<string, string>>({});
  const [generateCount, setGenerateCount] = useState<number>(10);
  const [parameterControlsOpen, setParameterControlsOpen] = useState(parameterControlsDefaultExpanded);

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

  // Separate parameters with multiple values from those with single values
  const filterableParameters = Object.entries(parameters).filter(([_, param]) => param.values.length > 1);
  const singleValueParameters = Object.entries(parameters).filter(([_, param]) => param.values.length === 1);

  // Calculate actual combinations with selected parameters
  const getActualCombinationCount = (): number => {
    if (!engine) return 0;
    
    try {
      // Use the unified method to count combinations with constraints
      return engine.getTotalCombinations('origin', selectedParameters);
    } catch (err) {
      console.error('Error calculating combination count:', err);
      return 0;
    }
  };

  const actualCombinations = getActualCombinationCount();

  const generateManyHardMax =
    maxGenerateMany !== undefined ? Math.min(maxGenerateMany, 100) : 100;
  const generateManyMax = Math.min(generateManyHardMax, Math.max(1, actualCombinations));

  // Get relevant parameters from the engine (now provided by the engine itself)
  const getRelevantParameters = (result: GenerationResult): Record<string, any> => {
    return result.metadata.relevantParameters || {};
  };

  const getModifierApplications = (result: GenerationResult) =>
    result.metadata.modifierApplications ?? [];

  // Reset selected parameters when grammar changes
  useEffect(() => {
    setSelectedParameters({});
  }, [engine]);

  useEffect(() => {
    setGenerateCount((c) => Math.min(Math.max(1, c), generateManyMax));
  }, [generateManyMax, engine]);

  const handleParameterChange = (paramName: string, value: string) => {
    setSelectedParameters(prev => {
      if (value === '') {
        // Remove parameter when "Random" is selected
        const { [paramName]: removed, ...rest } = prev;
        return rest;
      } else {
        // Add or update parameter
        return {
          ...prev,
          [paramName]: value
        };
      }
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
    
    // Get all unique parameter names from relevant parameters only
    const allParamNames = new Set<string>();
    results.forEach(result => {
      const relevantParams = getRelevantParameters(result);
      Object.keys(relevantParams).forEach(param => allParamNames.add(param));
    });
    
    // Create header row with basic columns + relevant parameters + optional metadata
    const headers = [
      'index', 
      'generated_text', 
      ...Array.from(allParamNames).sort(),
      'generation_time_ms',
      'generation_path'
    ];
    
    // Create CSV content
    const csvRows = [headers.join(',')];
    
    results.forEach((result, index) => {
      const relevantParams = getRelevantParameters(result);
      const row = [
        index + 1, // 1-based index
        `"${result.content.replace(/"/g, '""')}"`, // Escape quotes in content
        ...Array.from(allParamNames).sort().map(paramName => 
          `"${(relevantParams[paramName] || '').toString().replace(/"/g, '""')}"`
        ),
        result.metadata.generationTime || 0,
        `"${result.metadata.generationPath.join(' → ').replace(/"/g, '""')}"`
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

  if (!engine) {
    return (
        <Alert color="blue">
          <Text size="sm">Load a valid grammar to start generating results.</Text>
        </Alert>
    );
  }

  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Group gap="xs" align="flex-start" wrap="wrap">
            <Button
              size="sm"
              variant="filled"
              onClick={handleGenerateWithParams}
              disabled={isLoading}
            >
              Generate
            </Button>
            <Group gap="xs" wrap="nowrap">
              <NumberInput
                size="sm"
                value={generateCount}
                onChange={(value) =>
                  setGenerateCount(typeof value === 'number' ? value : generateManyMax)
                }
                min={1}
                max={generateManyMax}
                w={80}
                placeholder="Count"
                title={`Generate multiple results (1–${generateManyMax})`}
              />
              <Button
                size="sm"
                variant="light"
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
                variant="outline"
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
            variant="default"
            size="xs"
            leftSection={
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
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <div />
              <Group gap="md" align="center" wrap="wrap" justify="flex-end">
                {singleValueParameters.length > 0 && (
                  <Text
                    size="xs"
                    c="dimmed"
                    lh={1.4}
                    title={`Fixed parameters: ${singleValueParameters.map(([name, param]) => `${name}=${param.values[0]}`).join(', ')}`}
                  >
                    {singleValueParameters.length} fixed parameter{singleValueParameters.length !== 1 ? 's' : ''}
                  </Text>
                )}
                <Group gap={6} align="center" wrap="nowrap">
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
            </Group>

            {filterableParameters.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No variable parameters found. All parameters have fixed values.
              </Text>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  alignItems: 'start',
                }}
              >
                {filterableParameters.map(([name, param]) => (
                  <Stack key={name} gap={4}>
                    <Text
                      size="xs"
                      c="dimmed"
                      fw={500}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                    >
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
              </div>
            )}

            {stats && (
              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  Total combinations: {engine ? engine.getTotalCombinations('origin') : 0}
                </Text>
                <Text
                  size="xs"
                  c={
                    actualCombinations !== (engine ? engine.getTotalCombinations('origin') : 0)
                      ? 'primary'
                      : 'dimmed'
                  }
                >
                  With selected parameters: {actualCombinations}
                </Text>
                {actualCombinations > 100 && (
                  <Group gap={6} align="flex-start" wrap="nowrap">
                    <IconAlertTriangle
                      size={14}
                      style={{ flexShrink: 0, color: 'var(--mantine-color-orange-6)' }}
                    />
                    <Text size="xs" c="orange">
                      Too many combinations ({actualCombinations}). Use more specific parameters to reduce results.
                    </Text>
                  </Group>
                )}
                {singleValueParameters.length > 0 && (
                  <Text size="xs" c="dimmed">
                    Fixed: {singleValueParameters.map(([name, param]) => `${name}=${param.values[0]}`).join(', ')}
                  </Text>
                )}
              </Stack>
            )}
          </Stack>
        </Collapse>
      </Stack>

      <Divider />

      {/* Results */}
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="xs" wrap="wrap" mb="md">
          <Group gap="xs" align="center" wrap="wrap">
            <Title order={2} size="h3" fz="sm" fw={600} style={{ lineHeight: 1.2 }}>
              Results
            </Title>
            <Badge variant="light">{results.length}</Badge>
            {showResultDisplayModeControl && onHomeResultDisplayModeChange && (
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
            )}
          </Group>

          {results.length > 0 && (
            <Button
              size="xs"
              variant="light"
              onClick={exportResults}
              disabled={results.length === 0}
            >
              Export CSV
            </Button>
          )}
        </Group>

        {isLoading ? (
          <Center h={200}>
            <Stack align="center">
              <Loader size="md" color={theme.primaryColor} />
              <Text size="sm" c="dimmed">Generating results...</Text>
            </Stack>
          </Center>
        ) : results.length === 0 ? (
          <Alert color="gray">
            <Text size="sm">No results yet — press Generate to start.</Text>
          </Alert>
        ) : (
          <ResultsRenderer
            contentVariant={contentVariant}
            results={results}
            theme={theme}
            preview={preview}
            getRelevantParameters={getRelevantParameters}
            getModifierApplications={(r) => getModifierApplications(r) ?? []}
          />
        )}

        {/* Metadata Accordion */}
        {results.length > 0 && (
          <Accordion mt="xs">
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
                          <Text size="xs" c="dimmed">Generation Path:</Text>
                          <Code>{result.metadata.generationPath.join(' → ')}</Code>
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">Relevant Parameters:</Text>
                          <Group gap={4} wrap="wrap" mt={4}>
                            {Object.entries(getRelevantParameters(result)).map(([key, value]) => (
                              <Badge key={key} size="xs" variant="light">
                                {key}: {value}
                              </Badge>
                            ))}
                          </Group>
                        </div>
                        {getModifierApplications(result).length > 0 && (
                          <div>
                            <Text size="xs" c="dimmed">Modifiers applied:</Text>
                            <Stack gap={6} mt={4}>
                              {getModifierApplications(result).map((app, i) => (
                                <Text key={i} size="xs">
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
                          <Text size="xs" c="dimmed">Applied Rules:</Text>
                          <Text size="xs">{result.metadata.appliedRules.length} rules</Text>
                        </div>
                        {result.metadata.structure && (
                          <div>
                            <Text size="xs" c="dimmed">Structure:</Text>
                            <Text size="xs">
                              Length: {result.metadata.structure.length}, Words:{' '}
                              {result.metadata.structure.wordCount}
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
    </Stack>
  );
}
