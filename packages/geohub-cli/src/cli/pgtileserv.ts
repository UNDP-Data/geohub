import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { DatabaseManager, Datasets, PgtileservManager, Storages } from '../util';

const program = new Command();
program
	.name('pgtileserv')
	.description('scan pg_tileserv layers to register metadata into PostgreSQL database.')
	.requiredOption('-d, --database <dsn>', 'PostgreSQL database connection string')
	.option(
		'-p, --pgtileserv-url [pgtileserv-url]',
		'URL for pg_tileserv index.json',
		'https://pgtileserv.undpgeohub.org/index.json'
	)
	.option('-o, --output [output]', 'Output directory for temporary working folder', 'tmp')
	.action(async () => {
		console.time('pgtileserv');
		const options = program.opts();
		const database: string = options.database;
		const pgtileservUrl: string = options.pgtileservUrl;
		const outputDir: string = path.resolve(options.output);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}

		const pgtileservManager = new PgtileservManager(pgtileservUrl);
		const data = await pgtileservManager.load();

		const storages = new Storages(data.storages);
		console.log(`${storages.getStorages().length} storage object were created`);
		const datasets = new Datasets(data.datasets, outputDir);
		console.log(`${datasets.getDatasets().length} dataset object were created`);

		const dbManager = new DatabaseManager(database);
		await dbManager.registerAll(storages, datasets);

		console.timeEnd('pgtileserv');
	});

export default program;
