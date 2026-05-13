import { Code, SimpleGrid, Stack, Text, Title } from '@mantine/core';

const STEPS = [
  {
    title: 'Write rules',
    body:
      'Define symbols as arrays of strings. References like #animal# expand recursively until you get plain text.',
    snippet: `{
  "animal": ["cat", "raven"],
  "line": ["The #animal# waits."],
  "origin": ["#line#"]
}`,
  },
  {
    title: 'Roll outputs',
    body:
      'Generate one line, batches, or explore combinations. Lock branches with parameters when you want control.',
    snippet: null as string | null,
  },
  {
    title: 'Save & share',
    body:
      'Keep drafts in browser storage, export CSV from results, and copy JSON grammars into your own tooling.',
    snippet: null as string | null,
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading">
      <Stack gap="lg">
        <Title order={2} id="how-it-works-heading" size="h3">
          How it works
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {STEPS.map((step, i) => (
            <Stack key={step.title} gap="sm">
              <Text size="sm" fw={700} c="dimmed" tt="uppercase">
                Step {i + 1}
              </Text>
              <Title order={3} size="h5">
                {step.title}
              </Title>
              <Text size="md" c="dimmed" lh={1.55}>
                {step.body}
              </Text>
              {step.snippet ? (
                <Code block fz="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {step.snippet}
                </Code>
              ) : null}
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </section>
  );
}
