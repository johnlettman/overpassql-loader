// Core libraries
import { overpassJson } from 'overpass-ts';
import osmtogeojson from 'osmtogeojson';
import simplify from 'simplify-geojson';

// Local libraries
import { processProperties, isTraversible } from './properties';
import { stripWhitespace, stripComments } from './syntax';

// External types
import type { LoaderContext } from 'webpack';
import type { OverpassOptions } from 'overpass-ts';
import type { OsmToGeoJSONOptions } from 'osmtogeojson';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

/**
 * Fallback OverpassQL endpoint.
 * @type string
 */
const defaultEndpoint: string = 'https://overpass-api.de/api/interpreter';

/**
 * API function for Overpass JSON responses.
 * Useful if you want to implement your own way of doing it. :-)
 */
export let api: typeof overpassJson = overpassJson; // eslint-disable-line prefer-const

export type PropertiesFilter = (
  properties: GeoJsonProperties
) => GeoJsonProperties;

/**
 * OverpassQL Loader options.
 */
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
};

/**
 * Main OverpassQL webpack loader function.
 * @description Consumes OverpassQL source content and transforms it into a
 * loadable JavaScript module, optionally with minification and precached
 * GeoJSON results.
 *
 * @param this the webpack loader context
 * @param content OverpassQL content
 * @throws when `this` (loader context) is not provided
 */
export default function loader(
  this: LoaderContext<Options>,
  content: string
): void {
  if (!this) throw new Error('No loader context provided');
  if (!('async' in this) || !this.async || typeof this.async !== 'function')
    throw new Error('No loader callback provided');

  const callback = this.async();
  const options = this.getOptions();
  const logger = this.getLogger();

  if (typeof content !== 'string') {
    callback(new Error(`Unusual content type: ${typeof content}`));
  }

  if (content.trim() === '') {
    logger.warn(`No content provided! See: ${content}`);
    callback(null, '');
  }

  if (options.stripComments) {
    logger.info(`Stripping comments from ${this.resourcePath}`);
    content = stripComments(content);
  }

  if (options.stripWhitespace) {
    logger.info(`Stripping content from ${this.resourcePath}`);
    content = stripWhitespace(content);
  }

  if (options.cacheGeoJSON) {
    logger.info(`Caching GeoJSON response for ${this.resourcePath}`);

    const apiOptions: Partial<OverpassOptions> = isTraversible(
      options.overpassOptions
    )
      ? options.overpassOptions!
      : {};

    apiOptions.endpoint =
      typeof apiOptions.endpoint === 'string'
        ? apiOptions.endpoint
        : defaultEndpoint;

    logger.debug(`Using endpoint: ${apiOptions.endpoint}`);

    api(content, apiOptions)
      .then((osm) => {
        // convert OSM response to GeoJSON
        let geoJSON = osmtogeojson(osm, options.osmtogeojsonOptions);

        if (options.simplificationTolerance) {
          logger.info(
            `Simplifying, with tolerance ${options.simplificationTolerance}, ${this.resourcePath}`
          );
          geoJSON = simplify(geoJSON, options.simplificationTolerance, true);
        }

        if (!options.keepProperties) {
          logger.info(`Stripping properties for ${this.resourcePath}`);
          geoJSON = processProperties(
            geoJSON,
            options.propertiesFilter
          ) as FeatureCollection<Geometry, GeoJsonProperties>;
        }

        callback(
          null,
          `var query=${JSON.stringify(content)};
                ${options.esModule ? 'export default' : 'module.exports ='} {
                    query: query,
                    cached: ${JSON.stringify(geoJSON)},
                    toString: function(){return query;},
                };`
        );
      })
      .catch((error) => callback(error));
  } else {
    callback(
      null,
      `var query=${JSON.stringify(content)};
            ${options.esModule ? 'export default' : 'module.exports ='} {
                query: query,

                toString: function(){return query;},
            };`
    );
  }
}
