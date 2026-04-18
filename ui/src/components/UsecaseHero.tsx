import { Box, Flex, Grid, Stack, Text, Title } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { UsecaseCardOrnament, useUseCaseAccentColor } from './usecaseOrnaments';
import classes from './UsecaseHero.module.css';

interface UsecaseHeroProps {
  path: string;
  primaryColor: MantineColor;
  h1: string;
  intro: string;
}

/**
 * Wide use-case landing strip: copy on the left, vector ornament banner on the right (same motif as discovery cards).
 */
export function UsecaseHero({ path, primaryColor, h1, intro }: UsecaseHeroProps) {
  const accent = useUseCaseAccentColor(primaryColor);

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
            aria-hidden
            pos="relative"
            w="100%"
            h={{ base: 160, sm: 180, md: 220 }}
            className={classes.heroBanner}
            style={{
              color: accent,
            }}
          >
            <Flex className={classes.heroBannerInner}>
              <UsecaseCardOrnament path={path} variant="hero" className={classes.heroOrnament} />
            </Flex>
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
