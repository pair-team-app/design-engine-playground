
import arg from 'arg';
import inquirer from 'inquirer';

import { parseBuild } from './main';


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
//	console.log('------- cli()');

	let options = parseArgs(args);
//	console.log(options);
	options = await promptURL(options);
	await parseBuild();
}
