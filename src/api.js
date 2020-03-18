#!/usr/bin/env node
'use strict';


import fetch from 'node-fetch';
import { API_ENDPT_URL, FETCH_CFG, ChalkStyles } from './consts'


export async function disableAccount(user) {
	console.log('disableAccount()', JSON.stringify({ user }, null, 2));

	const cfg = { ...FETCH_CFG,
		body : JSON.stringify({ ...FETCH_CFG.body,
			action  : 'DISABLE_ACCOUNT',
			payload : { user_id : user.id }
		})
	};

	let response = await fetch(API_ENDPT_URL, cfg);
	try {
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', ChalkStyles.ERROR, e);
	}

//	console.log('DISABLE_ACCOUNT -->>', response);
	return (response.user);
}


export async function loginUser(user) {
	console.log('loginUser()', JSON.stringify({ user }, null, 2));

	const cfg = { ...FETCH_CFG,
		body : JSON.stringify({ ...FETCH_CFG.body,
			action  : 'LOGIN',
			payload : { ...user }
		})
	};

	let response = await fetch(API_ENDPT_URL, cfg);
	try {
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', ChalkStyles.ERROR, e);
	}

	console.log('LOGIN -->>', response);
	return (response.user);
}


export async function registerUser(user) {
	console.log('registerUser()', JSON.stringify({ user }, null, 2));

	const cfg = { ...FETCH_CFG,
		body : JSON.stringify({ ...FETCH_CFG.body,
			action  : 'REGISTER',
			payload : { ...user,
				username : user.email,
				type     : 'npm'
			}
		})
	};

	let response = await fetch(API_ENDPT_URL, cfg);
	try {
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', ChalkStyles.ERROR, e);
	}

	console.log('REGISTER -->>', response);

	const status = parseInt(response.status, 16);
	if (status === 0x11) {
		return (response.user);
	}

	return (await loginUser(user));
}


export async function teamLookup(user) {
	console.log('teamLookup()', JSON.stringify({ user }, null, 2));

	const cfg = { ...FETCH_CFG,
		body : JSON.stringify({ ...FETCH_CFG.body,
			action  : 'TEAM_LOOKUP',
			payload : { user_id : user.id }
		})
	};

	let response = await fetch(API_ENDPT_URL, cfg);
	try {
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', ChalkStyles.ERROR, e);
	}

	const { team } = response;
	console.log('TEAM_LOOKUP -->>', { team });
	
	return (team);
}
