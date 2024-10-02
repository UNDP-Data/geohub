import { Permission } from '$lib/config/AppConfig';
import { UserPermission } from '$lib/server/UserPermission';
import type { TransactionSchema } from '$lib/server/db';

export interface StylePermission {
	style_id: string;
	user_email: string;
	permission: Permission;
	createdat?: string;
	updatedat?: string;
}

export class StylePermissionManager {
	private userPermission: UserPermission;

	/**
	 * Constructor
	 * @param style_id style_id
	 * @param signed_user signed user email address
	 */
	constructor(style_id: number, signed_user: string) {
		this.userPermission = new UserPermission(
			`${style_id}`,
			signed_user,
			'style_permission',
			'style_id'
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
	 * Get all permission info for a style
	 * @returns StylePermission[]
	 */
	public getAll = async (tx?: TransactionSchema) => {
		return (await this.userPermission.getAll(tx)) as unknown as StylePermission[];
	};

	/**
	 * Register user permission for a style
	 * @param style_permission StylePermission object
	 */
	public register = async (style_permission: StylePermission, tx?: TransactionSchema) => {
		const params = JSON.parse(JSON.stringify(style_permission));
		await this.userPermission.register(params, tx);
	};

	/**
	 * Update user permission for a style
	 * @param style_permission StylePermission object
	 */
	public update = async (style_permission: StylePermission, tx?: TransactionSchema) => {
		const params = JSON.parse(JSON.stringify(style_permission));
		await this.userPermission.update(params, tx);
	};

	/**
	 * Delete user permission for a style
	 * @param user_email user email address to be deleted
	 */
	public delete = async (user_email: string, tx?: TransactionSchema) => {
		await this.userPermission.delete(user_email, tx);
	};
}
