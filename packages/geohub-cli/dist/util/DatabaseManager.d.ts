import { PoolClient } from 'pg';
import Datasets from './Datasets';
declare class DatabaseManager {
    private connectionString;
    private pool;
    private client;
    constructor(connectionString: string);
    transactionStart(): Promise<PoolClient>;
    transactionRollback(): Promise<void>;
    transactionEnd(): Promise<void>;
    registerAll(datasets: Datasets): Promise<void>;
    register(datasets: Datasets): Promise<void>;
    deleteDataset(url: string): Promise<void>;
}
export default DatabaseManager;
