export interface MartinLayerMetadata {
    id: string;
    schema: string;
    table: string;
    srid: number;
    geometry_column: string;
    id_column?: string;
    bounds: [number, number, number, number];
    extent: number;
    buffer: number;
    geometry_type: string;
    properties: {
        [key: string]: string;
    };
}
export interface MartinIndexJson {
    [key: string]: MartinLayerMetadata;
}
