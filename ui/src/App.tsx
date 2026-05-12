import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import {
  MantineProvider,
  createTheme,
  ColorSchemeScript,
  localStorageColorSchemeManager,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { appSurfaceVariablesResolver } from './appSurfaceVariablesResolver';
import HomeLanding from './components/HomeLanding';
import PrivacyPolicy from './components/PrivacyPolicy';
import { COLOR_SCHEME_STORAGE_KEY } from './colorSchemeStorage';
import GrammarApp from './GrammarApp';
import { PRIVACY_PATH } from './seo/useCases';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLanding />,
  },
  {
    path: PRIVACY_PATH,
    element: <PrivacyPolicy />,
  },
  {
    path: '*',
    element: <GrammarApp />,
  },
]);

const theme = createTheme({
  primaryColor: 'teal',
  fontFamily:
    '"Google Sans", Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif',
  fontFamilyMonospace:
    '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  headings: {
    fontFamily:
      '"Google Sans", Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif',
  },
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
  components: {
    Text: { defaultProps: { size: 'sm' } },
    Anchor: { defaultProps: { size: 'sm' } },
    List: { defaultProps: { size: 'sm' } },
    Code: { defaultProps: { fz: 'sm' } },
  },
});

export default function App() {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" localStorageKey={COLOR_SCHEME_STORAGE_KEY} />
      <MantineProvider
        theme={theme}
        defaultColorScheme="light"
        cssVariablesResolver={appSurfaceVariablesResolver}
        colorSchemeManager={localStorageColorSchemeManager({
          key: COLOR_SCHEME_STORAGE_KEY,
        })}
      >
        <Notifications />
        <div style={{ minHeight: '100dvh' }}>
          <RouterProvider router={router} />
        </div>
      </MantineProvider>
    </>
  );
}
