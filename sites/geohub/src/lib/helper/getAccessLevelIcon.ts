import { AccessLevel } from '$lib/config/AppConfig';

export const getAccessLevelIcon = (level: AccessLevel, hidePublicIcon = false) => {
	if (level === AccessLevel.PRIVATE) {
		return 'fa-solid fa-user-lock has-text-primary';
	} else if (level === AccessLevel.ORGANIZATION) {
		return 'fa-solid fa-building-lock has-text-primary';
	} else {
		return hidePublicIcon ? '' : 'fa-solid fa-lock-open has-text-primary';
	}
};
