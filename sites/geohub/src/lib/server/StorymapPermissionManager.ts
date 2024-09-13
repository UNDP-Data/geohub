import { Permission } from '$lib/config/AppConfig';
import { UserPermission } from './UserPermission';

export interface StorymapPermission {
	storymap_id: string;
	user_email: string;
	permission: Permission;
	createdat?: string;
	updatedat?: string;
}

export class StorymapPermissionManager {
	private userPermission: UserPermission;

	/**
	 * Constructor
	 * @param storymap_id storymap_id
	 * @param signed_user signed user email address
	 */
	constructor(storymap_id: string, signed_user: string) {
		this.userPermission = new UserPermission(
			storymap_id,
			signed_user,
			'storymap_permission',
			'storymap_id'
		);
	}

	/**
	 * get permission for signed user
	 * @returns 1: READ, 2: Write, 3: Owner, undefined: no permission registered
	 */
	public getBySignedUser = async () => {
		return await this.userPermission.getBySignedUser();
	};

	/**
	 * get permission for target user
	 * @param user_email target user_email address
	 * @returns 1: READ, 2: Write, 3: Owner, undefined: no permission registered
	 */
	public getByUser = async (user_email: string) => {
		return await this.userPermission.getByUser(user_email);
	};

	/**
	 * Get all permission info for a storymap
	 * @returns StorymapPermission[]
	 */
	public getAll = async () => {
		return (await this.userPermission.getAll()) as unknown as StorymapPermission[];
	};

	/**
	 * Register user permission for a storymap
	 * @param storymap_permission StorymapPermission object
	 */
	public register = async (storymap_permission: StorymapPermission) => {
		const params = JSON.parse(JSON.stringify(storymap_permission));
		await this.userPermission.register(params);
	};

	/**
	 * Update user permission for a storymap
	 * @param storymap_permission StorymapPermission object
	 */
	public update = async (storymap_permission: StorymapPermission) => {
		const params = JSON.parse(JSON.stringify(storymap_permission));
		await this.userPermission.update(params);
	};

	/**
	 * Delete user permission for a storymap
	 * @param user_email user email address to be deleted
	 */
	public delete = async (user_email: string) => {
		await this.userPermission.delete(user_email);
	};
}
