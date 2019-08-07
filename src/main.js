
import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';
import fs from 'fs';
import open from 'open';
import fetch from 'node-fetch';
import path from 'path';
import projectName from 'project-name';
import { promisify } from 'util';
import zipdir from 'zip-dir';

const access = promisify(fs.access);

const API_ENDPT_URL = 'https://api.designengine.ai/playground.php';


const cacheDir = ()=> {
	const plat = process.platform;
	const appName = 'design-engine-playground';
	const homeDir = process.env[(plat === 'win32') ? 'USERPROFILE' : 'HOME'];
	const appDir = (plat === 'win32') ? path.join(homeDir, 'AppData', appName) : path.join(homeDir, `.${appName}`);

	if (!fs.existsSync(appDir)) {
		fs.mkdir(appDir, (err)=> {
		});
	}

	return (appDir);
};


const getCache = async(key)=> {
	const cachePath = path.join(cacheDir(), 'caches');

	if (!fs.existsSync(cachePath)) {
		fs.writeFile(cachePath, '{}', (err)=> {});
		return (null);

	} else {
		const caches = JSON.parse(fs.readFileSync(cachePath));
		return ((typeof caches[key] === 'undefined') ? null : caches[key]);
	}
};


const writeCache = async(key, val)=> {
	const cachePath = await path.join(cacheDir(), 'caches');
	const caches = { ...JSON.parse(fs.readFileSync(cachePath)),
		[key] : val
	};

	fs.writeFile(cachePath, JSON.stringify(caches), (err)=> {});
};


async function createZip(srcPath, playgroundID, callback) {
//	console.log('createZip', srcPath, playgroundID);

	const destPath = path.join(cacheDir(), `build_${playgroundID}.zip`);
	zipdir(srcPath, {
		saveTo : destPath

	}, (err, buffer)=> {
		return (callback(destPath));
	});
}

async function sendZip(filepath, playgroundID) {
//	console.log('sendZip', filepath, playgroundID);

	let formData = new FormData();
	formData.append('playground_id', playgroundID);
	formData.append('file', fs.readFileSync(filepath), { filepath,
		contentType : 'application/zip'
	});

//	formData.append('file', fs.readFileSync(filepath));
	let response = await axios.post('https://api.designengine.ai/upload.php?dir=/builds', formData, {
//	let response = await axios.post('http://cdn.designengine.ai/upload.php?dir=/builds', formData, {
//	let response = await axios.post('http://terminal.designengine.ai/upload?playground_id=9', formData, {
		headers : {
			...formData.getHeaders(),
			//			'Accept'       : 'application/json',
//			'Content-Type' : 'multipart/form-data',
//			'Content-Type' : 'application/octet-stream',
//			'Content-Type': 'application/x-www-form-urlencoded',
//			'Content-Length': fs.statSync(filepath).size
		}
	});

	try {
		response = response.data;

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', chalk.red.bold('ERROR'), e);
	}

//	console.log('ZIP -->>', response);
	return (response);


	/*
//	let response = await fetch(API_ENDPT_URL, {
	let response = await fetch('http://cdn.designengine.ai/upload.php?dir=/tmp', {
		method : 'POST',
		headers : {
			'Accept' : 'application/json',
			'Content-Type' : 'multipart/form-data'
//			'Content-Type' : 'application/octet-stream'
		},
//		body : fs.readFileSync(filepath)
		body : formData
	});

	try {
		console.log('::::::::::', response);
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', chalk.red.bold('ERROR'), e);
	}
	*/

//	return (null);
}


async function queryPlayground(playgroundID) {
	let response = await fetch(API_ENDPT_URL, {
		method  : 'POST',
		headers : {
			'Content-Type' : 'application/json'
		},
		body    : JSON.stringify({
			action        : 'PLAYGROUND',
			playground_id : playgroundID,
			title         : projectName()
		})
	});

	try {
		response = await response.json();

	} catch (e) {
		console.log('%s Couldn\'t parse response! %s', chalk.red.bold('ERROR'), e);
	}

//  console.log('PLAYGROUND -->>', response);
	return (response);
}

export async function syncPlayground(options) {
	try {
		await access(path.join(process.cwd(), 'build'), fs.constants.R_OK);

	} catch (e) {
		console.log('%s Couldn\'t find build dir! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	const playgroundID = await getCache('playground_id');
	const openedPlayground = await getCache('playground_open');

	console.log('%s Queueing playground…', chalk.cyan.bold('INFO'));
	let response = null;
	try {
		response = await queryPlayground(playgroundID);

	} catch (e) {
		console.log('%s Error querying server! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	const playground = { ...response.playground,
		id  : response.playground.id << 0,
		new : response.playground.is_new
	};

	await writeCache('playground_id', playground.id);


	console.log('%s Compressing files…', chalk.cyan.bold('INFO'));
	await createZip(path.join(process.cwd(), 'build'), playground.id, async(zipPath)=> {
//		console.log('::::', 'ZIPPED');

		console.log('%s Sending zip…', chalk.cyan.bold('INFO'));
		await sendZip(zipPath, playground.id);

		console.log('%s Playground created! %s', chalk.green.bold('DONE'), chalk.blue.bold(`http://playground.designengine.ai/${playground.id}`));
		if (!openedPlayground) {
			await writeCache('playground_open', true);
			open(`http://playground.designengine.ai/${playground.id}`);
		}
	});

	return (true);
}
