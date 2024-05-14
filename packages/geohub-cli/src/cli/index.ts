import { Command } from 'commander';
import stac from './stac';
// import azblob from './azblob';
// import pgtileserv from './pgtileserv';
// import cogUnit from './cog-unit-update';

const program = new Command();
const version = require('../../package.json').version;
program
	.version(version, '-v, --version', 'output the version number')
	// .addCommand(azblob)
	// .addCommand(pgtileserv)
	// .addCommand(cogUnit)
	.addCommand(stac);

program.parse(process.argv);
