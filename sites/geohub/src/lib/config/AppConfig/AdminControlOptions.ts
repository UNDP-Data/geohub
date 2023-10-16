import type { Options } from '@undp-data/cgaz-admin-tool';

export const AdminControlOptions: Options = {
	url: 'https://undpngddlsgeohubdev01.blob.core.windows.net/admin/cgaz-geoboundaries.pmtiles',
	attribution: `Administrative boundaries courtesy of <a href= 'https://www.geoboundaries.org'>geoBoundaries</a>`,
	isHover: false,
	sourceId: 'cgaz',
	layerId: 'cgaz',
	sourceLayer: 'admin',
	featureId: 'id',
	maxZoom: 10,
	adminRange: [0, 2],
	adminName: 'admin{level}_name',
	fillColor: 'hsla(0, 0%, 0%, 0.25)',
	fillOutlineColor: 'hsla(0, 0%, 0%, 1)'
};
