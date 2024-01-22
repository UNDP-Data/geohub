

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.vWq-8r5L.js","_app/immutable/chunks/scheduler.j4vhKuc0.js","_app/immutable/chunks/index.J8036QCz.js","_app/immutable/chunks/entry.09MmrMVy.js"];
export const stylesheets = [];
export const fonts = [];
