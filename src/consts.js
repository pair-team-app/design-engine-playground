#!/usr/bin/env node
'use strict';


import chalk from 'chalk';

export const CMD_PARSE = 'npx pair-url --parse';

export const HOSTNAME = '127.0.0.1';
export const PORT = 1066;

export const MIME_TYPES = {
	html : 'text/html',
	txt  : 'text/plain',
	css  : 'text/css',
	gif  : 'image/gif',
	jpg  : 'image/jpeg',
	png  : 'image/png',
	svg  : 'image/svg+xml',
	js   : 'application/javascript'
};

// export const API_ENDPT_URL = 'https://api.designengine.ai/v2/pairurl-2.php';
export const API_ENDPT_URL = 'http://api.pairurl.com/v4/pairurl.php';
export const FETCH_CFG = {
	method  : 'POST',
	headers : { 'Content-Type' : 'application/json' },
	body    : {
		action  : null,
		payload : null
	}
};

export const ChalkStyles = {
	INFO   : chalk.cyanBright.bold('INFO'),
	ERROR  : chalk.red.bold('ERROR'),
	DONE   : chalk.greenBright.bold('DONE'),
	DEVICE : (val)=> (`[${chalk.grey.bold(val)}]`),
	NUMBER : (val, bare=false)=> ((bare) ? chalk.yellow.bold(val) : `(${chalk.yellow.bold(val)})`),
	PATH   : chalk.magenta.bold,
	URL    : chalk.blueBright.bold.underline
};
