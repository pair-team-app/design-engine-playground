#!/usr/bin/env node
'use strict';

import chalk from 'chalk';
import fs from 'fs';
import http from 'http';
import open from 'open';
import path from 'path';
import promise from 'bluebird';

import { puppetWorker } from 'design-engine-extract';

import { getCache, writeCache } from './cache';
import { HOSTNAME, PORT, MIME_TYPES } from './consts';

const access = promise.promisify(fs.access);


export async function parseBuild() {
	server.listen(PORT, HOSTNAME, async()=> {
//		console.log(`Server running at http://${HOSTNAME}:${PORT}/`);

		try {
			await access(path.join(process.cwd(), 'build'), fs.constants.R_OK);

		} catch (e) {
			console.log('%s Couldn\'t find build dir! %s', chalk.red.bold('ERROR'), e);
			process.exit(1);
		}

		const playgroundID = await getCache('playground_id');
		const openedPlayground = await getCache('playground_open');

		const { totals, playground } = await puppetWorker(`http://localhost:${PORT}/`, playgroundID);

		console.log('%s Found: %s link(s), %s button(s), %s image(s).', chalk.cyan.bold('INFO'), chalk.magenta.bold(totals.links), chalk.magenta.bold(totals.buttons), chalk.magenta.bold(totals.images));
		await writeCache('playground_id', playground.id);


		server.close();

		console.log('%s Playground created! %s', chalk.green.bold('DONE'), chalk.blue.bold(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`));
		if (!openedPlayground) {
			await writeCache('playground_open', true);
			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
//			open(`http://playground.designengine.ai/${55}`);
		}
	});
}


const server = http.createServer((req, res) => {
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
