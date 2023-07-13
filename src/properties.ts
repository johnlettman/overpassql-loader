import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import type { PropertiesFilter } from './types';

export const defaultPropertiesFilter: PropertiesFilter = (properties) => {
    if (properties === null || !isTraversible(properties)) return null;
    return (Object.keys(properties)
        .filter(tag => (/(alt_)?name|addr:?.*/i.test(tag)))
        .reduce((newProperties, tag) => {
            newProperties![tag] = properties[tag];
            return newProperties;
        }, {} as GeoJsonProperties));
}


export function isTraversible(obj?: object | null): boolean {
    return (obj !== null 
        && typeof obj !== 'undefined'
        && typeof obj !== 'bigint'
        && typeof obj !== 'boolean'
        && typeof obj !== 'function'
        && typeof obj !== 'string'
        && typeof obj !== 'symbol'
        && typeof obj === 'object');
}

export function hasProperties(obj?: object | null): boolean {
    return (isTraversible(obj)
        && Object.prototype.hasOwnProperty.call(obj, 'properties')
        && isTraversible((obj as { properties?: object }).properties));
}

export function processProperties(geojson: FeatureCollection<Geometry, GeoJsonProperties> | GeoJsonProperties, filter?: PropertiesFilter): GeoJsonProperties {
    if (!filter) filter = defaultPropertiesFilter; // implement default
    if (!isTraversible(geojson)) return null;

    for (const key in geojson) {
        if (isTraversible((geojson as GeoJsonProperties)![key])) {
            if (hasProperties((geojson as GeoJsonProperties)![key])) {
                (geojson as GeoJsonProperties)![key].properties =
                    filter((geojson as GeoJsonProperties)![key].properties);
            }

            (geojson as GeoJsonProperties)![key] =
                processProperties((geojson as GeoJsonProperties)![key], filter);
        }
    }

    return geojson;
} 