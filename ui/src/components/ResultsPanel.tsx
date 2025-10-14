import { useState, useEffect } from 'react';
import { 
  Stack, 
  Button, 
  Group, 
  Text, 
  Badge, 
  Table, 
  ScrollArea,
  Paper,
  Divider,
  Accordion,
  Code,
  Alert,
  Loader,
  Center
} from '@mantine/core';
// Icons removed temporarily to fix import issues
import { GrammarProcessor } from '../engine/GrammarEngine';
import type { GenerationResult } from '../engine/types';

interface ResultsPanelProps {
  engine: GrammarProcessor | null;
  results: GenerationResult[];
  isLoading: boolean;
  onGenerate: (parameters: Record<string, string>) => void;
  onGenerateAll: (selectedParameters: Record<string, string>) => void;
}

export function ResultsPanel({ 
  engine, 
  results, 
  isLoading, 
  onGenerate, 
  onGenerateAll
}: ResultsPanelProps) {
  const [selectedParameters, setSelectedParameters] = useState<Record<string, string>>({});

  const parameters = engine?.getParameters() || {};
  const stats = engine?.getParameterStatistics();
  
  // Separate parameters with multiple values from those with single values
  const filterableParameters = Object.entries(parameters).filter(([_, param]) => param.values.length > 1);
  const singleValueParameters = Object.entries(parameters).filter(([_, param]) => param.values.length === 1);

  // Calculate actual combinations with selected parameters
  const getActualCombinationCount = (): number => {
    if (!engine) return 0;
    
    try {
      // Use the unified method to count combinations with constraints
      return engine.getTotalCombinations(selectedParameters);
    } catch (err) {
      console.error('Error calculating combination count:', err);
      return 0;
    }
  };

  const actualCombinations = getActualCombinationCount();

  // Get relevant parameters from the engine (now provided by the engine itself)
  const getRelevantParameters = (result: GenerationResult): Record<string, any> => {
    return result.metadata.relevantParameters || {};
  };

  // Reset selected parameters when grammar changes
  useEffect(() => {
    setSelectedParameters({});
  }, [engine]);

  const handleParameterChange = (paramName: string, value: string) => {
    setSelectedParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleGenerateWithParams = () => {
    // Include all parameters: selected ones + fixed ones with single values
    const allParameters = { ...selectedParameters };
    singleValueParameters.forEach(([name, param]) => {
      allParameters[name] = param.values[0];
    });
    onGenerate(allParameters);
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
    <Stack>
      {/* Parameter Controls */}
      <Paper p="md" withBorder>
        <Group mb="md" justify="space-between">
          <Text size="sm" fw={500}>Parameter Controls</Text>
          {singleValueParameters.length > 0 && (
            <Text size="xs" c="dimmed" title={`Fixed parameters: ${singleValueParameters.map(([name, param]) => `${name}=${param.values[0]}`).join(', ')}`}>
              {singleValueParameters.length} fixed parameter{singleValueParameters.length !== 1 ? 's' : ''}
            </Text>
          )}
        </Group>
        
        {filterableParameters.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No variable parameters found. All parameters have fixed values.
          </Text>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            alignItems: 'start'
          }}>
            {filterableParameters.map(([name, param]) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Text size="xs" c="dimmed" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {name}
                </Text>
                <select
                  value={selectedParameters[name] || ''}
                  onChange={(e) => handleParameterChange(name, e.target.value)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: 'var(--mantine-color-body)',
                    color: 'var(--mantine-color-text)',
                    fontSize: '12px',
                    minWidth: '100%'
                  }}
                >
                  <option value="">Random</option>
                  {param.values.map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <Divider my="md" />

        <Group>
          <Button 
            size="sm" 
            onClick={handleGenerateWithParams}
            disabled={isLoading}
          >
            Generate
          </Button>
          <Button
            size="sm" 
            variant="outline"
            onClick={() => onGenerateAll(selectedParameters)}
            disabled={isLoading || actualCombinations > 100}
            title={actualCombinations > 100 ? `Too many combinations (${actualCombinations}). Use more specific parameters.` : undefined}
          >
            Generate All ({actualCombinations})
          </Button>
        </Group>

        {stats && (
          <Stack gap={2} mt="sm">
            <Text size="xs" c="dimmed">
              Total combinations: {engine ? engine.getTotalCombinations() : 0}
            </Text>
            <Text size="xs" c={actualCombinations !== (engine ? engine.getTotalCombinations() : 0) ? "blue" : "dimmed"}>
              With selected parameters: {actualCombinations}
            </Text>
            {actualCombinations > 100 && (
              <Text size="xs" c="orange">
                ⚠️ Too many combinations ({actualCombinations}). Use more specific parameters to reduce results.
              </Text>
            )}
            {singleValueParameters.length > 0 && (
              <Text size="xs" c="dimmed">
                Fixed: {singleValueParameters.map(([name, param]) => `${name}=${param.values[0]}`).join(', ')}
              </Text>
            )}
          </Stack>
        )}
      </Paper>

      {/* Results */}
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <Text size="sm" fw={500}>Results</Text>
            <Badge color="blue" variant="light">
              {results.length}
            </Badge>
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
              <Loader size="md" />
              <Text size="sm" c="dimmed">Generating results...</Text>
            </Stack>
          </Center>
        ) : results.length === 0 ? (
          <Alert color="gray">
            <Text size="sm">No results yet. Use the controls above to generate some.</Text>
          </Alert>
        ) : (
          <ScrollArea h={400}>
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
                      <Text size="sm" fw={500}>{result.content}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        {Object.entries(getRelevantParameters(result)).map(([key, value]) => (
                          <Badge key={key} size="xs" variant="light">
                            {key}: {value}
                          </Badge>
                        ))}
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}

        {/* Metadata Accordion */}
        {results.length > 0 && (
          <Accordion mt="md">
            <Accordion.Item value="metadata">
              <Accordion.Control>
                <Text size="sm">Generation Details</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  {results.map((result, index) => (
                    <Paper key={index} p="sm" withBorder>
                      <Text size="sm" fw={500} mb="xs">Result {index + 1}</Text>
                      <Stack gap="xs">
                        <div>
                          <Text size="xs" c="dimmed">Generation Path:</Text>
                          <Code>{result.metadata.generationPath.join(' → ')}</Code>
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">Relevant Parameters:</Text>
                          <Stack gap={2} mt={4}>
                            {Object.entries(getRelevantParameters(result)).map(([key, value]) => (
                              <Badge key={key} size="xs" variant="light">
                                {key}: {value}
                              </Badge>
                            ))}
                          </Stack>
                        </div>
                        <div>
                          <Text size="xs" c="dimmed">Applied Rules:</Text>
                          <Text size="xs">{result.metadata.appliedRules.length} rules</Text>
                        </div>
                        {result.metadata.structure && (
                          <div>
                            <Text size="xs" c="dimmed">Structure:</Text>
                            <Text size="xs">
                              Length: {result.metadata.structure.length}, 
                              Words: {result.metadata.structure.wordCount}
                            </Text>
                          </div>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </Paper>
    </Stack>
  );
}
