import { IoMdSettings } from 'react-icons/io';
import { ActionIcon, Drawer, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useAppDispatch, useAppSelector } from '@/redux/hooks.ts';
import { setObjectNameColumn } from '@/redux/local/localSlice.ts';

export function Settings() {
  const { columns, columnData } = useAppSelector((state) => state.data);

  const objectNameColumn = useAppSelector((state) => state.local.objectNameColumn);

  const [settingsOpened, { open, close }] = useDisclosure(false);

  const dispatch = useAppDispatch();

  return (
    <>
      <ActionIcon variant={'default'} onClick={open} aria-label={'Open page settings'}>
        <IoMdSettings />
      </ActionIcon>

      <Drawer
        opened={settingsOpened}
        onClose={close}
        title={'Settings'}
        padding={'md'}
        position={'right'}
        size={400}
      >
        <Select
          label={'Object name column'}
          value={objectNameColumn}
          onChange={(value) => dispatch(setObjectNameColumn(value))}
          data={columns
            .filter((col: string) => columnData[col].type === 'string')
            .map((col) => ({ value: col, label: col }))}
          searchable
        />
      </Drawer>
    </>
  );
}
