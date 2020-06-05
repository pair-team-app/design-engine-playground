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
export const API_ENDPT_URL = 'https://api.pairurl.com/v5/pairurl.php';
export const FETCH_CFG = {
	method  : 'POST',
	headers : { 'Content-Type' : 'application/json' },
	body    : {
		action  : null,
		payload : null
	}
};

export const ChalkStyles = {
	BANNER : (msg)=> (`|:| ${msg} |:|`),
	CMD    : (val)=> (chalk.redBright(`\`${val}\``)),
	ERROR  : chalk.red.bold('ERROR'),
	DONE   : chalk.greenBright.bold('DONE'),
	DEVICE : (val)=> (`[${chalk.grey.bold(val)}]`),
	FOOTER : (len=50)=> (`${chalk.white('\\')}${(new Array(len * 0.5).fill(`${chalk.grey('=')}${chalk.whiteBright('<>')}`)).join('')}${chalk.grey('=')}${chalk.white('/')}\n`),
	H_DIV  : (newline=false, len=50)=> (`${(newline) ? '\n' : ''}${chalk.white('|')}${(new Array(len * 0.5).fill(`${chalk.grey('=')}${chalk.whiteBright('<>')}`)).join('')}${chalk.grey('=')}${chalk.white('|')}${(newline) ? '\n' : ''}`),
	HEADER : (len=50)=> (`\n${chalk.white('/')}${(new Array(len * 0.5).fill(`${chalk.grey('=')}${chalk.whiteBright('<>')}`)).join('')}${chalk.grey('=')}${chalk.white('\\')}`),
	INFO   : chalk.cyanBright.bold('INFO'),
	NUMBER : (val, bare=false)=> ((bare) ? chalk.yellow.bold(val) : `(${chalk.yellow.bold(val)})`),
	PATH   : chalk.magenta.bold,
	TITLE  : (val)=> (chalk.yellowBright(val.toUpperCase())),
	URL    : chalk.blueBright.bold.underline
};
