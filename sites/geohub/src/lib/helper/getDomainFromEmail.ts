export const getDomainFromEmail = (email: string) => {
	return `@${email.split('@').pop()}`;
};
