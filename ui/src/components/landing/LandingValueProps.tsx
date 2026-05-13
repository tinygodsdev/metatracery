import { SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAdjustments, IconCloudOff, IconCoinOff, IconFileCode } from '@tabler/icons-react';

const ITEMS = [
  {
    icon: IconAdjustments,
    title: 'Predictable rolls',
    body:
      'The same rules and locked choices yield reproducible outputs — handy for tabletop handouts and repeatable experiments.',
  },
  {
    icon: IconCloudOff,
    title: 'Private by default',
    body: 'Everything runs on your device. No account and no grammar uploads required for generation.',
  },
  {
    icon: IconFileCode,
    title: 'Portable JSON',
    body:
      'Save grammars as plain JSON — version in git, bundle with jam games, or share alongside zines and itch kits.',
  },
  {
    icon: IconCoinOff,
    title: 'No AI dependency',
    body:
      'Rule-based and deterministic: no API keys, token limits, or model drift — just lists and structured templates.',
  },
];

export function LandingValueProps() {
  return (
    <section id="why-rules" aria-labelledby="why-rules-heading">
      <Stack gap="lg">
        <Title order={2} id="why-rules-heading" size="h3">
          Why a rule-based generator beats prompting an AI
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {ITEMS.map((item) => (
            <Stack key={item.title} gap="sm">
              <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                <item.icon size={22} stroke={1.5} />
              </ThemeIcon>
              <Title order={3} size="h5">
                {item.title}
              </Title>
              <Text size="md" c="dimmed" lh={1.55}>
                {item.body}
              </Text>
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </section>
  );
}
