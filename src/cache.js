#!/usr/bin/env node
'use strict';


import NodeCache from 'node-cache';


const cache = new NodeCache({
	stdTTL      : (5 * 60),
	checkperiod : ((5 * 60) * 0.2)
});


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
	return (cache.mget([
		'user',
		'playgrounds'
	]));

//	return (cache.mget(Object.keys(cache.keys())));
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
}

export function writeCache(key, val) {
	console.log('writeCache():', { key, val }, 'cache.getStats()', cache.getStats(), `cache.has('${key}')`, cache.has(key), 'cache.keys', cache.keys());

	return (cache.set(key, val));
}
