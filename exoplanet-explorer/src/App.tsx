import "@mantine/core/styles.css";

import {
  AppShell,
  Center,
  createTheme,
  Flex,
  MantineProvider,
} from "@mantine/core";
import { HomePage } from "@/pages/HomePage";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { DataFileInput } from "@/components/DataFileInput";

const theme = createTheme({});

export default function App() {
  return (
    <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <AppShell padding="md" header={{ height: 60 }}>
          <AppShell.Header p={"sm"}>
            <Flex justify={"space-between"} align={"center"} h={"100%"}>
              <Center>Exoplanet Explorer</Center>
              <DataFileInput />
              <ColorSchemeToggle />
            </Flex>
          </AppShell.Header>
          <AppShell.Main>
            <HomePage />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </Provider>
  );
}
