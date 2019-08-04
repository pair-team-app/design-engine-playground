
import chalk from 'chalk';
import fetch from 'node-fetch';
import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';
import projectName from 'project-name';
import { promisify } from 'util';


const access = promisify(fs.access);
const zip = new JSZip();

const API_ENDPT_URL = 'https://api.designengine.ai/playground.php';


const getCache = async(key)=> {
	const plat = process.platform;
	const appName = [...projectName().split('/')].pop();
	const homeDir = process.env[(plat === 'win32') ? 'USERPROFILE' : 'HOME'];
	const appDir = (plat === 'win32') ? path.join(homeDir, 'AppData', appName) : path.join(homeDir, `.${appName}`);
	const cachePath = path.join(appDir, 'caches');

	if (!fs.existsSync(cachePath)) {
		fs.readFile(cachePath, 'utf8', (err, contents)=> {
			return (contents);
		});

	} else {
		return (null);
	}
};


const writeCache = async(key, val)=> {
	const plat = process.platform;
	const appName = [...projectName().split('/')].pop();
	const homeDir = process.env[(plat === 'win32') ? 'USERPROFILE' : 'HOME'];
	const appDir = (plat === 'win32') ? path.join(homeDir, 'AppData', appName) : path.join(homeDir, `.${appName}`);
	const cachePath = path.join(appDir, 'caches');

	if (!fs.existsSync(appDir)) {
		fs.mkdir(appDir, (err)=> {
			fs.writeFile(cachePath, JSON.stringify({ [key] : val }), (err)=> {});
		})

	} else {
		fs.writeFile(cachePath, JSON.stringify({ [key] : val }), (err)=> {});
	}
};


async function createZip(srcPath) {
	console.log('createZip', srcPath);

	fs.readdir(srcPath, (err, files)=> {
		files.forEach((file, i)=> {
			console.log('FILE', file);
			zip.file(file, fs.readFileSync(path.join(srcPath, file)), {
				createFolders : true
			});
		})
	});

	zip.generateNodeStream({
		type : 'nodebuffer',
		streamFiles : true
	}).pipe(fs.createWriteStream('out.zip')).on('finish', ()=> {
		console.log('>>>>>> ZIPPED');
	});
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

	await createZip(path.join(process.cwd(), 'build'));

	console.log('%s Queueing playground…', chalk.cyan.bold('INFO'));

	let response = null;
	try {
		response = await queryPlayground(1);

	} catch (e) {
		console.log('%s Error querying server! %s', chalk.red.bold('ERROR'), e);
		process.exit(1);
	}

	const playground = { ...response.playground,
		id  : response.playground.id << 0,
		new : response.playground.is_new
	};

//	console.log(response, '-->', playground);

	await writeCache('playground_id', playground.id);


	console.log('%s Compressing files…', chalk.cyan.bold('INFO'));
	console.log('%s Sending zip…', chalk.cyan.bold('INFO'));


	console.log('%s Playground %s! %s', chalk.green.bold('DONE'), (playground), `https://playground.designengine.ai/${playground.id}`);
	return (true);
}
