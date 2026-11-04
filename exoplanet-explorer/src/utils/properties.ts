import { api } from '@/api/api';

/**
 * Extracts a string value from a property response, rejecting other response shapes.
 **/
export function getStringPropertyValue(
  response: Awaited<ReturnType<typeof api.getProperty<'StringProperty'>>>
) {
  return response.type === 'property' && typeof response.value.value === 'string'
    ? response.value.value
    : undefined;
}
