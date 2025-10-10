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
  ScrollArea
} from '@mantine/core';
// Icons removed temporarily to fix import issues
import type { GrammarRule } from '../engine/types';

interface GrammarEditorProps {
  grammar: GrammarRule;
  onChange: (grammar: GrammarRule) => void;
}

export function GrammarEditor({ grammar, onChange }: GrammarEditorProps) {
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Group>
          <Text size="sm" fw={500}>Grammar Definition</Text>
          {isValid ? (
            <Badge color="green" size="xs">
              Valid
            </Badge>
          ) : (
            <Badge color="red" size="xs">
              Invalid
            </Badge>
          )}
        </Group>
        
        <Group>
          <Button size="xs" variant="light" onClick={handleFormat}>
            Format JSON
          </Button>
          <Button size="xs" variant="outline" onClick={handleLoadExample}>
            Load Example
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert color="red">
          <Text size="sm">{error}</Text>
        </Alert>
      )}

      <ScrollArea h={400}>
        <Textarea
          value={jsonText}
          autosize
          onChange={(e) => handleJsonChange(e.target.value)}
          placeholder="Enter your grammar definition in JSON format..."
          minRows={15}
          maxRows={20}
          styles={{
            input: {
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: '13px',
              lineHeight: 1.5,
            }
          }}
        />
      </ScrollArea>

      <Text size="xs" c="dimmed">
        <Code>#symbol#</Code> references other symbols. Use <Code>origin</Code> as the starting point.
      </Text>
    </Stack>
  );
}
