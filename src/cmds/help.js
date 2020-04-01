#!/usr/bin/env node
'use strict';

import inquirer from 'inquirer';
import { ChalkStyles } from '../consts';


(async ()=> {
	const dropPostbuild = (data)=> {
		let scripts = normalize(data);

		if (scripts.hasOwnProperty('postbuild')) {
			if (scripts['postbuild'].includes(` && ${CMD_PARSE}`)) {
				scripts['postbuild'] = scripts['postbuild'].replace(` && ${CMD_PARSE}`, '');

			} else {
				delete (scripts['postbuild']);
			}
		}


		data.scripts = scripts;
		return (data);
	};

  console.log(ChalkStyles.HEADER());
	console.log('  ', ChalkStyles.TITLE('Pair-URL cmd help'));
	console.log(ChalkStyles.H_DIV(), '\n');
	console.log(` ${ChalkStyles.CMD('npx pair-url --init, -i')}   : Create account / login`);
	console.log(` ${ChalkStyles.CMD('npx pair-url --parse, -p')}  : Run project / element parser`);
	console.log(` ${ChalkStyles.CMD('npx pair-url --remove, -r')} : Remove any files related to Pair-URL`);
	console.log(` ${ChalkStyles.CMD('npx pair-url --help, -h')}   : Shows this table`, '\n');
	console.log(ChalkStyles.FOOTER());

	// const prompt = await inquirer.prompt({
	// 	type    : 'confirm',
	// 	name    : 'disable',
	// 	message : 'Delete your PairURL account as well?'
	// });

	// if (prompt.disable) {
	// 	await flushAll();
	// 	const user = await disableAccount(await getUser());
	// 	console.log('%s Successfully deleted your PairURL account (%s).', ChalkStyles.INFO, ChalkStyles.PATH(user.email));
	// }
})();
