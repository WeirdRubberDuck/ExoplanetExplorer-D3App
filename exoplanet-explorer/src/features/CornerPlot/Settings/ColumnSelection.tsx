import { useMemo } from 'react';
import { Button, Checkbox, Group, MultiSelect } from '@mantine/core';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetCornerPlot,
  setCornerPlotSelectedColumns,
  setCornerPlotSettings
} from '@/redux/local/localSlice';
import type { Column } from '@/types/types';

interface Props {
  primaryColumns: Column[];
}

const astronomyLogDefaults: Column[] = [
  'pl_bmasse',
  'pl_rade',
  'pl_orbper',
  'pl_orbsmax'
];

export function CornerPlotColumnSelection({ primaryColumns }: Props) {
  const {
    columnSelectionIsDefault,
    settings: { selectedColumns, logScaleColumns }
  } = useAppSelector((state) => state.local.cornerPlot);

  const { columns, columnData } = useAppSelector((state) => state.data);

  const numericColumns = useMemo(() => {
    return columns.filter((col) => columnData[col]?.type === 'number');
  }, [columns, columnData]);

  const dispatch = useAppDispatch();

  function setSelected(newSelected: Column[]) {
    const numericOnly = newSelected.filter((col) => numericColumns.includes(col));
    dispatch(setCornerPlotSelectedColumns(numericOnly));
  }

  function setLogScaleColumns(newLogScaleColumns: Column[]) {
    dispatch(setCornerPlotSettings({ logScaleColumns: newLogScaleColumns }));
  }

  function onTogglePrimary(column: Column, checked: boolean) {
    if (checked && !selectedColumns.includes(column)) {
      setSelected([...selectedColumns, column]);
      return;
    }

    if (!checked) {
      setSelected(selectedColumns.filter((col) => col !== column));
    }
  }

  const sortedPrimaryColumns = primaryColumns
    .filter((column) => numericColumns.includes(column))
    .slice()
    .sort();

  return (
    <>
      <Checkbox.Group
        label={'Primary exoplanet columns'}
        value={selectedColumns.filter((col) => sortedPrimaryColumns.includes(col))}
      >
        <Group gap={5}>
          {sortedPrimaryColumns.map((column) => (
            <Checkbox
              key={`corner-primary-${column}`}
              size={'xs'}
              label={column}
              value={column}
              checked={selectedColumns.includes(column)}
              onChange={(event) => onTogglePrimary(column, event.currentTarget.checked)}
              w={120}
            />
          ))}
        </Group>
      </Checkbox.Group>

      <MultiSelect
        label={'All numeric columns'}
        description={'Corner plots require numeric axes.'}
        data={numericColumns}
        searchable
        value={selectedColumns}
        onChange={setSelected}
        hidePickedOptions
      />

      <Group>
        <Button
          variant={'default'}
          disabled={columnSelectionIsDefault}
          onClick={() => dispatch(resetCornerPlot())}
        >
          Reset columns
        </Button>
        <Button
          variant={'light'}
          onClick={() =>
            setLogScaleColumns(
              astronomyLogDefaults.filter((column) => selectedColumns.includes(column))
            )
          }
        >
          Use astronomy log defaults
        </Button>
      </Group>

      <MultiSelect
        label={'Log scale columns'}
        data={selectedColumns}
        searchable
        value={logScaleColumns}
        onChange={setLogScaleColumns}
        hidePickedOptions
      />
    </>
  );
}
