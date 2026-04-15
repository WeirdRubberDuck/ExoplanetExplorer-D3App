import "@mantine/core/styles.css";

import {
  AppShell,
  createTheme,
  Flex,
  Group,
  MantineProvider,
  Text,
} from "@mantine/core";
import { HomePage } from "@/pages/HomePage";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { DataFileInput } from "@/components/DataFileInput";
import { LuaApiProvider } from "./api/LuaApiProvider";
import { ConnectionStatusHint } from "./components/ConnectionStatusHint";

const theme = createTheme({});

export default function App() {
  return (
    <Provider store={store}>
      <LuaApiProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <AppShell padding="md" header={{ height: 60 }}>
            <AppShell.Header p={"sm"}>
              <Flex justify={"space-between"} align={"center"} h={"100%"}>
                <Group flex={1}>
                  <Text>Exoplanet Explorer</Text>
                  <ConnectionStatusHint />
                </Group>
                <Group>
                  <DataFileInput />
                  <ColorSchemeToggle />
                </Group>
              </Flex>
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
