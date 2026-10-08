// window.OpenSpaceEnvironment is set by a http request to `./environment.js`.
// In production mode, this allows OpenSpace to serve a custom address and port through
// the backend nodejs application.

import OpenSpaceApi from 'openspace-api-js';

import { resolveApiEndpoint, startupConfig } from '@/utils/urlConfig';

declare global {
  interface Window {
    OpenSpaceEnvironment?: {
      wsAddress?: string;
      wsPort?: number;
    };
  }
}

export const apiEndpoint = resolveApiEndpoint(startupConfig, window.OpenSpaceEnvironment);

export const api = OpenSpaceApi(apiEndpoint.host, apiEndpoint.port);
