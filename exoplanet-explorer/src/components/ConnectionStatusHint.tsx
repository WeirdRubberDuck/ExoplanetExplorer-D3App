import { useAppSelector } from "@/redux/hooks";
import { Badge } from "@mantine/core";
import { ConnectionStatus } from "@/redux/connection/connectionSlice";

export function ConnectionStatusHint() {
  const isConnected = useAppSelector(
    (state) => state.connection.connectionStatus === ConnectionStatus.Connected,
  );

  return (
    <Badge color={isConnected ? "green" : "red"}>
      {isConnected ? "Connected to OpenSpace" : "Disconnected from OpenSpace"}
    </Badge>
  );
}
