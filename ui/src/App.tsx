import { useState, useEffect } from 'react'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { 
  MantineProvider, 
  AppShell, 
  Title, 
  Container, 
  Grid,
  Stack,
  Paper,
  Group,
  Alert,
  Badge
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
// Icons removed temporarily to fix import issues

import { GrammarEditor } from './components/GrammarEditor';
import { ResultsPanel } from './components/ResultsPanel';
import { Footer } from './components/Footer';
import { GrammarProcessor } from './engine/GrammarEngine';
import type { GrammarRule, GenerationResult } from './engine/types';
import type { GenerationStrategy } from './engine/Engine';

function App() {
  const [grammar, setGrammar] = useState<GrammarRule>({});
  const [engine, setEngine] = useState<GrammarProcessor | null>(null);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<GenerationStrategy>('uniform');

  // Load example grammar on startup
  useEffect(() => {
    const loadExampleGrammar = async () => {
      try {
        const response = await fetch('/example.json');
        const exampleGrammar = await response.json();
        setGrammar(exampleGrammar);
        setEngine(new GrammarProcessor(exampleGrammar));
      } catch (err) {
        console.error('Failed to load example grammar:', err);
      }
    };

    loadExampleGrammar();
  }, []);

  // Update engine when grammar changes
  useEffect(() => {
    if (Object.keys(grammar).length > 0) {
      try {
        const newEngine = new GrammarProcessor(grammar);
        setEngine(newEngine);
        setError(null);
        // Clear results when grammar changes
        setResults([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid grammar');
        setEngine(null);
      }
    } else {
      setEngine(null);
    }
  }, [grammar]);

  const handleGrammarChange = (newGrammar: GrammarRule) => {
    setGrammar(newGrammar);
    setError(null);
    try {
      const newEngine = new GrammarProcessor(newGrammar);
      setEngine(newEngine);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid grammar');
    }
  };

  const handleGenerate = async (parameters: Record<string, string>) => {
    if (!engine) return;
    
    setIsLoading(true);
    try {
      const result = engine.generateWithParameters('origin', parameters, strategy);
      setResults([result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAll = async (selectedParameters: Record<string, string>) => {
    if (!engine) return;
    
    console.log('handleGenerateAll called with selectedParameters:', selectedParameters);
    
    setIsLoading(true);
    try {
      // Use the new generateAllCombinations method with constraints
      const allResults = engine.generateAllCombinations('origin', selectedParameters);
      console.log('All results from generateAllCombinations:', allResults.length, allResults);
      
      setResults(allResults);
    } catch (err) {
      console.error('Generation error:', err);
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
              <Grid.Col span={4}>
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

              <Grid.Col span={8}>
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
                      strategy={strategy}
                      onStrategyChange={setStrategy}
                    />
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Container>
          
          <Footer />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}

export default App
