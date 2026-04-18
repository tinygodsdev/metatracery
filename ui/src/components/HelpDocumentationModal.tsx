import { Modal, Stack, Text, Title, List, Anchor, Code, Tabs } from '@mantine/core';

interface HelpDocumentationModalProps {
  opened: boolean;
  onClose: () => void;
}

export function HelpDocumentationModal({ opened, onClose }: HelpDocumentationModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="How to use this tool" size="lg">
      <Tabs defaultValue="guide">
        <Tabs.List mb="md">
          <Tabs.Tab value="guide">Guide</Tabs.Tab>
          <Tabs.Tab value="syntax">Syntax reference</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="guide">
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
                  (letters, digits, underscore; must match an existing key or a key will be created in graph mode). Use{' '}
                  <Code>\#</Code> for a literal hash and <Code>\\</Code> for a literal backslash so SVG hex colors,
                  markdown headings, and similar text do not get parsed as placeholders.
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
                <strong>parameters</strong>: you can fix them to specific values or leave them random. Use the{' '}
                <strong>Parameter Controls</strong> header to expand or collapse strategy, modifiers, and parameter
                dropdowns; on the home page it starts open, on dedicated use-case pages it starts collapsed. The{' '}
                <strong>Generate</strong> / <strong>Generate Many</strong> / <strong>Generate All</strong> buttons and
                combination summary stay visible even when Parameter Controls is collapsed.
              </Text>

              <Title order={6} mb="xs">
                Modifiers
              </Title>
              <Text size="sm" mb="xs">
                The <strong>Modifiers</strong> switch (in Parameter Controls) controls post-processing of placeholders
                written as <Code>#ruleName.modifier#</Code> or <Code>#ruleName.mod1.mod2#</Code>. When enabled, the engine
                applies the built-in English modifier set after expansion (listed in detail under{' '}
                <strong>Syntax reference</strong> → <strong>English modifiers</strong>). When disabled, only plain rule
                expansion runs. Hover the switch in the UI for a short reminder.
              </Text>

              <Title order={6} mb="xs">
                Result display modes
              </Title>
              <Text size="sm" mb="xs">
                On the <strong>home page</strong>, use the dropdown next to the <strong>Results</strong> heading to choose
                how each generated cell is shown. Dedicated use-case routes may fix a mode for their content type.
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <strong>Line</strong> — one line of text per cell (default for short outputs).
                </List.Item>
                <List.Item>
                  <strong>Multiline</strong> — read-only text areas when a result spans several lines.
                </List.Item>
                <List.Item>
                  <strong>Code</strong> — monospace block with copy, for snippets and structured text.
                </List.Item>
                <List.Item>
                  <strong>SVG</strong> — sanitized SVG preview in a framed area, with copy and download of the raw
                  markup.
                </List.Item>
                <List.Item>
                  <strong>HTML</strong> — sanitized HTML preview plus copy/download of the source.
                </List.Item>
                <List.Item>
                  <strong>Markdown</strong> — rendered preview (sanitized), with raw Markdown available to copy.
                </List.Item>
              </List>

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
                  each branch can yield under the current parameters and depth limit. Branches that expand to a larger
                  space of outcomes get a higher chance; narrow branches get a lower chance. Use this when you want random
                  samples to reflect the <em>size</em> of each subtree, not just the number of listed alternatives.
                </List.Item>
              </List>
            </div>

            <div>
              <Title order={5} mb="xs">
                Examples
              </Title>
              <Text size="sm">
                Use <strong>Load example</strong> in the toolbar to load sample grammars so you can explore IPA,
                syllables, or other demos without starting from scratch.
              </Text>
            </div>

            <div>
              <Title order={5} mb="xs">
                Saved grammars and your data
              </Title>
              <Text size="sm" mb="xs">
                Use <strong>My grammars</strong> to open, create, or switch between grammars you keep in this browser.
                When a saved grammar is active, use the <strong>Name</strong> field next to the toolbar to rename it (or
                press Enter to apply). The first time you <strong>Save</strong> while viewing a grammar from{' '}
                <strong>Load example</strong> or the initial default, you choose a name for a new saved copy. The first
                time you save in a tab, a reminder explains that storage is only on this device—not on our servers. For a
                durable backup, copy the JSON (from the save dialog or the JSON editor) into a file or note.
              </Text>
              <Text size="sm">
                The database icon in the footer opens <strong>Data stored in this browser</strong>: you can review raw
                JSON, copy it, or clear saved grammars. Theme preference is listed there too. Clearing site data in the
                browser removes this storage like any other site data.
              </Text>
            </div>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="syntax">
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Quick reference for grammar text and placeholders. See the <strong>Guide</strong> tab for full context.
            </Text>

            <div>
              <Title order={5} mb="xs">
                JSON object
              </Title>
              <Text size="sm">
                Root value: an object whose keys are rule names (identifiers: letters, digits, underscore; must not start
                with a digit). Each key maps to an <strong>array of strings</strong> — the alternatives for that rule.
              </Text>
            </div>

            <div>
              <Title order={5} mb="xs">
                Entry rule
              </Title>
              <Text size="sm">
                Generation always starts from the rule named <Code>origin</Code>. It must exist in the grammar.
              </Text>
            </div>

            <div>
              <Title order={5} mb="xs">
                Placeholders
              </Title>
              <List size="sm" spacing="xs">
                <List.Item>
                  <Code>#RuleName#</Code> — expand the rule <Code>RuleName</Code> and insert the result.
                </List.Item>
                <List.Item>
                  <Code>#RuleName.modifier#</Code> or <Code>#RuleName.mod1.mod2#</Code> — expand, then apply modifier
                  chain left to right when <strong>Modifiers</strong> is on in Results (dot-separated segments after the
                  rule name).
                </List.Item>
              </List>
            </div>

            <div>
              <Title order={5} mb="xs">
                English modifiers
              </Title>
              <Text size="sm" mb="xs">
                With <strong>Modifiers</strong> enabled, these built-in names are recognized. Chains run in order, e.g.{' '}
                <Code>#animal.s.a#</Code>. Unknown names are left visible as <Code>((.name))</Code> in the output.
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <Code>a</Code> — prefix <Code>a</Code> or <Code>an</Code> (simple English vowel heuristics).
                </List.Item>
                <List.Item>
                  <Code>s</Code> — plural-like suffix (<Code>es</Code>, <Code>ies</Code>, or <Code>s</Code> by last
                  letter).
                </List.Item>
                <List.Item>
                  <Code>ed</Code> — past-tense style suffix (<Code>d</Code>, <Code>ed</Code>, <Code>ied</Code>, etc.).
                </List.Item>
                <List.Item>
                  <Code>capitalize</Code> — uppercase the first character of the expanded string.
                </List.Item>
                <List.Item>
                  <Code>capitalizeAll</Code> — uppercase the first letter of each &quot;word&quot; (after non-alphanumeric
                  characters).
                </List.Item>
                <List.Item>
                  <Code>firstS</Code> — apply <Code>s</Code> only to the first whitespace-separated word.
                </List.Item>
                <List.Item>
                  <Code>replace(a,b)</Code> — replace every occurrence of substring <Code>a</Code> with <Code>b</Code>{' '}
                  (comma-separated arguments in parentheses; use <Code>replace(x,y)</Code> syntax in the placeholder).
                </List.Item>
              </List>
            </div>

            <div>
              <Title order={5} mb="xs">
                Escapes
              </Title>
              <List size="sm" spacing="xs">
                <List.Item>
                  <Code>\#</Code> — literal <Code>#</Code> (inside or outside a placeholder).
                </List.Item>
                <List.Item>
                  <Code>\\</Code> — literal backslash.
                </List.Item>
                <List.Item>
                  Other <Code>\x</Code> — backslash is dropped; <Code>x</Code> is kept.
                </List.Item>
              </List>
            </div>

            <div>
              <Title order={5} mb="xs">
                Graph mode
              </Title>
              <Text size="sm">
                In the graph editor, nodes are rules and edges are <Code>#references#</Code>. You can rename rules and
                edit alternatives without hand-editing JSON; new references can auto-create empty rules depending on
                settings.
              </Text>
            </div>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
