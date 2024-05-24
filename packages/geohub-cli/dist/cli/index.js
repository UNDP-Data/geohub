"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const martin_1 = __importDefault(require("./martin"));
const stac_1 = __importDefault(require("./stac"));
// import azblob from './azblob';
// import pgtileserv from './pgtileserv';
// import cogUnit from './cog-unit-update';
const program = new commander_1.Command();
const version = require('../../package.json').version;
program
    .version(version, '-v, --version', 'output the version number')
    // .addCommand(azblob)
    // .addCommand(pgtileserv)
    // .addCommand(cogUnit)
    .addCommand(martin_1.default)
    .addCommand(stac_1.default);
program.parse(process.argv);
