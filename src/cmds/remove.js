#!/usr/bin/env node
'use strict';


import promise from 'bluebird';
import fs from 'fs';

import { CMD_PARSE, ChalkStyles } from '../consts';
import { checkDir, normalize, prettyPrint, savePackage } from '../utils';

promise.promisifyAll(require('fs'));


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

	const pkgPath = await checkDir();

	console.log('%s Removing Pair URL postbuild script...', ChalkStyles.INFO);
	fs.readFileAsync(pkgPath).then(JSON.parse).then(dropPostbuild).then(prettyPrint).then((data)=> savePackage(data, pkgPath)).catch(console.log);
})();
