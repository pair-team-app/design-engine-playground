#!/usr/bin/env node
'use strict';


import { renderWorker } from 'design-engine-extract';
import { createPlayground, sendPlaygroundComponents } from 'design-engine-extract';
import { Strings } from 'lang-js-utils';

import {
	initCache,
//	getAll,
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

//	console.log('cache', await getAll());


	const user = await getUser();
	const team = await getTeam();
	if (!user) {
		// do signup here
	}

	const startDate = Date.now();
	const server = await makeServer(async()=> {

		const renders = await renderWorker(`http://localhost:${PORT}/`);
		server.close();

		renders.forEach((render, i)=> {
			const { device, doc, elements } = render;
			console.log('%s%s Completed parsing [%s]: %s', ((i === 0) ? '\n' : ''), ChalkStyles.INFO, ChalkStyles.DEVICE(device), [ ...Object.keys(elements).map((key)=> (`(${ChalkStyles.NUMBER(elements[key].length)}) ${Strings.pluralize(key.slice(0, -1), elements[key].length)}`)), `(${ChalkStyles.NUMBER(Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))}) ${Strings.pluralize('color', Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))}`, `(${ChalkStyles.NUMBER(doc.fonts.length)}) ${Strings.pluralize('font', doc.fonts.length)}`].join(', '));
		});


		if (MAKE_PLAYGROUND) {
			for (let i=0; i<renders.length; i++) {
				const render = renders[i];

				const { device, doc, elements } = render;
				console.log('\n%s Generating [%s] playground (%s/%s)…',  ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.NUMBER(i + 1), ChalkStyles.NUMBER(renders.length));

				const { buildID } = await getPlayground();
				const playground = await createPlayground((buildID || -1), user.id, team.id, device, doc);

				if (!buildID) {
					await writePlayground(playground);
				}

				if (SEND_ELEMENTS) {
					const total = Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val));
					console.log('%s Sending %s [%s] component(s)…', ChalkStyles.INFO, ChalkStyles.NUMBER(total), ChalkStyles.DEVICE(device));
					await sendPlaygroundComponents(user.id, playground.id, elements);
				}

				console.log('%s Created [%s] playground: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.URL(`https://pairurl.com/app/team-name/${Strings.slugifyURI(render.doc.title)}/${playground.buildID}/${playground.id}/views`));
			}


//			const urls = await Promise.all(renders.map(async(render, i)=> {
//				const { device, elements } = render;
//				console.log('%s Generating [%s] playground (%s/%s)…',  ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.NUMBER(i + 1), ChalkStyles.NUMBER(renders.length));
//
//				const { buildID } = await getPlayground();
//				const playground = await createPlayground((buildID || -1), user.id, render.device, render.doc);
//				await writePlayground(playground);
//
//				if (SEND_ELEMENTS) {
//					const total = Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val));
//					console.log('\n%s Sending %s component(s)…', ChalkStyles.INFO, ChalkStyles.NUMBER(total));
//					await sendPlaygroundComponents(user.id, playground.id, elements);
//
////					return ({ ...render, playground, components });
//
//				} else {
////					return ({ ...render, playground,
////						components : null
////					});
//				}
//
////				console.log('%s Created [%s] playground: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.URL(`https://pairurl.com/app/team-name/${Strings.slugifyURI(render.doc.title)}/${render.playground.build_id}/${render.playground.id}/views`));
//				return ('%s Created [%s] playground: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.URL(`https://pairurl.com/app/team-name/${Strings.slugifyURI(render.doc.title)}/${playground.build_id}/${playground.id}/views`));
//			}));
//
//
//			urls.forEach((url)=> {
//				console.log(url);
//			});


//			renders = await Promise.all(renders.map(async(render, i)=> {
//				const { device, elements } = render;
//				console.log('%s Generating [%s] playground (%s/%s)…',  ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.NUMBER(i + 1), ChalkStyles.NUMBER(renders.length));
//
//				const { buildID } = await getPlayground();
//				const playground = await createPlayground((buildID || -1), user.id, render.device, render.doc);
//				await writePlayground(playground);
//
//				if (SEND_ELEMENTS) {
//					const total = Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val));
//					console.log('\n%s Sending %s component(s)…', ChalkStyles.INFO, ChalkStyles.NUMBER(total));
//					const components = await sendPlaygroundComponents(user.id, playground.id, elements);
//
//					return ({ ...render, playground, components });
//
//				} else {
//					return ({ ...render, playground,
//						components : null
//					});
//				}
//			}));
		}

//		if (MAKE_PLAYGROUND && SEND_ELEMENTS) {
//			const totalElements = renders.map(({ elements })=> (Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val)))).reduce((acc, val)=> (acc + val));
//			console.log('\n%s Sending all %s component(s)…', ChalkStyles.INFO, ChalkStyles.NUMBER(totalElements));
//			renders = await Promise.all(renders.map(async(render)=> {
//				const { playground, elements } = render;
//				const response = await sendPlaygroundComponents(user.id, playground.id, elements);
//
//				return ({ ...render,
//					components : response
//				})
//			}));
//		}

//		if (MAKE_PLAYGROUND) {
//			renders.forEach((render)=> {
//				const { device } = render;
//				console.log('%s Created [%s] playground: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.URL(`https://pairurl.com/app/team-name/${Strings.slugifyURI(render.doc.title)}/${render.playground.build_id}/${render.playground.id}/views`));
//			});
//		}

		const elapsed = `${(((Date.now() - startDate) * 0.001) << 0)}`;
		console.log('\n%s Finished in (%s)s', ChalkStyles.DONE, ChalkStyles.NUMBER(elapsed));

		await dropPlayground();
		/*
		if (!opened) {
			await writeCache('playground_open', true);
			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
		}
		*/
	});
}
