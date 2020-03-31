#!/usr/bin/env node
'use strict';


// import aws from 'aws-sdk';
// import multer from 'multer';
// import multerS3 from 'multer-s3';
// import Uploader from 's3-batch-upload';
import { renderWorker } from 'design-engine-extract';
import { createPlayground, sendPlaygroundComponents } from 'design-engine-extract';
import { Strings } from 'lang-js-utils';



import {
	initCache,
	getAll,
	dropPlayground,
	getPlayground,
	writePlayground,
	getTeam,
	getUser } from './cache';
import { MAKE_PLAYGROUND, SEND_ELEMENTS } from './config';
import { PORT, ChalkStyles } from './consts';
import { makeServer } from './server';


export async function parseBuild() {
	await initCache();

	const allCache = await getAll();
	console.log('cache', { user : allCache.user.id, team : allCache.team.id });

	// const files = await new Uploader({
	// 		config: './.awss3rc', // can also use environment variables
	// 		bucket: 'pairurl',
	// 		localPath: './build/images/favicon',
	// 		remotePath: 'remote/path/in/bucket',
	// 		glob: '*.png', // default is '*.*'
	// 		globOptions: { nodir: true, dot: true }, // optional, additional options to pass to "glob" module
	// 		concurrency: '200', // default is 100
	// 		// dryRun: true, // default is false
	// 		cacheControl: 'max-age=300', // can be a string, for all uploade resources
	// 		cacheControl: { // or an object with globs as keys to match the input path
	// 			'**/settings.json': 'max-age=60', // 1 mins for settings, specific matches should go first
	// 			'**/*.json': 'max-age=300', // 5 mins for other jsons
	// 			'**/*.*': 'max-age=3600', // 1 hour for everthing else
	// 		},
	// 		accessControlLevel: 'bucket-owner-full-control' // optional, not passed if undefined. - available options - "private"|"public-read"|"public-read-write"|"authenticated-read"|"aws-exec-read"|"bucket-owner-read"|"bucket-owner-full-control"
	// 	}).upload();


	const user = await getUser();
	const team = await getTeam();
	if (!user || !team) {
		// do signup here
	}

	const startDate = Date.now();
	const server = await makeServer(async()=> {

		const renders = await renderWorker(`http://localhost:${PORT}/`);
		server.close();

		renders.forEach((render, i)=> {
			const { device, doc, elements } = render;
//			console.log('%s %s Completed parsing: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), [ ...Object.keys(elements).map((key)=> (`${ChalkStyles.NUMBER(elements[key].length)} ${Strings.pluralize(key.slice(0, -1), elements[key].length)}`)), `${ChalkStyles.NUMBER(Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))} ${Strings.pluralize('color', Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))}`, `${ChalkStyles.NUMBER(doc.fonts.length)} ${Strings.pluralize('font', doc.fonts.length)}`].join(', '));
			console.log('%s %s Completed parsing: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), [ ...Object.keys(elements).filter((key)=> (key !== 'links')).map((key)=> (`${ChalkStyles.NUMBER(elements[key].length)} ${Strings.pluralize(key.slice(0, -1), elements[key].length)}`)), `${ChalkStyles.NUMBER(Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))} ${Strings.pluralize('color', Object.keys(doc.colors).map((key)=> (doc.colors[key].length)).reduce((acc, val)=> (acc + val)))}`, `${ChalkStyles.NUMBER(doc.fonts.length)} ${Strings.pluralize('font', doc.fonts.length)}`].join(', '));
		});


		


		if (MAKE_PLAYGROUND) {
			for (let i=0; i<renders.length; i++) {
				const render = renders[i];

				const { device, doc, elements } = render;
				console.log('\n%s %s Generating playground (%s/%s)…', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.NUMBER(i + 1, true), ChalkStyles.NUMBER(renders.length, true));

				const { buildID } = await getPlayground();
				// const playground = await createPlayground((buildID || -1), user.id, team.id, device, doc);
				const playground = await createPlayground({ doc, device, 
					userID  : user.id, 
					teamID  : team.id,
					buildID : (buildID || -1)
				});

				if (!buildID) {
					await writePlayground(playground);
				}

				if (SEND_ELEMENTS) {
					const total = Object.keys(elements).map((key)=> (elements[key].length)).reduce((acc, val)=> (acc + val));
					console.log('%s %s Sending %s component(s)…', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.NUMBER(total));
					await sendPlaygroundComponents({
						userID       : user.id, 
						teamID       : team.id, 
						buildID      : playground.build_id,
						playgroundID : playground.id,
						components   : elements
					});
				}

				console.log('%s %s Created playground: %s', ChalkStyles.INFO, ChalkStyles.DEVICE(device), ChalkStyles.URL(`http://dev.pairurl.com/app/${Strings.slugifyURI(team.title)}/${Strings.slugifyURI(render.doc.title)}/${playground.build_id}/${Strings.slugifyURI(device)}`));
			}
		}

		const elapsed = `${(((Date.now() - startDate) * 0.001) << 0)}`;
		console.log('\n%s Finished in %s seconds.', ChalkStyles.DONE, ChalkStyles.NUMBER(elapsed));

		await dropPlayground();

		/*
		if (!opened) {
			await writeCache('playground_open', true);
			open(`http://playground.designengine.ai/spectrum-adobe-${playground.id}`);
		}
		*/
	});
}
