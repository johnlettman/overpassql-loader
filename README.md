<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img height="100" vspace="" hspace="25"
      src="https://raw.githubusercontent.com/johnlettman/overpassql-loader/main/.github/assets/webpack-icon.svg">
  </a>
  <a href="https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL">
    <img height="100" vspace="" hspace="25"
      src="https://raw.githubusercontent.com/johnlettman/overpassql-loader/main/.github/assets/overpass-icon.svg">
  </a>
  <h1>OverpassQL Loader</h1>
</div>

[![License][shield-license]][url-license]
[![Package Version][shield-version]][url-npm]
![Programming Language][shield-language]
![Minimized Size][shield-minsize]
![Test Results][shield-test]
[![Code Coverage][shield-codecov]][url-codecov]

This Webpack loader allows you to pull in [OverpassQL][url-overpassql] files as
strings, providing seamless integration of OpenStreetMap data into your
application.


Not only does it allow you to directly load OverpassQL scripts as part of
your Webpack build process, but it also optionally caches the responses
from an [Overpass API server][url-overpassapi-servers] to speed up your
production application.

## Features
- Implemented in TypeScript for strong type safety.
- Load OverpassQL scripts as strings into your JavaScript or TypeScript
  application.
- Optionally cache responses from an Overpass API server.

## Installation
You can install the loader using `npm`, `yarn`, or your preferred JavaScript
package management program.

```bash
yarn add --dev overpassql-loader
```
_or_
```bash
npm install --save-dev overpassql-loader
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
### General advice
The following procedure for contributing changes is recommended:
- Branch to `fix/[issue or description]`, `feature/[issue or description]`, ...
- Implement your changes and commit
- Open a [pull request][url-pr]

Of course, you're welcome to use any reasonable workflow that best suits your
style. After all, I committed to unprotected main throughout this project.

Please add any of the following strings to your commit message if the commit
does not modify any code (e.g., documentation work):

- `[skip ci]`
- `[ci skip]`
- `[no ci]`
- `[skip actions]`
- `[actions skip]`

See: [GitHub documentation, "skipping workflow runs"][ghdocs-skip-actions]

### Versioning
To bump versions:
```bash
yarn version --patch
yarn version --minor
yarn version --major
```

### Licensing
Given this project is licensed under the MIT License, please be mindful that
your contributions will fall under the same licensing scheme.

## Related Projects & Dependencies
The following projects are core to the function of OverpassQL Loader.
They are worth checking out. The authors have my thanks. :-)

### [overpass-ts][repo-overpass-ts]
> promise-based overpass api client in typescript

- [GitHub Repository][repo-overpass-ts]
- [NPM Package][npm-overpass-ts]


### [osmtogeojson][repo-osmtogeojson]
> Converts OSM data to GeoJSON.

- [GitHub Repository][repo-osmtogeojson]
- [NPM Package][npm-osmtogeojson]


## License
This project is licensed under the MIT License.
See `LICENSE` for more information.


[url-overpassql]: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
[url-overpassapi-servers]: https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances

[repo-overpass-ts]: https://github.com/1papaya/overpass-ts
[npm-overpass-ts]: https://www.npmjs.com/package/overpass-ts

[repo-osmtogeojson]: https://github.com/tyrasd/osmtogeojson
[npm-osmtogeojson]: https://www.npmjs.com/package/osmtogeojson

[ghdocs-skip-actions]: https://docs.github.com/en/actions/managing-workflow-runs/skipping-workflow-runs

[url-pr]: https://github.com/johnlettman/overpassql-loader/pulls
[url-npm]: https://www.npmjs.com/package/overpassql-loader
[url-license]: https://github.com/johnlettman/overpassql-loader/blob/main/LICENSE
[url-codecov]: https://codecov.io/gh/johnlettman/overpassql-loader

[shield-license]: https://img.shields.io/npm/l/overpassql-loader?style=for-the-badge
[shield-version]: https://img.shields.io/npm/v/overpassql-loader?style=for-the-badge&logo=npm
[shield-language]: https://img.shields.io/github/languages/top/johnlettman/overpassql-loader?style=for-the-badge&logo=typescript
[shield-minsize]: https://img.shields.io/bundlephobia/min/overpassql-loader?style=for-the-badge
[shield-test]: https://img.shields.io/github/actions/workflow/status/johnlettman/overpassql-loader/test.yml?style=for-the-badge&logo=github&label=test
[shield-codecov]: https://img.shields.io/codecov/c/github/johnlettman/overpassql-loader?style=for-the-badge&logo=codecov


