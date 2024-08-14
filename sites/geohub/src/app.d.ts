/// <reference types="@sveltejs/kit" />

import type { PoolClient } from 'pg';

// See https://kit.svelte.dev/docs#typescript
// for information about these interfaces
declare namespace App {
	interface Locals {
		pool: PoolClient;
		session: Session;
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
