import { ImageResponse } from '@ethercorps/sveltekit-og';
import type { RequestHandler } from './$types';

const template = (
	url: URL,
	content: string,
	title = 'UNDP GeoHub',
	description = `UNDP's one stop shop for geospatial data and analytics`,
	copyright = '&copy; 2023 United Nations Development Programme'
) => {
	return `
 <div tw="bg-gray-50 flex w-full h-full">
    <div tw="flex flex-col h-screen w-full p-4">
        <div tw="flex justify-between">
            <h1 tw="text-6xl font-bold">${title}</h1>
            <img src="${url.origin}/assets/undp-images/undp-logo-blue.svg" alt="UNDP Logo" height="256">
        </div>
        
        <div tw="flex items-center justify-start">
            <h2 tw="text-8xl font-bold text-center">${content}</h2>
        </div>
        <div tw="flex flex-col items-start flex-grow justify-end">
            <div tw="flex flex-col">
                <p tw="text-3xl text-left">${description}</p>
                <p tw="text-xl text-left">${copyright}</p>
            </div>
        </div>
    </div>
  </div>
`;
};

export const GET: RequestHandler = async ({ fetch, url }) => {
	const fontFile = await fetch(`${url.origin}/assets/fonts/proximanova-regular-webfont.woff`);
	const fontData: ArrayBuffer = await fontFile.arrayBuffer();

	const content = url.searchParams.get('content') ?? 'Missing content';

	const html = template(url, content);

	return await ImageResponse(html, {
		height: 630,
		width: 1200,
		fonts: [
			{
				name: 'Inter Latin',
				data: fontData,
				weight: 400
			}
		]
	});
};
