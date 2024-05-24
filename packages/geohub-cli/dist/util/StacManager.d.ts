import { Dataset } from '../interfaces';
declare class StacManager {
    private stacUrl;
    constructor(stacUrl: string);
    load(): Promise<{
        datasets: Dataset[];
    }>;
    private loadStac;
    private loadDatasets;
    private getItem;
}
export default StacManager;
