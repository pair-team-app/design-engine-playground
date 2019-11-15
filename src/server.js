#!/usr/bin/env node
'use strict';


import promise from 'bluebird';
import fs from 'fs';
import http from 'http';
import path from 'path';

import { HOSTNAME, MIME_TYPES, PORT, ChalkStyles } from './consts';

const access = promise.promisify(fs.access);


export async function makeServer(onListen=null) {
	return (new Promise(async(resolve, reject)=> {
		try {
			await access(path.join(process.cwd(), 'build'), fs.constants.R_OK);

		} catch (e) {
			console.log('%s Couldn\'t find build dir! %s', ChalkStyles.ERROR, e);
			reject(e);
		}

		const server = http.createServer((req, res)=> {
			const reqPath = req.url.toString().split('?')[0];
			const dir = path.join(process.cwd(), 'build');
			const filePath = path.join(dir, reqPath.replace(/\/$/, '/index.html'));
			const file = (fs.existsSync(filePath)) ? filePath : path.join(dir, 'index.html');

//			console.log('>>>>>', reqPath);

			if (file.indexOf(`${dir}${path.sep}`) !== 0) {
				res.statusCode = 403;
				res.setHeader('Content-Type', 'text/plain');
				return (res.end('Forbidden'));
			}

			const readStream = fs.createReadStream(file);
			readStream.on('open', ()=> {
				res.setHeader('Content-Type', (MIME_TYPES[path.extname(file).slice(1)] || 'text/plain'));
				readStream.pipe(res);
			});

			readStream.on('error', ()=> {
				res.setHeader('Content-Type', 'text/plain');
				res.statusCode = 404;
				res.end('Not found');
			});
		});


		server.listen(PORT, HOSTNAME, async()=> {
			if (onListen) {
				onListen();
			}
		});

		resolve(server);
	}));
}
