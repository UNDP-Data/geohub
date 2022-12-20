import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { DatabaseManager, Datasets, MartinManager, Storages } from '../util';

const program = new Command();
program
	.name('martin')
	.description('scan martin layers to register metadata into PostgreSQL database.')
	.requiredOption('-d, --database <dsn>', 'PostgreSQL database connection string')
	.option(
		'-m, --martin-url [martin-url]',
		'URL for martin index.json',
		'https://martin.undpgeohub.org/index.json'
	)
	.option('-o, --output [output]', 'Output directory for temporary working folder', 'tmp')
	.action(async () => {
		console.time('martin');
		const options = program.opts();
		const database: string = options.database;
		const martinUrl: string = options.martinUrl;
		const outputDir: string = path.resolve(options.output);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}

		const martinManager = new MartinManager(martinUrl);
		const data = await martinManager.load();

		const storages = new Storages(data.storages);
		console.log(`${storages.getStorages().length} storage object were created`);
		const datasets = new Datasets(data.datasets, outputDir);
		console.log(`${datasets.getDatasets().length} dataset object were created`);

		const dbManager = new DatabaseManager(database);
		await dbManager.registerAll(storages, datasets);

		console.timeEnd('martin');
	});

export default program;
