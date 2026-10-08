import { Provider } from 'react-redux';
import { AppShell, Box, createTheme, MantineProvider } from '@mantine/core';

import { Header } from '@/pages/Header';
import { HomePage } from '@/pages/HomePage';
import { StandaloneChartHeader } from '@/pages/StandaloneChartHeader';
import { store } from '@/redux/store';
import { startupConfig } from '@/utils/urlConfig';

import { LuaApiProvider } from './api/LuaApiProvider';

import '@mantine/core/styles.css';

const theme = createTheme({
  components: {
    Tooltip: {
      defaultProps: {
        withArrow: true,
        openDelay: 500
      }
    }
  }
});

export default function App() {
  return (
    <Provider store={store}>
      <LuaApiProvider>
        <MantineProvider theme={theme} defaultColorScheme={'dark'}>
          {startupConfig.chart ? (
            <Box
              style={{
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <StandaloneChartHeader chart={startupConfig.chart} />
              <Box
                component={'main'}
                p={'md'}
                style={{
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <HomePage />
              </Box>
            </Box>
          ) : (
            <AppShell padding={'md'} header={{ height: 60 }}>
              <AppShell.Header p={'sm'}>
                <Header />
              </AppShell.Header>
              <AppShell.Main>
                <HomePage />
              </AppShell.Main>
            </AppShell>
          )}
        </MantineProvider>
      </LuaApiProvider>
    </Provider>
  );
}
