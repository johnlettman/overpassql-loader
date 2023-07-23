declare module '*.overpassql' {
  import type { GeoJSON } from 'geojson';

  /**
   * Value of the query.
   */
  const value: string;
  export default value;

  /**
   * Function to convert the module into a string representation of the
   * query using the `value` variable.
   */
  export function toString(): string;

  /**
   * Optional cached GeoJSON response from the query at build time.
   */
  export const cached: GeoJSON | undefined;
}
