import { SvelteComponent } from "svelte";
import type { StoryMapConfig } from './interfaces/index.js';
import 'maplibre-gl/dist/maplibre-gl.css';
declare const __propDef: {
    props: {
        config: StoryMapConfig;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type StoryMapProps = typeof __propDef.props;
export type StoryMapEvents = typeof __propDef.events;
export type StoryMapSlots = typeof __propDef.slots;
export default class StoryMap extends SvelteComponent<StoryMapProps, StoryMapEvents, StoryMapSlots> {
}
export {};
