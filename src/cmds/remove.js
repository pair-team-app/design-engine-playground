#!/usr/bin/env node
'use strict';

import promise from 'bluebird';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

promise.promisifyAll(require('fs'));


(async ()=> {
	if (fs.existsSync(`${process.cwd()}/../../node_modules/design-engine-playground/package.json`)) {
		shell.cd('../..');
	}

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

	const dropPostbuild = (data)=> {
		let scripts = normalize(data);

		if (scripts.hasOwnProperty('postbuild')) {
			delete (scripts['postbuild']);
		}

		data.scripts = scripts;

		return (data);
	};

	const prettyPrint = (data)=> {
		return (JSON.stringify(data, null, 4));
	};

	const savePackage = (data)=> {
		return (fs.writeFileAsync(PACKAGE_PATH, data));
	};

	console.log('%s Removing Design Engine postbuild script...', chalk.green.bold('INFO'));
	fs.readFileAsync(PACKAGE_PATH).then(JSON.parse).then(dropPostbuild).then(prettyPrint).then(savePackage).catch(console.log);
})();
