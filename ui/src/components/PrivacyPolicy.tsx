import {
  ActionIcon,
  Anchor,
  Box,
  Container,
  Divider,
  List,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { ChromeThemeSegmentedControl } from './Footer';
import { LandingFooter } from './landing/LandingFooter';
import { UsecaseCardOrnament } from './usecaseOrnaments';
import { SeoHead } from '../seo/SeoHead';
import { FLEXIBLE_EDITOR_PATH } from '../seo/useCases';

const CONTACT_EMAIL = 'dani@tinygods.dev';
const LAST_UPDATED = '2026-05-13';

export default function PrivacyPolicy() {
  return (
    <Box component="article">
      <SeoHead />

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
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Anchor component={Link} to="/" underline="never" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <UsecaseCardOrnament path={FLEXIBLE_EDITOR_PATH} width={24} height={20} aria-hidden />
              <Text fw={700} component="span" truncate c="var(--mantine-color-text)">
                Generative Grammar Engine
              </Text>
            </Anchor>
            <Box style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
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
            </Box>
          </Box>
        </Container>
      </Box>

      <main>
        <Container size="md" pb="xl" pt={{ base: 'lg', md: 'xl' }}>
          <Stack gap="lg">
            <Stack gap="xs">
              <Title order={1} fz={{ base: '1.65rem', sm: '2rem' }}>
                Privacy policy
              </Title>
              <Text size="sm" c="dimmed">
                Last updated: {LAST_UPDATED}
              </Text>
            </Stack>

            <Text lh={1.6}>
              The Generative Grammar Engine is a free, browser-based tool. We do not run our own backend for the
              generator and do not collect or store personal data ourselves. This page explains the only places where
              data leaves your browser and how to control it.
            </Text>

            <Divider />

            <section aria-labelledby="what-we-collect">
              <Stack gap="sm">
                <Title order={2} id="what-we-collect" size="h3">
                  What we collect ourselves
                </Title>
                <Text lh={1.6}>
                  Nothing. Grammar generation, parameter selection, and result rendering happen entirely in your
                  browser tab. Your grammars are not transmitted to our servers.
                </Text>
              </Stack>
            </section>

            <section aria-labelledby="local-storage">
              <Stack gap="sm">
                <Title order={2} id="local-storage" size="h3">
                  Data stored in your browser
                </Title>
                <Text lh={1.6}>
                  The app uses your browser&rsquo;s local storage to keep your work between visits on this device:
                </Text>
                <List spacing="xs" lh={1.55}>
                  <List.Item>Saved grammars from the editor library</List.Item>
                  <List.Item>Draft grammars per use-case route (so you can resume on the next visit)</List.Item>
                  <List.Item>UI preferences such as color scheme and workspace expanded state</List.Item>
                </List>
                <Text lh={1.6}>
                  You can clear this data at any time via the &ldquo;Data stored in this browser&rdquo; dialog (database
                  icon in the editor header) or by clearing site data in your browser settings.
                </Text>
              </Stack>
            </section>

            <section aria-labelledby="third-parties">
              <Stack gap="sm">
                <Title order={2} id="third-parties" size="h3">
                  Third-party services
                </Title>
                <Text lh={1.6}>
                  The site loads two third-party services. Each has its own privacy policy.
                </Text>

                <Title order={3} size="h5">
                  Google Analytics
                </Title>
                <Text lh={1.6}>
                  We use Google Analytics (GA4) to understand aggregate traffic — which pages are visited, from which
                  countries, and on what devices. Google may set cookies or use similar identifiers to attribute
                  visits. We do not connect this data to any personal account. See the{' '}
                  <Anchor href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                    Google Privacy Policy
                  </Anchor>
                  . To opt out, you can install the{' '}
                  <Anchor href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                    Google Analytics opt-out browser add-on
                  </Anchor>{' '}
                  or block analytics with your browser&rsquo;s privacy tools.
                </Text>

                <Title order={3} size="h5">
                  Tally (feedback form)
                </Title>
                <Text lh={1.6}>
                  We embed a feedback form provided by{' '}
                  <Anchor href="https://tally.so" target="_blank" rel="noopener noreferrer">
                    Tally
                  </Anchor>
                  . The form widget script is loaded from Tally on every page, but no personal data is sent unless you
                  open the form and submit it. Anything you type into the form is processed by Tally. See the{' '}
                  <Anchor href="https://tally.so/help/privacy-policy" target="_blank" rel="noopener noreferrer">
                    Tally Privacy Policy
                  </Anchor>
                  .
                </Text>
              </Stack>
            </section>

            <section aria-labelledby="cookies">
              <Stack gap="sm">
                <Title order={2} id="cookies" size="h3">
                  Cookies
                </Title>
                <Text lh={1.6}>
                  We do not set our own cookies. Cookies or similar identifiers may be set by Google Analytics and
                  Tally as described above.
                </Text>
              </Stack>
            </section>

            <section aria-labelledby="children">
              <Stack gap="sm">
                <Title order={2} id="children" size="h3">
                  Children
                </Title>
                <Text lh={1.6}>
                  This tool is not directed at children. We do not knowingly collect personal information from anyone.
                </Text>
              </Stack>
            </section>

            <section aria-labelledby="changes">
              <Stack gap="sm">
                <Title order={2} id="changes" size="h3">
                  Changes to this policy
                </Title>
                <Text lh={1.6}>
                  If we change how data is handled, this page will be updated. The &ldquo;Last updated&rdquo; date at
                  the top reflects the most recent revision.
                </Text>
              </Stack>
            </section>

            <section aria-labelledby="contact">
              <Stack gap="sm">
                <Title order={2} id="contact" size="h3">
                  Contact
                </Title>
                <Text lh={1.6}>
                  Questions or requests? Email{' '}
                  <Anchor href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Anchor> or use the{' '}
                  <Anchor href="#tally-open=eqKGEx">feedback form</Anchor>.
                </Text>
              </Stack>
            </section>

            <LandingFooter />
          </Stack>
        </Container>
      </main>
    </Box>
  );
}
