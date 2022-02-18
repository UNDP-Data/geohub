import { writable } from 'svelte/store';
console.log('Setting up empty map store');
export const map = writable(null);