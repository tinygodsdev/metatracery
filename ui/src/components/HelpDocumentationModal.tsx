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
          <Text size="sm" mb="xs">
            The right column runs the engine on your grammar. Symbols with more than one alternative may appear as{' '}
            <strong>parameters</strong>: you can fix them to specific values or leave them random, then generate one
            line, many lines, or all combinations (subject to practical limits).
          </Text>
          <Title order={6} mb="xs">
            Uniform vs Weighted
          </Title>
          <Text size="sm" mb="xs">
            When a rule has several alternatives and you leave choices random, the engine picks one branch at each
            step. The strategy only affects <em>how</em> those random choices are distributed:
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>
              <strong>Uniform</strong> — each alternative at a choice point is equally likely. If a rule has{' '}
              <Code>n</Code> alternatives, each has probability <Code>1/n</Code>, no matter how many different final
              strings each branch can produce.
            </List.Item>
            <List.Item>
              <strong>Weighted</strong> — alternatives are chosen in proportion to how many distinct output strings
              each branch can yield under the current parameters and depth limit. Branches that expand to a larger space
              of outcomes get a higher chance; narrow branches get a lower chance. Use this when you want random
              samples to reflect the <em>size</em> of each subtree, not just the number of listed alternatives.
            </List.Item>
          </List>
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

        <div>
          <Title order={5} mb="xs">
            Saved grammars and your data
          </Title>
          <Text size="sm" mb="xs">
            Use <strong>My grammars</strong> to open, create, or switch between grammars you keep in this browser. When a
            saved grammar is active, use the <strong>Name</strong> field next to the toolbar to rename it (or press Enter
            to apply). The first time you <strong>Save</strong> while viewing a fixture or the default example, you choose
            a name for a new saved copy. The first time you save in a tab, a reminder explains that storage is only on
            this device—not on our servers. For a durable backup, copy the JSON (from the save dialog or the JSON editor)
            into a file or note.
          </Text>
          <Text size="sm">
            The database icon in the footer opens <strong>Data stored in this browser</strong>: you can review raw JSON,
            copy it, or clear saved grammars. Theme preference is listed there too. Clearing site data in the browser
            removes this storage like any other site data.
          </Text>
        </div>
      </Stack>
    </Modal>
  );
}
