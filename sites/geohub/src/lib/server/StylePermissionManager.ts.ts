import { Permission } from '$lib/config/AppConfig';
import type { PoolClient } from 'pg';
import { UserPermission } from './UserPermission';

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
	 * @param client
	 * @returns 1: READ, 2: Write, 3: Owner, undefined: no permission registered
	 */
	public getBySignedUser = async (client: PoolClient) => {
		return await this.userPermission.getBySignedUser(client);
	};

	/**
	 * get permission for target user
	 * @param client
	 * @param user_email target user_email address
	 * @returns 1: READ, 2: Write, 3: Owner, undefined: no permission registered
	 */
	public getByUser = async (client: PoolClient, user_email: string) => {
		return await this.userPermission.getByUser(client, user_email);
	};

	/**
	 * Get all permission info for a style
	 * @param client
	 * @returns StylePermission[]
	 */
	public getAll = async (client: PoolClient) => {
		return (await this.userPermission.getAll(client)) as StylePermission[];
	};

	/**
	 * Register user permission for a style
	 * @param client
	 * @param style_permission StylePermission object
	 */
	public register = async (client: PoolClient, style_permission: StylePermission) => {
		const params = JSON.parse(JSON.stringify(style_permission));
		await this.userPermission.register(client, params);
	};

	/**
	 * Update user permission for a style
	 * @param client
	 * @param style_permission StylePermission object
	 */
	public update = async (client: PoolClient, style_permission: StylePermission) => {
		const params = JSON.parse(JSON.stringify(style_permission));
		await this.userPermission.update(client, params);
	};

	/**
	 * Delete user permission for a style
	 * @param client
	 * @param user_email user email address to be deleted
	 */
	public delete = async (client: PoolClient, user_email: string) => {
		await this.userPermission.delete(client, user_email);
	};
}
