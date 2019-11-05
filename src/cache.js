#!/usr/bin/env node
'use strict';


import storage from 'node-persist';


export async function initCache() {
	await storage.init();
//	console.log('>> initCache()');
}


export async function flushAll() {
	await storage.clear();
	return (true);
}

export async function getAll() {
//	console.log('getAll():', 'storage.keys()', await storage.keys());

	let caches = {};
	(await Promise.all((await storage.keys()).map(async(key)=> ({ [key] : await storage.getItem(key) })))).forEach((entry)=> {
		const key = Object.keys(entry)[0];
		caches[key] = entry[key];
	});

	return (caches);
}


export async function getCache(key, val=null) {
//	console.log('getCache():', { key, val }, 'storage.keys()', await storage.keys());
	return (await storage.getItem(key));
}


export async function getPlayground(playgroundID) {
//	console.log('getPlayground():', playgroundID, 'storage.keys()', await storage.keys());
	return (getPlaygrounds().find((playground)=> (playground.id === playgroundID)).id || null);
}


export async function getPlaygrounds() {
//	console.log('getPlaygrounds():', 'storage.keys()', await storage.keys());
	return ((hasPlaygrounds()) ? cache.get('playgrounds') : []);
}


export async function getUser() {
//	console.log('getUser():', 'storage.keys()', await storage.keys());
	return ((await storage.getItem('user')) ? await storage.getItem('user') : { id : 0 });
}

export async function hasPlaygrounds() {
//	console.log('hasPlaygrounds():', 'storage.keys()', await storage.keys());
	return ((await storage.valuesWithKeyMatch('playgrounds')).length > 0);
}


export async function hasVal(key) {
//	console.log('hasVal():', key, 'storage.keys()', await storage.keys());
	return ((await storage.keys()).find((k)=> (k === key)));
}


export async function reset() {
//	console.log('reset():', 'storage.keys()', await storage.keys());

	await storage.setItem('user', { id : 0 });
	await storage.setItem('playgrounds', []);

	return (await getAll());
}


export async function writeCache(key, val) {
//	console.log('writeCache():', { key, val }, 'storage.keys()', await storage.keys());
	return (await storage.setItem(key, val));
}


export async function writePlayground(playground) {
//	console.log('writePlayground():', playground, 'storage.keys()', await storage.keys());

	let playgrounds = await getPlaygrounds();
	const ind = playgrounds.indexOf(playground);

	if (ind !== -1) {
		playgrounds.splice(ind, 1, { id : playground.id })

	} else {
		playgrounds = [{ id : playground.id }];
	}

	await storage.setItem('playgrounds', playgrounds);
	return (playgrounds);
}


export async function writeUser(user) {
//	console.log('writeUser():', user, 'storage.keys()', await storage.keys());

	await storage.setItem('user', user);
	return (await getUser());
}
