#!/usr/bin/env node


import arg from 'arg';
import inquirer from 'inquirer';


function parseArgs(argv) {
	const args = arg({
		'--init': Boolean,
		'--parse': Boolean,
		'--remove': Boolean,
		'-i': '--init',
		'-p': '--parse',
		'-r': '--remove'

	}, {
		argv: argv.slice(2)
	});

	return ({
		init   : args['--init'] || false,
		parse  : args['--parse'] || true,
		remove : args['--remove'] || false
	});
}

async function promptURL(options) {
	if (options.repl) {
		return ({ ...options,
			playgroundURL : await inquirer.prompt({
				type    : 'input',
				name    : 'playground_url',
				message : 'Playground URL'
			})
		});

	} else {
		return (options);
	}
}

export async function cli(args) {
//	console.log('------- cli()');

	let options = parseArgs(args);
//	console.log(options);

	if (options.init) {
//		console.log('OPTS -- init');
		await require('./cmds/init');

	} else if (options.remove) {
//		console.log('OPTS -- remove');
		await require('./cmds/remove');

	} else if (options.parse) {
//		console.log('OPTS -- parse');
		await require('./cmds/parse');
	}

//	options = await promptURL(options);

}


/*
import cli from 'cli';
import { setup, remove, parse } from './cmds';


export async function run() {
//	console.log('------- cli()');

	await parseBuild();
}


cli.enable('status');

const commands = {
	'setup'  : 'Configure project',
	'remove' : 'Remove config',
	'parse'  : 'Run parser'
};

const options = {
	//'remove' : ['r', "Remove config", 'bool', false]
};

const parsedOpts = cli.parse(options, commands);


if (parsedOpts.json) {
	cli.status = function() {};

} else {
	cli.info(`design-engine-playground : CLI`);
}

const { command, args } = cli;


switch (command.toLowerCase()) {
	case 'setup':
		setup(parsedOpts, args);
		break;

	case 'remove':
		remove(parsedOpts, args);
		break;

	case 'parse':
		parse(parsedOpts, args);
		break;

	default:
		console.log('DEFAULT CMD', command, parsedOpts, args);
		break;
}
*/
