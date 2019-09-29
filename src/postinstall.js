#!/usr/bin/env node

const promise = require('bluebird');
const chalk = require('chalk');
let fs = require('fs');
const path = require('path');
const shell = require('shelljs');


promise.promisifyAll(require('fs'));

console.log('%s Adding Design Engine postbuild script...', chalk.green.bold('INFO'));

if (fs.existsSync(`${process.cwd()}/../../node_modules/design-engine-playground/package.json`)) {
	shell.cd('../..');
}

console.log('%s PWD -- ', chalk.green.bold('INFO'), process.cwd());
const PACKAGE_PATH = path.join(process.cwd(), 'package.json');


function normalize(data) {
	let scripts = data.scripts || {};

	if (typeof scripts === 'string' || scripts instanceof String) {
		const v = scripts;
		scripts = {};
		scripts['postbuild'] = v;
	}

	return (scripts);
}

function addPostbuild(data) {
	let scripts = normalize(data);
	scripts['postbuild'] = 'design-engine-playground';
	data.scripts = scripts;

	return (data);
}

function prettyPrint(data) {
	return (JSON.stringify(data, null, 4));
}

function savePackage(data) {
	return (fs.writeFileAsync(PACKAGE_PATH, data));
}


fs.readFileAsync(PACKAGE_PATH).then(JSON.parse).then(addPostbuild).then(prettyPrint).then(savePackage).catch(console.log);
shell.exec('npm link design-engine-playground');
