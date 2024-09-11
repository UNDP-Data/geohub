import { relations } from "drizzle-orm/relations";
import { datasetInGeohub, datasetTagInGeohub, tagInGeohub, styleInGeohub, styleFavouriteInGeohub, datasetFavouriteInGeohub, storymapInGeohub, storymapChaptersInGeohub, storymapChapterInGeohub, storymapFavouriteInGeohub, datasetPermissionInGeohub, productInGeohub, stacCollectionProductInGeohub, stylePermissionInGeohub, storymapPermissionInGeohub, datasetDefaultstyleInGeohub } from "./schema";

export const datasetTagInGeohubRelations = relations(datasetTagInGeohub, ({one}) => ({
	datasetInGeohub: one(datasetInGeohub, {
		fields: [datasetTagInGeohub.datasetId],
		references: [datasetInGeohub.id]
	}),
	tagInGeohub: one(tagInGeohub, {
		fields: [datasetTagInGeohub.tagId],
		references: [tagInGeohub.id]
	}),
}));

export const datasetInGeohubRelations = relations(datasetInGeohub, ({many}) => ({
	datasetTagInGeohubs: many(datasetTagInGeohub),
	datasetFavouriteInGeohubs: many(datasetFavouriteInGeohub),
	datasetPermissionInGeohubs: many(datasetPermissionInGeohub),
	datasetDefaultstyleInGeohubs: many(datasetDefaultstyleInGeohub),
}));

export const tagInGeohubRelations = relations(tagInGeohub, ({many}) => ({
	datasetTagInGeohubs: many(datasetTagInGeohub),
}));

export const styleFavouriteInGeohubRelations = relations(styleFavouriteInGeohub, ({one}) => ({
	styleInGeohub: one(styleInGeohub, {
		fields: [styleFavouriteInGeohub.styleId],
		references: [styleInGeohub.id]
	}),
}));

export const styleInGeohubRelations = relations(styleInGeohub, ({many}) => ({
	styleFavouriteInGeohubs: many(styleFavouriteInGeohub),
	stylePermissionInGeohubs: many(stylePermissionInGeohub),
}));

export const datasetFavouriteInGeohubRelations = relations(datasetFavouriteInGeohub, ({one}) => ({
	datasetInGeohub: one(datasetInGeohub, {
		fields: [datasetFavouriteInGeohub.datasetId],
		references: [datasetInGeohub.id]
	}),
}));

export const storymapChaptersInGeohubRelations = relations(storymapChaptersInGeohub, ({one}) => ({
	storymapInGeohub: one(storymapInGeohub, {
		fields: [storymapChaptersInGeohub.storymapId],
		references: [storymapInGeohub.id]
	}),
	storymapChapterInGeohub: one(storymapChapterInGeohub, {
		fields: [storymapChaptersInGeohub.chapterId],
		references: [storymapChapterInGeohub.id]
	}),
}));

export const storymapInGeohubRelations = relations(storymapInGeohub, ({many}) => ({
	storymapChaptersInGeohubs: many(storymapChaptersInGeohub),
	storymapFavouriteInGeohubs: many(storymapFavouriteInGeohub),
	storymapPermissionInGeohubs: many(storymapPermissionInGeohub),
}));

export const storymapChapterInGeohubRelations = relations(storymapChapterInGeohub, ({many}) => ({
	storymapChaptersInGeohubs: many(storymapChaptersInGeohub),
}));

export const storymapFavouriteInGeohubRelations = relations(storymapFavouriteInGeohub, ({one}) => ({
	storymapInGeohub: one(storymapInGeohub, {
		fields: [storymapFavouriteInGeohub.storymapId],
		references: [storymapInGeohub.id]
	}),
}));

export const datasetPermissionInGeohubRelations = relations(datasetPermissionInGeohub, ({one}) => ({
	datasetInGeohub: one(datasetInGeohub, {
		fields: [datasetPermissionInGeohub.datasetId],
		references: [datasetInGeohub.id]
	}),
}));

export const stacCollectionProductInGeohubRelations = relations(stacCollectionProductInGeohub, ({one}) => ({
	productInGeohub: one(productInGeohub, {
		fields: [stacCollectionProductInGeohub.productId],
		references: [productInGeohub.id]
	}),
}));

export const productInGeohubRelations = relations(productInGeohub, ({many}) => ({
	stacCollectionProductInGeohubs: many(stacCollectionProductInGeohub),
}));

export const stylePermissionInGeohubRelations = relations(stylePermissionInGeohub, ({one}) => ({
	styleInGeohub: one(styleInGeohub, {
		fields: [stylePermissionInGeohub.styleId],
		references: [styleInGeohub.id]
	}),
}));

export const storymapPermissionInGeohubRelations = relations(storymapPermissionInGeohub, ({one}) => ({
	storymapInGeohub: one(storymapInGeohub, {
		fields: [storymapPermissionInGeohub.storymapId],
		references: [storymapInGeohub.id]
	}),
}));

export const datasetDefaultstyleInGeohubRelations = relations(datasetDefaultstyleInGeohub, ({one}) => ({
	datasetInGeohub: one(datasetInGeohub, {
		fields: [datasetDefaultstyleInGeohub.datasetId],
		references: [datasetInGeohub.id]
	}),
}));