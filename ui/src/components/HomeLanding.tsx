import { useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Box,
  Burger,
  Container,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandGithub, IconHelp } from '@tabler/icons-react';

import { ChromeThemeSegmentedControl } from './Footer';
import { HelpDocumentationModal } from './HelpDocumentationModal';
import { LandingFAQ } from './landing/LandingFAQ';
import { LandingFinalCTA } from './landing/LandingFinalCTA';
import { LandingFooter } from './landing/LandingFooter';
import { LandingForCreators } from './landing/LandingForCreators';
import { LandingGeneratorsGrid } from './landing/LandingGeneratorsGrid';
import { LandingHero } from './landing/LandingHero';
import { LandingHowItWorks } from './landing/LandingHowItWorks';
import { LandingTraceryNote } from './landing/LandingTraceryNote';
import { LandingValueProps } from './landing/LandingValueProps';
import { UsecaseCardOrnament } from './usecaseOrnaments';
import { SeoHead } from '../seo/SeoHead';
import { FLEXIBLE_EDITOR_PATH } from '../seo/useCases';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function HomeLanding() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileNav, mobileNavHandlers] = useDisclosure(false);

  const navLinks = (
    <>
      <Anchor
        component="button"
        type="button"
        onClick={() => {
          scrollToId('generators');
          mobileNavHandlers.close();
        }}
        size="sm"
        fw={500}
      >
        Generators
      </Anchor>
      <Anchor
        component="button"
        type="button"
        onClick={() => {
          scrollToId('how-it-works');
          mobileNavHandlers.close();
        }}
        size="sm"
        fw={500}
      >
        How it works
      </Anchor>
      <Anchor
        component="button"
        type="button"
        onClick={() => {
          scrollToId('faq');
          mobileNavHandlers.close();
        }}
        size="sm"
        fw={500}
      >
        FAQ
      </Anchor>
      <Anchor href="https://github.com/tinygodsdev/metatracery" target="_blank" rel="noopener noreferrer" size="sm" fw={500}>
        GitHub
      </Anchor>
    </>
  );

  return (
    <Box component="article">
      <SeoHead />
      <HelpDocumentationModal opened={helpOpen} onClose={() => setHelpOpen(false)} />

      <Box
        component="header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--app-surface-1)',
          borderBottom: '1px solid var(--app-soft-border)',
        }}
        py="xs"
      >
        <Container size="lg">
          <Group justify="space-between" wrap="nowrap" gap="xs" align="center">
            <Group gap={8} wrap="nowrap" align="center" style={{ minWidth: 0 }}>
              <UsecaseCardOrnament path={FLEXIBLE_EDITOR_PATH} width={24} height={20} aria-hidden />
              <Text fw={700} component="span" truncate>
                Generative Grammar Engine
              </Text>
            </Group>

            <Group gap="lg" wrap="nowrap" justify="center" style={{ flex: 1 }} visibleFrom="md">
              {navLinks}
            </Group>

            <Group gap="xs" wrap="nowrap" align="center" style={{ flexShrink: 0 }}>
              <Burger
                opened={mobileNav}
                onClick={mobileNavHandlers.toggle}
                size="sm"
                aria-label="Open navigation"
                hiddenFrom="md"
              />
              <Tooltip label="Documentation">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  radius="xl"
                  aria-label="Open documentation"
                  onClick={() => setHelpOpen(true)}
                >
                  <IconHelp size={18} stroke={1.5} aria-hidden />
                </ActionIcon>
              </Tooltip>
              <ChromeThemeSegmentedControl />
              <ActionIcon
                component="a"
                href="https://github.com/tinygodsdev/metatracery"
                target="_blank"
                rel="noopener noreferrer"
                variant="subtle"
                color="gray"
                size="sm"
                radius="xl"
                aria-label="GitHub repository"
                title="GitHub"
              >
                <IconBrandGithub size={18} stroke={1.2} aria-hidden />
              </ActionIcon>
            </Group>
          </Group>
        </Container>
      </Box>

      <Drawer opened={mobileNav} onClose={mobileNavHandlers.close} title="Menu" padding="md" size="xs">
        <Stack gap="md">{navLinks}</Stack>
      </Drawer>

      <main>
        <Container size="lg" pb="xl" pt={{ base: 'lg', md: 'xl' }}>
          <Stack gap="xl">
            <LandingHero />
            <Divider />
            <LandingGeneratorsGrid />
            <Divider />
            <LandingValueProps />
            <Divider />
            <LandingHowItWorks />
            <Divider />
            <LandingForCreators />
            <Divider />
            <LandingTraceryNote />
            <Divider />
            <LandingFAQ />
            <Divider />
            <LandingFinalCTA />
            <LandingFooter />
          </Stack>
        </Container>
      </main>
    </Box>
  );
}
