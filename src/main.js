
import chalk from 'chalk';
import fetch from 'node-fetch';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';

const access = promisify(fs.access);
const copy = promisify(ncp);

const API_ENDPT_URL = 'https://api.designengine.ai/playground.php';

async function copyProjectFiles(options) {
	return (copy)
}

async function queryPlayground(userID) {
	let response = await fetch(API_ENDPT_URL, {
		method  : 'POST',
		headers : {
			'Content-Type' : 'application/json'
		},
		body    : JSON.stringify({
			action  : 'PLAYGROUND',
			user_id : userID
		})
	});

	try {
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', chalk.red.bold('ERROR'), e);
	}

	console.log('-->>', response);
	return (response);
}

export async function syncPlayground(options) {
	options = { ...options,
		targetDir : options.targetDir || process.cwd()
	};

	try {
		await access(`${process.cwd()}/build`, fs.constants.R_OK);

	} catch (e) {
		console.log('%s Couldn\'t find build dir! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	console.log('%s Creating playground…', chalk.cyan.bold('INFO'));
	try {
		const playground = await queryPlayground(2);

	} catch (e) {
		console.log('%s Error querying server! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	console.log('%s Playground URL', chalk.cyan.bold('INFO'));

	console.log('%s Compressing files…', chalk.cyan.bold('INFO'));
	console.log('%s Sending zip…', chalk.cyan.bold('INFO'));


	console.log('%s Playground created! %s', chalk.green.bold('DONE'), 'https://playground.designengine.ai/1234');
	return (true);
}
