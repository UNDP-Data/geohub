export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.W7F7G8R7.js","app":"_app/immutable/entry/app.Rk1XkMzp.js","imports":["_app/immutable/entry/start.W7F7G8R7.js","_app/immutable/chunks/entry.09MmrMVy.js","_app/immutable/chunks/scheduler.j4vhKuc0.js","_app/immutable/entry/app.Rk1XkMzp.js","_app/immutable/chunks/scheduler.j4vhKuc0.js","_app/immutable/chunks/index.J8036QCz.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
