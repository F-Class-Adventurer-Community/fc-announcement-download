import { promises as fs } from 'fs';
import path from 'path';

import parseAnnouncementList from "./lib/parseAnnouncementList.mjs";
import parseAnnouncement from "./lib/parseAnnouncement.mjs";
import loadConfig from './lib/loadConfig.mjs';

// const origin = 'https://announcement.ekgamesserver.com';
// const announcementListUrl = 'https://announcement.ekgamesserver.com/?ppk=42f47521-f47a-496b-9e90-af01f0f10c37&l=en';
// const outDir = './out';
const gidPattern = /gid=(\d+)$/g;

// const couponAnnouncementGid = '7351';

(async function () {
	const config = await loadConfig('./config/config.json');
	console.log(config);
	const OutDir = path.resolve(config.outDir);
	const mkdirPromise = fs.mkdir(OutDir, { recursive: true });
	const announcementUrls = await parseAnnouncementList(config.announcementListUrl);

	await mkdirPromise;
	const dirContents = await fs.readdir(OutDir, { withFileTypes: true });
	const subdirs = dirContents.filter(d => d.isDirectory()).map(d => d.name);

	await Promise.allSettled(announcementUrls.map(url => parseUrl(url, subdirs, OutDir, config.origin, config.couponAnnouncementGid)));

}());

async function parseUrl(url, subdirs, outDir, origin, couponAnnouncementGid) {
	const gid = [...url.matchAll(gidPattern)][0][1];
	if (gid === couponAnnouncementGid) return;
	if (subdirs.includes(gid)) return;
	await parseAnnouncement(origin + url, path.join(outDir, gid));
}