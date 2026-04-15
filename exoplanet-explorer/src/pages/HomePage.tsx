import { useEffect, useState } from "react";

import { useOpenSpaceApi } from "@/api/hooks";

import "@mantine/core/styles.css";

export function HomePage() {
  const [nNumPlanets, setNumPlanets] = useState<number | null>(null);
  const luaApi = useOpenSpaceApi();

  useEffect(() => {
    if (!luaApi) {
      return;
    }

    // TODO: Set up a subscription to this property instead of polling it once
    luaApi
      .propertyValue("Modules.ExoplanetsExpertTool.FilteredDataRows")
      .then((res) => {
        console.log("Got property value:", res);
        if (!res) {
          console.warn("Property value is null or undefined");
          setNumPlanets(null);
          return;
        }

        console.log("Type of res:", Object.values(res));
        const numPlanets = Object.values(res).length;
        setNumPlanets(numPlanets);
      })
      .catch((e) => {
        console.error("Failed to get property value:", e);
      });
  }, [luaApi]);

  return (
    <>
      Welcome to the Exoplanet Explorer!{" "}
      {nNumPlanets !== null
        ? ` (Detected filtering resulting in ${nNumPlanets} planets)`
        : ""}
    </>
  );
}
