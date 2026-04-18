import { Box, Grid, Stack, Text, Title } from '@mantine/core';

interface UsecaseHeroProps {
  h1: string;
  intro: string;
}

/**
 * Wide use-case landing strip: copy on the left, reserved banner area on the right (placeholder).
 */
export function UsecaseHero({ h1, intro }: UsecaseHeroProps) {
  return (
    <Box
      component="header"
      mb={{ base: 'xl', md: '2.5rem' }}
      py={{ base: 'lg', sm: 'xl', md: 48 }}
      px={{ base: 'xs', sm: 0 }}
    >
      <Grid gutter={{ base: 'lg', md: 'xl' }} align="flex-start">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="xl" maw={640}>
            <Title
              order={1}
              fz={{ base: 28, sm: 36, md: 44 }}
              lh={1.12}
              fw={700}
              style={{ letterSpacing: '-0.02em' }}
            >
              {h1}
            </Title>
            <Text
              size="lg"
              c="dimmed"
              lh={1.65}
              fz={{ base: 'md', md: 'lg' }}
            >
              {intro}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Box
            aria-label="Banner placeholder"
            h={{ base: 160, sm: 180, md: 220 }}
            w="100%"
            miw={0}
            style={{
              border: '1px dashed var(--mantine-color-default-border)',
              borderRadius: 'var(--mantine-radius-md)',
              backgroundColor: 'var(--mantine-color-default-hover)',
            }}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
