import { Button, Modal, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface SaveGrammarDisclaimerModalProps {
  opened: boolean;
  onClose: () => void;
  grammarJson: string;
  onAcknowledge: () => void;
}

export function SaveGrammarDisclaimerModal({
  opened,
  onClose,
  grammarJson,
  onAcknowledge,
}: SaveGrammarDisclaimerModalProps) {
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(grammarJson);
      notifications.show({ message: 'JSON copied to clipboard', color: 'teal' });
    } catch {
      notifications.show({ message: 'Could not copy to clipboard', color: 'red' });
    }
  };

  const handleConfirm = () => {
    onAcknowledge();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Saving in the browser" size="md">
      <Stack gap="md">
        <Text size="sm">
          Grammars are stored only in this browser&apos;s storage. They are not sent to any server. Clearing site data,
          using another browser, or a private window will not include your saved work here.
        </Text>
        <Text size="sm">
          To keep a backup, copy the JSON (for example into a file or note) whenever you care about not losing it.
        </Text>
        <Button variant="light" onClick={copyJson}>
          Copy grammar JSON
        </Button>
        <Button onClick={handleConfirm}>Got it, save</Button>
      </Stack>
    </Modal>
  );
}
