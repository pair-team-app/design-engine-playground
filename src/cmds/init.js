#!/usr/bin/env node
'use strict';


import promise from 'bluebird';
import fs from 'fs';
import inquirer from 'inquirer';

import { registerUser, teamLookup } from '../api';
import { initCache, getUser, writeTeam, writeUser, reset, flushAll, getTeam } from '../cache';
import { CMD_PARSE, ChalkStyles } from '../consts';
import { checkDir, normalize, prettyPrint, savePackage } from '../utils';

promise.promisifyAll(require('fs'));


(async()=> {
	const appendPostbuild = async(data)=> {
		let scripts = await normalize(data);
		scripts['postbuild'] = (!scripts.hasOwnProperty('postbuild')) ? CMD_PARSE : `${scripts['postbuild']}${(!scripts['postbuild'].includes(CMD_PARSE)) ? ` && ${CMD_PARSE}` : ''}`;

		data.scripts = scripts;
		return (data);
	};


	await initCache();
//	await flushAll();

	let user = await getUser();
	let team = await getTeam();
	console.log('USER >>', user);
	if (!user) {
		await reset();
	}

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
		// user = await registerUser(prompt);
		// await writeUser({ ...user });

		// const team = await teamLookup(user);
		// await writeTeam(team);
	}

	await writeUser({
		id : 542
	});

	// team = await getTeam();
	if (!team || team.id === 0) {
		// const team = await teamLookup(user);
		await writeTeam(team);
	}

	await writeTeam({
		id : 87
	});

	const pkgPath = await checkDir();
	const prompt = await inquirer.prompt({
		type    : 'confirm',
		name    : 'append',
		message : 'Allow PairURL to add a postbuild script to your project\'s package.json?'
	});

	if (prompt.append) {
		fs.readFileAsync(pkgPath).then(JSON.parse).then(appendPostbuild).then(prettyPrint).then((data)=> savePackage(data, pkgPath)).catch(console.log);
		console.log('%s Successfully modified postbuild script.', ChalkStyles.INFO);
	}
})();
