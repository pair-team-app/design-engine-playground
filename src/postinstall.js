#!/usr/bin/env node

console.log('Post-install script HERE!');

import chalk from "chalk/types/index";
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';


const access = promisify(fs.access);
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


(async function() {
	try {
		await access(PACKAGE_PATH, fs.constants.R_OK);

	} catch (e) {
		console.log('%s Couldn\'t find package.json! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	fs.readFileAsync(PACKAGE_PATH).then(JSON.parse).then(addPostbuild).then(prettyPrint).then(savePackage).catch(console.log);
	console.log('%s Successfully installed design-engine-playground!', chalk.green.bold('INFO'))
})();
