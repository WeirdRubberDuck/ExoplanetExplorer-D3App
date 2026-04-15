import { type PropsWithChildren, useEffect, useState } from "react";

import { api } from "@/api/api";
import { closeConnection } from "@/redux/connection/connectionMiddleware";
import {
  ConnectionStatus,
  startConnection,
} from "@/redux/connection/connectionSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import { LuaApiContext } from "./LuaApiContext";

export function LuaApiProvider({ children }: PropsWithChildren) {
  const [luaApi, setLuaApi] = useState<OpenSpace.openspace | null>(null);
  const isConnected = useAppSelector(
    (state) => state.connection.connectionStatus === ConnectionStatus.Connected,
  );
  const dispatch = useAppDispatch();

  // Connect to OpenSpace
  useEffect(() => {
    dispatch(startConnection());
    return () => {
      dispatch(closeConnection());
    };
  }, [dispatch]);

  // Get the Lua Api once the connection has been made
  useEffect(() => {
    const fetchApi = async () => {
      try {
        const res = await api.singleReturnLibrary();
        setLuaApi(res);
      } catch (e) {
        console.error("Failed to fetch Lua API:", e);
      }
    };
    if (isConnected) {
      // Delay fetching the API slightly to ensure it's ready
      const timer = setTimeout(fetchApi, 100);
      return () => clearTimeout(timer);
    }
  }, [isConnected, dispatch]);

  return (
    <LuaApiContext.Provider value={luaApi}>{children}</LuaApiContext.Provider>
  );
}
