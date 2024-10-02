import { Permission } from '$lib/config/AppConfig';
import { UserPermission } from './UserPermission';
import type { TransactionSchema } from './db';

export interface DatasetPermission {
	dataset_id: string;
	user_email: string;
	permission: Permission;
	createdat?: string;
	updatedat?: string;
}

export class DatasetPermissionManager {
	private userPermission: UserPermission;

	/**
	 * Constructor
	 * @param dataset_id dataset_id
	 * @param signed_user signed user email address
	 */
	constructor(dataset_id: string, signed_user: string) {
		this.userPermission = new UserPermission(
			dataset_id,
			signed_user,
			'dataset_permission',
			'dataset_id'
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
	 * Get all permission info for a dataset
	 * @returns DatasetPermission[]
	 */
	public getAll = async (tx?: TransactionSchema) => {
		return (await this.userPermission.getAll(tx)) as unknown as DatasetPermission[];
	};

	/**
	 * Register user permission for a dataset
	 * @param dataset_permission DatasetPermission object
	 */
	public register = async (dataset_permission: DatasetPermission, tx?: TransactionSchema) => {
		const params = JSON.parse(JSON.stringify(dataset_permission));
		await this.userPermission.register(params, tx);
	};

	/**
	 * Update user permission for a dataset
	 * @param dataset_permission DatasetPermission object
	 */
	public update = async (dataset_permission: DatasetPermission, tx?: TransactionSchema) => {
		const params = JSON.parse(JSON.stringify(dataset_permission));
		await this.userPermission.update(params, tx);
	};

	/**
	 * Delete user permission for a dataset
	 * @param user_email user email address to be deleted
	 */
	public delete = async (user_email: string, tx?: TransactionSchema) => {
		await this.userPermission.delete(user_email, tx);
	};
}
