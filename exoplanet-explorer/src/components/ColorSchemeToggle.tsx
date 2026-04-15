import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Tooltip
      label={`${computedColorScheme === "light" ? "Dark" : "Light"} mode`}
    >
      <ActionIcon
        onClick={() =>
          setColorScheme(computedColorScheme === "light" ? "dark" : "light")
        }
        variant={"default"}
        size={"lg"}
        aria-label={"Toggle color scheme"}
      >
        {computedColorScheme === "dark" ? (
          <MdOutlineLightMode />
        ) : (
          <MdOutlineDarkMode />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
