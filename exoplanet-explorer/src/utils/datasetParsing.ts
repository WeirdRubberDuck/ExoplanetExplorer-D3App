import Papa from 'papaparse';

import type { Value } from '@/types/types';

function parseCsvValue(value: string): Value {
  if (value === '') return null;
  const numeric = Number(value);
  return /^\s*[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?\s*$/i.test(value) &&
    Number.isFinite(numeric) &&
    Math.abs(numeric) <= Number.MAX_SAFE_INTEGER
    ? numeric
    : value;
}

export function parseDataset(
  text: string,
  filenameOrUrl: string
): Record<string, Value>[] {
  const pathname = new URL(filenameOrUrl, 'http://localhost/').pathname.toLowerCase();

  console.log(`Parsing dataset from: ${filenameOrUrl}`);

  const content = text.replace(/^\uFEFF/, '');
  let rows: unknown;

  if (pathname.endsWith('.json')) {
    try {
      rows = JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON: expected an array of row objects.');
    }
  } else if (pathname.endsWith('.csv')) {
    const { data, errors } = Papa.parse<string[]>(content, {
      comments: '#',
      skipEmptyLines: 'greedy'
    });
    const error = errors.find((item) => item.code !== 'UndetectableDelimiter');
    if (error) {
      throw new Error(
        `Invalid CSV${error.row === undefined ? '' : ` at row ${error.row + 1}`}: ${error.message}`
      );
    }
    const [headers, ...records] = data;
    if (!headers?.length || headers.some((header) => !header.trim())) {
      throw new Error(
        'CSV must have a nonempty name for every column in its header row.'
      );
    }
    if (new Set(headers).size !== headers.length) {
      throw new Error('CSV column names must be unique.');
    }
    rows = records.map((record, index) => {
      if (record.length !== headers.length) {
        throw new Error(
          `CSV data row ${index + 1} has ${record.length} values; expected ${headers.length}.`
        );
      }
      return Object.fromEntries(
        headers.map((header, index) => [header, parseCsvValue(record[index])])
      );
    });
  } else {
    throw new Error('Unsupported dataset extension. Choose a .json or .csv file.');
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Dataset must contain at least one row.');
  }
  for (const [index, row] of rows.entries()) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error(`Dataset row ${index + 1} must be an object.`);
    }
    const entries = Object.entries(row);
    if (entries.length === 0 || entries.some(([column]) => !column.trim())) {
      throw new Error(`Dataset row ${index + 1} must have nonempty column names.`);
    }
    for (const [column, value] of entries) {
      if (
        value !== null &&
        typeof value !== 'string' &&
        !(typeof value === 'number' && Number.isFinite(value))
      ) {
        throw new Error(
          `Dataset row ${index + 1}, column "${column}": expected a string, finite number, or null.`
        );
      }
    }
  }
  return rows as Record<string, Value>[];
}
