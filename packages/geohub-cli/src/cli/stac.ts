import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { DatabaseManager, Datasets, StacManager, Storages } from '../util';

const program = new Command();
program
	.name('stac')
	.description('scan STAC collections to register metadata into PostgreSQL database.')
	.requiredOption('-d, --database <dsn>', 'PostgreSQL database connection string')
	.requiredOption(
		'-s, --stac <stac>',
		'STAC API root URL. e.g., https://planetarycomputer.microsoft.com/api/stac/v1'
	)
	.option('-o, --output [output]', 'Output directory for temporary working folder', 'tmp')
	.action(async () => {
		console.time('stac');
		const options = program.opts();
		const database: string = options.database;
		const stacUrl: string = options.stac;
		const outputDir: string = path.resolve(options.output);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}

		const stacManager = new StacManager(stacUrl);
		const data = await stacManager.load();

		if (data.datasets.length === 0) {
			throw new Error(`No collections to register in the STAC: ${data.storages[0].url}`);
		}

		const storages = new Storages(data.storages);
		console.log(`${storages.getStorages().length} storage object were created`);
		const datasets = new Datasets(data.datasets, outputDir);
		console.log(`${datasets.getDatasets().length} dataset object were created`);

		const dbManager = new DatabaseManager(database);
		await dbManager.registerAll(storages, datasets);

		console.timeEnd('stac');
	});

export default program;
