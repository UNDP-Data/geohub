import { Dataset } from '../interfaces';
declare class MartinManager {
    private martinUrl;
    constructor(martinUrl: string);
    load(): Promise<{
        datasets: Dataset[];
    }>;
}
export default MartinManager;
