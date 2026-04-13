import { useState, useEffect } from 'react';
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
}: GrammarEditorProps) {
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

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center" wrap="wrap" gap="xs" w="100%">
        <Group gap="xs" align="center" wrap="wrap">
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
              onChange={(e) => setGrammarNameDraft(e.currentTarget.value)}
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
            data={fixtures.map((f) => ({ value: f.name, label: f.name }))}
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
        </Group>

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
            color={isValid ? 'teal' : 'red'}
            aria-label={isValid ? 'Grammar valid' : 'Grammar invalid'}
          >
            {isValid ? (
              <IconCircleCheck size={18} stroke={1.5} aria-hidden />
            ) : (
              <IconAlertCircle size={18} stroke={1.5} aria-hidden />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>

      {librarySource === 'fixture' && selectedFixtureName && (
        <Text size="xs" c="dimmed" lh={1.4}>
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
          <Text size="xs" c="dimmed">
            <Code>#symbol#</Code> references other symbols. Use <Code>origin</Code> as the starting point.
          </Text>
        </>
      ) : (
        <GrammarGraphView grammar={grammar} onChange={onChange} />
      )}
    </Stack>
  );
}
