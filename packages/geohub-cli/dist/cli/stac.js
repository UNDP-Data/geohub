"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("../util");
const program = new commander_1.Command();
program
    .name('stac')
    .description('scan STAC collections to register metadata into PostgreSQL database.')
    .requiredOption('-d, --database <dsn>', 'PostgreSQL database connection string')
    .requiredOption('-s, --stac <stac>', 'STAC API root URL. e.g., https://planetarycomputer.microsoft.com/api/stac/v1')
    .option('-o, --output [output]', 'Output directory for temporary working folder', 'tmp')
    .action(async () => {
    console.time('stac');
    const options = program.opts();
    const database = options.database;
    const stacUrl = options.stac;
    const outputDir = path_1.default.resolve(options.output);
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir);
    }
    const stacManager = new util_1.StacManager(stacUrl);
    const data = await stacManager.load();
    if (data.datasets.length === 0) {
        throw new Error(`No collections to register in the STAC`);
    }
    const datasets = new util_1.Datasets(data.datasets, outputDir);
    console.log(`${datasets.getDatasets().length} dataset object were created`);
    const dbManager = new util_1.DatabaseManager(database);
    await dbManager.registerAll(datasets);
    console.timeEnd('stac');
});
exports.default = program;
