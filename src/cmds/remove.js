#!/usr/bin/env node
'use strict';


import promise from 'bluebird';
import chalk from 'chalk';
import fs from 'fs';

import { checkDir, normalize, prettyPrint, savePackage } from '../utils';

promise.promisifyAll(require('fs'));


(async ()=> {
	const dropPostbuild = (data)=> {
		let scripts = normalize(data);

		if (scripts.hasOwnProperty('postbuild')) {
			if (scripts['postbuild'].includes(' && npx design-engine --parse')) {
				scripts['postbuild'] = scripts['postbuild'].replace(' && npx design-engine --parse', '');

			} else {
				delete (scripts['postbuild']);
			}
		}


		data.scripts = scripts;
		return (data);
	};

	const pkgPath = await checkDir();

	console.log('%s Removing Design Engine postbuild script...', chalk.green.bold('INFO'));
	fs.readFileAsync(pkgPath).then(JSON.parse).then(dropPostbuild).then(prettyPrint).then((data)=> savePackage(data, pkgPath)).catch(console.log);
})();
