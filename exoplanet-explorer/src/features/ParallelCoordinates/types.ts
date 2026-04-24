export type WithId = { id: string | number };
export type Value = string | number | null;
export type DataItem = WithId & Record<string, Value>;

export type Column = string;

export type Dimension =
  | {
      key: Column;
      type: 'number';
      scale: d3.ScaleLinear<number, number>;
    }
  | {
      key: Column;
      type: 'string';
      scale: d3.ScalePoint<string>;
    };

export type BrushFilter =
  | {
      type: 'number';
      extent: [number, number];
    }
  | {
      type: 'string';
      selected: string[];
    };

export enum NanBrushMode {
  Block,
  Filter
}
