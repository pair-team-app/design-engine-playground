#!/usr/bin/env node
'use strict';

import chalk from 'chalk';
import fs from 'fs';
import http from 'http';
import open from 'open';
import path from 'path';
import promise from 'bluebird';

import { puppetWorker } from 'design-engine-extract';
import { createPlayground, sendPlaygroundComponents } from 'design-engine-extract';

import { getCache, writeCache } from './cache';
import { HOSTNAME, PORT, MIME_TYPES } from './consts';

const access = promise.promisify(fs.access);


export async function parseBuild() {
	server.listen(PORT, HOSTNAME, async()=> {
		try {
			await access(path.join(process.cwd(), 'build'), fs.constants.R_OK);

		} catch (e) {
			console.log('%s Couldn\'t find build dir! %s', chalk.red.bold('ERROR'), e);
			process.exit(1);
		}

		const userID = (await getCache('user_id') || 0);
		const playgroundID = (await getCache('playground_id') || 0);
		const openedPlayground = await getCache('playground_open');

		let renders = await puppetWorker(`http://localhost:${PORT}/`, playgroundID);
//		const { device, extract, totals, playground } = renders.reverse()[0];

		renders.forEach((render)=> {
			const { device, elements } = render;
		 	console.log('%s [%s] Found: %s link(s), %s button(s), %s image(s).', chalk.cyan.bold('INFO'), chalk.grey(device), chalk.magenta.bold(elements.links.length), chalk.magenta.bold(elements.buttons.length), chalk.magenta.bold(elements.images.length));
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

		const totalElements = renders.map((render)=> (Object.keys(render.elements).map((key)=> (render.elements[key].length)).reduce((acc, val)=> (acc + val)))).reduce((acc, val)=> (acc + val));
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


		server.close();

//		console.log('%s Playground created! %s', chalk.green.bold('DONE'), chalk.blue.bold(`http://playground.designengine.ai/spectrum-adobe-${renders.reverse()[0].playground.id}`));
//		if (!openedPlayground) {
//			await writeCache('playground_open', true);
//			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
////			open(`http://playground.designengine.ai/${55}`);
//		}
	});
}

const server = http.createServer((req, res)=> {
	const reqPath = req.url.toString().split('?')[0];
	const dir = path.join(process.cwd(), 'build');
	const file = path.join(dir, reqPath.replace(/\/$/, '/index.html'));

	if (file.indexOf(dir + path.sep) !== 0) {
		res.statusCode = 403;
		res.setHeader('Content-Type', 'text/plain');
		return (res.end('Forbidden'));
	}

	const readStream = fs.createReadStream(file);
	readStream.on('open', ()=> {
		res.setHeader('Content-Type', MIME_TYPES[path.extname(file).slice(1)] || 'text/plain');
		readStream.pipe(res);
	});

	readStream.on('error', ()=> {
		res.setHeader('Content-Type', 'text/plain');
		res.statusCode = 404;
		res.end('Not found');
	});
});
