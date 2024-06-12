export const AvailableTemplates = ['light', 'dark'] as const;

export type StoryMapTemplate = (typeof AvailableTemplates)[number];
