
import arg from 'arg';
import inquirer from 'inquirer';

import {puppet, syncPlayground} from './main';


function parseArgs(argv) {
	const args = arg({
		'--new': Boolean,
		'--replace': Boolean,
		'-n': '--new',
		'-r': '--replace'

	}, {
		argv: argv.slice(2)
	});

	return ({
		gen: args['--new'] || false,
		repl: args['--replace'] || false
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
//	console.log('cli()');

	let options = parseArgs(args);
	options = await promptURL(options);
//	console.log(options);
//	await syncPlayground(options);
	await puppet();
}
