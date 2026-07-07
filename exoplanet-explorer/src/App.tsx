import { Provider } from 'react-redux';
import { AppShell, createTheme, MantineProvider } from '@mantine/core';

import { Header } from '@/pages/Header';
import { HomePage } from '@/pages/HomePage';
import { store } from '@/redux/store';

import { LuaApiProvider } from './api/LuaApiProvider';

import '@mantine/core/styles.css';

const theme = createTheme({});

export default function App() {
  return (
    <Provider store={store}>
      <LuaApiProvider>
        <MantineProvider theme={theme} defaultColorScheme={'dark'}>
          <AppShell padding={'md'} header={{ height: 60 }}>
            <AppShell.Header p={'sm'}>
              <Header />
            </AppShell.Header>
            <AppShell.Main>
              <HomePage />
            </AppShell.Main>
          </AppShell>
        </MantineProvider>
      </LuaApiProvider>
    </Provider>
  );
}
