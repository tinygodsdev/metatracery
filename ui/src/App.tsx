import { useState, useEffect, useRef, useCallback } from 'react';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import {
  MantineProvider,
  createTheme,
  AppShell,
  Title,
  Container,
  Grid,
  Stack,
  Group,
  Alert,
  ColorSchemeScript,
  localStorageColorSchemeManager,
} from '@mantine/core';
import { COLOR_SCHEME_STORAGE_KEY } from './colorSchemeStorage';
import { Notifications, notifications } from '@mantine/notifications';

import { GrammarEditor } from './components/GrammarEditor';
import { HelpDocumentationModal } from './components/HelpDocumentationModal';
import { ResultsPanel } from './components/ResultsPanel';
import { Footer } from './components/Footer';
import { SaveGrammarDisclaimerModal } from './components/SaveGrammarDisclaimerModal';
import { SaveGrammarNameModal } from './components/SaveGrammarNameModal';
import { BrowserStoredDataModal } from './components/BrowserStoredDataModal';
import { GrammarProcessor } from './engine/GrammarEngine';
import { ensureRulesForReferences } from './engine/grammarGraphModel';
import type { GrammarRule, GenerationResult } from './engine/types';
import type { GenerationStrategy } from './engine/Engine';
import { fixtures } from './fixtures';
import {
  type GrammarLibraryState,
  type SavedGrammarItem,
  type GrammarLibrarySource,
  readGrammarLibraryFromLocalStorage,
  writeGrammarLibraryToLocalStorage,
  createEmptyLibraryState,
  hasStorageDisclaimerAck,
  setStorageDisclaimerAck,
  clearGrammarLibraryFromLocalStorage,
} from './grammarLibraryStorage';

const theme = createTheme({
  primaryColor: 'teal',
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
});

const DEBOUNCE_MS = 450;

function getInitialClientGrammarState(): {
  grammar: GrammarRule;
  library: GrammarLibraryState;
  source: GrammarLibrarySource;
} {
  if (typeof window === 'undefined') {
    return {
      grammar: {},
      library: createEmptyLibraryState(),
      source: 'example',
    };
  }
  const library = readGrammarLibraryFromLocalStorage();
  const active = library.activeId
    ? library.items.find((i) => i.id === library.activeId)
    : null;
  if (active) {
    return {
      grammar: ensureRulesForReferences(active.grammar),
      library,
      source: 'user',
    };
  }
  return { grammar: {}, library, source: 'example' };
}

function App() {
  const initial = getInitialClientGrammarState();
  const [grammar, setGrammar] = useState<GrammarRule>(() => initial.grammar);
  const [engine, setEngine] = useState<GrammarProcessor | null>(() => {
    if (Object.keys(initial.grammar).length > 0) {
      try {
        return new GrammarProcessor(initial.grammar);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<GenerationStrategy>('uniform');
  const [helpOpen, setHelpOpen] = useState(false);
  const [grammarViewMode, setGrammarViewMode] = useState<'json' | 'graph'>('graph');

  const [libraryState, setLibraryState] = useState<GrammarLibraryState>(() => initial.library);
  const [librarySource, setLibrarySource] = useState<GrammarLibrarySource>(() => initial.source);
  const [selectedFixtureName, setSelectedFixtureName] = useState<string | null>(null);

  const [saveDisclaimerOpen, setSaveDisclaimerOpen] = useState(false);
  const [saveNameModalOpen, setSaveNameModalOpen] = useState(false);
  const [storedDataModalOpen, setStoredDataModalOpen] = useState(false);

  const pendingAfterDisclaimerRef = useRef<(() => void) | null>(null);
  const libraryStateRef = useRef(libraryState);
  const librarySourceRef = useRef(librarySource);
  libraryStateRef.current = libraryState;
  librarySourceRef.current = librarySource;

  // Load example.json once on mount if we did not restore a user grammar from localStorage
  useEffect(() => {
    let cancelled = false;
    const snap = getInitialClientGrammarState();
    if (snap.source === 'user') return;

    (async () => {
      try {
        const response = await fetch('/example.json');
        const raw = await response.json();
        const exampleGrammar = ensureRulesForReferences(raw);
        if (!cancelled) {
          setGrammar(exampleGrammar);
          setLibrarySource('example');
        }
      } catch (err) {
        console.error('Failed to load example grammar:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced persist when editing a user grammar
  useEffect(() => {
    if (librarySource !== 'user' || !libraryState.activeId) return;
    const t = window.setTimeout(() => {
      writeGrammarLibraryToLocalStorage(libraryStateRef.current);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [libraryState, librarySource]);

  // Update engine when grammar changes
  useEffect(() => {
    if (Object.keys(grammar).length > 0) {
      try {
        const newEngine = new GrammarProcessor(grammar);
        setEngine(newEngine);
        setError(null);
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
    const ensured = ensureRulesForReferences(newGrammar);
    setGrammar(ensured);
    setError(null);
    setLibraryState((prev) => {
      if (librarySourceRef.current !== 'user' || !prev.activeId) return prev;
      const id = prev.activeId;
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.id === id ? { ...it, grammar: ensured, updatedAt: new Date().toISOString() } : it,
        ),
      };
    });
    try {
      const newEngine = new GrammarProcessor(ensured);
      setEngine(newEngine);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid grammar');
    }
  };

  const handleFixtureLoad = useCallback((fixtureName: string) => {
    const fixture = fixtures.find((f) => f.name === fixtureName);
    if (!fixture) return;
    const g = ensureRulesForReferences(fixture.grammar as GrammarRule);
    setGrammar(g);
    setLibrarySource('fixture');
    setSelectedFixtureName(fixtureName);
    setError(null);
    try {
      setEngine(new GrammarProcessor(g));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid grammar');
    }
  }, []);

  const handleSelectUserGrammar = useCallback((id: string) => {
    const item = libraryStateRef.current.items.find((i) => i.id === id);
    if (!item) return;
    const g = ensureRulesForReferences(item.grammar);
    setGrammar(g);
    setLibrarySource('user');
    setSelectedFixtureName(null);
    setError(null);
    try {
      setEngine(new GrammarProcessor(g));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid grammar');
    }
    setLibraryState((prev) => ({ ...prev, activeId: id }));
  }, []);

  const handleRenameUserGrammar = useCallback((name: string) => {
    const trimmed = name.trim() || 'Untitled';
    setLibraryState((prev) => {
      if (!prev.activeId) return prev;
      const id = prev.activeId;
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.id === id ? { ...it, name: trimmed, updatedAt: new Date().toISOString() } : it,
        ),
      };
    });
  }, []);

  const handleNewUserGrammar = useCallback(() => {
    const id = crypto.randomUUID();
    const base: GrammarRule = { origin: [''] };
    const ensured = ensureRulesForReferences(base);
    const item: SavedGrammarItem = {
      id,
      name: 'Untitled',
      updatedAt: new Date().toISOString(),
      grammar: ensured,
    };
    const next: GrammarLibraryState = {
      version: 1,
      items: [...libraryStateRef.current.items, item],
      activeId: id,
    };
    setLibraryState(next);
    libraryStateRef.current = next;
    setGrammar(ensured);
    setLibrarySource('user');
    setSelectedFixtureName(null);
    setError(null);
    try {
      setEngine(new GrammarProcessor(ensured));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid grammar');
    }
    writeGrammarLibraryToLocalStorage(next);
  }, []);

  const handleSaveAsSubmit = useCallback((name: string) => {
    const id = crypto.randomUUID();
    const ensured = ensureRulesForReferences(grammar);
    const item: SavedGrammarItem = {
      id,
      name: name.trim() || 'Untitled',
      updatedAt: new Date().toISOString(),
      grammar: ensured,
    };
    const nextState: GrammarLibraryState = {
      version: 1,
      items: [...libraryStateRef.current.items, item],
      activeId: id,
    };
    setLibraryState(nextState);
    libraryStateRef.current = nextState;
    setGrammar(ensured);
    setLibrarySource('user');
    setSelectedFixtureName(null);

    if (!hasStorageDisclaimerAck()) {
      pendingAfterDisclaimerRef.current = () => {
        writeGrammarLibraryToLocalStorage(nextState);
      };
      setSaveDisclaimerOpen(true);
    } else {
      writeGrammarLibraryToLocalStorage(nextState);
      notifications.show({ message: 'Grammar saved', color: 'teal' });
    }
  }, [grammar]);

  const handleSaveRequest = useCallback(() => {
    if (librarySourceRef.current !== 'user' || !libraryStateRef.current.activeId) {
      setSaveNameModalOpen(true);
      return;
    }
    if (!hasStorageDisclaimerAck()) {
      pendingAfterDisclaimerRef.current = null;
      setSaveDisclaimerOpen(true);
      return;
    }
    writeGrammarLibraryToLocalStorage(libraryStateRef.current);
    notifications.show({ message: 'Grammar saved', color: 'teal' });
  }, []);

  const handleDisclaimerAcknowledge = useCallback(() => {
    setStorageDisclaimerAck();
    if (pendingAfterDisclaimerRef.current) {
      pendingAfterDisclaimerRef.current();
      pendingAfterDisclaimerRef.current = null;
    } else {
      writeGrammarLibraryToLocalStorage(libraryStateRef.current);
    }
    notifications.show({ message: 'Grammar saved', color: 'teal' });
  }, []);

  const handleClearGrammars = useCallback(async () => {
    clearGrammarLibraryFromLocalStorage();
    setLibraryState(createEmptyLibraryState());
    libraryStateRef.current = createEmptyLibraryState();
    setLibrarySource('example');
    setSelectedFixtureName(null);
    try {
      const response = await fetch('/example.json');
      const raw = await response.json();
      const g = ensureRulesForReferences(raw);
      setGrammar(g);
      setError(null);
      setEngine(new GrammarProcessor(g));
    } catch (err) {
      console.error(err);
      const fallback = ensureRulesForReferences({ origin: [''] });
      setGrammar(fallback);
      setEngine(new GrammarProcessor(fallback));
    }
  }, []);

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

    setIsLoading(true);
    try {
      const allResults = engine.generateAllCombinations('origin', selectedParameters);
      setResults(allResults);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMany = async (parameters: Record<string, string>, count: number) => {
    if (!engine) return;

    setIsLoading(true);
    try {
      const manyResults: GenerationResult[] = [];

      for (let i = 0; i < count; i++) {
        const result = engine.generateWithParameters('origin', parameters, strategy);
        manyResults.push(result);
      }

      setResults(manyResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" localStorageKey={COLOR_SCHEME_STORAGE_KEY} />
      <MantineProvider
        theme={theme}
        defaultColorScheme="light"
        colorSchemeManager={localStorageColorSchemeManager({
          key: COLOR_SCHEME_STORAGE_KEY,
        })}
      >
        <Notifications />
        <HelpDocumentationModal opened={helpOpen} onClose={() => setHelpOpen(false)} />
        <SaveGrammarDisclaimerModal
          opened={saveDisclaimerOpen}
          onClose={() => {
            pendingAfterDisclaimerRef.current = null;
            setSaveDisclaimerOpen(false);
          }}
          grammarJson={JSON.stringify(grammar, null, 2)}
          onAcknowledge={() => {
            handleDisclaimerAcknowledge();
            setSaveDisclaimerOpen(false);
          }}
        />
        <SaveGrammarNameModal
          opened={saveNameModalOpen}
          onClose={() => setSaveNameModalOpen(false)}
          onSave={(name) => {
            setSaveNameModalOpen(false);
            handleSaveAsSubmit(name);
          }}
        />
        <BrowserStoredDataModal
          opened={storedDataModalOpen}
          onClose={() => setStoredDataModalOpen(false)}
          libraryState={libraryState}
          onClearGrammars={handleClearGrammars}
        />
        <AppShell padding={0}>
          <AppShell.Main style={{ minHeight: '100vh', overflow: 'auto' }}>
            <Container fluid pt="xs" pb="md" px="sm">
              {error && (
                <Alert color="red" mb="md">
                  {error}
                </Alert>
              )}

              <Grid gutter={{ base: 'xs', md: 'sm' }}>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="md">
                    <Group align="center">
                      <Title order={3} style={{ lineHeight: 1.2 }}>
                        Generative Grammar Engine
                      </Title>
                    </Group>
                    <GrammarEditor
                      grammar={grammar}
                      onChange={handleGrammarChange}
                      viewMode={grammarViewMode}
                      onViewModeChange={setGrammarViewMode}
                      onOpenHelp={() => setHelpOpen(true)}
                      libraryState={libraryState}
                      librarySource={librarySource}
                      selectedFixtureName={selectedFixtureName}
                      onFixtureLoad={handleFixtureLoad}
                      onSelectUserGrammar={handleSelectUserGrammar}
                      onNewUserGrammar={handleNewUserGrammar}
                      onSaveGrammar={handleSaveRequest}
                      onRenameUserGrammar={handleRenameUserGrammar}
                    />
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="md">
                    <Group align="center">
                      <Title order={3} style={{ lineHeight: 1.2 }}>
                        Results
                      </Title>
                    </Group>
                    <ResultsPanel
                      engine={engine}
                      results={results}
                      isLoading={isLoading}
                      onGenerate={handleGenerate}
                      onGenerateAll={handleGenerateAll}
                      onGenerateMany={handleGenerateMany}
                      strategy={strategy}
                      onStrategyChange={setStrategy}
                    />
                  </Stack>
                </Grid.Col>
              </Grid>
            </Container>

            <Footer onOpenStoredData={() => setStoredDataModalOpen(true)} />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </>
  );
}

export default App;
