import { Command } from 'commander';
import { DatabaseManager } from '../util';
import fs from 'fs';
import path from 'path';

const program = new Command();
program
	.name('delete')
	.description('Delete items by storage URL')
	.requiredOption('-d, --database <dsn>', 'PostgreSQL database connection string')
	.requiredOption('-u, --url <url>', 'Storage URL to be deleted')
	.option('-o, --output [output]', 'Output directory for temporary working folder', 'tmp')
	.action(async () => {
		console.time('delete');
		const options = program.opts();
		const database: string = options.database;
		const url: string = options.url;
		const outputDir: string = path.resolve(options.output);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}

		const dbManager = new DatabaseManager(database);
		await dbManager.deleteStorage(url, outputDir);

		console.timeEnd('delete');
	});

export default program;
