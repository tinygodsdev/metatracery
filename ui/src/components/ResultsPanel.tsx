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
import { GrammarEngine } from '../engine/GrammarEngine';
import type { ExtractedParameters, GenerationResult } from '../engine/types';

interface ResultsPanelProps {
  engine: GrammarEngine | null;
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
  const [showMetadata, setShowMetadata] = useState(false);

  const parameters = engine?.getParameters() || {};
  const stats = engine?.getParameterStatistics();
  
  // Separate parameters with multiple values from those with single values
  const filterableParameters = Object.entries(parameters).filter(([_, param]) => param.values.length > 1);
  const singleValueParameters = Object.entries(parameters).filter(([_, param]) => param.values.length === 1);

  // Calculate actual combinations with selected parameters
  const getActualCombinationCount = (): number => {
    if (!engine) return 0;
    
    let combinations = 1;
    for (const [paramName, param] of Object.entries(parameters)) {
      if (selectedParameters[paramName]) {
        // If parameter is selected, it contributes 1 combination
        combinations *= 1;
      } else {
        // If parameter is not selected, it contributes all its values
        combinations *= param.values.length;
      }
    }
    return combinations;
  };

  const actualCombinations = getActualCombinationCount();

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
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grammar-results.json';
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
        
        <Stack gap="sm">
          {filterableParameters.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No variable parameters found. All parameters have fixed values.
            </Text>
          ) : (
            filterableParameters.map(([name, param]) => (
            <Group key={name} justify="space-between">
              <Text size="sm" fw={500}>{name}:</Text>
              <select
                value={selectedParameters[name] || ''}
                onChange={(e) => handleParameterChange(name, e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'var(--mantine-color-body)',
                  color: 'var(--mantine-color-text)',
                  fontSize: '12px'
                }}
              >
                <option value="">Random</option>
                {param.values.map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </Group>
            ))
          )}
        </Stack>

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
              Total combinations: {stats.totalVariants}
            </Text>
            <Text size="xs" c={actualCombinations !== stats.totalVariants ? "blue" : "dimmed"}>
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
            >
              Export
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
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Actions</Table.Th>
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
                        {Object.entries(result.metadata.parameters).map(([key, value]) => (
                          <Badge key={key} size="xs" variant="light">
                            {key}: {value}
                          </Badge>
                        ))}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{result.metadata.generationTime}ms</Text>
                    </Table.Td>
                    <Table.Td>
                      <Button 
                        size="xs" 
                        variant="light"
                        onClick={() => setShowMetadata(!showMetadata)}
                      >
                        Details
                      </Button>
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
