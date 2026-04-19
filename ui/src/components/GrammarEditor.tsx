import { useState, useEffect, useMemo, type ReactNode } from 'react';
import {
  Textarea,
  TextInput,
  Group,
  Stack,
  Text,
  Alert,
  Code,
  Select,
  SegmentedControl,
  ActionIcon,
  Tooltip,
  Box,
  useMantineTheme,
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconDeviceFloppy, IconHelp } from '@tabler/icons-react';
import type { GrammarRule } from '../engine/types';
import { fixtures } from '../fixtures';
import type { GrammarLibraryState, GrammarLibrarySource } from '../grammarLibraryStorage';
import { GrammarGraphView } from './grammarGraph';

const NEW_GRAMMAR_VALUE = '__new__';

interface GrammarEditorProps {
  grammar: GrammarRule;
  onChange: (grammar: GrammarRule) => void;
  viewMode: 'json' | 'graph';
  onViewModeChange: (mode: 'json' | 'graph') => void;
  onOpenHelp: () => void;
  libraryState: GrammarLibraryState;
  librarySource: GrammarLibrarySource;
  selectedFixtureName: string | null;
  onFixtureLoad: (fixtureName: string) => void;
  onSelectUserGrammar: (id: string) => void;
  onNewUserGrammar: () => void;
  onSaveGrammar: () => void;
  onRenameUserGrammar: (name: string) => void;
  /** If set, "Load example" lists only fixtures whose `name` is in this list. */
  allowedFixtureNames?: string[];
  /** Lemula-style column: header band + body fills available height. */
  variant?: 'default' | 'workspace';
  /** Shown in the header band when `variant="workspace"`. */
  workspaceHeading?: ReactNode;
}

export function GrammarEditor({
  grammar,
  onChange,
  viewMode,
  onViewModeChange,
  onOpenHelp,
  libraryState,
  librarySource,
  selectedFixtureName,
  onFixtureLoad,
  onSelectUserGrammar,
  onNewUserGrammar,
  onSaveGrammar,
  onRenameUserGrammar,
  allowedFixtureNames,
  variant = 'default',
  workspaceHeading,
}: GrammarEditorProps) {
  const theme = useMantineTheme();
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(grammar, null, 2));
  }, [grammar]);

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    setError(null);

    try {
      const parsed = JSON.parse(value);
      setIsValid(true);
      onChange(parsed);
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const userGrammarData = [
    { value: NEW_GRAMMAR_VALUE, label: 'New grammar' },
    ...libraryState.items.map((it) => ({ value: it.id, label: it.name })),
  ];

  const myGrammarValue =
    librarySource === 'user' && libraryState.activeId ? libraryState.activeId : null;

  const activeUserItem =
    librarySource === 'user' && libraryState.activeId
      ? libraryState.items.find((i) => i.id === libraryState.activeId)
      : undefined;

  const [grammarNameDraft, setGrammarNameDraft] = useState(activeUserItem?.name ?? '');
  useEffect(() => {
    setGrammarNameDraft(activeUserItem?.name ?? '');
  }, [activeUserItem?.id, activeUserItem?.name]);

  const fixtureSelectData = useMemo(() => {
    const list =
      allowedFixtureNames && allowedFixtureNames.length > 0
        ? fixtures.filter((f) => allowedFixtureNames.includes(f.name))
        : fixtures;
    return list.map((f) => ({ value: f.name, label: f.name }));
  }, [allowedFixtureNames]);

  useEffect(() => {
    if (!allowedFixtureNames?.length) return;
    if (librarySource !== 'fixture' || !selectedFixtureName) return;
    if (allowedFixtureNames.includes(selectedFixtureName)) return;
    const first = fixtureSelectData[0]?.value;
    if (first) onFixtureLoad(first);
  }, [
    allowedFixtureNames,
    fixtureSelectData,
    librarySource,
    onFixtureLoad,
    selectedFixtureName,
  ]);

  const toolbarControls = (
    <>
      <SegmentedControl
        size="xs"
        value={viewMode}
        onChange={(v) => onViewModeChange(v as 'json' | 'graph')}
        data={[
          { label: 'Graph', value: 'graph' },
          { label: 'JSON', value: 'json' },
        ]}
      />
      <Select
        placeholder="My grammars"
        data={userGrammarData}
        value={myGrammarValue}
        onChange={(value) => {
          if (!value) return;
          if (value === NEW_GRAMMAR_VALUE) onNewUserGrammar();
          else onSelectUserGrammar(value);
        }}
        size="xs"
        w={160}
      />
      {activeUserItem && (
        <TextInput
          size="xs"
          w={150}
          placeholder="Grammar name"
          aria-label="Grammar display name"
          value={grammarNameDraft}
          onChange={(e) => setGrammarNameDraft(e.target.value)}
          onBlur={() => onRenameUserGrammar(grammarNameDraft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
        />
      )}
      <Tooltip label="Save grammar">
        <ActionIcon
          size="md"
          variant="default"
          radius="md"
          aria-label="Save grammar"
          onClick={onSaveGrammar}
        >
          <IconDeviceFloppy size={16} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
      <Select
        placeholder="Load example"
        data={fixtureSelectData}
        value={librarySource === 'fixture' ? selectedFixtureName : null}
        onChange={(value) => value && onFixtureLoad(value)}
        size="xs"
        w={128}
      />
      <ActionIcon
        variant="subtle"
        color="gray"
        size="md"
        radius="xl"
        aria-label="Open documentation"
        title="How to use"
        onClick={onOpenHelp}
      >
        <IconHelp size={18} />
      </ActionIcon>
    </>
  );

  const validityControl = (
    <Tooltip
      label={
        isValid
          ? viewMode === 'json'
            ? 'JSON is valid'
            : 'Grammar is valid'
          : 'Invalid JSON — switch to JSON to fix'
      }
    >
      <ActionIcon
        variant="subtle"
        size="md"
        radius="xl"
        color={isValid ? theme.primaryColor : 'red'}
        aria-label={isValid ? 'Grammar valid' : 'Grammar invalid'}
      >
        {isValid ? (
          <IconCircleCheck size={18} stroke={1.5} aria-hidden />
        ) : (
          <IconAlertCircle size={18} stroke={1.5} aria-hidden />
        )}
      </ActionIcon>
    </Tooltip>
  );

  const toolbar = (
    <Group justify="space-between" align="center" wrap="wrap" gap="xs" w="100%">
      <Group gap="xs" align="center" wrap="wrap">
        {toolbarControls}
      </Group>
      {validityControl}
    </Group>
  );

  if (variant === 'workspace') {
    return (
      <Stack
        gap={0}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          gap="sm"
          px="md"
          pt="sm"
          pb="sm"
          style={{
            flexShrink: 0,
            borderBottom: '1px solid var(--app-soft-border)',
          }}
        >
          <Group
            align="center"
            justify="space-between"
            gap="md"
            wrap="nowrap"
            w="100%"
            style={{ minWidth: 0 }}
          >
            <Box style={{ flexShrink: 0 }}>{workspaceHeading}</Box>
            <Box
              style={{
                flex: 1,
                minWidth: 0,
                overflowX: 'auto',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Group gap="xs" align="center" wrap="nowrap" style={{ width: 'max-content' }}>
                {toolbarControls}
                {validityControl}
              </Group>
            </Box>
          </Group>
          {librarySource === 'fixture' && selectedFixtureName && (
            <Text size="sm" c="dimmed" lh={1.4}>
              {fixtures.find((f) => f.name === selectedFixtureName)?.description}
            </Text>
          )}
          {error && viewMode === 'json' && (
            <Alert color="red">
              <Text size="sm">{error}</Text>
            </Alert>
          )}
        </Stack>
        <Stack
          gap={0}
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {viewMode === 'json' ? (
            <>
              <Textarea
                value={jsonText}
                autosize={false}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder="Enter your grammar definition in JSON format..."
                ff="monospace"
                styles={{
                  root: {
                    flex: 1,
                    minHeight: 0,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  },
                  wrapper: { flex: 1, minHeight: 0, alignItems: 'stretch' },
                  input: {
                    flex: 1,
                    minHeight: 0,
                    height: '100%',
                    resize: 'none',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  },
                }}
              />
              <Text size="sm" c="dimmed" px="md" py="xs" style={{ flexShrink: 0 }}>
                <Code>#symbol#</Code> references other symbols. Use <Code>origin</Code> as the starting point.
              </Text>
            </>
          ) : (
            <GrammarGraphView grammar={grammar} onChange={onChange} fillHeight />
          )}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      {toolbar}

      {librarySource === 'fixture' && selectedFixtureName && (
        <Text size="sm" c="dimmed" lh={1.4}>
          {fixtures.find((f) => f.name === selectedFixtureName)?.description}
        </Text>
      )}

      {error && viewMode === 'json' && (
        <Alert color="red">
          <Text size="sm">{error}</Text>
        </Alert>
      )}

      {viewMode === 'json' ? (
        <>
          <Textarea
            value={jsonText}
            autosize
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder="Enter your grammar definition in JSON format..."
            minRows={15}
            maxRows={30}
            ff="monospace"
            styles={{
              input: {
                fontSize: '13px',
                lineHeight: 1.5,
              },
            }}
          />
          <Text size="sm" c="dimmed">
            <Code>#symbol#</Code> references other symbols. Use <Code>origin</Code> as the starting point.
          </Text>
        </>
      ) : (
        <GrammarGraphView grammar={grammar} onChange={onChange} />
      )}
    </Stack>
  );
}
