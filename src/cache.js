#!/usr/bin/env node
'use strict';

import fs from 'fs';
import path from 'path';


function cacheDir() {
	const plat = process.platform;
	const appName = 'design-engine-playground';
	const homeDir = process.env[(plat === 'win32') ? 'USERPROFILE' : 'HOME'];
	const appDir = (plat === 'win32') ? path.join(homeDir, 'AppData', appName) : path.join(homeDir, `.${appName}`);

	if (!fs.existsSync(appDir)) {
		fs.mkdir(appDir, (err)=> {
		});
	}

	return (appDir);
}


export async function getCache(key) {
	const cachePath = path.join(cacheDir(), 'caches');

	if (!fs.existsSync(cachePath)) {
		fs.writeFile(cachePath, '{}', (err)=> {});
		return (null);

	} else {
		const caches = JSON.parse(fs.readFileSync(cachePath));
		return ((typeof caches[key] === 'undefined') ? null : caches[key]);
	}
}


export async function writeCache(key, val) {
	const cachePath = await path.join(cacheDir(), 'caches');
	const caches = { ...JSON.parse(fs.readFileSync(cachePath)),
		[key] : val
	};

	fs.writeFile(cachePath, JSON.stringify(caches), (err)=> {});
}
