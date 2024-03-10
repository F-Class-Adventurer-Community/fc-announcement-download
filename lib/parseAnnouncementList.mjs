const pattern = /<a [^>]*href=\"([^\"]+)\"/gi;

/**
 * 
 * @param {string} url 
 * @returns {Promise<string[]>}
 */
export default async function parsedAnnouncementList(url) {
	const PageContents = (await (await fetch(url)).text()).replace(/&amp;/g, '&');

	return [...(new Set([...PageContents.matchAll(pattern)].map(m => m[1]))).values()];
}