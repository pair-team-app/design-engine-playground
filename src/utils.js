#!/usr/bin/env node
'use strict';


import promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

promise.promisifyAll(require('fs'));


export const checkDir = async()=> {
//	console.log('PWD -- ', process.cwd());
//	if (fs.existsSync(`${process.cwd()}/../../node_modules/design-engine-playground/package.json`)) {
	if (fs.existsSync(path.join(process.cwd(), '..', '..', 'node_modules', 'design-engine-playground', 'package.json'))) {
		shell.cd('../..');
	}

	return (path.join(process.cwd(), 'package.json'));
};

export const normalize = async(data)=> {
	let scripts = data.scripts || {};

	if (typeof scripts === 'string' || scripts instanceof String) {
		const v = scripts;
		scripts = {};
		scripts['postbuild'] = v;
	}

	return (scripts);
};

export const prettyPrint = async(data)=> {
	return (JSON.stringify(data, null, 2));
};

export const savePackage = async(data, path)=> {
	return (fs.writeFileAsync(path, data));
};
