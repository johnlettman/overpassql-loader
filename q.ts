import { overpassJson } from 'overpass-ts';

const q = `
/*
    Test query
*/
[out:json];
way["gnis:feature_id"="1210391"];
out body;
>;
out skel qt;`;



overpassJson(q).then(osm => { console.log(osm) })