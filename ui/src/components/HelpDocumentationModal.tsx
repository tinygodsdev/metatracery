import { Modal, Stack, Text, Title, List, Anchor, Code } from '@mantine/core';

interface HelpDocumentationModalProps {
  opened: boolean;
  onClose: () => void;
}

export function HelpDocumentationModal({ opened, onClose }: HelpDocumentationModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="How to use this tool" size="lg">
      <Stack gap="md">
        <Text size="sm">
          This app is a <strong>generative grammar engine</strong>: you describe a set of rules, and it expands them
          from a root symbol into text—similar in spirit to{' '}
          <Anchor href="https://github.com/galaxykate/tracery" target="_blank" rel="noopener noreferrer">
            Tracery
          </Anchor>
          .
        </Text>

        <div>
          <Title order={5} mb="xs">
            Grammar shape
          </Title>
          <Text size="sm" mb="xs">
            Your grammar is a JSON object: each <strong>key</strong> is a rule name; its value is an{' '}
            <strong>array of alternatives</strong> (strings). One alternative is chosen when that rule is expanded.
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>
              There must be a rule named <Code>origin</Code>—that is where generation starts.
            </List.Item>
            <List.Item>
              Inside a string, <Code>#OtherRule#</Code> inserts the expansion of the rule <Code>OtherRule</Code>{' '}
              (letters, digits, underscore; must match an existing key or a key will be created in graph mode).
            </List.Item>
            <List.Item>
              Text without <Code>#…#</Code> is literal output for that alternative.
            </List.Item>
          </List>
        </div>

        <div>
          <Title order={5} mb="xs">
            JSON vs Graph
          </Title>
          <Text size="sm">
            Use <strong>JSON</strong> to edit the raw object (useful for copy-paste and bulk edits). Use{' '}
            <strong>Graph</strong> to see rules as nodes and references as edges: edit alternatives in place, rename
            rules, add alternatives, and delete rules (except <Code>origin</Code>) from the node header.
          </Text>
        </div>

        <div>
          <Title order={5} mb="xs">
            Results panel
          </Title>
          <Text size="sm">
            The right column runs the engine on your grammar. Symbols with more than one alternative may appear as{' '}
            <strong>parameters</strong>: you can fix them to specific values or leave them random, then generate one
            line, many lines, or all combinations (subject to practical limits). Choose <strong>Uniform</strong> or{' '}
            <strong>Weighted</strong> strategy as needed.
          </Text>
        </div>

        <div>
          <Title order={5} mb="xs">
            Fixtures
          </Title>
          <Text size="sm">
            The fixture dropdown loads sample grammars so you can explore IPA, syllables, or other demos without
            starting from scratch.
          </Text>
        </div>
      </Stack>
    </Modal>
  );
}
