
import arg from 'arg';

function parseArgumentsIntoOptions(rawArgs) {
	const args = arg({
		'--create': Boolean,
		'--yes': Boolean,
		'-c': '--create',
		'-y': '--yes'
	}, {
		argv: rawArgs.slice(2)
	});

	return ({
		skipPrompts: args['--yes'] || false,
		createPlayground: args['--create'] || false,
		template: args._[0]
	});
}

export async function cli(args) {
	console.log('cli()', args);

	let options = parseArgumentsIntoOptions(args);
	console.log(options);
}
