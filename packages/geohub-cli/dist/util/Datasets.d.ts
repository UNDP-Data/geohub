import { PoolClient } from 'pg';
import { Dataset } from '../interfaces';
import Tags from './Tags';
declare class Datasets {
    private datasets;
    getDatasets(): Dataset[];
    private tmpDir;
    constructor(datasets: Dataset[], tmpDir?: string);
    addTags(tags: Tags): void;
    updateTags(tags: Tags): void;
    private getDeleteIds;
    insertAll(client: PoolClient): Promise<Dataset[]>;
    private bulkInsert;
    private bulkInsertTabs;
    clearAll(client: PoolClient, datasetIds: string[]): Promise<void>;
    insert(client: PoolClient, dataset: Dataset): Promise<Dataset>;
    upsert(client: PoolClient, dataset: Dataset): Promise<Dataset>;
    delete(client: PoolClient, datasetId: string): Promise<void>;
}
export default Datasets;
