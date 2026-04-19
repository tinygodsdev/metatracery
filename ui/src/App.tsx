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
import { COLOR_SCHEME_STORAGE_KEY } from './colorSchemeStorage';
import GrammarApp from './GrammarApp';

const router = createBrowserRouter([
  {
    path: '/*',
    element: <GrammarApp />,
  },
]);

const theme = createTheme({
  primaryColor: 'teal',
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
        <div
          style={{
            height: '100dvh',
            maxHeight: '100dvh',
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <RouterProvider router={router} />
        </div>
      </MantineProvider>
    </>
  );
}
