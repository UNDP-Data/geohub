import { Dataset } from './Dataset';
export interface DatasetFeature {
    type: 'Feature';
    geometry?: {
        type: string;
        coordinates: [number, number] | [number, number][] | [number, number][][];
    };
    properties: Dataset;
}
