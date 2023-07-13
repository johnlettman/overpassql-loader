declare module "simplify-geojson" {
    import type { 
        FeatureCollection, 
        Geometry, 
        GeoJsonProperties 
    } from 'geojson';
    
    function simplify(
        feat: FeatureCollection<Geometry, GeoJsonProperties>, 
        tolerance: number): FeatureCollection<Geometry, GeoJsonProperties>;
    
    function simplifyFeature(
        feat: FeatureCollection<Geometry, GeoJsonProperties>, 
        tolerance: number): FeatureCollection<Geometry, GeoJsonProperties>;

    function simplifyFeatureCollection(
        fc: FeatureCollection<Geometry, GeoJsonProperties>,
        tolerance: number): FeatureCollection<Geometry, GeoJsonProperties>;
    
    export default function (
        geojson: FeatureCollection<Geometry, GeoJsonProperties>, 
        tolerance: number, 
        dontClone: boolean): FeatureCollection<Geometry, GeoJsonProperties>;
}