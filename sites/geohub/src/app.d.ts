/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs#typescript
// for information about these interfaces
declare namespace App {
	interface Locals {
		session: Session;
		db: drizzle;
	}

	//   interface Platform {}
	interface Session {
		user: {
			id: string;
			name: string;
			email: string;
			image: string;
			is_superuser?: boolean;
		};
		expires: string;
		accessToken: string;
	}
	//   interface Stuff {}
}
