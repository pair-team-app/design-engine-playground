#!/usr/bin/env node
'use strict';

import chalk from 'chalk';
import { renderWorker } from 'design-engine-extract';
import { createPlayground, sendPlaygroundComponents } from 'design-engine-extract';

import {
	getAll,
	getUser,
	reset,
	writePlayground } from './cache';
import { PORT } from './consts';
import { makeServer } from './server';

//const access = promise.promisify(fs.access);


export async function parseBuild() {
	const caches = (!getUser()) ? reset() : getAll();
	const { user, playgrounds } = caches;

	if (user.id === 0) {
		// do signup here
	}

	const server = await makeServer(async()=> {
		let renders = await renderWorker(`http://localhost:${PORT}`);
		server.close();

		renders.forEach((render)=> {
			const { device, doc, elements } = render;
			console.log('%s [%s]: %s', chalk.cyan.bold('INFO'), chalk.grey(device), [ ...Object.keys(elements).map((key)=> (`${chalk.magenta.bold(elements[key].length)} ${key}(s)`)), `${chalk.magenta.bold(Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))} colors(s)`, `${chalk.magenta.bold(doc.fonts.length)} fonts(s)`].join(', '));
		});

		console.log('\n');
		/*
>>>>>>> 338e0770d771bc4d7a2d2391e64e3cdb62aedbbc
		renders = await Promise.all(renders.map(async(render, i)=> {
			const { device } = render;
			console.log('%s Generating playground %d/%d [%s]…', chalk.cyan.bold('INFO'), (i+1), renders.length, chalk.grey(device));
			return ({ ...render,
				playground : await createPlayground(user.id, render.device, render.doc)
			});
		}));

		const totalElements = renders.map(({ elements })=> (Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val)))).reduce((acc, val)=> (acc + val));
		console.log('\n%s Sending all %s component(s)…', chalk.cyan.bold('INFO'), chalk.magenta.bold(totalElements));
		renders = await Promise.all(renders.map(async(render)=> {
			const { playground, elements } = render;

			writePlayground(playground);
			const response = await sendPlaygroundComponents(playground.id, elements);
//			console.log(response);

			return ({ ...render,
				components : response
			})
		}));
		*/



//		console.log('%s Playground created! %s', chalk.green.bold('DONE'), chalk.blue.bold(`http://playground.designengine.ai/spectrum-adobe-${renders.reverse()[0].playground.id}`));
//		if (!opened) {
//			await writeCache('playground_open', true);
//			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
//		}
	});
}
