import type { Column } from '@/types/types';

export type Dimension =
  | {
      key: Column;
      type: 'number';
      scale: d3.ScaleLinear<number, number>;
      isUncertainty?: boolean;
    }
  | {
      key: Column;
      type: 'string';
      scale: d3.ScalePoint<string>;
      isUncertainty?: false;
    };

export type BrushFilter =
  | {
      type: 'number';
      extent: [number, number];
    }
  | {
      type: 'string';
      selected: string[];
      normalizedExtent: [number, number];
    };

export enum NanBrushMode {
  Block,
  Filter
}
