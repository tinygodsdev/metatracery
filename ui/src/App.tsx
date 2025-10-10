import { useState, useEffect } from 'react'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { 
  MantineProvider, 
  AppShell, 
  Header, 
  Title, 
  Container, 
  Grid,
  Stack,
  Paper,
  Group,
  Button,
  Alert,
  Text,
  Badge
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
// Icons removed temporarily to fix import issues

import { GrammarEditor } from './components/GrammarEditor';
import { ResultsPanel } from './components/ResultsPanel';
import { GrammarEngine } from './engine/GrammarEngine';
import type { GrammarRule, GenerationResult } from './engine/types';

function App() {
  const [grammar, setGrammar] = useState<GrammarRule>({});
  const [engine, setEngine] = useState<GrammarEngine | null>(null);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load example grammar on startup
  useEffect(() => {
    const loadExampleGrammar = async () => {
      try {
        const response = await fetch('/example.json');
        const exampleGrammar = await response.json();
        setGrammar(exampleGrammar);
        setEngine(new GrammarEngine(exampleGrammar));
      } catch (err) {
        console.error('Failed to load example grammar:', err);
      }
    };
    
    loadExampleGrammar();
  }, []);

  const handleGrammarChange = (newGrammar: GrammarRule) => {
    setGrammar(newGrammar);
    setError(null);
    try {
      const newEngine = new GrammarEngine(newGrammar);
      setEngine(newEngine);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid grammar');
    }
  };

  const handleGenerate = async (parameters: Record<string, string>) => {
    if (!engine) return;
    
    setIsLoading(true);
    try {
      const result = engine.generateWithParameters('#origin#', parameters);
      setResults([result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!engine) return;
    
    setIsLoading(true);
    try {
      const allResults = engine.generateAllCombinations('#origin#');
      setResults(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MantineProvider defaultColorScheme="dark">
      <Notifications />
      <AppShell
        header={{ height: 60 }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Title order={2}>Scientific Grammar Engine</Title>
            <Badge color="blue" variant="light">
              Research Tool
            </Badge>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <Container fluid>
            {error && (
              <Alert color="red" mb="md">
                {error}
              </Alert>
            )}

            <Grid>
              <Grid.Col span={6}>
                <Stack>
                  <Paper p="md" withBorder>
                    <Group mb="md">
                      <Title order={3}>Grammar Editor</Title>
                    </Group>
                    <GrammarEditor 
                      grammar={grammar}
                      onChange={handleGrammarChange}
                    />
                  </Paper>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack>
                  <Paper p="md" withBorder>
                    <Group mb="md">
                      <Title order={3}>Results</Title>
                    </Group>
                    <ResultsPanel 
                      engine={engine}
                      results={results}
                      isLoading={isLoading}
                      onGenerate={handleGenerate}
                      onGenerateAll={handleGenerateAll}
                    />
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}

export default App
