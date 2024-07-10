import type { PoolClient } from 'pg';
import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
import { Permission } from '$lib/config/AppConfig';
import { StorymapPermissionManager } from './StorymapPermissionManager';
import { v4 as uuidv4 } from 'uuid';

const dataUrl2binary = (dataUrl: string) => {
	const base64Data = dataUrl.split(',')[1];
	const binaryData = Buffer.from(base64Data, 'base64');
	return binaryData;
};

class StorymapManager {
	private storymap: StoryMapConfig;
	public getStorymap() {
		return this.storymap;
	}

	constructor(storymap?: StoryMapConfig) {
		// initialize default values
		if (!storymap) return;
		if (!storymap.id) storymap.id = uuidv4();
		if (!storymap.template_id) storymap.template_id = 'light';
		if (!storymap.chapters) storymap.chapters = [];
		storymap.chapters.forEach((ch) => {
			if (!ch.id) ch.id = uuidv4();
			if (!ch.imageAlignment) ch.imageAlignment = 'center';
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
			}
			if (!ch.mapAnimation) ch.mapAnimation = 'flyTo';
			if (ch.rotateAnimation === undefined) ch.rotateAnimation = false;
			if (ch.spinGlobe === undefined) ch.spinGlobe = false;
		});

		this.storymap = storymap;
	}

	private getSelectSql = (is_superuser: boolean, user_email?: string) => {
		return `
		WITH no_stars as (
			SELECT storymap_id, count(*) as no_stars FROM geohub.storymap_favourite GROUP BY storymap_id
		),
		permission as (
			SELECT storymap_id, permission FROM geohub.storymap_permission 
			WHERE user_email='${user_email}'
		)
		SELECT
			a.id, 
			a.title, 
			'data:image/png;base64,' || encode(a.logo, 'base64') as logo,
			a.subtitle, 
			a.byline, 
			a.footer, 
			a.template_id, 
			a.style_id, 
			a.base_style_id, 
			a.access_level, 
			a.createdat, 
			a.created_user, 
			a.updatedat, 
			a.updated_user,
			CASE WHEN z.no_stars is not null THEN cast(z.no_stars as integer) ELSE 0 END as no_stars,
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
					'data:image/png;base64,' || encode(c.image, 'base64') as image,
					c.image_alignment as "imageAlignment", 
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
					c.createdat, 
					c.created_user, 
					c.updatedat, 
					c.updated_user
				) AS p
			)))) AS chapters
		FROM geohub.storymap a
		LEFT JOIN geohub.storymap_chapters b
		ON a.id = b.storymap_id
		INNER JOIN geohub.storymap_chapter c
		ON b.chapter_id = c.id
		LEFT JOIN no_stars z
		ON a.id = z.storymap_id
		LEFT JOIN permission p
          ON a.id = p.storymap_id
		{where}
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
			a.createdat, 
			a.created_user, 
			a.updatedat, 
			a.updated_user,
			no_stars,
			permission
		`;
	};

	private generateStyleUrl = (story: StoryMapConfig) => {
		if (story.style_id) {
			story.style = `/api/style/${story.style_id}.json`;
		} else {
			story.style = `/api/mapstyle/${story.base_style_id ?? 'style'}.json`;
		}
		story.chapters.forEach((ch) => {
			const chapter = ch as unknown as StoryMapChapter;
			if (chapter.style_id) {
				chapter.style = `/api/style/${chapter.style_id}.json`;
			} else if (chapter.base_style_id) {
				chapter.style = `/api/mapstyle/${chapter.base_style_id}.json`;
			} else {
				chapter.style = `/api/mapstyle/${story.base_style_id}.json`;
			}
		});
		return story;
	};

	public async getById(client: PoolClient, id: string, is_superuser: boolean, user_email?: string) {
		let sql = this.getSelectSql(is_superuser, user_email);
		const where = `
		WHERE
			a.id = $1
		`;
		sql = sql.replace('{where}', where);

		const query = {
			text: sql,
			values: [id]
		};
		const res = await client.query(query);

		if (res.rowCount === 0) {
			return undefined;
		}
		let story = res.rows[0] as StoryMapConfig;
		story = this.generateStyleUrl(story);
		return story;
	}

	public async upsert(client: PoolClient) {
		console.debug(`started upserting ${this.storymap.id}`);

		// delete existing chapters
		let queryDelete = {
			text: `DELETE FROM geohub.storymap_chapter
			USING geohub.storymap_chapters
			WHERE geohub.storymap_chapter.id = geohub.storymap_chapters.chapter_id
			AND geohub.storymap_chapters.storymap_id = $1`,
			values: [this.storymap.id]
		};
		await client.query(queryDelete);
		queryDelete = {
			text: `DELETE FROM geohub.storymap_chapters WHERE storymap_id = $1`,
			values: [this.storymap.id]
		};
		await client.query(queryDelete);

		// insert chapters
		for (const ch of this.storymap.chapters) {
			const chapter = ch as unknown as StoryMapChapter;
			// console.log(JSON.stringify(chapter, null, 4));
			let chapterImage: Buffer = undefined;
			if (chapter.image) {
				chapterImage = dataUrl2binary(chapter.image);
			}

			const queryChapter = {
				text: `
				INSERT INTO geohub.storymap_chapter (
				id, 
				title, 
				description, 
				image, 
				image_alignment, 
				alignment, 
				map_interactive, 
				map_navigation_position, 
				map_animation, 
				rotate_animation, 
				spinglobe, 
				hidden, 
				center, 
				zoom, 
				bearing, 
				pitch, 
				style_id, 
				base_style_id, 
				on_chapter_enter, 
				on_chapter_exit, 
				createdat, 
				created_user, 
				updatedat, 
				updated_user
			) VALUES (
				$1, $2, $3, $4, $5, $6, 
				$7, $8, $9, $10, $11, $12, 
				ST_GeomFromText('POINT(${chapter.location.center.join(' ')})', 4326), 
				$13, $14, $15, $16, $17, $18, 
				$19, $20, $21, $22, $23
			)
				`,
				values: [
					chapter.id,
					chapter.title,
					chapter.description,
					chapterImage,
					chapter.imageAlignment,
					chapter.alignment,
					chapter.mapInteractive,
					chapter.mapNavigationPosition,
					chapter.mapAnimation,
					chapter.rotateAnimation,
					chapter.spinGlobe,
					chapter.hidden,
					chapter.location.zoom,
					chapter.location.bearing,
					chapter.location.pitch,
					chapter.style_id,
					chapter.base_style_id,
					chapter.onChapterEnter ? JSON.stringify(chapter.onChapterEnter) : undefined,
					chapter.onChapterExit ? JSON.stringify(chapter.onChapterExit) : undefined,
					chapter.createdat,
					chapter.created_user,
					chapter.updatedat,
					chapter.updated_user
				]
			};
			await client.query(queryChapter);
			console.debug(`inserted ${chapter.id} into storymap_chapter table`);
		}

		// insert storymap
		let logoImage: Buffer = undefined;
		if (this.storymap.logo) {
			logoImage = dataUrl2binary(this.storymap.logo);
		}

		const queryStorymap = {
			text: `
			INSERT INTO geohub.storymap (
			  id, 
			  title, 
			  logo, 
			  subtitle, 
			  byline, 
			  footer, 
			  template_id, 
			  style_id, 
			  base_style_id,
			  access_level,
			  createdat, 
			  created_user
			) 
			values (
			  $1, 
			  $2, 
			  $3, 
			  $4, 
			  $5, 
			  $6, 
			  $7,
			  $8,
			  $9,
			  $10,
			  $11, 
			  $12
			) 
			ON CONFLICT (id)
			DO
			UPDATE
			 SET
			  title=$2, 
			  logo=$3, 
			  subtitle=$4, 
			  byline=$5, 
			  footer=$6, 
			  template_id=$7, 
			  style_id=$8,
			  base_style_id=$9,
			  access_level=$10,
			  updatedat=$13,
			  updated_user=$14`,
			values: [
				this.storymap.id,
				this.storymap.title,
				logoImage,
				this.storymap.subtitle,
				this.storymap.byline,
				this.storymap.footer,
				this.storymap.template_id,
				this.storymap.style_id,
				this.storymap.base_style_id,
				this.storymap.access_level,
				this.storymap.createdat,
				this.storymap.created_user,
				this.storymap.updatedat,
				this.storymap.updated_user
			]
		};
		await client.query(queryStorymap);
		console.debug(`updated storymap table`);

		for (const ch of this.storymap.chapters) {
			// insert storymap_chapters
			const sequence = this.storymap.chapters.indexOf(ch) + 1;
			const queryChapters = {
				text: `INSERT INTO geohub.storymap_chapters 
				(storymap_id, chapter_id, sequence) 
				VALUES ($1, $2, $3)`,
				values: [this.storymap.id, ch.id, sequence]
			};
			await client.query(queryChapters);
		}
		console.debug(`updated storymap_chapters table`);

		// if it is new data (no permission settings in the table yet), insert user email address as an owner of the dataset.
		const dpm = new StorymapPermissionManager(this.storymap.id, this.storymap.created_user);
		const permissions = await dpm.getAll(client);
		if (permissions.length === 0) {
			await dpm.register(client, {
				storymap_id: this.storymap.id,
				user_email: this.storymap.created_user,
				permission: Permission.OWNER
			});
			console.debug(`added ${this.storymap.created_user} as an owner of the dataset`);
		}
		console.debug(`ended upserting ${this.storymap.id}`);
		return this.storymap;
	}

	public async delete(client: PoolClient, storymapId: string) {
		console.debug(`started deleting ${storymapId}`);

		const queryChapters = {
			text: `
			DELETE FROM geohub.storymap_chapter
			USING geohub.storymap_chapters
			WHERE geohub.storymap_chapters.chapter_id = geohub.storymap_chapter.id
			AND geohub.storymap_chapters.storymap_id = $1
			`,
			values: [storymapId]
		};
		await client.query(queryChapters);

		const queryStorymap = {
			text: `DELETE FROM geohub.storymap WHERE id = $1`,
			values: [storymapId]
		};
		await client.query(queryStorymap);
		console.debug(`ended deleting ${storymapId}`);
	}
}

export default StorymapManager;
