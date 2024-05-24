import { Dataset } from '../interfaces';
declare class PgtileservManager {
    private pgtileservUrl;
    constructor(pgtileservUrl: string);
    load(): Promise<{
        datasets: Dataset[];
    }>;
}
export default PgtileservManager;
