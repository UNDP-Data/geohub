import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import StorymapManager from '$lib/server/StorymapManager';
import { Permission } from '$lib/config/AppConfig';
import type { StoryMapConfig, StoryMapChapter } from '$lib/types';
import { error } from '@sveltejs/kit';

export const Output = z
	.custom<StoryMapConfig>()
	.describe('Storymap config object after registering');

export const Input = z
	.custom<StoryMapConfig>()
	.describe('Storymap config object to register')
	.openapi({
		example: {
			id: '33c0d688-e742-4e0b-b118-fae8d524b168',
			base_style_id: 'dark',
			template_id: 'light',
			title: 'Maplibre story map demo',
			subtitle: 'Subtitle of storymap',
			byline: 'Jin Igarashi',
			footer: 'United Nations Development Programme',
			access_level: 1,
			location: {
				center: [35.446, -0.12],
				zoom: 6,
				pitch: 0,
				bearing: 0
			},
			chapters: [
				{
					id: '439eeb54-76b0-4f7f-8887-abae8fac0a28',
					title: 'Kenya',
					description: 'This is Kenya',
					image:
						'data:image/png;base64,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',
					imageAlignment: 'right',
					alignment: 'left',
					hidden: false,
					mapInteractive: false,
					mapNavigationPosition: 'top-right',
					location: {
						center: [35.446, -0.12],
						zoom: 6,
						pitch: 0,
						bearing: 0
					},
					mapAnimation: 'flyTo',
					rotateAnimation: false,
					spinGlobe: false
				},
				{
					id: '90f04eff-88ab-49a4-b280-12b551b00fd7',
					title: 'Rwanda DEM',
					description: 'This is Rwanda DEM',
					alignment: 'right',
					hidden: false,
					mapInteractive: true,
					mapNavigationPosition: 'top-right',
					location: {
						center: [29.601, -1.784],
						zoom: 8,
						pitch: 0,
						bearing: 0
					},
					mapAnimation: 'flyTo',
					rotateAnimation: false,
					spinGlobe: false,
					style_id: '315',
					onChapterEnter: [
						{
							layer: '2e7e25c7-f5db-43a2-b7ba-70af559b623c',
							opacity: 0,
							duration: 0
						},
						{
							layer: 'e4032157-10e9-4c4a-a69e-efcc5e50ca08',
							opacity: 0,
							duration: 0
						}
					]
				}
			]
		} as unknown as StoryMapConfig
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Register new storymap';
	c.description =
		'Resiter new storymap object. If uuid is not specified, it will generate new uuid to register. If uuid is specified, check the database whether the ID already exists, update if passed checking user permission.';
	c.tags = ['storymap'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No storymap found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Input, Output, Modifier }).handle(
	async (param, { locals, request }) => {
		const session = await locals.auth();
		if (!session) error(403, { message: 'Permission error' });

		const user_email = session?.user.email;
		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const body: StoryMapConfig = await request.json();

		const now = new Date().toISOString();
		if (!body.created_user) {
			body.created_user = user_email;
			body.createdat = now;
		}
		body.updated_user = user_email;
		body.updatedat = now;

		body.chapters.forEach((ch) => {
			const chapter = ch as unknown as StoryMapChapter;
			chapter.created_user = body.created_user;
			chapter.createdat = body.createdat;
			chapter.updated_user = body.updated_user;
			chapter.updatedat = body.updatedat;
		});

		const sm = new StorymapManager(body);

		const story = await sm.getById(body.id as string, is_superuser, user_email);
		// if story id already exists, check user permission
		if (story && !(story && (story.permission as Permission) >= Permission.WRITE)) {
			error(403, { message: `You don't have permission to edit this storymap.` });
		}

		let storymap = await sm.upsert();
		if (storymap) {
			storymap = await sm.getById(storymap.id as string, is_superuser, user_email);
		}

		return storymap as StoryMapConfig;
	}
);
