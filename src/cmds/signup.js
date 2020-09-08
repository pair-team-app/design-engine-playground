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
	await initCache();
	await flushAll();
  await reset();

	
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
  
  const user = await registerUser(prompt);
  

  await writeUser(user);
  await writeTeam(await teamLookup(user));

	team = await getTeam();
	if (!team || team.id === 0) {
		const team = await teamLookup(user);
		await writeTeam(team);
	}


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
