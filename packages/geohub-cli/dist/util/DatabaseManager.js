"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const helpers_1 = require("../helpers");
const Datasets_1 = __importDefault(require("./Datasets"));
const Tags_1 = __importDefault(require("./Tags"));
class DatabaseManager {
    connectionString;
    pool = undefined;
    client = undefined;
    constructor(connectionString) {
        this.connectionString = connectionString;
    }
    async transactionStart() {
        this.pool = new pg_1.Pool({ connectionString: this.connectionString });
        this.client = await this.pool.connect();
        await this.client.query('BEGIN');
        console.info('Transaction started');
        return this.client;
    }
    async transactionRollback() {
        await this.client?.query('ROLLBACK');
        console.info('Transaction rollbacked');
    }
    async transactionEnd() {
        await this.client?.query('COMMIT');
        console.info('Transaction ended');
        this.client?.release();
        this.pool?.end();
    }
    async registerAll(datasets) {
        const tags = new Tags_1.default([]);
        try {
            datasets.addTags(tags);
            const client = await this.transactionStart();
            await tags.insert(client);
            console.debug(`${tags.getTags().length} tags were registered into PostGIS.`);
            datasets.updateTags(tags);
            await datasets.insertAll(client);
            console.debug(`${datasets.getDatasets().length} datasets were registered into PostGIS.`);
            await tags.cleanup(client);
            console.debug(`unused tags were cleaned`);
        }
        catch (e) {
            await this.transactionRollback();
            throw e;
        }
        finally {
            await this.transactionEnd();
        }
    }
    async register(datasets) {
        const tags = new Tags_1.default([]);
        try {
            datasets.addTags(tags);
            const client = await this.transactionStart();
            await tags.insert(client);
            console.debug(`${tags.getTags().length} tags were registered into PostGIS.`);
            datasets.updateTags(tags);
            for (const dataset of datasets.getDatasets()) {
                await datasets.upsert(client, dataset);
            }
            console.debug(`${datasets.getDatasets().length} datasets were registered into PostGIS.`);
            await tags.cleanup(client);
            console.debug(`unused tags were cleaned`);
        }
        catch (e) {
            await this.transactionRollback();
            throw e;
        }
        finally {
            await this.transactionEnd();
        }
    }
    async deleteDataset(url) {
        const tags = new Tags_1.default([]);
        try {
            const client = await this.transactionStart();
            console.log(`start deleteing storage url = ${url}`);
            const dataset_id = (0, helpers_1.generateHashKey)(url);
            const datasets = new Datasets_1.default([]);
            datasets.delete(client, dataset_id);
            console.log(`deleted dataset by dataset_id: ${dataset_id}`);
            await tags.cleanup(client);
            console.debug(`unused tags were cleaned`);
        }
        catch (e) {
            await this.transactionRollback();
            throw e;
        }
        finally {
            await this.transactionEnd();
        }
    }
}
exports.default = DatabaseManager;
