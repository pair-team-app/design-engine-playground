#!/usr/bin/env node
'use strict';


import fetch from 'node-fetch';
import { API_ENDPT_URL, FETCH_CFG, ChalkStyles } from './consts'


export async function loginUser(user) {
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
	if (status === 0x00) {
		return (response.user);
	}

	return (await loginUser(user));
}
