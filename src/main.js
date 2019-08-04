
import chalk from 'chalk';
import fetch from 'node-fetch';
import fs from 'fs';
import projectName from 'project-name';
import { promisify } from 'util';


const access = promisify(fs.access);

const API_ENDPT_URL = 'https://api.designengine.ai/playground.php';


async function queryPlayground(playgroundID) {
	let response = await fetch(API_ENDPT_URL, {
		method  : 'POST',
		headers : {
			'Content-Type' : 'application/json'
		},
		body    : JSON.stringify({
			action        : 'PLAYGROUND',
			playground_id : playgroundID,
			title         : projectName()
		})
	});

	try {
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', chalk.red.bold('ERROR'), e);
	}

//  console.log('PLAYGROUND -->>', response);
	return (response);
}

export async function syncPlayground(options) {
	console.log('%s Project Name (%s)', chalk.cyan.bold('INFO'), projectName());

	try {
		await access(`${process.cwd()}/build`, fs.constants.R_OK);

	} catch (e) {
		console.log('%s Couldn\'t find build dir! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	console.log('%s Queueing playground…', chalk.cyan.bold('INFO'));

	let response = null;
	try {
		response = await queryPlayground(1);

	} catch (e) {
		console.log('%s Error querying server! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	const playground = { ...response.playground,
		id  : response.playground.id << 0,
		new : response.playground.is_new
	};

//	console.log(response, '-->', playground);

	console.log('%s Compressing files…', chalk.cyan.bold('INFO'));
	console.log('%s Sending zip…', chalk.cyan.bold('INFO'));


	console.log('%s Playground %s! %s', chalk.green.bold('DONE'), (playground), `https://playground.designengine.ai/${playground.id}`);
	return (true);
}
