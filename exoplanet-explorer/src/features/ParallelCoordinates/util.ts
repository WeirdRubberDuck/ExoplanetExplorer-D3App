import * as d3 from "d3";

export type WithId = { id: string | number };
export type Value = string | number | null;
export type DataItem = WithId & Record<string, Value>;

export type Dimension =
  | {
      key: string;
      type: "number";
      scale: d3.ScaleLinear<number, number>;
    }
  | {
      key: string;
      type: "string";
      scale: d3.ScalePoint<string>;
    };

export function inferDimensions(
  data: DataItem[],
  columns: string[],
  height: number,
): Dimension[] {
  if (!data.length) return [];

  return columns.map((key) => {
    const values = data.map((d) => d[key]).filter((v) => v != null);

    const numericValues = values.map((v) => Number(v));

    const numericCount = numericValues.filter((v) => !isNaN(v)).length;
    const numericRatio = values.length === 0 ? 0 : numericCount / values.length;
    const isNumeric = numericRatio > 0.8;

    if (isNumeric) {
      const cleanValues = numericValues.filter((v) => !isNaN(v));

      const scale = d3
        .scaleLinear()
        .domain(d3.extent(cleanValues) as [number, number])
        .nice()
        .range([height, 0]);

      return {
        key,
        type: "number",
        scale,
      };
    }

    const categories = Array.from(new Set(values.map((v) => String(v))));

    const scale = d3
      .scalePoint<string>()
      .domain(categories)
      .range([height, 0])
      .padding(0.5);

    return {
      key,
      type: "string",
      scale,
    };
  });
}
