import type { AcceptedExtension } from '$lib/types';

export const AccepedExtensions: AcceptedExtension[] = [
	{
		name: 'GeoTIFF',
		extensions: ['tif', 'tiff'],
		href: 'https://gdal.org/drivers/raster/gtiff.html#raster-gtiff',
		dataTypes: ['raster']
	},
	{
		name: 'NetCDF',
		extensions: ['nc'],
		href: 'https://gdal.org/drivers/raster/netcdf.html#raster-netcdf',
		dataTypes: ['raster', 'vector']
	},
	{
		name: 'Arc/Info ASCII Grid File',
		extensions: ['aig', 'asc', 'sgr', 'grd'],
		href: 'https://gdal.org/drivers/raster/aaigrid.html',
		dataTypes: ['raster']
	},
	{
		name: 'Erdas Imagine',
		extensions: ['raw', 'bl'],
		href: 'https://gdal.org/drivers/raster/eir.html',
		dataTypes: ['raster']
	},
	{
		name: 'ESRI Shapefile (zipped)',
		extensions: ['zip'],
		href: 'https://gdal.org/drivers/vector/shapefile.html',
		dataTypes: ['vector']
	},
	{
		name: 'ESRI Shapefile',
		extensions: [
			'shp',
			'prj',
			'dbf',
			'shx',
			'cpg',
			'sbn',
			'sbx',
			'fbn',
			'fbx',
			'ain',
			'aih',
			'ixs',
			'mxs'
			// 'atx'
		],
		href: 'https://gdal.org/drivers/vector/shapefile.html',
		requiredExtensions: ['shp', 'prj', 'dbf', 'shx'],
		dataTypes: ['vector']
	},
	{
		name: 'FlatGeobuf',
		extensions: ['fgb'],
		href: 'https://gdal.org/drivers/vector/flatgeobuf.html',
		dataTypes: ['vector']
	},
	{
		name: 'GeoJSON',
		extensions: ['geojson'],
		href: 'https://gdal.org/drivers/vector/geojson.html',
		dataTypes: ['vector']
	},
	{
		name: 'PMTILES',
		extensions: ['pmtiles'],
		href: 'https://protomaps.com/docs/pmtiles',
		dataTypes: ['vector']
	},
	{
		name: 'MBTILES',
		extensions: ['mbtiles'],
		href: 'https://github.com/mapbox/mbtiles-spec',
		dataTypes: ['vector']
	},
	{
		name: 'ESRI File Geodatabase (OpenFileGDB)',
		extensions: ['gdb'],
		href: 'https://gdal.org/drivers/vector/openfilegdb.html#esri-file-geodatabase-openfilegdb',
		dataTypes: ['vector', 'raster']
	},
	{
		name: 'ESRI File Geodatabase (FileGDB)',
		extensions: ['gdb'],
		href: 'https://gdal.org/drivers/vector/filegdb.html',
		dataTypes: ['vector']
	},
	{
		name: 'ESRI Personal GeoDatabase',
		extensions: ['mdb'],
		href: 'https://gdal.org/drivers/vector/pgeo.html',
		dataTypes: ['vector']
	},
	{
		name: 'GeoPackage',
		extensions: ['gpkg'],
		href: 'https://gdal.org/drivers/vector/gpkg.html',
		dataTypes: ['vector', 'raster']
	},
	{
		name: 'Archive Formats',
		extensions: ['zip', 'gz', 'tar', 'tgz', '7z'],
		href: 'https://github.com/UNDP-Data/geohub-data-pipeline/blob/main/ingest/config.py#L32-L38',
		dataTypes: ['vector', 'raster']
	}
];
