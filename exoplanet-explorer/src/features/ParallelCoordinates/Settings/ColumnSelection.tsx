import { useMemo } from 'react';
import { Button, Checkbox, Group, MultiSelect } from '@mantine/core';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetParallelCoordinates,
  setParallelCoordinatesSelectedColumns,
  setParallelCoordinatesSettings
} from '@/redux/local/localSlice';
import type { Column } from '@/types/types';

interface Props {
  primaryColumns: Column[];
}

export function ColumnSelection({ primaryColumns }: Props) {
  const {
    columnSelectionIsDefault,
    settings: { selectedColumns, logScaleColumns }
  } = useAppSelector((state) => state.local.parallelCoordinates);

  const { columns, columnData } = useAppSelector((state) => state.data);

  const numericColumns = useMemo(() => {
    return columns.filter(
      (col) => columnData[col].type === 'number' && !columnData[col].isUncertainty
    );
  }, [columns, columnData]);

  const dispatch = useAppDispatch();

  function setSelected(newSelected: Column[]) {
    dispatch(setParallelCoordinatesSelectedColumns(newSelected));
  }

  function setLogScaleColumns(newLogScaleColumns: Column[]) {
    dispatch(setParallelCoordinatesSettings({ logScaleColumns: newLogScaleColumns }));
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
      <MultiSelect
        label={'Log scale columns'}
        data={numericColumns}
        searchable
        value={logScaleColumns}
        onChange={setLogScaleColumns}
        hidePickedOptions
      />
    </>
  );
}
