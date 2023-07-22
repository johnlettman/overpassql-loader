<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img height="200" vspace="" hspace="25"
      src="./.github/assets/webpack-icon.svg">
    <img height="200" vspace="" hspace="25"
      src="./.github/assets/overpass-icon.svg">
  </a>
  <h1>OverpassQL Loader</h1>
  <p>
    This Webpack loader allows you to pull in
    <a href="https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL">
      OverpassQL
    </a>
    files as strings, providing seamless integration of OpenStreetMap data into
    your application.
    <br><br>
    Not only does it allow you to directly load OverpassQL scripts as part of
    your Webpack build process, but it also optionally caches the responses
    from an
    <a href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances">
      Overpass API server
    </a>
    to speed up your production application.
  <p>
</div>




## Features
- Implemented in TypeScript for strong type safety.
- Load OverpassQL scripts as strings into your JavaScript or TypeScript
  application.
- Optionally cache responses from an Overpass API server.

## Installation
You can install the loader using `npm`, `yarn`, or your preferred JavaScript
package management program.

```bash
npm install --save-dev overpassql-loader
```
_or_

```bash
yarn add --dev overpassql-loader
```

## Usage
Add `overpassql-loader` to your Webpack configuration:

```typescript
import type { Configuration, RuleSetUse } from 'webpack';
import type { PropertiesFilter } from 'overpassql-loader';

const IS_DEV: boolean = (process.env.NODE_ENV === 'development');

const propertiesFilter: PropertiesFilter = (properties) => ({
  return (Object.keys(properties)
    .filter(tag => /addr:.*/i.test(tag))
    .reduce((filtered, tag) => {
      filtered[tag] = properties[tag];
      return filtered;
    }, {}));
});

const useOverpassql: RuleSetUse = {
  test: /\.overpass(ql)?$/,
  options: {
    // minify the query
    stripWhitespace: !IS_DEV,
    stripComments: !IS_DEV,

    // cache API response
    cacheGeoJSON: !IS_DEV,

    // remove tags we're not interested in
    keepProperties: false,
    propertiesFilter
  }
}

export const config: Configuration = {
  module: {
    rules: [useOverpassql]
  }
}
```

Use the `import` in your project:

```typescript
import { overpassJson } from 'overpass-ts';
import osmtogeojson from 'osmtogeojson';
import query from './my-query.overpassql';

const endpoint: string = 'https://overpass-api.de/api/interpreter';

console.log(query); // print the query to console
overpassJson(query, { endpoint }).then((osmdata) => {
  const geoJSON = osmtogeojson(osmdata);

  // work with the GeoJSON or OSM response
  // e.g., integrate with Leaflet.js GeoJSON layers
});
```

## Contributing



## License
This project is licensed under the [MIT License](./LICENSE).
See `LICENSE` for more information.

