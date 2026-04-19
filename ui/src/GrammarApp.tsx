import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, useLocation, useBlocker } from 'react-router-dom';
import {
  AppShell,
  Title,
  Stack,
  Group,
  Alert,
  Text,
  Modal,
  Button,
  MantineThemeProvider,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { GrammarEditor } from './components/GrammarEditor';
import { HelpDocumentationModal } from './components/HelpDocumentationModal';
import { ResultsPanel } from './components/ResultsPanel';
import { SaveGrammarDisclaimerModal } from './components/SaveGrammarDisclaimerModal';
import { SaveGrammarNameModal } from './components/SaveGrammarNameModal';
import { BrowserStoredDataModal } from './components/BrowserStoredDataModal';
import { CollapsibleWorkspaceChrome } from './components/CollapsibleWorkspaceChrome';
import { EditorWorkspaceColumns } from './components/EditorWorkspaceColumns';
import { RoutePrimaryCssScope } from './components/RoutePrimaryCssScope';
import { UsecaseDiscoveryCards } from './components/UsecaseDiscoveryCards';
import { UsecaseHero } from './components/UsecaseHero';
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
import { SeoHead } from './seo/SeoHead';
import type { UseCasePreviewConfig, UseCaseResultsContentVariant } from './seo/useCases';
import { getUseCaseByPath, isAllowedPath } from './seo/useCases';

const HOME_RICH_RESULT_PREVIEW: UseCasePreviewConfig = {
  aspectRatio: 1,
  minHeight: 160,
  background: 'checker',
};

const DEBOUNCE_MS = 450;

/** Per-route grammar draft when leaving a configured use case (see pathname effect + navigation modal). */
function draftStorageKey(pathname: string): string {
  return `gge-usecase-draft-${pathname}`;
}

function readDraftForRoute(pathname: string): string | null {
  return localStorage.getItem(draftStorageKey(pathname));
}

function removeDraftsForRoute(pathname: string) {
  localStorage.removeItem(draftStorageKey(pathname));
}

function grammarSignature(g: GrammarRule): string {
  return JSON.stringify(ensureRulesForReferences(g));
}

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

export default function GrammarApp() {
  const { pathname } = useLocation();
  if (!isAllowedPath(pathname)) {
    return <Navigate to="/" replace />;
  }

  const useCase = getUseCaseByPath(pathname);
  const isHome = pathname === '/';

  const initial = getInitialClientGrammarState();
  const [grammar, setGrammar] = useState<GrammarRule>(() => initial.grammar);
  const [engine, setEngine] = useState<GrammarProcessor | null>(() => {
    if (Object.keys(initial.grammar).length > 0) {
      try {
        return new GrammarProcessor(initial.grammar, { processModifiers: false });
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
  const [processModifiers, setProcessModifiers] = useState(false);
  const [homeResultsContentVariant, setHomeResultsContentVariant] =
    useState<UseCaseResultsContentVariant>('line');
  const [helpOpen, setHelpOpen] = useState(false);
  const [grammarViewMode, setGrammarViewMode] = useState<'json' | 'graph'>('graph');

  const [libraryState, setLibraryState] = useState<GrammarLibraryState>(() => initial.library);
  const [librarySource, setLibrarySource] = useState<GrammarLibrarySource>(() => initial.source);
  const [selectedFixtureName, setSelectedFixtureName] = useState<string | null>(null);

  const [saveDisclaimerOpen, setSaveDisclaimerOpen] = useState(false);
  const [saveNameModalOpen, setSaveNameModalOpen] = useState(false);
  const [storedDataModalOpen, setStoredDataModalOpen] = useState(false);
  const [baselineSerialized, setBaselineSerialized] = useState<string | null>(null);
  const [draftDialog, setDraftDialog] = useState<{ path: string; json: string } | null>(null);

  const pendingAfterDisclaimerRef = useRef<(() => void) | null>(null);
  const libraryStateRef = useRef(libraryState);
  const librarySourceRef = useRef(librarySource);
  libraryStateRef.current = libraryState;
  librarySourceRef.current = librarySource;

  const grammarRef = useRef(grammar);
  grammarRef.current = grammar;

  useEffect(() => {
    let cancelled = false;
    const snap = getInitialClientGrammarState();
    if (snap.source === 'user') return;

    const path = window.location.pathname;
    if (!isAllowedPath(path)) return;
    const uc = getUseCaseByPath(path);
    if (path !== '/' && uc?.ui?.defaultFixtureName) return;

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

  useEffect(() => {
    setDraftDialog(null);
    const uc = getUseCaseByPath(pathname);

    setGrammarViewMode(uc?.ui?.defaultGrammarViewMode ?? 'graph');

    if (uc?.ui?.defaultProcessModifiers !== undefined) {
      setProcessModifiers(uc.ui.defaultProcessModifiers);
    } else if (pathname !== '/') {
      setProcessModifiers(false);
    }

    if (pathname === '/') {
      setBaselineSerialized(null);
      return;
    }

    if (librarySourceRef.current === 'user') {
      setBaselineSerialized(grammarSignature(grammarRef.current));
      return;
    }

    setBaselineSerialized(null);

    let cancelled = false;

    void (async () => {
      if (uc?.ui?.defaultFixtureName) {
        const raw = readDraftForRoute(pathname);
        if (raw) {
          if (!cancelled) setDraftDialog({ path: pathname, json: raw });
          return;
        }
        const fixture = fixtures.find((f) => f.name === uc.ui!.defaultFixtureName);
        if (!fixture) return;
        const g = ensureRulesForReferences(fixture.grammar as GrammarRule);
        if (cancelled) return;
        setGrammar(g);
        setLibrarySource('fixture');
        setSelectedFixtureName(uc.ui!.defaultFixtureName!);
        setError(null);
        setBaselineSerialized(grammarSignature(g));
        return;
      }

      try {
        const response = await fetch('/example.json');
        const raw = await response.json();
        const g = ensureRulesForReferences(raw);
        if (cancelled) return;
        setGrammar(g);
        setLibrarySource('example');
        setSelectedFixtureName(null);
        setBaselineSerialized(grammarSignature(g));
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (librarySource !== 'user' || !libraryState.activeId) return;
    const t = window.setTimeout(() => {
      writeGrammarLibraryToLocalStorage(libraryStateRef.current);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [libraryState, librarySource]);

  const isDirty =
    Boolean(useCase?.ui) &&
    baselineSerialized !== null &&
    grammarSignature(grammar) !== baselineSerialized;

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (Object.keys(grammar).length > 0) {
      try {
        const newEngine = new GrammarProcessor(grammar, { processModifiers });
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
  }, [grammar, processModifiers]);

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
  };

  const handleFixtureLoad = useCallback((fixtureName: string) => {
    const fixture = fixtures.find((f) => f.name === fixtureName);
    if (!fixture) return;
    const g = ensureRulesForReferences(fixture.grammar as GrammarRule);
    setGrammar(g);
    setLibrarySource('fixture');
    setSelectedFixtureName(fixtureName);
    setError(null);
  }, []);

  const handleSelectUserGrammar = useCallback((id: string) => {
    const item = libraryStateRef.current.items.find((i) => i.id === id);
    if (!item) return;
    const g = ensureRulesForReferences(item.grammar);
    setGrammar(g);
    setLibrarySource('user');
    setSelectedFixtureName(null);
    setError(null);
    setLibraryState((prev) => ({ ...prev, activeId: id }));
    const uc = getUseCaseByPath(pathname);
    if (uc?.ui) setBaselineSerialized(grammarSignature(g));
  }, [pathname]);

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
    const uc = getUseCaseByPath(pathname);
    if (uc?.ui) setBaselineSerialized(grammarSignature(ensured));
    writeGrammarLibraryToLocalStorage(next);
  }, [pathname]);

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
    const uc = getUseCaseByPath(pathname);
    if (uc?.ui) setBaselineSerialized(grammarSignature(ensured));

    if (!hasStorageDisclaimerAck()) {
      pendingAfterDisclaimerRef.current = () => {
        writeGrammarLibraryToLocalStorage(nextState);
      };
      setSaveDisclaimerOpen(true);
    } else {
      writeGrammarLibraryToLocalStorage(nextState);
      notifications.show({ message: 'Grammar saved', color: 'teal' });
    }
  }, [grammar, pathname]);

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
    } catch (err) {
      console.error(err);
      const fallback = ensureRulesForReferences({ origin: [''] });
      setGrammar(fallback);
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

    const cap = useCase?.ui?.maxGenerateMany;
    const n = cap !== undefined ? Math.min(Math.max(1, count), cap) : count;

    setIsLoading(true);
    try {
      const manyResults: GenerationResult[] = [];

      for (let i = 0; i < n; i++) {
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

  const resolveDraftUseDefault = useCallback(() => {
    if (!draftDialog) return;
    removeDraftsForRoute(draftDialog.path);
    const uc = getUseCaseByPath(draftDialog.path);
    const name = uc?.ui?.defaultFixtureName;
    if (name) {
      const fixture = fixtures.find((f) => f.name === name);
      if (fixture) {
        const g = ensureRulesForReferences(fixture.grammar as GrammarRule);
        setGrammar(g);
        setLibrarySource('fixture');
        setSelectedFixtureName(name);
        setError(null);
        setBaselineSerialized(grammarSignature(g));
      }
    }
    setDraftDialog(null);
  }, [draftDialog]);

  const resolveDraftRestore = useCallback(() => {
    if (!draftDialog) return;
    try {
      const parsed = JSON.parse(draftDialog.json) as unknown;
      const g = ensureRulesForReferences(parsed as GrammarRule);
      setGrammar(g);
      setLibrarySource('example');
      setSelectedFixtureName(null);
      setError(null);
      setBaselineSerialized(grammarSignature(g));
      removeDraftsForRoute(draftDialog.path);
    } catch (e) {
      console.error(e);
      notifications.show({ message: 'Could not restore draft', color: 'red' });
    }
    setDraftDialog(null);
  }, [draftDialog]);

  const routePrimary = useCase?.ui?.primaryColor;

  const resultsContentVariant: UseCaseResultsContentVariant = isHome
    ? homeResultsContentVariant
    : (useCase?.ui?.resultsContentVariant ?? 'line');

  const resultsPreview: UseCasePreviewConfig | undefined =
    useCase?.ui?.preview ??
    (isHome &&
    (homeResultsContentVariant === 'svg' ||
      homeResultsContentVariant === 'html' ||
      homeResultsContentVariant === 'markdown')
      ? HOME_RICH_RESULT_PREVIEW
      : undefined);

  const workspaceMain = (
    <EditorWorkspaceColumns
      style={{ flex: 1, minHeight: 0 }}
      minHeight={0}
      left={
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
            allowedFixtureNames={useCase?.ui?.exampleFixtureNames}
            variant="workspace"
            workspaceHeading={
              <Title
                order={isHome ? 1 : 2}
                size="h3"
                component={isHome ? 'h1' : 'h2'}
                style={{ lineHeight: 1.2 }}
              >
                Edit
              </Title>
            }
          />
        </Box>
      }
      right={
        <Box
          p="md"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ResultsPanel
            key={pathname}
            engine={engine}
            results={results}
            isLoading={isLoading}
            onGenerate={handleGenerate}
            onGenerateAll={handleGenerateAll}
            onGenerateMany={handleGenerateMany}
            strategy={strategy}
            onStrategyChange={setStrategy}
            processModifiers={processModifiers}
            onProcessModifiersChange={setProcessModifiers}
            contentVariant={resultsContentVariant}
            preview={resultsPreview}
            maxGenerateMany={useCase?.ui?.maxGenerateMany}
            showGenerateAll={useCase?.ui?.showGenerateAll ?? true}
            parameterControlsDefaultExpanded={isHome}
            showResultDisplayModeControl={isHome}
            homeResultDisplayMode={homeResultsContentVariant}
            onHomeResultDisplayModeChange={setHomeResultsContentVariant}
          />
        </Box>
      }
    />
  );

  const expandedChrome = (
    <>
      {isHome && <UsecaseDiscoveryCards placement="top" compact />}
      {useCase && (
        <UsecaseHero
          path={useCase.path}
          primaryColor={useCase.ui?.primaryColor ?? 'blue'}
          h1={useCase.h1}
          intro={useCase.intro}
          compact
        />
      )}
      {error && (
        <Alert color="red" mt="xs" variant="light">
          {error}
        </Alert>
      )}
      {!isHome && <UsecaseDiscoveryCards placement="bottom" compact />}
    </>
  );

  const shellBody = (
    <CollapsibleWorkspaceChrome
      expandedContent={expandedChrome}
      workspace={workspaceMain}
      onOpenStoredData={() => setStoredDataModalOpen(true)}
      collapsedErrorMessage={error}
    />
  );

  return (
    <Box
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <SeoHead />
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
      <Modal
        opened={draftDialog !== null}
        onClose={resolveDraftUseDefault}
        title="Saved draft"
        closeOnClickOutside={false}
      >
        <Stack gap="md">
          <Text size="sm">You have a saved grammar draft for this page. Restore it or load the default example?</Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={resolveDraftUseDefault}>
              Use default example
            </Button>
            <Button onClick={resolveDraftRestore}>Restore draft</Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="Leave this page?"
        closeOnClickOutside={false}
      >
        <Stack gap="md">
          <Text size="sm">
            Continue? Your edits will be replaced by the default grammar for the page you open. A draft of the current
            grammar is saved for this route so you can restore it when you return.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => blocker.reset?.()}>
              Stay
            </Button>
            <Button
              onClick={() => {
                try {
                  localStorage.setItem(draftStorageKey(pathname), JSON.stringify(grammarRef.current));
                } catch (e) {
                  console.warn(e);
                }
                blocker.proceed?.();
              }}
            >
              Continue
            </Button>
          </Group>
        </Stack>
      </Modal>
      <AppShell
        padding={0}
        styles={{
          root: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
          main: {
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        <AppShell.Main>
          {routePrimary ? (
            <MantineThemeProvider inherit theme={{ primaryColor: routePrimary }}>
              <RoutePrimaryCssScope primaryColor={routePrimary}>{shellBody}</RoutePrimaryCssScope>
            </MantineThemeProvider>
          ) : (
            shellBody
          )}
        </AppShell.Main>
      </AppShell>
    </Box>
  );
}
