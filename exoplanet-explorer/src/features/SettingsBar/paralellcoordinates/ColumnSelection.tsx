import { Button, Checkbox, Group, MultiSelect } from '@mantine/core';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetParallelCoordinates,
  setParallelCoordinatesSelectedColumns
} from '@/redux/local/localSlice';
import type { Column } from '@/types/types';

interface Props {
  columns: Column[];
  primaryColumns: Column[];
}

export function ColumnSelection({ columns, primaryColumns }: Props) {
  const {
    columnSelectionIsDefault,
    settings: { selectedColumns }
  } = useAppSelector((state) => state.local.parallelCoordinates);

  const dispatch = useAppDispatch();

  function setSelected(newSelected: Column[]) {
    dispatch(setParallelCoordinatesSelectedColumns(newSelected));
  }

  function onTogglePrimary(column: Column, checked: boolean) {
    if (checked && !selectedColumns.includes(column)) {
      setSelected([...selectedColumns, column]);
    }
    if (!checked) {
      setSelected(selectedColumns.filter((col) => col !== column));
    }
  }

  const sortedPrimaryColumns = primaryColumns.slice().sort();

  return (
    <>
      <Checkbox.Group
        label={'Primary columns'}
        value={selectedColumns.filter((col) => primaryColumns.includes(col))}
      >
        <Group gap={5}>
          {sortedPrimaryColumns.sort().map((column) => (
            <Checkbox
              key={`primary-${column}`}
              size={'xs'}
              label={column}
              value={column}
              checked={selectedColumns.includes(column)}
              onChange={(event) => onTogglePrimary(column, event.currentTarget.checked)}
              w={110}
            />
          ))}
        </Group>
      </Checkbox.Group>
      <MultiSelect
        label={'All columns'}
        data={columns}
        searchable
        value={selectedColumns}
        onChange={setSelected}
        hidePickedOptions
      />
      <Button
        variant={'default'}
        disabled={columnSelectionIsDefault}
        onClick={() => dispatch(resetParallelCoordinates())}
      >
        Reset columns
      </Button>
    </>
  );
}
