import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Code,
  ScrollArea,
  Group,
  Title,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  GRAMMAR_LIBRARY_STORAGE_KEY,
  COLOR_SCHEME_STORAGE_KEY,
} from '../browserStorageKeys';
import type { GrammarLibraryState } from '../grammarLibraryStorage';

function readLocalStorageKey(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    notifications.show({ message: `${label} copied`, color: 'teal' });
  } catch {
    notifications.show({ message: 'Could not copy', color: 'red' });
  }
}

interface BrowserStoredDataModalProps {
  opened: boolean;
  onClose: () => void;
  libraryState: GrammarLibraryState;
  onClearGrammars: () => void;
}

export function BrowserStoredDataModal({
  opened,
  onClose,
  libraryState,
  onClearGrammars,
}: BrowserStoredDataModalProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!opened) setConfirmClear(false);
  }, [opened]);

  const fullLibraryJson = JSON.stringify(libraryState, null, 2);
  const themeRaw = readLocalStorageKey(COLOR_SCHEME_STORAGE_KEY);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearGrammars();
    setConfirmClear(false);
    notifications.show({ message: 'Saved grammars cleared from this browser', color: 'teal' });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Data stored in this browser" size="lg">
      <Stack gap="md">
        <Text size="sm">
          This app keeps data only on your device. Use the copies below for backup or debugging.
        </Text>

        <div>
          <Group justify="space-between" mb="xs">
            <Title order={6}>Saved grammars</Title>
            <Button size="xs" variant="light" onClick={() => copyText('Grammar library', fullLibraryJson)}>
              Copy all
            </Button>
          </Group>
          {libraryState.items.length === 0 ? (
            <Text size="sm" c="dimmed">
              No saved grammars yet.
            </Text>
          ) : (
            <Stack gap="sm">
              {libraryState.items.map((it) => (
                <div key={it.id}>
                  <Text size="xs" c="dimmed" mb={4}>
                    {it.name}{' '}
                    <Text component="span" size="xs" c="dimmed">
                      ({it.updatedAt})
                    </Text>
                  </Text>
                  <Group justify="flex-end" mb={4}>
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={() =>
                        copyText(
                          it.name,
                          JSON.stringify({ name: it.name, grammar: it.grammar }, null, 2),
                        )
                      }
                    >
                      Copy
                    </Button>
                  </Group>
                  <ScrollArea.Autosize mah={160}>
                    <Code block>{JSON.stringify(it.grammar, null, 2)}</Code>
                  </ScrollArea.Autosize>
                </div>
              ))}
            </Stack>
          )}
          <ScrollArea.Autosize mah={200} mt="sm">
            <Code block>{fullLibraryJson}</Code>
          </ScrollArea.Autosize>
          <Text size="xs" c="dimmed" mt="xs">
            Storage key: <Code>{GRAMMAR_LIBRARY_STORAGE_KEY}</Code>
          </Text>
        </div>

        <Divider />

        <div>
          <Title order={6} mb="xs">
            Theme
          </Title>
          <Text size="sm" mb="xs">
            Color scheme preference (same browser storage).
          </Text>
          <Group>
            <Code block style={{ flex: 1 }}>
              {themeRaw ?? '(not set)'}
            </Code>
            {themeRaw !== null && (
              <Button size="xs" variant="light" onClick={() => copyText('Theme value', themeRaw)}>
                Copy
              </Button>
            )}
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Key: <Code>{COLOR_SCHEME_STORAGE_KEY}</Code>
          </Text>
        </div>

        <Divider />

        <div>
          <Title order={6} mb="xs">
            Clear saved grammars
          </Title>
          <Text size="sm" mb="sm">
            Removes all named grammars from this browser. Your current editor session is updated by the app after
            confirmation.
          </Text>
          <Button color="red" variant="light" onClick={handleClear}>
            {confirmClear ? 'Click again to confirm' : 'Clear saved grammars'}
          </Button>
          {confirmClear && (
            <Button variant="subtle" size="xs" mt="xs" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
          )}
        </div>
      </Stack>
    </Modal>
  );
}
