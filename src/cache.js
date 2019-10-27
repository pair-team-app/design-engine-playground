#!/usr/bin/env node
'use strict';

//import fs from 'fs';
//import path from 'path';

import NodeCache from 'node-cache';



const cache = new NodeCache({
	stdTTL      : (5 * 60),
	checkperiod : ((5 * 60) * 0.2)
});



//
//
//function cacheDir() {
//	const plat = process.platform;
//	const appName = 'design-engine-playground';
//	const homeDir = process.env[(plat === 'win32') ? 'USERPROFILE' : 'HOME'];
//	const appDir = (plat === 'win32') ? path.join(homeDir, 'AppData', appName) : path.join(homeDir, '.npm', `${appName}`);
//
//	if (!fs.existsSync(appDir)) {
//		fs.mkdir(appDir, (err)=> {
//		});
//	}
//
//	return (appDir);
//}



export function reset() {
	const user = { id : 0 };
	const playgrounds = [];

	cache.mset([{
		key : 'user',
		val : user
	}, {
		key : 'playgrounds',
		val : playgrounds
	}]);

	return (getAll());
}


export function getAll() {
//	return (Object.keys(cache.keys()).map((key)=> ({ [key] : cache.get(key) })));
	return (cache.mget([
		'user',
		'playgrounds'
	]));
}


export function getPlayground(playgroundID) {
	return (getPlaygrounds().find((playground)=> (playground.id === playgroundID)).id || null);
}


export function getPlaygrounds() {
	return ((hasPlaygrounds()) ? cache.get('playgrounds') : []);
}


export function getUser() {
	return ((cache.has('user')) ? cache.get('user') : null);
}


export function hasPlaygrounds() {
	return (cache.has('playgrounds') && cache.get('playgrounds').length > 0);
}


export function writePlayground(playground) {
	let playgrounds = getPlaygrounds();
	const ind = playgrounds.indexOf(playground);

	if (ind !== -1) {
		playgrounds.splice(ind, 1, { id : playground.id })

	} else {
		playgrounds = [{ id : playground.id }];
	}

	cache.set('playgrounds', playgrounds);

	return (playgrounds);
}


export function writeUser(user) {
	cache.write('user', { ...getUser(), ...user });
	return (getUser());
}


export function getCache(key, val=null) {
	console.log('getCache():', { key, val }, 'cache.getStats()', cache.getStats(), `cache.has('${key}')`, cache.has(key), 'cache.keys', cache.keys());

	if (val || (!cache.has(key) && val)) {
		const res = writeCache(key, val);
	}

	return ((cache.has(key)) ? cache.get(key) : null);



//	const cachePath = path.join(cacheDir(), 'caches');
//
//	if (!fs.existsSync(cachePath)) {
//		fs.writeFile(cachePath, '{}', (err)=> {});
//		return (null);
//
//	} else {
//		const caches = JSON.parse(fs.readFileSync(cachePath));
//		return ((typeof caches[key] === 'undefined') ? null : caches[key]);
//	}
}

export function writeCache(key, val) {
	console.log('writeCache():', { key, val }, 'cache.getStats()', cache.getStats(), `cache.has('${key}')`, cache.has(key), 'cache.keys', cache.keys());

	return (cache.set(key, val));


//	const cachePath = await path.join(cacheDir(), 'caches');
//	const caches = { ...JSON.parse(fs.readFileSync(cachePath)),
//		[key] : val
//	};
//
//	fs.writeFile(cachePath, JSON.stringify(caches), (err)=> {});
}
