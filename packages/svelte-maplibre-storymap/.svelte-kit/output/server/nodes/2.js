

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.tCDsXfOD.js","_app/immutable/chunks/scheduler.j4vhKuc0.js","_app/immutable/chunks/index.J8036QCz.js"];
export const stylesheets = ["_app/immutable/assets/2.Kju5g4EG.css"];
export const fonts = [];
