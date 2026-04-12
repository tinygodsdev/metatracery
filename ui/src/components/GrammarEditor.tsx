import { useState, useEffect } from 'react';
import {
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Alert,
  Code,
  Select,
} from '@mantine/core';
import type { GrammarRule } from '../engine/types';
import { fixtures } from '../fixtures';
import { GrammarGraphView } from './grammarGraph';

interface GrammarEditorProps {
  grammar: GrammarRule;
  onChange: (grammar: GrammarRule) => void;
  viewMode: 'json' | 'graph';
}

export function GrammarEditor({
  grammar,
  onChange,
  viewMode,
}: GrammarEditorProps) {
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null);

  // Update JSON text when grammar changes
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

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setIsValid(true);
      setError(null);
      onChange(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const loadFixture = (fixtureName: string) => {
    const fixture = fixtures.find(f => f.name === fixtureName);
    if (fixture) {
      onChange(fixture.grammar);
      setSelectedFixture(fixtureName);
    }
  };

  const handleLoadExample = () => {
    const exampleGrammar: GrammarRule = {
      "SP": ["#NP#"],
      "OP": ["#NP#"],
      "NP": ["girl", "cat"],
      "VP": ["loves", "eats", "pets"],
      "SVO": ["#SP# #VP# #OP#"],
      "VSO": ["#VP# #SP# #OP#"],
      "word_order": ["#SVO#", "#VSO#"],
      "origin": ["#word_order#"]
    };
    
    setJsonText(JSON.stringify(exampleGrammar, null, 2));
    onChange(exampleGrammar);
    setIsValid(true);
    setError(null);
    setSelectedFixture(null);
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <Text size="sm" fw={500}>Grammar Definition</Text>
          {isValid ? (
            <Badge color="green" variant="light" size="xs">
              Valid
            </Badge>
          ) : (
            <Badge color="red" variant="light" size="xs">
              Invalid
            </Badge>
          )}
        </Group>
        
        <Group>
          <Select
            placeholder="Load fixture..."
            data={fixtures.map(f => ({ value: f.name, label: f.name }))}
            value={selectedFixture}
            onChange={(value) => value && loadFixture(value)}
            size="xs"
            w={150}
          />
          {viewMode === 'json' && (
            <>
              <Button size="xs" variant="light" onClick={handleFormat}>
                Format JSON
              </Button>
              <Button size="xs" variant="outline" onClick={handleLoadExample}>
                Load Example
              </Button>
            </>
          )}
        </Group>
      </Group>

      {selectedFixture && (
        <Text size="xs" c="dimmed">
          {fixtures.find(f => f.name === selectedFixture)?.description}
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
