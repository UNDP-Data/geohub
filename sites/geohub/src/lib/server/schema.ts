import {
	// pgTable,
	pgSchema,
	varchar,
	integer,
	unique,
	json,
	index,
	serial,
	timestamp,
	boolean,
	// geometry,
	uuid,
	doublePrecision,
	jsonb,
	foreignKey,
	primaryKey,
	smallint,
	customType
} from 'drizzle-orm/pg-core';
import type { Point, Polygon } from 'geojson';
// import { sql } from 'drizzle-orm';

export const geohub = pgSchema('geohub');

export const countryInGeohub = geohub.table('country', {
	iso3: varchar('iso_3').primaryKey().notNull(),
	isoCode: integer('iso_code').notNull(),
	iso2: varchar('iso_2'),
	name: varchar('name').notNull(),
	region1Code: integer('region1_code').notNull(),
	region1Name: varchar('region1_name').notNull(),
	region2Code: integer('region2_code').notNull(),
	region2Name: varchar('region2_name').notNull(),
	region3Code: integer('region3_code').notNull(),
	region3Name: varchar('region3_name').notNull()
});

export const userSettingsInGeohub = geohub.table(
	'user_settings',
	{
		userEmail: varchar('user_email', { length: 100 }).notNull(),
		settings: json('settings')
	},
	(table) => {
		return {
			constraintName: unique('constraint_name').on(table.userEmail)
		};
	}
);

export const tagInGeohub = geohub.table(
	'tag',
	{
		id: serial('id').primaryKey().notNull(),
		value: varchar('value').notNull(),
		key: varchar('key').notNull()
	},
	(table) => {
		return {
			idxKeyValue: index('tag_idx_key_value').using(
				'btree',
				table.key.asc().nullsLast(),
				table.value.asc().nullsLast()
			),
			idxValue: index('tag_idx_value').using('btree', table.value.asc().nullsLast())
		};
	}
);

export const styleInGeohub = geohub.table('style', {
	id: serial('id').primaryKey().notNull(),
	name: varchar('name').notNull(),
	style: json('style').notNull(),
	createdat: timestamp('createdat', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	layers: json('layers'),
	accessLevel: integer('access_level').default(1).notNull(),
	createdUser: varchar('created_user', { length: 100 }),
	updatedUser: varchar('updated_user', { length: 100 })
});

export const usersInGeohub = geohub.table('users', {
	id: varchar('id').primaryKey().notNull(),
	userEmail: varchar('user_email', { length: 100 }).notNull(),
	signupat: timestamp('signupat', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	lastaccessedat: timestamp('lastaccessedat', { withTimezone: true, mode: 'string' })
		.defaultNow()
		.notNull()
});

export const datasetInGeohub = geohub.table(
	'dataset',
	{
		id: varchar('id').primaryKey().notNull(),
		url: varchar('url').notNull(),
		isRaster: boolean('is_raster').notNull(),
		license: varchar('license'),
		// to fix the bug of geometry, use customType for time-being
		// https://github.com/drizzle-team/drizzle-orm/issues/3040#issuecomment-2451014133
		bounds: customType<{ data: Polygon }>({
			dataType() {
				return 'geometry(Polygon,4326)';
			}
		})('bounds').notNull(),
		createdat: timestamp('createdat', { withTimezone: true, mode: 'string' }).notNull(),
		updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' }),
		name: varchar('name'),
		description: varchar('description'),
		createdUser: varchar('created_user', { length: 100 }).notNull(),
		updatedUser: varchar('updated_user', { length: 100 }),
		accessLevel: integer('access_level').default(3).notNull()
	},
	(table) => {
		return {
			boundsGeomIdx: index('dataset_bounds_geom_idx').using('gist', table.bounds.asc().nullsLast())
		};
	}
);

export const superuserInGeohub = geohub.table('superuser', {
	userEmail: varchar('user_email', { length: 100 }).primaryKey().notNull(),
	createdat: timestamp('createdat', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
});

export const stacInGeohub = geohub.table('stac', {
	id: varchar('id').primaryKey().notNull(),
	name: varchar('name').notNull(),
	url: varchar('url').notNull(),
	type: varchar('type').notNull(),
	providers: json('providers'),
	createdat: timestamp('createdat', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdUser: varchar('created_user', { length: 100 }).notNull(),
	updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' }),
	updatedUser: varchar('updated_user', { length: 100 })
});

export const productInGeohub = geohub.table('product', {
	id: varchar('id').primaryKey().notNull(),
	label: varchar('label').notNull(),
	expression: varchar('expression').notNull(),
	description: varchar('description').notNull()
});

export const storymapInGeohub = geohub.table('storymap', {
	id: uuid('id').primaryKey().notNull(),
	title: varchar('title').notNull(),
	logo: varchar('logo'),
	subtitle: varchar('subtitle'),
	byline: varchar('byline'),
	footer: varchar('footer'),
	templateId: varchar('template_id').notNull(),
	// to fix the bug of geometry, use customType for time-being
	// https://github.com/drizzle-team/drizzle-orm/issues/3040#issuecomment-2451014133
	center: customType<{ data: Point }>({
		dataType() {
			return 'geometry(Point,4326)';
		}
	})('center'),
	zoom: doublePrecision('zoom'),
	bearing: doublePrecision('bearing').default(0).notNull(),
	pitch: doublePrecision('pitch').default(0).notNull(),
	styleId: integer('style_id'),
	baseStyleId: varchar('base_style_id'),
	hillshade: boolean('hillshade').default(false).notNull(),
	terrain: boolean('terrain').default(false).notNull(),
	accessLevel: integer('access_level').default(1).notNull(),
	createdat: timestamp('createdat', { withTimezone: true, mode: 'string' }).notNull(),
	createdUser: varchar('created_user').notNull(),
	updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' }),
	updatedUser: varchar('updated_user'),
	showProgress: boolean('show_progress').default(true).notNull(),
	projection: varchar('projection')
});

export const storymapChapterInGeohub = geohub.table('storymap_chapter', {
	id: uuid('id').primaryKey().notNull(),
	title: varchar('title').notNull(),
	description: varchar('description').notNull(),
	image: varchar('image'),
	alignment: varchar('alignment').notNull(),
	mapInteractive: boolean('map_interactive').default(false).notNull(),
	mapNavigationPosition: varchar('map_navigation_position').notNull(),
	mapAnimation: varchar('map_animation').notNull(),
	rotateAnimation: boolean('rotate_animation').default(false).notNull(),
	spinglobe: boolean('spinglobe').default(false).notNull(),
	hidden: boolean('hidden').default(false).notNull(),
	// to fix the bug of geometry, use customType for time-being
	// https://github.com/drizzle-team/drizzle-orm/issues/3040#issuecomment-2451014133
	center: customType<{ data: Point }>({
		dataType() {
			return 'geometry(Point,4326)';
		}
	})('center').notNull(),
	zoom: doublePrecision('zoom').notNull(),
	bearing: doublePrecision('bearing').default(0).notNull(),
	pitch: doublePrecision('pitch').default(0).notNull(),
	styleId: integer('style_id'),
	baseStyleId: varchar('base_style_id'),
	hillshade: boolean('hillshade').default(false).notNull(),
	terrain: boolean('terrain').default(false).notNull(),
	onChapterEnter: jsonb('on_chapter_enter'),
	onChapterExit: jsonb('on_chapter_exit'),
	createdat: timestamp('createdat', { withTimezone: true, mode: 'string' }).notNull(),
	createdUser: varchar('created_user').notNull(),
	updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' }),
	updatedUser: varchar('updated_user'),
	cardHidden: boolean('card_hidden').default(false).notNull(),
	legendPosition: varchar('legend_position').default('bottom-left'),
	showLegend: boolean('show_legend').default(true).notNull(),
	projection: varchar('projection')
});

export const licenseInGeohub = geohub.table('license', {
	id: serial('id').primaryKey().notNull(),
	name: varchar('name').notNull()
});

export const datasetTagInGeohub = geohub.table(
	'dataset_tag',
	{
		datasetId: varchar('dataset_id').notNull(),
		tagId: serial('tag_id').notNull()
	},
	(table) => {
		return {
			fkDatasetToDatasetTag: foreignKey({
				columns: [table.datasetId],
				foreignColumns: [datasetInGeohub.id],
				name: 'fk_dataset_to_dataset_tag'
			}).onDelete('cascade'),
			fkTagToDatasetTag: foreignKey({
				columns: [table.tagId],
				foreignColumns: [tagInGeohub.id],
				name: 'fk_tag_to_dataset_tag'
			}).onDelete('cascade'),
			datasetTagPkey: primaryKey({
				columns: [table.datasetId, table.tagId],
				name: 'dataset_tag_pkey'
			})
		};
	}
);

export const styleFavouriteInGeohub = geohub.table(
	'style_favourite',
	{
		styleId: integer('style_id').notNull(),
		userEmail: varchar('user_email', { length: 100 }).notNull(),
		savedat: timestamp('savedat', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
	},
	(table) => {
		return {
			fkStyleToStyleFavourite: foreignKey({
				columns: [table.styleId],
				foreignColumns: [styleInGeohub.id],
				name: 'FK_style_TO_style_favourite'
			}).onDelete('cascade'),
			styleFavouritePkey: primaryKey({
				columns: [table.styleId, table.userEmail],
				name: 'style_favourite_pkey'
			})
		};
	}
);

export const datasetFavouriteInGeohub = geohub.table(
	'dataset_favourite',
	{
		datasetId: varchar('dataset_id').notNull(),
		userEmail: varchar('user_email', { length: 100 }).notNull(),
		savedat: timestamp('savedat', { withTimezone: true, mode: 'string' }).notNull()
	},
	(table) => {
		return {
			fkDatasetToDatasetFavourite: foreignKey({
				columns: [table.datasetId],
				foreignColumns: [datasetInGeohub.id],
				name: 'FK_dataset_TO_dataset_favourite'
			}).onDelete('cascade'),
			datasetFavouritePkey: primaryKey({
				columns: [table.datasetId, table.userEmail],
				name: 'dataset_favourite_pkey'
			})
		};
	}
);

export const storymapChaptersInGeohub = geohub.table(
	'storymap_chapters',
	{
		storymapId: uuid('storymap_id').notNull(),
		chapterId: uuid('chapter_id').notNull(),
		sequence: integer('sequence').notNull()
	},
	(table) => {
		return {
			fkStorymapToStorymapChapters: foreignKey({
				columns: [table.storymapId],
				foreignColumns: [storymapInGeohub.id],
				name: 'fk_storymap_to_storymap_chapters'
			}).onDelete('cascade'),
			fkStorymapToStorymapChapter: foreignKey({
				columns: [table.chapterId],
				foreignColumns: [storymapChapterInGeohub.id],
				name: 'fk_storymap_to_storymap_chapter'
			}).onDelete('cascade'),
			storymapChaptersPkey: primaryKey({
				columns: [table.storymapId, table.chapterId],
				name: 'storymap_chapters_pkey'
			})
		};
	}
);

export const storymapFavouriteInGeohub = geohub.table(
	'storymap_favourite',
	{
		storymapId: uuid('storymap_id').notNull(),
		userEmail: varchar('user_email', { length: 100 }).notNull(),
		savedat: timestamp('savedat', { withTimezone: true, mode: 'string' }).notNull()
	},
	(table) => {
		return {
			fkStorymapToStorymapFavourite: foreignKey({
				columns: [table.storymapId],
				foreignColumns: [storymapInGeohub.id],
				name: 'FK_storymap_TO_storymap_favourite'
			}).onDelete('cascade'),
			storymapFavouritePkey: primaryKey({
				columns: [table.storymapId, table.userEmail],
				name: 'storymap_favourite_pkey'
			})
		};
	}
);

export const datasetPermissionInGeohub = geohub.table(
	'dataset_permission',
	{
		datasetId: varchar('dataset_id').notNull(),
		userEmail: varchar('user_email', { length: 100 }).notNull(),
		permission: smallint('permission').default(1).notNull(),
		createdat: timestamp('createdat', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' })
	},
	(table) => {
		return {
			fkDatasetToDatasetPermission: foreignKey({
				columns: [table.datasetId],
				foreignColumns: [datasetInGeohub.id],
				name: 'FK_dataset_TO_dataset_permission'
			}).onDelete('cascade'),
			datasetPermissionPkey: primaryKey({
				columns: [table.datasetId, table.userEmail],
				name: 'dataset_permission_pkey'
			})
		};
	}
);

export const stacCollectionProductInGeohub = geohub.table(
	'stac_collection_product',
	{
		stacId: varchar('stac_id').notNull(),
		collectionId: varchar('collection_id').notNull(),
		productId: varchar('product_id').notNull(),
		assets: varchar('assets').array().notNull(),
		description: varchar('description')
	},
	(table) => {
		return {
			stacCollectionProductProductIdFkey: foreignKey({
				columns: [table.productId],
				foreignColumns: [productInGeohub.id],
				name: 'stac_collection_product_product_id_fkey'
			}),
			stacCollectionProductPkey: primaryKey({
				columns: [table.stacId, table.collectionId, table.productId],
				name: 'stac_collection_product_pkey'
			})
		};
	}
);

export const stylePermissionInGeohub = geohub.table(
	'style_permission',
	{
		styleId: integer('style_id').notNull(),
		userEmail: varchar('user_email', { length: 100 }).notNull(),
		permission: smallint('permission').default(1).notNull(),
		createdat: timestamp('createdat', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' })
	},
	(table) => {
		return {
			fkStyleToStylePermission: foreignKey({
				columns: [table.styleId],
				foreignColumns: [styleInGeohub.id],
				name: 'FK_style_TO_style_permission'
			}).onDelete('cascade'),
			stylePermissionPkey: primaryKey({
				columns: [table.styleId, table.userEmail],
				name: 'style_permission_pkey'
			})
		};
	}
);

export const storymapPermissionInGeohub = geohub.table(
	'storymap_permission',
	{
		storymapId: uuid('storymap_id').notNull(),
		userEmail: varchar('user_email', { length: 100 }).notNull(),
		permission: smallint('permission').default(1).notNull(),
		createdat: timestamp('createdat', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' })
	},
	(table) => {
		return {
			fkStorymapToStorymapPermission: foreignKey({
				columns: [table.storymapId],
				foreignColumns: [storymapInGeohub.id],
				name: 'FK_storymap_TO_storymap_permission'
			}).onDelete('cascade'),
			storymapPermissionPkey: primaryKey({
				columns: [table.storymapId, table.userEmail],
				name: 'storymap_permission_pkey'
			})
		};
	}
);

export const datasetDefaultstyleInGeohub = geohub.table(
	'dataset_defaultstyle',
	{
		datasetId: varchar('dataset_id').notNull(),
		layerId: varchar('layer_id').notNull(),
		layerType: varchar('layer_type').notNull(),
		source: json('source').notNull(),
		style: json('style').notNull(),
		colormapName: varchar('colormap_name'),
		classificationMethod: varchar('classification_method'),
		createdUser: varchar('created_user', { length: 100 }).notNull(),
		createdat: timestamp('createdat', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedat: timestamp('updatedat', { withTimezone: true, mode: 'string' }),
		updatedUser: varchar('updated_user', { length: 100 }),
		classificationMethod2: varchar('classification_method_2')
	},
	(table) => {
		return {
			'fkDatasetToDatasetId,LayerType': foreignKey({
				columns: [table.datasetId],
				foreignColumns: [datasetInGeohub.id],
				name: 'FK_dataset_TO_dataset_id, layer_type'
			}).onDelete('cascade'),
			datasetDefaultstylePkey: primaryKey({
				columns: [table.datasetId, table.layerId, table.layerType],
				name: 'dataset_defaultstyle_pkey'
			})
		};
	}
);
