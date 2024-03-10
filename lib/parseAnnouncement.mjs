import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import client from 'https';

const startToken = '<div id="content">';
const endToken = '</div>';
const imgPattern = /<img [^>]*src="([^"]+)"/gi;
const htmlPattern = /<[^>]*>/g;
const numberLinePattern = /^\d+\./;
const whitespacePattern = /^\s*$/;

const indentation = '  ';

/**
 * 
 * @param {string} url 
 * @param {string} outDir
 */
export default async function parsedAnnouncement(url, outDir) {
	const imgDir = path.join(outDir, 'imgs');
	await fs.mkdir(imgDir, { recursive: true });

	const contents = await getContents(url);
	const imgs = [...contents.matchAll(imgPattern)].map(a => a[1]);

	const bareContents = contents.replace(htmlPattern, '');
	const contentLines = bareContents.split('\n');

	const Output = [];
	const AnnouncementIndex = contentLines.findIndex(l => l.startsWith('Maintenance announcement'));
	Output.push(contentLines[AnnouncementIndex], url);

	const announcementStartIndex = contentLines.findIndex(l => l.startsWith('1.'));
	const announcementEndIndex = findStopIndex(contentLines);

	for (let i = announcementStartIndex; i < announcementEndIndex; i++) {
		const line = contentLines[i];

		if (line === '' || whitespacePattern.test(line)) {
			continue;
		}

		if (numberLinePattern.test(line)) {
			const splitLine = line.split('. ');
			Output.push('', splitLine[0] + '. **' + splitLine[1] + '**');
			continue;
		}

		if (line.startsWith('- ')) {
			Output.push(indentation + line);
			continue;
		}

		Output.push(indentation + indentation + line);

	}

	await Promise.all([
		fs.writeFile(path.join(outDir, 'parsedAnnouncement.html'), contents),
		fs.writeFile(path.join(outDir, 'parsedAnnouncement.txt'), bareContents),
		fs.writeFile(path.join(outDir, 'extractedImgs.txt'), imgs.join('\n')),
		fs.writeFile(path.join(outDir, 'formattedAnnouncement.txt'), Output.join('\n')),
		downloadImgs(imgs, imgDir),
	]);

}

/**
 * 
 * @param {string[]} urls 
 * @param {string} outDir
 */
async function downloadImgs(urls, outDir) {
	for (const u of urls) {
		await downloadImg(u, outDir);
		await sleep(100); // cloudfront will throttle us
	}
}

/**
 * 
 * @param {number} ms 
 */
async function sleep(ms) {
	return new Promise((res) => {
		setTimeout(res, ms);
	});
}

/**
 * 
 * @param {string} url 
 * @param {string} outDir 
 */
async function downloadImg(url, outDir) {
	const filename = url.substring(url.lastIndexOf('/') + 1);
	await downloadImage(url, path.join(outDir, filename));
}

// https://scrapingant.com/blog/download-image-javascript
function downloadImage(url, filepath) {
	return new Promise((resolve, reject) => {
		client.get(url, (res) => {
			if (res.statusCode === 200) {
				res.pipe(createWriteStream(filepath))
					.on('error', reject)
					.once('close', () => resolve(filepath));
			} else {
				// Consume response data to free up memory
				res.resume();
				const errorText = `Request Failed With a Status Code: ${res.statusCode} URL: ${url}`;
				console.error(errorText);
				reject(new Error(errorText));
			}
		});
	});
}

/**
 * 
 * @param {string} url 
 * @returns 
 */
async function getContents(url) {
	const PageContents = await (await fetch(url)).text();
	const fileContents = PageContents.replace(/\r/g, '');
	const startIndex = fileContents.indexOf(startToken) + startToken.length;
	const endIndex = fileContents.indexOf(endToken, startIndex);

	const contents = fileContents.substring(startIndex, endIndex);
	return contents;
}

/**
 * 
 * @param {string[]} contentLines 
 */
function findStopIndex(contentLines) {
	for (let i = contentLines.length - 1; i >= 0; i--) {
		if (contentLines[i].startsWith('*')) return i;
	}
	return 0;
}