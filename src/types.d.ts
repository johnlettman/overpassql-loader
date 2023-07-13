import type { OverpassOptions, OverpassJson } from 'overpass-ts';
import type { OsmToGeoJSONOptions } from "osmtogeojson";
import type { GeoJsonProperties } from "geojson";


declare module "*.overpassql" {
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
    export const cached: GeoJSON|undefined;
}

export type OverpassAPI = (query: string, opts?: Partial<OverpassOptions>) => Promise<OverpassJson>;
export type PropertiesFilter = (properties: GeoJsonProperties) => GeoJsonProperties;
export type Options = {
    /**
     * Emit an ES-style module.
     * (e.g. 'export default' instead of 'module.exports =')
     */
    esModule?: boolean;

    /**
     * Remove comments to save space.
     * The function to strip comments will respect "@preserve" directives.
     */
    stripComments?: boolean;

    /**
     * Remove redundant whitespace to save space.
     */
    stripWhitespace?: boolean;

    /**
     * Preload and cache the Overpass API response from the query.
     * Connects to the Overpass API specified in `endpoint` to execute
     * the query and cache the GeoJSON response in the rendered module.
     */
    cacheGeoJSON?: boolean;

    /**
     * Tolerance value for shape simplification.
     * Function uses the "simplify-geojson" package:
     * https://www.npmjs.com/package/simplify-geojson
     * https://github.com/maxogden/simplify-geojson
     */
    simplificationTolerance?: number;

    /**
     * Avoid clobbering properties when caching the GeoJSON response from the 
     * Overpass API.
     * 
     * The value has no effect when `cacheGeoJSON` is not set or set to false.
     */
    keepProperties?: boolean;

    /**
     * Function to clobber properties (e.g. to remove or keep them).
     * 
     * The value has no effect when `cacheGeoJSON` is not set or set to false.
     * The value has no effect when `keepProperties` is set to true.
     */
    propertiesFilter?: PropertiesFilter;

    /**
     * Options to pass through to the "osmtogeojson" package.
     * @see "osmtogeojson" package:
     * https://github.com/tyrasd/osmtogeojson
     * https://www.npmjs.com/package/osmtogeojson
     * 
     * The value has no effect when `cacheGeoJSON` is not set or set to false.
     */
    osmtogeojsonOptions?: OsmToGeoJSONOptions;

    /**
     * Options to pass through to the Overpass API handler (e.g. "overpass-ts").
     * @see "overpass-ts" package:
     * https://www.npmjs.com/package/overpass-ts
     */
    overpassOptions?: Partial<OverpassOptions>;
}