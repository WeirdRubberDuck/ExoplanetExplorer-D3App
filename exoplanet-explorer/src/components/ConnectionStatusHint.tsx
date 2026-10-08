import { Badge } from '@mantine/core';

import { ConnectionStatus } from '@/redux/connection/connectionSlice';
import { useAppSelector } from '@/redux/hooks';

interface Props {
  short?: boolean;
}

export function ConnectionStatusHint({ short }: Props) {
  const isConnected = useAppSelector(
    (state) => state.connection.connectionStatus === ConnectionStatus.Connected
  );

  return (
    <Badge color={isConnected ? 'green' : 'red'}>
      {isConnected
        ? short
          ? 'Connected'
          : 'Connected to OpenSpace'
        : short
          ? 'Disconnected'
          : 'Disconnected from OpenSpace'}
    </Badge>
  );
}
