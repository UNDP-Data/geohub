export const getRemoteSource = async (sourceUrl: string) => {
	try {
		const res = await fetch(sourceUrl);
		if (!res.ok) {
			console.log(`failed to fetch ${sourceUrl}`);
			return null;
		}
		const buf = Buffer.from(await res.arrayBuffer());
		return buf;
	} catch (e) {
		console.error(`[ERROR] ${e}`);
		return null;
	}
};
