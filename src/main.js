
import axios from 'axios';
import chalk from 'chalk';
import FormData from 'form-data';
import fs from 'fs';
import http from 'http';
import open from 'open';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import path from 'path';
import projectName from 'project-name';
import { promisify } from 'util';
import { XMLHttpRequest } from 'xmlhttprequest';
import zipdir from 'zip-dir';

const access = promisify(fs.access);

const API_ENDPT_URL = 'https://api.designengine.ai/playground.php';
const HOSTNAME = '127.0.0.1';
const PORT = 1066;

const MIME_TYPES = {
	html : 'text/html',
	txt  : 'text/plain',
	css  : 'text/css',
	gif  : 'image/gif',
	jpg  : 'image/jpeg',
	png  : 'image/png',
	svg  : 'image/svg+xml',
	js   : 'application/javascript'
};


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
//			open(`http://playground.designengine.ai/${55}`);
		}
	});

	return (true);
}

export async function puppet() {
	server.listen(PORT, HOSTNAME, async()=> {
//		console.log(`Server running at http://${HOSTNAME}:${PORT}/`);

		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto('http://localhost:1066/');
		const extract = await parsePage(page);

		const totals = {
			'links'   : extract.elements.links.length,
			'buttons' : extract.elements.buttons.length,
			'images'  : extract.elements.images.length
		};

		console.log('%s Found: %s link(s), %s button(s), %s image(s).', chalk.cyan.bold('INFO'), chalk.green.bold(totals.links), chalk.green.bold(totals.buttons), chalk.green.bold(totals.images));

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

//		if (playground.new) {

		console.log('%s Sending %s component(s)…', chalk.cyan.bold('INFO'), chalk.green.bold(Object.keys(totals).map((key)=> (totals[key])).reduce((acc, val)=> (acc + val))));
//		console.log('::::', extract.elements);
		response = await fetch(API_ENDPT_URL, {
			method  : 'POST',
			headers : {
				'Content-Type' : 'application/json'
			},
			body    : JSON.stringify({
				action        : 'ADD_COMPONENTS',
				playground_id : playgroundID,
				elements      : extract.elements
			})
		});

		try {
			response = await response.json();
//			console.log('::::', response);

		} catch (e) {
			console.log('%s Couldn\'t parse response! %s', chalk.red.bold('ERROR'), e);
		}
//		}

//		await page.screenshot({path:'example.png'});
//		const buttons = await page.$$eval('input[type="button"]', (btns)=> { return (btns.map((btn)=> btn.value)); });
//		const buttons = await page.$$eval('input[type="button"]', (btns)=> { return (btns.map((btn)=> {return ({width:getComputedStyle(btn).width, height:getComputedStyle(btn).height}); })); });
//		console.log('extract:', JSON.stringify(extract));
//		console.log('buttons:', buttons);

		await browser.close();
		server.close();

		console.log('%s Playground created! %s', chalk.green.bold('DONE'), chalk.blue.bold(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`));
		if (!openedPlayground) {
			await writeCache('playground_open', true);
			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
//			open(`http://playground.designengine.ai/${55}`);
		}
	});
}


const server = http.createServer((req, res) => {
	const reqPath = req.url.toString().split('?')[0];
	const dir = path.join(process.cwd(), 'build');
	const file = path.join(dir, reqPath.replace(/\/$/, '/index.html'));

	if (file.indexOf(dir + path.sep) !== 0) {
		res.statusCode = 403;
		res.setHeader('Content-Type', 'text/plain');
		return (res.end('Forbidden'));
	}

	const readStream = fs.createReadStream(file);
	readStream.on('open', ()=> {
		res.setHeader('Content-Type', MIME_TYPES[path.extname(file).slice(1)] || 'text/plain');
		readStream.pipe(res);
	});

	readStream.on('error', ()=> {
		res.setHeader('Content-Type', 'text/plain');
		res.statusCode = 404;
		res.end('Not found');
	});
});


async function extractElements(page) {
	const elements = {
		'links'   : await page.$$eval('a', (els)=> {
			return (els.map((el)=> {
				const elementStyles = (element)=> {
					let styles = {};
					const compStyle = getComputedStyle(element);
					for (let i=0; i<compStyle.length; i++) {
						styles[compStyle[i]] = compStyle.getPropertyValue(compStyle[i]).replace(/"/g, '\\"');
					}

					return (styles);
				};

				const styles = elementStyles(el);
				const elementColor = ()=> {
					return ({
						background : (Object.keys(styles).includes('background-color')) ? styles['background-color'] : rgbaObject('rgba(0, 0, 0, 1)'),
						foreground : (Object.keys(styles).includes('color')) ? styles['color'] : rgbaObject('rgba(0, 0, 0, 1)')
					});
				};

				const elementFont = ()=> {
					const line = (Object.keys(styles).includes('line-height') && !isNaN(styles['line-height'].replace('px', ''))) ? styles['line-height'].replace('px', '') << 0 : (styles['font-size'].replace('px', '') << 0) * 1.2;
					return ({
						family  : (Object.keys(styles).includes('font-family')) ? styles['font-family'].replace(/\\"/g, '') : '',
						size    : (Object.keys(styles).includes('font-size')) ? styles['font-size'].replace('px', '') << 0 : 0,
						kerning : (Object.keys(styles).includes('letter-spacing')) ? parseFloat(styles['letter-spacing']) : 0,
						line    : line
					})
				};

				const elementSize = ()=> {
					return ({
						width  : styles.width.replace('px', '') << 0,
						height : styles.height.replace('px', '') << 0
					});
				};

				return ({
					html   : el.outerHTML.replace(/"/g, '\\"'),
					styles : styles,
					border : null,
					color  : elementColor(),
					font   : elementFont(),
					size   : elementSize(),
					text   : el.innerText
				});
			}));
		}),

		'buttons' : await page.$$eval('input[type="button"]', (els)=> {
			return (els.map((el)=> {
				const elementStyles = (element)=> {
					let styles = {};
					const compStyle = getComputedStyle(element);
					for (let i=0; i<compStyle.length; i++) {
						styles[compStyle[i]] = compStyle.getPropertyValue(compStyle[i]).replace(/"/g, '\\"');
					}

					return (styles);
				};

				const styles = elementStyles(el);
				const elementColor = ()=> {
					return ({
						background : (Object.keys(styles).includes('background-color')) ? styles['background-color'] : rgbaObject('rgba(0, 0, 0, 1)'),
						foreground : (Object.keys(styles).includes('color')) ? styles['color'] : rgbaObject('rgba(0, 0, 0, 1)')
					});
				};

				const elementFont = ()=> {
					const line = (Object.keys(styles).includes('line-height') && !isNaN(styles['line-height'].replace('px', ''))) ? styles['line-height'].replace('px', '') << 0 : (styles['font-size'].replace('px', '') << 0) * 1.2;
					return ({
						family  : (Object.keys(styles).includes('font-family')) ? styles['font-family'].replace(/\\"/g, '') : '',
						size    : (Object.keys(styles).includes('font-size')) ? styles['font-size'].replace('px', '') << 0 : 0,
						kerning : (Object.keys(styles).includes('letter-spacing')) ? parseFloat(styles['letter-spacing']) : 0,
						line    : line
					});
				};

				const elementSize = ()=> {
					return ({
						width  : styles.width.replace('px', '') << 0,
						height : styles.height.replace('px', '') << 0
					});
				};

				return ({
					html   : el.outerHTML.replace(/"/g, '\\"'),
					styles : styles,
					border : null,
					color  : elementColor(),
					font   : elementFont(),
					size   : elementSize(),
					text   : el.value
				});
			}));
		}),

		'images'  : await page.$$eval('img', (els)=> {
			return (els.map((el)=> {
				const elementStyles = (element)=> {
					let styles = {};
					const compStyle = getComputedStyle(element);
					for (let i=0; i<compStyle.length; i++) {
						styles[compStyle[i]] = compStyle.getPropertyValue(compStyle[i]).replace(/"/g, '\\"');
					}

					return (styles);
				};

				const styles = elementStyles(el);
				const elementColor = ()=> {
					return ({
						background : (Object.keys(styles).includes('background-color')) ? styles['background-color'] : rgbaObject('rgba(0, 0, 0, 1)'),
						foreground : (Object.keys(styles).includes('color')) ? styles['color'] : rgbaObject('rgba(0, 0, 0, 1)')
					});
				};

				const elementFont = ()=> {
					const line = (Object.keys(styles).includes('line-height') && !isNaN(styles['line-height'].replace('px', ''))) ? styles['line-height'].replace('px', '') << 0 : (styles['font-size'].replace('px', '') << 0) * 1.2;
					return ({
						family  : (Object.keys(styles).includes('font-family')) ? styles['font-family'].replace(/\\"/g, '') : '',
						size    : (Object.keys(styles).includes('font-size')) ? styles['font-size'].replace('px', '') << 0 : 0,
						kerning : (Object.keys(styles).includes('letter-spacing')) ? parseFloat(styles['letter-spacing']) : 0,
						line    : line
					})
				};

				const elementSize = ()=> {
					return ({
						width  : styles.width.replace('px', '') << 0,
						height : styles.height.replace('px', '') << 0
					});
				};

				return ({
					html   : el.outerHTML.replace(/"/g, '\\"'),
					styles : styles,
					border : null,
					color  : elementColor(),
					font   : elementFont(),
					size   : elementSize(),
					text   : el.innerText,
					data   : el.src
				});
			}));
		}),
	};

	const imgSrcData = async(url)=> {
		return (new Promise((resolve, reject)=> {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onload = ()=> {
				if (xhr.status >= 200 && xhr.status < 300) {
					const mediaType = xhr.getResponseHeader('content-type');
					const bytes = new Uint8Array(xhr.response);
					const binary = [].map.call(bytes, (byte)=> (String.fromCharCode(byte))).join('');
					const base64 = [
						'data:',
						(mediaType) ? `${mediaType};` : '',
						'base64,',
//						btoa(binary)
						Buffer.from(binary, 'base64').toString()
					].join('');

					resolve(base64);

					//resolve(xhr.response);

				} else {
					reject({
						status     : xhr.status,
						statusText : xhr.statusText
					});
				}
			};

			xhr.onerror = ()=> {
				reject({
					status       : xhr.status,
					statusText   : xhr.statusText
				});
			};

			xhr.send();
		}));
	};


	return (elements);

//	return ({ ...elements,
//		images : elements.images.map(async(el, i)=> {
//			return ({ ...el,
//				data : await imgSrcData(el.data)
//			});
//		})
//	});
}

export function hexRGBA(color) {
	const { red, green, blue, alpha } = color.match(/^#?(?<red>[A-Fa-f\d]{2})(?<green>[A-Fa-f\d]{2})(?<blue>[A-Fa-f\d]{2})((?<alpha>[A-Fa-f\d]{2})?)$/).groups;
	return ({
		r : parseInt(red, 16),
		g : parseInt(green, 16),
		b : parseInt(blue, 16),
		a : (alpha) ? parseInt(alpha, 16) : 255
	});
}

async function parsePage(page) {
	return ({
		html       : {
			doc    : await page.content(),
			styles : await page.evaluate(()=> (getComputedStyle(document.documentElement)))
		},
		elements   : await extractElements(page),
		playground : null
	});
}

function rgbaObject(color) {
	return ({
		r : (color.match(/^rgba?\((?<red>\d+), (?<green>\d+), (?<blue>\d+)(, (?<alpha>\d(\.\d+)?))?\)$/).groups.red) << 0,
		g : (color.match(/^rgba?\((?<red>\d+), (?<green>\d+), (?<blue>\d+)(, (?<alpha>\d(\.\d+)?))?\)$/).groups.green) << 0,
		b : (color.match(/^rgba?\((?<red>\d+), (?<green>\d+), (?<blue>\d+)(, (?<alpha>\d(\.\d+)?))?\)$/).groups.blue) << 0,
		a : (color.includes('rgba')) ? parseFloat(color.match(/^rgba?\((?<red>\d+), (?<green>\d+), (?<blue>\d+), (?<alpha>\d(\.\d+)?)\)$/).groups.alpha) * 255 : 255
	});
}
