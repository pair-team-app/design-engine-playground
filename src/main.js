#!/usr/bin/env node
'use strict';

import chalk from 'chalk';
//import fs from 'fs';
//import http from 'http';
//import open from 'open';
//import path from 'path';
//import promise from 'bluebird';

import NodeCache from 'node-cache';


import { renderWorker } from 'design-engine-extract';
import { createPlayground, sendPlaygroundComponents } from 'design-engine-extract';

import {
	getPlayground,
	getPlaygrounds,
	getAll,
	getUser,
	hasPlaygrounds,
	reset,
	writeUser,
	writePlayground } from './cache';
import { PORT } from './consts';
import { makeServer } from './server';

//const access = promise.promisify(fs.access);


export async function parseBuild() {
//	const cache = new NodeCache( { stdTTL : (5 * 60) });
//	const res = cache.set('hoge', 'piyo');
//	console.log('%s', chalk.cyan.bold('INFO'), 'cache.set()', res, cache.keys());

	const caches = (!getUser()) ? reset() : getAll();
	const { user, playgrounds } = caches;

	if (user.id === 0) {
		// do signup here
	}

	const server = await makeServer(async()=> {
		let renders = await renderWorker(`http://localhost:${PORT}`);
		renders.forEach((render)=> {
			const { device, doc, elements } = render;
			console.log('%s [%s]: %s', chalk.cyan.bold('INFO'), chalk.grey(device), [ ...Object.keys(elements).map((key)=> (`${chalk.magenta.bold(elements[key].length)} ${key}(s)`)), `${chalk.magenta.bold(Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))} colors(s)`, `${chalk.magenta.bold(doc.fonts.length)} fonts(s)`].join(', '));
		});

		server.close();


		console.log('\n');
		renders = await Promise.all(renders.map(async(render, i)=> {
			console.log('%s Generating playground (%d/%d)…', chalk.cyan.bold('INFO'), (i+1), renders.length);
			return ({ ...render,
				playground : await createPlayground(user.id, render.device, render.doc)
			});
		}));

		const totalElements = renders.map(({ elements })=> (Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val)))).reduce((acc, val)=> (acc + val));
		console.log('\n%s Sending %s component(s)…', chalk.cyan.bold('INFO'), chalk.magenta.bold(totalElements));
		renders = await Promise.all(renders.map(async(render)=> {
			const { playground, elements } = render;

			writePlayground(playground);
			const response = await sendPlaygroundComponents(playground.id, elements);
			console.log(response);

			return ({ ...render,
				components : response
			})
		}));
	});


/*
		renders = await Promise.all(renders.map(async(render, i)=> {
			if (i === 0) {
				console.log('%s Generating new playground…', chalk.cyan.bold('INFO'));
			}

			return ({ ...render,
				playground : await createPlayground(userID, render.device, render.doc)
			});
		}));

//		const totalElements = renders.map((render)=> (Object.keys(render.elements).map((key)=> (render.elements[key].length)).reduce((acc, val)=> (acc + val)))).reduce((acc, val)=> (acc + val));
		const totalElements = renders.map(({ elements })=> (Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val)))).reduce((acc, val)=> (acc + val));
		console.log('%s Sending %s component(s)…', chalk.cyan.bold('INFO'), chalk.magenta.bold(totalElements));

		renders = await Promise.all(renders.map(async(render)=> {
			const { playground, elements } = render;
			const response = await sendPlaygroundComponents(playground.id, elements);
			console.log(response);

			return ({ ...render,
				components : response
			})
		}));
*/

//		await writeCache('playground_id', playground.id);


//		console.log('%s Playground created! %s', chalk.green.bold('DONE'), chalk.blue.bold(`http://playground.designengine.ai/spectrum-adobe-${renders.reverse()[0].playground.id}`));
//		if (!opened) {
//			await writeCache('playground_open', true);
//			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
////			open(`http://playground.designengine.ai/${55}`);
//		}
}

//const server = http.createServer((req, res)=> {
//	const reqPath = req.url.toString().split('?')[0];
//	const dir = path.join(process.cwd(), 'build');
//	const file = path.join(dir, reqPath.replace(/\/$/, '/index.html'));
//
//	if (file.indexOf(dir + path.sep) !== 0) {
//		res.statusCode = 403;
//		res.setHeader('Content-Type', 'text/plain');
//		return (res.end('Forbidden'));
//	}
//
//	const readStream = fs.createReadStream(file);
//	readStream.on('open', ()=> {
//		res.setHeader('Content-Type', MIME_TYPES[path.extname(file).slice(1)] || 'text/plain');
//		readStream.pipe(res);
//	});
//
//	readStream.on('error', ()=> {
//		res.setHeader('Content-Type', 'text/plain');
//		res.statusCode = 404;
//		res.end('Not found');
//	});
//});
