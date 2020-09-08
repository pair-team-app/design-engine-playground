#!/usr/bin/env node

import arg from 'arg';


function parseArgs(argv) {
	const args = arg({
		'--init'   : Boolean,
		'--parse'  : Boolean,
		'--remove' : Boolean,
		'--help'   : Boolean,
		'-i'       : '--init',
		'-p'       : '--parse',
		'-r'       : '--remove',
		'-h'       : '--help'
	}, {
		argv       : argv.slice(2),
		permissive : true
	});

	return ({
		init   : (args['--init'] || false),
		parse  : (args['--parse'] || false),
		remove : (args['--remove'] || false),
		help   : (args['--help'] || false)
	});
}

export async function cli(args) {
	let options = parseArgs(args);

	if (options.init) {
		require('./cmds/init');

	} else if (options.remove) {
		require('./cmds/remove');

	} else if (options.parse) {
		require('./cmds/parse');

	} else if (options.help) {
		require('./cmds/help');
	
	} else {
		require('./cmds/help');
	}
}
