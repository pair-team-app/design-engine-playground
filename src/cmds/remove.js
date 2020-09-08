#!/usr/bin/env node
'use strict';


import promise from 'bluebird';
import fs from 'fs';
import inquirer from 'inquirer';

import { disableAccount } from '../api';
import { flushAll, getUser } from '../cache';
import { CMD_PARSE, ChalkStyles } from '../consts';
import { checkDir, normalize, prettyPrint, savePackage } from '../utils';

promise.promisifyAll(require('fs'));


(async ()=> {
	const dropPostbuild = (data)=> {
		let scripts = normalize(data);

		if (scripts.hasOwnProperty('postbuild')) {
			if (scripts['postbuild'].includes(` && ${CMD_PARSE}`)) {
				scripts['postbuild'] = scripts['postbuild'].replace(` && ${CMD_PARSE}`, '');

			} else {
				delete (scripts['postbuild']);
			}
		}


		data.scripts = scripts;
		return (data);
	};

	const pkgPath = await checkDir();

	console.log('%s Removing Pair URL postbuild script...', ChalkStyles.INFO);
	fs.readFileAsync(pkgPath).then(JSON.parse).then(dropPostbuild).then(prettyPrint).then((data)=> savePackage(data, pkgPath)).catch(console.log);

	const prompt = await inquirer.prompt({
		type    : 'confirm',
		name    : 'disable',
		message : 'Delete your PairURL account as well?'
	});

	if (prompt.disable) {
		await flushAll();
		const user = await disableAccount(await getUser());
		console.log('%s Successfully deleted your PairURL account (%s).', ChalkStyles.INFO, ChalkStyles.PATH(user.email));
	}
})();
