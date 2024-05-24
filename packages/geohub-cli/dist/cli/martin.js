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
    .name('martin')
    .description('scan martin layers to register metadata into PostgreSQL database.')
    .requiredOption('-d, --database <dsn>', 'PostgreSQL database connection string')
    .option('-m, --martin-url [martin-url]', 'URL for martin index.json', 'https://martin.undpgeohub.org/index.json')
    .option('-o, --output [output]', 'Output directory for temporary working folder', 'tmp')
    .action(async () => {
    console.time('martin');
    const options = program.opts();
    const database = options.database;
    const martinUrl = options.martinUrl;
    const outputDir = path_1.default.resolve(options.output);
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir);
    }
    const martinManager = new util_1.MartinManager(martinUrl);
    const data = await martinManager.load();
    const datasets = new util_1.Datasets(data.datasets, outputDir);
    console.log(`${datasets.getDatasets().length} dataset object were created`);
    const dbManager = new util_1.DatabaseManager(database);
    await dbManager.registerAll(datasets);
    console.timeEnd('martin');
});
exports.default = program;
