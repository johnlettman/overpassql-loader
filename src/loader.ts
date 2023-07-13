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
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

// Local types
import type { Options, OverpassAPI } from './types';

/**
 * Fallback OverpassQL endpoint.
 * @type string
 */
const defaultEndpoint: string = 'https://overpass-api.de/api/interpreter';

export let api: OverpassAPI = overpassJson; // eslint-disable-line prefer-const


/**
 * Main OverpassQL webpack loader function.
 * @description Consumes OverpassQL source content and transforms it into a 
 * loadable JavaScript module, optionally with minification and precached 
 * GeoJSON results.
 * 
 * @param this {LoaderContext<Options>} the webpack loader context
 * @param content {string} OverpassQL content
 * @throws when `this` (loader context) is not provided
*/
export default function loader(this: LoaderContext<Options>, content: string): void {
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
        
        const apiOptions: Partial<OverpassOptions> = (
            isTraversible(options.overpassOptions) 
                ? options.overpassOptions! : {});

        apiOptions.endpoint = (
            typeof apiOptions.endpoint === 'string'
                ? apiOptions.endpoint : defaultEndpoint);
        
        logger.debug(`Using endpoint: ${apiOptions.endpoint}`);

        api(content, apiOptions).then(osm => {
            // convert OSM response to GeoJSON
            let geoJSON = osmtogeojson(osm, options.osmtogeojsonOptions);

            if (options.simplificationTolerance) {
                logger.info(`Simplifying, with tolerance ${options.simplificationTolerance}, ${this.resourcePath}`)
                geoJSON = simplify(geoJSON, 
                    options.simplificationTolerance, true);
            }

            if (!options.keepProperties) {
                logger.info(`Stripping properties for ${this.resourcePath}`);
                geoJSON = processProperties(geoJSON, options.propertiesFilter) as 
                    FeatureCollection<Geometry, GeoJsonProperties>;
            }

            callback(
                null,
                `var query=${JSON.stringify(content)};
                ${options.esModule ? 'export default' : 'module.exports ='} {
                    query: query,
                    cached: ${JSON.stringify(geoJSON)},
                    toString: function(){return query;},
                };`);
        }).catch(error => callback(error));
    } else {
        callback(
            null,
            `var query=${JSON.stringify(content)};
            ${options.esModule ? 'export default' : 'module.exports ='} {
                query: query,

                toString: function(){return query;},
            };`);
    }
}