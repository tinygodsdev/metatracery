import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Code,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowRight, IconDice } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { GrammarProcessor } from '../../engine/GrammarEngine';
import writingPromptsGrammar from '../../fixtures/writingPrompts.json';
import fantasyElfGrammar from '../../fixtures/fantasyElf.json';
import placeNamesGrammar from '../../fixtures/placeNames.json';
import {
  FANTASY_NAMES_DEFAULT_FIXTURE_NAME,
  FLEXIBLE_EDITOR_PATH,
  PLACE_NAMES_DEFAULT_FIXTURE_NAME,
  WRITING_PROMPTS_FIXTURE_NAME,
} from '../../seo/useCases';

type DemoTab = 'prompts' | 'names' | 'places';

const DEMO_TAB_FIXTURE: Record<DemoTab, string> = {
  prompts: WRITING_PROMPTS_FIXTURE_NAME,
  names: FANTASY_NAMES_DEFAULT_FIXTURE_NAME,
  places: PLACE_NAMES_DEFAULT_FIXTURE_NAME,
};

const DEMOS: Record<
  DemoTab,
  { label: string; grammar: Record<string, string[]>; processModifiers: boolean }
> = {
  prompts: {
    label: 'Writing prompts',
    grammar: writingPromptsGrammar as Record<string, string[]>,
    processModifiers: true,
  },
  names: {
    label: 'Fantasy names',
    grammar: fantasyElfGrammar as Record<string, string[]>,
    processModifiers: false,
  },
  places: {
    label: 'Place names',
    grammar: placeNamesGrammar as Record<string, string[]>,
    processModifiers: false,
  },
};

function rollOnce(processor: GrammarProcessor): string {
  const result = processor.generateWithParameters('origin', {});
  return result.content;
}

export function LandingMiniDemo() {
  const [tab, setTab] = useState<DemoTab>('prompts');
  const processors = useMemo(() => {
    return {
      prompts: new GrammarProcessor(DEMOS.prompts.grammar, {
        processModifiers: DEMOS.prompts.processModifiers,
      }),
      names: new GrammarProcessor(DEMOS.names.grammar, {
        processModifiers: DEMOS.names.processModifiers,
      }),
      places: new GrammarProcessor(DEMOS.places.grammar, {
        processModifiers: DEMOS.places.processModifiers,
      }),
    };
  }, []);

  const [output, setOutput] = useState(() => rollOnce(processors.prompts));

  const reroll = useCallback(() => {
    setOutput(rollOnce(processors[tab]));
  }, [processors, tab]);

  const handleTabChange = (value: string | null) => {
    const next = (value as DemoTab) || 'prompts';
    setTab(next);
    const p = processors[next];
    setOutput(rollOnce(p));
  };

  return (
    <Paper withBorder p="md" radius="lg" shadow="sm" bg="var(--app-surface-1)">
      <Stack gap="md">
        <Title order={3} size="h4">
          Try it now
        </Title>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tabs.List grow>
            <Tabs.Tab value="prompts">{DEMOS.prompts.label}</Tabs.Tab>
            <Tabs.Tab value="names">{DEMOS.names.label}</Tabs.Tab>
            <Tabs.Tab value="places">{DEMOS.places.label}</Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <Box>
          <Code
            block
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              minHeight: '6.5rem',
              fontSize: 'var(--mantine-font-size-md)',
            }}
          >
            {output}
          </Code>
        </Box>
        <Group wrap="wrap" gap="sm">
          <Button leftSection={<IconDice size={18} />} onClick={reroll} variant="light">
            Roll again
          </Button>
          <Button
            component={Link}
            to={`${FLEXIBLE_EDITOR_PATH}?fixture=${encodeURIComponent(DEMO_TAB_FIXTURE[tab])}`}
            variant="filled"
            rightSection={<IconArrowRight size={18} />}
          >
            Open in editor
          </Button>
        </Group>
        <Text size="sm" c="dimmed" lh={1.5}>
          Live roll from bundled grammars — same engine as the full workspace.
        </Text>
      </Stack>
    </Paper>
  );
}
