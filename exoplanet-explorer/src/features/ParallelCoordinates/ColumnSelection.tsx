import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Group, MultiSelect } from '@mantine/core';

import type { Column } from './types';
import { isSameColumnArray } from './util';

interface Props {
  columns: Column[];
  primaryColumns: Column[];
  defaultSelection?: Column[];
  onSelectionChange?: (selected: Column[]) => void;
}

export function ColumnSelection({
  columns,
  primaryColumns,
  defaultSelection,
  onSelectionChange
}: Props) {
  const [selected, setSelected] = useState<string[]>(defaultSelection || []);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selected);
    }
  }, [selected, onSelectionChange]);

  function onTogglePrimary(column: Column, checked: boolean) {
    if (checked && !selected.includes(column)) {
      setSelected((prev) => [...prev, column]);
    }
    if (!checked) {
      setSelected((prev) => prev.filter((col) => col !== column));
    }
  }

  const selectionIsDefault = useMemo(
    () => isSameColumnArray(selected, defaultSelection || []),
    [selected, defaultSelection]
  );

  return (
    <>
      <Checkbox.Group
        label={'Primary columns'}
        value={selected.filter((col) => primaryColumns.includes(col))}
      >
        <Group gap={5}>
          {primaryColumns.sort().map((column) => (
            <Checkbox
              key={`primary-${column}`}
              size={'xs'}
              label={column}
              value={column}
              checked={selected.includes(column)}
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
        value={selected}
        onChange={setSelected}
        hidePickedOptions
      />
      <Button
        variant={'default'}
        disabled={selectionIsDefault}
        onClick={() => setSelected(defaultSelection || [])}
      >
        Reset columns
      </Button>
    </>
  );
}
