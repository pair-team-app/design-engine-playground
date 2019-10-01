#!/usr/bin/env node
'use strict';


import promise from 'bluebird';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import shell from 'shelljs';

promise.promisifyAll(require('fs'));


(async()=> {
	if (fs.existsSync(`${process.cwd()}/../../node_modules/design-engine-playground/package.json`)) {
		shell.cd('../..');
	}

//	console.log('%s PWD -- ', chalk.green.bold('INFO'), process.cwd());
	const PACKAGE_PATH = path.join(process.cwd(), 'package.json');

	const normalize = (data)=> {
		let scripts = data.scripts || {};

		if (typeof scripts === 'string' || scripts instanceof String) {
			const v = scripts;
			scripts = {};
			scripts['postbuild'] = v;
		}

		return (scripts);
	};

	const addPostbuild = (data)=> {
		let scripts = normalize(data);
		scripts['postbuild'] = 'npx design-engine --parse';
		data.scripts = scripts;

		return (data);
	};

	const prettyPrint = (data)=> {
		return (JSON.stringify(data, null, 4));
	};

	const savePackage = (data)=> {
		return (fs.writeFileAsync(PACKAGE_PATH, data));
	};


	const prompt = await inquirer.prompt({
		type    : 'input',
		name    : 'confirm',
		message : 'Allow Design Engine to add a postbuild script to your project\'s package.json? [Y/n]'
	});

	if (prompt.confirm === '' || prompt.confirm.toUpperCase() === 'Y') {
		console.log('%s Adding Design Engine postbuild script...', chalk.green.bold('INFO'));
		fs.readFileAsync(PACKAGE_PATH).then(JSON.parse).then(addPostbuild).then(prettyPrint).then(savePackage).catch(console.log);
	}
})();