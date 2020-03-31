#!/usr/bin/env node
'use strict';


import { renderWorker, createPlayground, sendPlaygroundComponents } from 'design-engine-extract';
import { Strings } from 'lang-js-utils';

import {
	initCache,
	getAll,
	dropPlayground,
	getPlayground,
	writePlayground,
	getTeam,
	getUser } from './cache';
import { MAKE_PLAYGROUND, SEND_ELEMENTS } from './config';
import { PORT, ChalkStyles } from './consts';
import { makeServer } from './server';


export async function parseBuild() {
	await initCache();

	const allCache = await getAll();
	console.log('cache', { user : allCache.user.id, team : allCache.team.id });

	const user = await getUser();
	const team = await getTeam();
	if (!user || !team) {
		// do signup here
	}

	const startDate = Date.now();
	const server = await makeServer(async()=> {

		const renders = await renderWorker(`http://localhost:${PORT}/`);
		server.close();

		renders.forEach((render, i)=> {
			const { device, doc, elements } = render;
			console.log('%s %s Completed parsing: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), [ ...Object.keys(elements).filter((key)=> (key !== 'links')).map((key)=> (`${ChalkStyles.NUMBER(elements[key].length)} ${Strings.pluralize(key.slice(0, -1), elements[key].length)}`)), `${ChalkStyles.NUMBER(Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))} ${Strings.pluralize('color', Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))}`, `${ChalkStyles.NUMBER(doc.fonts.length)} ${Strings.pluralize('font', doc.fonts.length)}`].join(', '));
		});


	
		if (MAKE_PLAYGROUND) {
			for (let i=0; i<renders.length; i++) {
				const render = renders[i];

				const { device, doc, elements } = render;
				console.log('\n%s %s Generating playground (%s/%s)…', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.NUMBER(i + 1, true), ChalkStyles.NUMBER(renders.length, true));

				const { buildID } = await getPlayground();
				const playground = await createPlayground({ doc, device, 
					userID  : user.id, 
					teamID  : team.id,
					buildID : (buildID || -1)
				});

				if (!buildID) {
					await writePlayground(playground);
				}

				if (SEND_ELEMENTS) {
					const total = Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val));
					console.log('%s %s Sending %s component(s)…', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.NUMBER(total));
					await sendPlaygroundComponents({
						userID       : user.id, 
						teamID       : team.id, 
						buildID      : playground.build_id,
						playgroundID : playground.id,
						components   : elements
					});
				}

				console.log('%s %s Created playground: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.URL(`http://dev.pairurl.com/app/${Strings.slugifyURI(team.title)}/${Strings.slugifyURI(render.doc.title)}/${playground.build_id}/${Strings.slugifyURI(device)}`));
			}
		}

		const elapsed = `${(((Date.now() - startDate) * 0.001) << 0)}`;
		console.log('\n%s Finished in %s seconds.', ChalkStyles.DONE, ChalkStyles.NUMBER(elapsed));

		await dropPlayground();

		/*
		if (!opened) {
			await writeCache('playground_open', true);
			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
		}
		*/
	});
}
