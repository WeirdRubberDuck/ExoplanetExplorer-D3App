export type ChartMode = 'parallelcoordinates' | 'scatterplotmatrix';

export interface UrlConfig {
  chart?: ChartMode;
  columns?: string[];
  uncertaintyColumns?: string[];
  host?: string;
  port?: number;
  autoSync?: boolean;
  hideTopBar?: boolean;
  warnings: string[];
}

export function parseUrlConfig(search: string): UrlConfig {
  const params = new URLSearchParams(search);
  const config: UrlConfig = { warnings: [] };
  const chart = params.get('chart');
  if (chart === 'parallelcoordinates') {
    config.chart = chart;
  } else if (chart === 'scatterplotmatrix' || chart === 'cornerplot') {
    config.chart = 'scatterplotmatrix';
  } else if (chart !== null) {
    config.warnings.push('Unknown chart; showing the dashboard.');
  }

  if (config.chart && params.has('columns')) {
    config.columns = [
      ...new Set(
        params.getAll('columns').flatMap((value) =>
          value
            .split(',')
            .map((column) => column.trim())
            .filter(Boolean)
        )
      )
    ];
  }

  if (config.chart === 'parallelcoordinates' && params.has('uncertaintycolumns')) {
    config.uncertaintyColumns = [
      ...new Set(
        params.getAll('uncertaintycolumns').flatMap((value) =>
          value
            .split(',')
            .map((column) => column.trim())
            .filter(Boolean)
        )
      )
    ];
  }

  if (params.has('host')) {
    const host = params.get('host')!.trim();
    if (/^[a-zA-Z0-9.-]+$/.test(host)) {
      config.host = host;
    } else {
      config.warnings.push('Invalid API host; using the default endpoint.');
    }
  }

  if (params.has('port')) {
    const value = params.get('port')!;
    const port = Number(value);
    if (/^\d+$/.test(value) && port >= 1 && port <= 65535) {
      config.port = port;
    } else {
      config.warnings.push('Invalid API port; using the default port.');
    }
  }

  if (params.has('autosync')) {
    const value = params.get('autosync');
    if (value === 'true' || value === 'false') {
      config.autoSync = value === 'true';
    } else {
      config.warnings.push('Invalid autosync value; expected true or false.');
    }
  }

  if (params.has('hidetopbar')) {
    const value = params.get('hidetopbar');
    if (value === 'true' || value === 'false') {
      config.hideTopBar = value === 'true';
    } else {
      config.warnings.push('Invalid hidetopbar value; expected true or false.');
    }
  }
  return config;
}

export function getEligibleUncertaintyColumns(
  candidates: string[],
  selectedColumns: string[],
  columnData: Record<string, { type: string }>,
  uncertaintyDomains: Record<string, { min: number; max: number }>
) {
  return [...new Set(candidates)].filter(
    (column) =>
      selectedColumns.includes(column) &&
      columnData[column]?.type === 'number' &&
      Object.hasOwn(uncertaintyDomains, column)
  );
}

export function resolveApiEndpoint(
  config: UrlConfig,
  environment?: { wsAddress?: string; wsPort?: number }
) {
  return {
    host: config.host ?? (environment?.wsAddress || 'localhost'),
    port: config.port ?? (environment?.wsPort || 4682)
  };
}

export function buildChartUrl(
  href: string,
  config: {
    chart: ChartMode;
    columns: string[];
    uncertaintyColumns?: string[];
    host: string;
    port: number;
    autoSync: boolean;
    hideTopBar?: boolean;
  }
) {
  const url = new URL(href);
  url.searchParams.set('chart', config.chart);
  url.searchParams.set('columns', config.columns.join(','));
  url.searchParams.delete('uncertaintycolumns');
  if (config.chart === 'parallelcoordinates' && config.uncertaintyColumns !== undefined) {
    url.searchParams.set('uncertaintycolumns', config.uncertaintyColumns.join(','));
  }
  url.searchParams.set('host', config.host);
  url.searchParams.set('port', String(config.port));
  url.searchParams.set('autosync', String(config.autoSync));
  if (config.hideTopBar !== undefined) {
    url.searchParams.set('hidetopbar', String(config.hideTopBar));
  }
  return url.href;
}

export const startupConfig = parseUrlConfig(
  typeof window === 'undefined' ? '' : window.location.search
);
