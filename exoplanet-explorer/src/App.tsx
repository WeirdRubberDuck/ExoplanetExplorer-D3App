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

const theme = createTheme({
  /** Your theme override here */
});

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AppShell padding="md" header={{ height: 60 }}>
        <AppShell.Header p={"sm"}>
          <Flex justify={"space-between"} align={"center"} h={"100%"}>
            <Center>Exoplanet Explorer</Center>
            <ColorSchemeToggle />
          </Flex>
        </AppShell.Header>
        <AppShell.Main>
          <HomePage />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
