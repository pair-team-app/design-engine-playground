#!/usr/bin/env node


import arg from 'arg';


function parseArgs(argv) {
	const args = arg({
		'--init'   : Boolean,
		'--parse'  : Boolean,
		'--remove' : Boolean,
		'-i'       : '--init',
		'-p'       : '--parse',
		'-r'       : '--remove'

	}, {
		argv: argv.slice(2)
	});

	return ({
		init   : (args['--init'] || false),
		parse  : (args['--parse'] || true),
		remove : (args['--remove'] || false)
	});
}

export async function cli(args) {
	let options = parseArgs(args);

	if (options.init) {
		await require('./cmds/init');

	} else if (options.remove) {
		await require('./cmds/remove');

	} else if (options.parse) {
		await require('./cmds/parse');
	}
}
