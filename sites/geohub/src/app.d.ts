/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs#typescript
// for information about these interfaces
declare namespace App {
	interface Locals {
		session: Session;
	}

	//   interface Platform {}
	interface Session {
		user: {
			id: string;
			name: string;
			email: string;
			image: string;
			jobTitle?: string;
		};
		expires: string;
		accessToken: string;
	}
	//   interface Stuff {}
}
