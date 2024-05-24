export interface BandMetadata {
    STATISTICS_MAXIMUM?: number;
    STATISTICS_MEAN?: number;
    STATISTICS_MINIMUM: number;
    STATISTICS_STDDEV: number;
    STATISTICS_VALID_PERCENT: number;
    STATISTICS_UNIQUE_VALUES?: object;
    Description?: string;
    RepresentationType?: string;
    Source?: string;
    Unit?: string;
}
export interface RasterTileMetadata {
    band_descriptions?: string[];
    band_metadata?: [string[] | BandMetadata[]];
    bounds?: [] | string;
    colorinterp?: [];
    count?: number;
    driver?: string;
    dtype?: string;
    height?: number;
    maxzoom?: number;
    minzoom?: number;
    nodata_type?: string;
    nodata_value?: number;
    overviews?: [];
    width?: number;
}
