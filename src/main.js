#!/usr/bin/env node
'use strict';


import chalk from 'chalk';
import { renderWorker } from 'design-engine-extract';
import { createPlayground, sendPlaygroundComponents } from 'design-engine-extract';
import { Strings } from 'lang-js-utils';

import {
	initCache,
	getAll,
	getUser,
	reset,
	writePlayground } from './cache';
import { MAKE_PLAYGROUND, SEND_ELEMENTS } from './config';
import { PORT } from './consts';
import { makeServer } from './server';


export async function parseBuild() {
	await initCache();

	const cache = (!(await getUser())) ? await reset() : await getAll();
//	console.log('cache', cache);

	const { user } = cache;

	if (user.id === 0) {
		// do signup here
	}

	const server = await makeServer(async()=> {
		let renders = await renderWorker(`http://localhost:${PORT}/`);
		server.close();

		renders.forEach((render)=> {
			const { device, doc, elements } = render;
			console.log('%s Completed [%s]: %s', chalk.cyan.bold('INFO'), chalk.grey(device), [ ...Object.keys(elements).map((key)=> (`(${chalk.magenta.bold(elements[key].length)}) ${Strings.pluralize(key.slice(0, -1), elements[key].length)}`)), `(${chalk.magenta.bold(Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))}) ${Strings.pluralize('color', Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))}`, `(${chalk.magenta.bold(doc.fonts.length)}) ${Strings.pluralize('font', doc.fonts.length)}`].join(', '));
		});

		if (MAKE_PLAYGROUND) {
			renders = await Promise.all(renders.map(async(render, i)=> {
				const { device } = render;
				console.log('%s Generating [%s] playground (%s/%s)…', chalk.cyan.bold('INFO'), chalk.grey(device), chalk.magenta.bold(i + 1), chalk.magenta.bold(renders.length));
				return ({ ...render,
					playground : await createPlayground(user.id, render.device, render.doc)
				});
			}));
		}

		if (MAKE_PLAYGROUND && SEND_ELEMENTS) {
			const totalElements = renders.map(({ elements })=> (Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val)))).reduce((acc, val)=> (acc + val));
			console.log('\n%s Sending all %s component(s)…', chalk.cyan.bold('INFO'), chalk.magenta.bold(totalElements));
			renders = await Promise.all(renders.map(async(render)=> {
				const { playground, elements } = render;

				await writePlayground(playground);
				const response = await sendPlaygroundComponents(user.id, playground.id, elements);

				return ({ ...render,
					components : response
				})
			}));
		}

		if (MAKE_PLAYGROUND) {
			renders.forEach((render)=> {
				console.log('%s Playground created! %s', chalk.green.bold('DONE'), chalk.blue.bold(`https://pairurl.com/app/team-name/${Strings.slugifyURI(render.doc.title)}/${render.playground.build_id}/${render.playground.id}/views`));
			});
		}

		/*
		if (!opened) {
			await writeCache('playground_open', true);
			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
		}
		*/
	});
}
