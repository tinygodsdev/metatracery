import { Modal, Stack, Text, Title, List, Anchor, Code, Tabs } from '@mantine/core';
import { Link } from 'react-router-dom';
import { USE_CASES } from '../seo/useCases';

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
                <strong>parameters</strong>: you can fix them to specific values or leave them random. Use{' '}
                <strong>Advanced</strong> (next to the generate control) to expand or collapse strategy, modifiers,
                parameter dropdowns, and combination counts; on the home page it starts open, on dedicated use-case pages
                it starts collapsed. The main <strong>Generate</strong> action stays visible with a count field; when
                the <strong>▼</strong> menu next to <strong>Generate</strong> lists every combination when the space is
                small enough (≤100), or samples up to the usual batch cap with a short note when the full space is larger.
                Combination stats are inside Advanced.
              </Text>

              <Title order={6} mb="xs">
                Modifiers
              </Title>
              <Text size="sm" mb="xs">
                The <strong>Modifiers</strong> switch (under Advanced) controls post-processing of placeholders
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
                Generate and “generate all”
              </Title>
              <List size="sm" spacing="xs">
                <List.Item>
                  Set the <strong>count</strong> next to the button, then press <strong>Generate</strong>. With count{' '}
                  <strong>1</strong>, you get one random output using the current parameter dropdowns. With a higher
                  count, the engine runs that many <em>independent</em> random generations (same cap as before: the smaller
                  of the page limit, the current combination count, and 100). <strong>Random</strong> in a parameter
                  dropdown means the engine may pick any listed value for that symbol when expanding.
                </List.Item>
                <List.Item>
                  The <strong>▼</strong> menu beside <strong>Generate</strong> offers <strong>list all</strong> when
                  there are 2–100 combinations. If there are more, choose <strong>N of total (random sample)</strong> to
                  fill up to the usual batch limit with random rows; a one-line note shows the full combination count.
                  Some use-case pages hide the menu entirely.
                </List.Item>
              </List>

              <Title order={6} mb="xs">
                Combination counts
              </Title>
              <Text size="sm" mb="xs">
                In <strong>Advanced</strong> (when expanded), <strong>Total combinations</strong> is the full output space
                of the grammar (with no parameter locks). <strong>With selected parameters</strong> reflects your
                dropdown choices: picking a specific value fixes that symbol; <strong>Random</strong> leaves it
                unconstrained in the count. If the filtered count exceeds 100, use the <strong>▼</strong> menu for a capped
                random batch or narrow parameters to list all.
              </Text>

              <Title order={6} mb="xs">
                Export CSV
              </Title>
              <Text size="sm" mb="xs">
                When at least one result exists, <strong>Export CSV (N)</strong> appears next to the Results heading —{' '}
                <Code>N</Code> is the number of rows. The file includes columns <Code>index</Code>,{' '}
                <Code>generated_text</Code>, one column per relevant parameter name
                (sorted), <Code>generation_time_ms</Code>, and <Code>generation_path</Code> (the rule expansion path as
                text).
              </Text>

              <Title order={6} mb="xs">
                Generation Details
              </Title>
              <Text size="sm" mb="xs">
                Below the results table, an accordion opens per-result metadata: generation path, which parameters
                applied, modifier steps (when Modifiers are on), applied rule count, and optional structure stats. It is
                mainly for debugging and understanding how a string was built.
              </Text>

              <Title order={6} mb="xs">
                Per-page defaults (use-case routes)
              </Title>
              <Text size="sm" mb="xs">
                Each dedicated use-case route (not the home page) can ship with its own default example
                grammar, fixed result display mode, default on/off for <strong>Modifiers</strong>, a cap on the{' '}
                <strong>generate count</strong> (batch size), and a default of JSON or Graph in the editor. The home page keeps result
                display mode and examples under your control.
              </Text>

              <Title order={6} mb="xs">
                Saved drafts when leaving a page
              </Title>
              <Text size="sm" mb="xs">
                If you change the loaded example on a use-case page and navigate away, you may see <strong>
                  Leave this page?
                </strong>
                — confirming saves the current grammar JSON in <Code>localStorage</Code> for that route. On the next
                visit, <strong>Saved draft</strong> lets you restore it or load the default example again.
              </Text>

              <Title order={6} mb="xs">
                Theme and data in this browser
              </Title>
              <Text size="sm" mb="xs">
                The top bar includes a light/dark theme control (stored in this browser). The database icon opens{' '}
                <strong>Data stored in this browser</strong>: copy individual saved grammars, copy the full library JSON,
                inspect the raw theme value and storage keys, or clear all saved grammars after confirmation.
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
                The database icon in the top bar opens <strong>Data stored in this browser</strong>: review and copy raw
                JSON for each saved grammar, copy the entire library, see the theme preference value and storage keys,
                or clear saved grammars after a second confirmation click. Clearing site data in the browser removes this
                storage like any other site data. See also <strong>Theme and data in this browser</strong> under Results
                panel above.
              </Text>
            </div>

            <div>
              <Title order={5} mb="xs">
                About & links
              </Title>
              <Text size="sm" mb="md">
                Created by{' '}
                <Anchor href="https://danipolani.github.io/en/" target="_blank" rel="noopener noreferrer" fw={500}>
                  Dani Polani
                </Anchor>
                . Inspired by{' '}
                <Anchor href="https://github.com/galaxykate/tracery" target="_blank" rel="noopener noreferrer">
                  Tracery.js
                </Anchor>
                . Source:{' '}
                <Anchor href="https://github.com/tinygodsdev" target="_blank" rel="noopener noreferrer">
                  GitHub
                </Anchor>
                .
              </Text>
              <Title order={6} mb="xs">
                Preset pages
              </Title>
              <Text size="sm" mb="xs">
                Jump to the home page or a dedicated use-case route (also listed on the expanded page header):
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>
                  <Anchor component={Link} to="/" onClick={onClose}>
                    Home — Generative Grammar Engine
                  </Anchor>
                </List.Item>
                {USE_CASES.map((uc) => (
                  <List.Item key={uc.path}>
                    <Anchor component={Link} to={uc.path} onClick={onClose}>
                      {uc.cardTitle ?? uc.h1}
                    </Anchor>
                  </List.Item>
                ))}
              </List>
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
