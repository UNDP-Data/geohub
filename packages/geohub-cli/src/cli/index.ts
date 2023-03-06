import { Command } from 'commander';
import azblob from './azblob';
import martin from './martin';
import pgtileserv from './pgtileserv';
import stac from './stac';
import cogUnit from './cog-unit-update';

const program = new Command();
const version = require('../../package.json').version;
program
	.version(version, '-v, --version', 'output the version number')
	.addCommand(azblob)
	.addCommand(martin)
	.addCommand(pgtileserv)
	.addCommand(stac)
	.addCommand(cogUnit);

program.parse(process.argv);
