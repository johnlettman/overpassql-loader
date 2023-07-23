import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import type { PropertiesFilter } from './loader';

/**
 * The default OpenStreetMaps properties and tags filter.
 * This removes everything but names and addresses.
 *
 * @param properties Key-value object containing OpenStreetMap tags
 * @returns Properties with tags other than name and address removed
 */
export const defaultPropertiesFilter: PropertiesFilter = (properties) => {
  if (properties === null || !isTraversible(properties)) return null;
  return Object.keys(properties)
    .filter((tag) => /(alt_)?name|addr:?.*/i.test(tag))
    .reduce((newProperties, tag) => {
      newProperties![tag] = properties[tag];
      return newProperties;
    }, {} as GeoJsonProperties);
};

/**
 * Helper function to determine whether an object is a real traversible
 * key-value object, e.g., GeoJSON.
 *
 * @param obj The object to check
 * @returns True when the object is traversible
 */
export function isTraversible(obj?: object | null): boolean {
  return (
    obj !== null &&
    typeof obj !== 'undefined' &&
    typeof obj !== 'bigint' &&
    typeof obj !== 'boolean' &&
    typeof obj !== 'function' &&
    typeof obj !== 'string' &&
    typeof obj !== 'symbol' &&
    typeof obj === 'object'
  );
}

/**
 * Helper function to determine whether an object contains OpenStreetMaps
 * GeoJSON properties.
 *
 * @param obj The object to check
 * @returns True when the object contains properties
 */
export function hasProperties(obj?: object | null): boolean {
  return (
    isTraversible(obj) &&
    Object.prototype.hasOwnProperty.call(obj, 'properties') &&
    isTraversible((obj as { properties?: object }).properties)
  );
}

/**
 * Helper function to process OpenStreetMaps GeoJSON with the supplied filter
 * function. Scans the entire object at multiple levels for filtering.
 *
 * @param geojson OpenStreetMaps GeoJSON object
 * @param filter filtering function
 * @returns OpenStreetMaps GeoJSON object after filtering with the function
 */
export function processProperties(
  geojson: FeatureCollection<Geometry, GeoJsonProperties> | GeoJsonProperties,
  filter?: PropertiesFilter
): GeoJsonProperties {
  if (!filter) filter = defaultPropertiesFilter; // implement default
  if (!isTraversible(geojson)) return null;

  for (const key in geojson) {
    if (isTraversible((geojson as GeoJsonProperties)![key])) {
      if (hasProperties((geojson as GeoJsonProperties)![key])) {
        (geojson as GeoJsonProperties)![key].properties = filter(
          (geojson as GeoJsonProperties)![key].properties
        );
      }

      (geojson as GeoJsonProperties)![key] = processProperties(
        (geojson as GeoJsonProperties)![key],
        filter
      );
    }
  }

  return geojson;
}
