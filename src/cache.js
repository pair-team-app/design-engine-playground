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


export async function dropCache(key) {
//	console.log('dropCache():', { key }, 'storage.keys()', await storage.keys());
	return ((hasVal(key)) ? await storage.removeItem(key) : false);
}


export async function dropPlayground() {
//	console.log('dropPlayground():', 'storage.keys()', await storage.keys());
	return (await dropCache('playground'));
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


export async function getPlayground() {
//	console.log('getPlayground():', 'storage.keys()', await storage.keys());
	return ((await hasPlayground()) ? await storage.getItem('playground') : {
		id      : null,
		buildID : null
	});
}


export async function getTeam() {
//	console.log('getTeam():', 'storage.keys()', await storage.keys());
	return ((await hasTeam()) ? await storage.getItem('team') : null);
}


export async function getUser() {
//	console.log('getUser():', 'storage.keys()', await storage.keys());
	return ((await hasUser()) ? await storage.getItem('user') : null);
}


export async function hasPlayground() {
//	console.log('hasPlayground():', 'storage.keys()', await storage.keys());
	return ((await storage.valuesWithKeyMatch('playground')).length > 0);
}


export async function hasTeam() {
//	console.log('hasTeam():', 'storage.keys()', await storage.keys());
	return ((await storage.valuesWithKeyMatch('team')).length > 0);
}


export async function hasUser() {
//	console.log('hasUser():', 'storage.keys()', await storage.keys());
	return ((await storage.valuesWithKeyMatch('user')).length > 0);
}


export async function hasVal(key) {
//	console.log('hasVal():', key, 'storage.keys()', await storage.keys());
	return ((await storage.keys()).find((k)=> (k === key)));
}


export async function reset() {
//	console.log('reset():', 'storage.keys()', await storage.keys());

	await writeCache('user', null);
	await writeCache('playground', {
		id      : null,
		buildID : null
	});
	await writeCache('team', null);

	return (true);
}


export async function writeCache(key, val) {
//	console.log('writeCache():', { key, val }, 'storage.keys()', await storage.keys());
	return (await storage.setItem(key, val));
}


export async function writePlayground(playground) {
//	console.log('writePlayground():', playground, 'storage.keys()', await storage.keys());

	return (await writeCache('playground', {
		id      : playground.id,
		buildID : playground.build_id
	}));
}


export async function writeTeam(team) {
//	console.log('writeTeam():', team, 'storage.keys()', await storage.keys());
	return (await writeCache('team', team));
}


export async function writeUser(user) {
//	console.log('writeUser():', user, 'storage.keys()', await storage.keys());
	return (await writeCache('user', user));
}
