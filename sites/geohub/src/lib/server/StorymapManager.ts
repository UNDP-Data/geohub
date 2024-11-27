import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { StorymapPermissionManager } from './StorymapPermissionManager';
import { v4 as uuidv4 } from 'uuid';
import { getDomainFromEmail } from '$lib/helper';
import { env } from '$env/dynamic/private';
import { eq, SQL, sql } from 'drizzle-orm';
import { db, type TransactionSchema } from '$lib/server/db';
import {
	storymapChapterInGeohub,
	storymapChaptersInGeohub,
	storymapInGeohub
} from '$lib/server/schema';

class StorymapManager {
	private storymap: StoryMapConfig | undefined;
	public getStorymap() {
		return this.storymap;
	}

	constructor(storymap?: StoryMapConfig) {
		// initialize default values
		if (!storymap) return;
		if (!storymap.id) storymap.id = uuidv4();
		if (!storymap.template_id) storymap.template_id = 'light';
		if (!storymap.chapters) storymap.chapters = [];
		if (storymap.showProgress === undefined) storymap.showProgress = true;
		storymap.chapters.forEach((ch) => {
			if (!ch.id) ch.id = uuidv4();
			if (!ch.alignment) ch.alignment = 'center';
			if (ch.hidden === undefined) ch.hidden = false;
			if (ch.mapInteractive === undefined) ch.mapInteractive = false;
			if (!ch.mapNavigationPosition) ch.mapNavigationPosition = 'top-right';
			if (!ch.location) {
				ch.location = {
					center: [0, 0],
					zoom: 0,
					pitch: 0,
					bearing: 0
				};
			} else {
				if (!ch.location.center) ch.location.center = [0, 0];
				if (!ch.location.zoom) ch.location.zoom = 0;
				if (!ch.location.pitch) ch.location.pitch = 0;
				if (!ch.location.bearing) ch.location.bearing = 0;
			}
			if (!ch.mapAnimation) ch.mapAnimation = 'flyTo';
			if (ch.rotateAnimation === undefined) ch.rotateAnimation = false;
			if (ch.spinGlobe === undefined) ch.spinGlobe = false;
		});

		this.storymap = storymap;
	}

	private getSelectSql = (
		is_superuser: boolean,
		user_email: string,
		isCount = false,
		where?: SQL
	) => {
		const sqlChunks: SQL[] = [];
		sqlChunks.push(
			sql.raw(`
			WITH no_stars as (
				SELECT storymap_id, count(*) as no_stars FROM geohub.storymap_favourite GROUP BY storymap_id
			),
			permission as (
				SELECT storymap_id, permission FROM geohub.storymap_permission 
				WHERE user_email='${user_email}'
			)`)
		);
		sqlChunks.push(sql.raw(`SELECT`));
		if (isCount) {
			sqlChunks.push(sql.raw(`count(*) as count`));
		} else {
			sqlChunks.push(
				sql.raw(`
			a.id, 
			a.title,
			a.logo,
			a.subtitle, 
			a.byline, 
			a.footer, 
			a.template_id, 
			json_build_object(
				'center', ARRAY[ST_X(a.center), ST_Y(a.center)], 
				'zoom', a.zoom, 
				'bearing', a.bearing, 
				'pitch', a.pitch
			) as location,
			a.style_id, 
			a.base_style_id, 
			a.access_level, 
			a.show_progress as "showProgress",
			a.createdat, 
			a.created_user, 
			a.updatedat, 
			a.updated_user,
			CASE WHEN z.no_stars is not null THEN cast(z.no_stars as integer) ELSE 0 END as no_stars,
			${
				user_email
					? `
						CASE
							WHEN (
							SELECT count(storymap_id) as count FROM geohub.storymap_favourite 
							WHERE storymap_id=a.id and user_email='${user_email}'
							) > 0 THEN true
							ELSE false
						END as is_star,
						`
					: 'false as is_star,'
			}
            ${
							!is_superuser && user_email
								? `CASE WHEN p.permission is not null THEN p.permission ELSE null END`
								: `${is_superuser ? Permission.OWNER : 'null'}`
						} as permission,
			array_to_json(array_agg(row_to_json((
				SELECT p FROM (
				SELECT
					c.id,
					c.title, 
					c.description,
					c.image,
					c.card_hidden as "cardHidden", 
					c.alignment, 
					c.map_interactive as "mapInteractive", 
					c.map_navigation_position as "mapNavigationPosition",
					c.map_animation as "mapAnimation", 
					c.rotate_animation as "rotateAnimation", 
					c.spinglobe as "spinGlobe", 
					c.hidden, 
					json_build_object(
						'center', ARRAY[ST_X(c.center), ST_Y(c.center)], 
						'zoom', c.zoom, 
						'bearing', c.bearing, 
						'pitch', c.pitch
					) as location,
					c.style_id, 
					c.base_style_id, 
					c.on_chapter_enter as "onChapterEnter", 
					c.on_chapter_exit as "onChapterExit", 
					c.legend_position as "legendPosition",
					c.show_legend as "showLegend",
					c.createdat, 
					c.created_user, 
					c.updatedat, 
					c.updated_user
				) AS p
			)) ORDER BY b.sequence)) AS chapters
			`)
			);
		}

		sqlChunks.push(sql.raw(`FROM geohub.storymap a`));

		if (!isCount) {
			sqlChunks.push(
				sql.raw(`
			LEFT JOIN geohub.storymap_chapters b
			ON a.id = b.storymap_id
			LEFT JOIN geohub.storymap_chapter c
			ON b.chapter_id = c.id	
			`)
			);
		}

		sqlChunks.push(
			sql.raw(`
		LEFT JOIN no_stars z
		ON a.id = z.storymap_id
		LEFT JOIN permission p
        ON a.id = p.storymap_id
		`)
		);

		if (where) {
			sqlChunks.push(where);
		}

		if (!isCount) {
			sqlChunks.push(
				sql.raw(`
			GROUP BY
				a.id, 
				a.title,
				a.logo, 
				a.subtitle, 
				a.byline, 
				a.footer, 
				a.template_id, 
				a.style_id, 
				a.base_style_id, 
				a.access_level, 
				a.show_progress,
				a.createdat, 
				a.created_user, 
				a.updatedat, 
				a.updated_user,
				no_stars,
				permission
				`)
			);
		}

		return sql.join(sqlChunks, sql.raw(' '));
	};

	private generateStyleUrl = (story: StoryMapConfig) => {
		if (story.style_id) {
			story.style = `/api/style/${story.style_id}.json${story.base_style_id ? `?basemap=${story.base_style_id}` : ''}`;
		} else {
			story.style = `/api/mapstyle/${story.base_style_id ?? 'style'}.json`;
		}
		story.chapters.forEach((ch) => {
			const chapter = ch as unknown as StoryMapChapter;
			if (chapter.style_id) {
				chapter.style = `/api/style/${chapter.style_id}.json${chapter.base_style_id ? `?basemap=${chapter.base_style_id}` : ''}`;
			} else if (chapter.base_style_id) {
				chapter.style = `/api/mapstyle/${chapter.base_style_id}.json`;
			} else {
				// if no style specified for chapter, use parent style either style_id or base_style_id
				if (story.style_id) {
					chapter.style = `/api/style/${story.style_id}.json${story.base_style_id ? `?basemap=${story.base_style_id}` : ''}`;
					chapter.style_id = story.style_id;
					chapter.base_style_id = story.base_style_id;
				} else {
					chapter.style = `/api/mapstyle/${story.base_style_id}.json`;
					chapter.base_style_id = story.base_style_id;
				}
			}
		});
		return story;
	};

	private getWhereSql(
		query: string,
		accessLevel: AccessLevel,
		onlyStar: boolean,
		user_email: string,
		mydataOnly: boolean
	) {
		let domain = '';
		if (user_email) {
			domain = getDomainFromEmail(user_email);
		}

		const sqlChunks: SQL[] = [sql.raw(`WHERE`)];

		if (!user_email) {
			sqlChunks.push(sql.raw(`a.access_level = ${AccessLevel.PUBLIC}`));
		} else {
			if (accessLevel === AccessLevel.PUBLIC) {
				sqlChunks.push(sql.raw(`a.access_level = ${AccessLevel.PUBLIC}`));
			} else if (accessLevel === AccessLevel.ORGANIZATION) {
				if (domain) {
					sqlChunks.push(
						sql.raw(`
					(
						a.access_level = ${AccessLevel.ORGANIZATION} AND a.created_user LIKE '%${domain}'
						OR (
							a.access_level = ${AccessLevel.ORGANIZATION} AND a.created_user LIKE '%${domain}'
							AND
							EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
						)
					)
					`)
					);
				}
			} else if (accessLevel === AccessLevel.PRIVATE) {
				sqlChunks.push(
					sql.raw(`
					(
						a.access_level = ${AccessLevel.PRIVATE}
						AND
						EXISTS (SELECT storymap_id FROM geohub.storymap_permission WHERE storymap_id = a.id AND user_email='${user_email}')
					OR EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
					)
				`)
				);
			} else {
				sqlChunks.push(
					sql.raw(`
				(a.access_level = ${AccessLevel.PUBLIC}
				${
					domain
						? `OR (
							a.access_level = ${AccessLevel.ORGANIZATION} AND a.created_user LIKE '%${domain}'
							OR (
								a.access_level = ${AccessLevel.ORGANIZATION} AND a.created_user LIKE '%${domain}'
								AND
								EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
							)
						)`
						: ''
				}
					OR (
						(
							a.access_level = ${AccessLevel.PRIVATE}
							AND
							EXISTS (SELECT storymap_id FROM geohub.storymap_permission WHERE storymap_id = a.id AND user_email='${user_email}')
						)
						OR EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
					)
				)
				`)
				);
			}
		}

		if (query) {
			sqlChunks.push(
				sql.raw(
					`AND (to_tsvector(a.title) @@ to_tsquery('${query}') OR to_tsvector(a.subtitle) @@ to_tsquery('${query}'))`
				)
			);
		}

		if (onlyStar && user_email) {
			sqlChunks.push(
				sql.raw(`
			AND EXISTS (
			SELECT storymap_id FROM geohub.storymap_favourite WHERE storymap_id=a.id AND user_email='${user_email}'
			)
			`)
			);
		}

		if (user_email && mydataOnly) {
			sqlChunks.push(
				sql.raw(
					`AND EXISTS (SELECT storymap_id FROM geohub.storymap_permission WHERE storymap_id = a.id AND user_email = '${user_email}' AND permission >= ${Permission.READ} )`
				)
			);
		}

		return sql.join(sqlChunks, sql.raw(' '));
	}

	public async getTotalCount(
		query: string,
		accessLevel: AccessLevel,
		onlyStar: boolean,
		is_superuser: boolean,
		user_email: string,
		mydataOnly: boolean
	) {
		const where = this.getWhereSql(query, accessLevel, onlyStar, user_email, mydataOnly);

		const sql = this.getSelectSql(is_superuser, user_email, true, where);

		const res = await db.execute(sql);
		if (res.length === 0) {
			return 0;
		} else {
			return Number(res[0].count);
		}
	}

	private createLinks = (story: StoryMapConfig) => {
		return [
			{
				rel: 'root',
				type: 'application/json',
				href: `/api/storymaps`
			},
			{
				rel: 'self',
				type: 'application/json',
				href: `/api/storymaps/${story.id}`
			},
			{
				rel: 'storymap',
				type: 'application/json',
				href: `/storymaps/${story.id}`
			},
			{
				rel: 'viewer',
				type: 'application/json',
				href: `/storymaps/${story.id}/viewer`
			},
			{
				rel: 'edit',
				type: 'application/json',
				href: `/storymaps/${story.id}/edit`
			},
			{
				rel: 'static-auto',
				type: 'image/png',
				href: `${env.GEOHUB_STATIC_IMAGE_API}/style/static/auto/{width}x{height}.webp?url=${story.style as string}`
			},
			{
				rel: 'ogimage',
				type: 'image/png',
				href: `${env.GEOHUB_STATIC_IMAGE_API}/og?url=${story.style as string}`
			}
		];
	};

	public async search(
		query: string,
		limit: number,
		offset: number,
		accessLevel: AccessLevel,
		onlyStar: boolean,
		sortByColumn: string,
		sortOrder: 'asc' | 'desc',
		is_superuser: boolean,
		user_email: string,
		mydataOnly: boolean
	) {
		const where = this.getWhereSql(query, accessLevel, onlyStar, user_email, mydataOnly);

		const sqlChunks: SQL[] = [];
		const mainSql = this.getSelectSql(is_superuser, user_email, false, where);
		sqlChunks.push(mainSql);

		sqlChunks.push(
			sql.raw(`
		ORDER BY
			${sortByColumn} ${sortOrder} 
		LIMIT ${limit}
		OFFSET ${offset}
		`)
		);
		const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
		const result = await db.execute(finalSql);

		const stories = result as unknown as StoryMapConfig[];

		for (let i = 0; i < stories.length; i++) {
			stories[i] = this.generateStyleUrl(stories[i]);
			stories[i].links = this.createLinks(stories[i]);
			stories[i].chapters = stories[i].chapters.filter((ch) => ch.id !== null);
		}
		return stories;
	}

	public async getById(id: string, is_superuser: boolean, user_email?: string) {
		const where = sql.raw(`
		WHERE
			a.id = UUID('${id}')
		`);

		const mainSql = this.getSelectSql(is_superuser, user_email as string, false, where);

		const res = await db.execute(mainSql);

		if (res.length === 0) {
			return undefined;
		}
		let story = res[0] as unknown as StoryMapConfig;
		story = this.generateStyleUrl(story);
		story.links = this.createLinks(story);
		story.chapters = story.chapters.filter((ch) => ch.id !== null);
		return story;
	}

	public async upsert() {
		if (!this.storymap) return;
		console.debug(`started upserting ${this.storymap.id}`);

		await db.transaction(async (tx) => {
			if (!this.storymap) return;
			// delete existing chapters
			await tx.execute(sql`
			DELETE FROM ${storymapChapterInGeohub}
			USING ${storymapChaptersInGeohub}
			WHERE ${storymapChapterInGeohub.id} = ${storymapChaptersInGeohub.chapterId}
			AND ${storymapChaptersInGeohub.storymapId} = ${this.storymap.id}
			`);

			await tx
				.delete(storymapChaptersInGeohub)
				.where(eq(storymapChaptersInGeohub.storymapId, this.storymap.id as string));

			// insert chapters
			for (const ch of this.storymap.chapters) {
				const chapter = ch as unknown as StoryMapChapter;

				await tx.insert(storymapChapterInGeohub).values({
					id: chapter.id,
					title: chapter.title,
					description: chapter.description,
					image: chapter.image,
					cardHidden: chapter.cardHidden ?? false,
					alignment: chapter.alignment,
					mapInteractive: chapter.mapInteractive,
					mapNavigationPosition: chapter.mapNavigationPosition,
					mapAnimation: chapter.mapAnimation,
					rotateAnimation: chapter.rotateAnimation,
					spinGlobe: chapter.spinGlobe,
					hidden: chapter.hidden,
					center: sql.raw(`ST_GeomFromText('POINT(${chapter.location.center.join(' ')})', 4326)`),
					zoom: chapter.location.zoom,
					bearing: chapter.location.bearing,
					pitch: chapter.location.pitch,
					styleId: chapter.style_id,
					baseStyleId: chapter.base_style_id,
					onChapterEnter: chapter.onChapterEnter,
					onChapterExit: chapter.onChapterExit,
					legendPosition: chapter.legendPosition ?? 'bottom-left',
					showLegend: chapter.showLegend ?? false,
					createdat: chapter.createdat,
					createdUser: chapter.created_user,
					updatedat: chapter.updatedat,
					updatedUser: chapter.updated_user
				});
				console.debug(`inserted ${chapter.id} into storymap_chapter table`);
			}

			// insert storymap
			await tx
				.insert(storymapInGeohub)
				.values({
					id: this.storymap.id,
					title: this.storymap.title,
					logo: this.storymap.logo,
					subtitle: this.storymap.subtitle,
					byline: this.storymap.byline,
					footer: this.storymap.footer,
					templateId: this.storymap.template_id,
					center: sql.raw(
						`ST_GeomFromText('POINT(${this.storymap.location.center.join(' ')})', 4326)`
					),
					zoom: this.storymap.location.zoom,
					bearing: this.storymap.location.bearing,
					pitch: this.storymap.location.pitch,
					styleId: this.storymap.style_id,
					baseStyleId: this.storymap.base_style_id,
					accessLevel: this.storymap.access_level,
					showProgress: this.storymap.showProgress,
					createdat: this.storymap.createdat,
					createdUser: this.storymap.created_user
				})
				.onConflictDoUpdate({
					target: [storymapInGeohub.id],
					set: {
						title: this.storymap.title,
						logo: this.storymap.logo,
						subtitle: this.storymap.subtitle,
						byline: this.storymap.byline,
						footer: this.storymap.footer,
						templateId: this.storymap.template_id,
						center: sql.raw(
							`ST_GeomFromText('POINT(${this.storymap.location.center.join(' ')})', 4326)`
						),
						zoom: this.storymap.location.zoom,
						bearing: this.storymap.location.bearing,
						pitch: this.storymap.location.pitch,
						styleId: this.storymap.style_id,
						baseStyleId: this.storymap.base_style_id,
						accessLevel: this.storymap.access_level,
						showProgress: this.storymap.showProgress,
						updatedat: this.storymap.updatedat,
						updatedUser: this.storymap.updated_user
					}
				});

			console.debug(`updated storymap table`);

			for (const ch of this.storymap.chapters) {
				// insert storymap_chapters
				const sequence = this.storymap.chapters.indexOf(ch) + 1;

				await tx.insert(storymapChaptersInGeohub).values({
					storymapId: this.storymap.id as string,
					chapterId: ch.id,
					sequence: sequence
				});
			}
			console.debug(`updated storymap_chapters table`);

			// if it is new data (no permission settings in the table yet), insert user email address as an owner of the dataset.
			const dpm = new StorymapPermissionManager(
				this.storymap.id as string,
				this.storymap.created_user as string
			);
			const permissions = await dpm.getAll(tx as TransactionSchema);
			if (permissions.length === 0) {
				await dpm.register(
					{
						storymap_id: this.storymap.id as string,
						user_email: this.storymap.created_user as string,
						permission: Permission.OWNER
					},
					tx as TransactionSchema
				);
				console.debug(`added ${this.storymap.created_user} as an owner of the storymap`);
			}
		});
		console.debug(`ended upserting ${this.storymap.id}`);
		return this.storymap;
	}

	public async delete(storymapId: string) {
		console.debug(`started deleting ${storymapId}`);
		await db.delete(storymapInGeohub).where(eq(storymapInGeohub.id, storymapId));
		console.debug(`ended deleting ${storymapId}`);
	}
}

export default StorymapManager;
