import { useState, useEffect } from 'react';
import { Button, Modal, Stack, TextInput } from '@mantine/core';

interface SaveGrammarNameModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function SaveGrammarNameModal({ opened, onClose, onSave }: SaveGrammarNameModalProps) {
  const [name, setName] = useState('Untitled');

  useEffect(() => {
    if (opened) setName('Untitled');
  }, [opened]);

  const submit = () => {
    onSave(name.trim() || 'Untitled');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Save grammar as" size="sm">
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="My grammar"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          autoFocus
        />
        <Button onClick={submit}>Continue</Button>
      </Stack>
    </Modal>
  );
}
