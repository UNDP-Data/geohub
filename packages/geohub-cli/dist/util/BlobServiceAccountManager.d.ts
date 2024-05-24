import { ContainerClient } from '@azure/storage-blob';
import type { Dataset, Storage } from '../interfaces';
declare class BlobServiceAccountManager {
    private azAccount;
    private azAccountKey;
    private blobServiceClient;
    private sasToken;
    private baseUrl;
    private titilerUrl;
    constructor(azAccount: string, azAccountKey: string, titilerUrl: string);
    listContainers(containerName?: string): Promise<Storage[]>;
    scanContainers(storages: Storage[]): Promise<Dataset[]>;
    scanContainer(storage: Storage): Promise<Dataset[]>;
    scanBlob(url: string): Promise<{
        dataset: Dataset | undefined;
    }>;
    listBlobs(containerClient: ContainerClient, path?: string): Promise<Dataset[]>;
    private createDataset;
    private getRasterMetadata;
    private getVectorMetadata;
}
export default BlobServiceAccountManager;
