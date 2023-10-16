export const getMe = async (token: string) => {
	const res = await fetch('https://graph.microsoft.com/v1.0/me', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	const json = await res.json();
	return json;
};
