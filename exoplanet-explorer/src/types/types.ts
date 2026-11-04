export type WithId = { id: number };
export type Value = string | number | null;
export type DataItem = WithId & Record<string, Value>;

export type Column = string;

export type ColumnData =
  | { type: 'number'; min: number; max: number; isUncertainty?: boolean }
  | { type: 'string'; categories: string[] };

export type Uncertainty = {
  lower: number | null;
  upper: number | null;
  percentage?: number | null;
};

export type UncertaintyDataItem = Record<Column, Uncertainty>;
