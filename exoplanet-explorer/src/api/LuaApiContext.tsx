import { createContext } from 'react';
import type { OpenSpaceLibrary } from 'openspace-api-js/types';

export const LuaApiContext = createContext<OpenSpaceLibrary | null>(null);
