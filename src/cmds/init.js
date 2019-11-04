#!/usr/bin/env node
'use strict';


import promise from 'bluebird';
import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';

import { getAll, getUser, writeUser } from '../cache';
import { checkDir, normalize, prettyPrint, savePackage } from '../utils';

promise.promisifyAll(require('fs'));


(async()=> {
	const appendPostbuild = async(data)=> {
		let scripts = await normalize(data);
		scripts['postbuild'] = (!scripts.hasOwnProperty('postbuild')) ? 'npx design-engine --parse' : `${scripts['postbuild']}${(!scripts['postbuild'].includes('npx design-engine --parse')) ? ' && npx design-engine --parse' : ''}`;

		data.scripts = scripts;
		return (data);
	};

	console.log('CACHE >>', getAll());


	const user = getUser();
	console.log('USER >>', user);
	if (!user || user.id === 0) {
		const questions = [{
			type     : 'input',
			name     : 'email',
			message  : 'Enter Email Address',
			validate : (val)=> ((/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(String(val))))
		}, {
			type     : 'password',
			name     : 'password',
			mask     : '*',
			message  : 'Enter Password',
			validate : (val)=> (val.length > 0)
		}];

		const prompt = await inquirer.prompt(questions);
		const { email, password } = prompt;
		writeUser({ ...user, email, password });
	}


	const pkgPath = await checkDir();
	const prompt = await inquirer.prompt({
		type    : 'confirm',
		name    : 'append',
		message : 'Allow Design Engine to add a postbuild script to your project\'s package.json?'
	});

	if (prompt.append) {
		fs.readFileAsync(pkgPath).then(JSON.parse).then(appendPostbuild).then(prettyPrint).then((data)=> savePackage(data, pkgPath)).catch(console.log);
		console.log('%s Successfully modified postbuild script.', chalk.green.bold('INFO'));
	}

	console.log('CACHE >>', getAll());
})();