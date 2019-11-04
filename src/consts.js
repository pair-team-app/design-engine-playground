#!/usr/bin/env node
'use strict';


export const HOSTNAME = '127.0.0.1';
export const PORT = 1066;

export const API_ENDPT_URL = 'https://api.designengine.ai/playgrounds.php';
export const FETCH_CFG = {
	method  : 'POST',
	headers : { 'Content-Type' : 'application/json' },
	body    : {
		action  : null,
		payload : null
	}
};

export const MIME_TYPES = {
	html : 'text/html',
	txt  : 'text/plain',
	css  : 'text/css',
	gif  : 'image/gif',
	jpg  : 'image/jpeg',
	png  : 'image/png',
	svg  : 'image/svg+xml',
	js   : 'application/javascript'
};
