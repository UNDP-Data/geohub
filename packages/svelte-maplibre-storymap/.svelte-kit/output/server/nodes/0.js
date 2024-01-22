

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.PyViqxtQ.js","_app/immutable/chunks/scheduler.j4vhKuc0.js","_app/immutable/chunks/index.J8036QCz.js"];
export const stylesheets = [];
export const fonts = [];
