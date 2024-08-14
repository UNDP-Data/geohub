import { Permission } from '$lib/config/AppConfig';
import { error } from '@sveltejs/kit';
import type { PoolClient } from 'pg';
import { isSuperuser } from './helpers';

export class UserPermission {
	private id: string;
	private signed_user: string;

	private TABLE_NAME: string;
	private ID_COLUMN_NAME: string;

	/**
	 * Constructor
	 * @param id id
	 * @param signed_user signed user email address
	 * @param tableName table name for permission, eg, dataset_permission, style_permission
	 * @param idColName id column name for permission, eg, dataset_id, style_id
	 */
	constructor(id: string, signed_user: string, tableName: string, idColName: string) {
		this.id = id;
		this.signed_user = signed_user;
		this.TABLE_NAME = tableName;
		this.ID_COLUMN_NAME = idColName;
	}

	/**
	 * get permission for signed user
	 * @param client
	 * @returns 1: READ, 2: Write, 3: Owner, undefined: no permission registered
	 */
	public getBySignedUser = async (client: PoolClient) => {
		return await this.getByUser(client, this.signed_user);
	};

	/**
	 * get permission for target user
	 * @param client
	 * @param user_email target user_email address
	 * @returns 1: READ, 2: Write, 3: Owner, undefined: no permission registered
	 */
	public getByUser = async (client: PoolClient, user_email: string) => {
		const query = {
			text: `SELECT permission FROM geohub.${this.TABLE_NAME} WHERE ${this.ID_COLUMN_NAME}=$1 and user_email = $2`,
			values: [this.id, user_email]
		};
		const res = await client.query(query);
		if (res.rowCount === 0) {
			return undefined;
		}
		const permission = res.rows[0];
		return permission.permission;
	};

	/**
	 * Get all permission info for a dataset
	 * @param client
	 * @returns DatasetPermission[]
	 */
	public getAll = async (client: PoolClient) => {
		const query = {
			text: `
            SELECT ${this.ID_COLUMN_NAME}, user_email, permission, createdat, updatedat 
            FROM geohub.${this.TABLE_NAME}
            WHERE ${this.ID_COLUMN_NAME}=$1
            `,
			values: [this.id]
		};
		const res = await client.query(query);
		return res.rows;
	};

	private upsert = async (client: PoolClient, user_permission: { [key: string]: string }) => {
		const now = new Date().toISOString();
		if (!user_permission.createdat) {
			user_permission.createdat = now;
		}
		if (!user_permission.updatedat) {
			user_permission.updatedat = now;
		}

		const query = {
			text: `
			INSERT INTO geohub.${this.TABLE_NAME} (
			  ${this.ID_COLUMN_NAME},
              user_email,
              permission,
			  createdat
			) 
			values (
			  $1, 
			  $2, 
			  $3, 
			  $4::timestamptz
			) 
			ON CONFLICT (${this.ID_COLUMN_NAME}, user_email)
			DO
			UPDATE
			 SET
			  permission=$3, 
			  updatedat=$5::timestamptz
            `,
			values: [
				user_permission[this.ID_COLUMN_NAME],
				user_permission.user_email,
				user_permission.permission,
				user_permission.createdat,
				user_permission.updatedat
			]
		};
		try {
			await client.query(query);
		} catch (err) {
			client.query('ROLLBACK');
			error(500, err);
		}
	};

	/**
	 * Register user permission
	 * @param client
	 * @param user_permission user_permission info
	 */
	public register = async (client: PoolClient, user_permission: { [key: string]: string }) => {
		const is_superuser = await isSuperuser(client, this.signed_user);
		const permissions = await this.getAll(client);
		if (!is_superuser) {
			const signedUserPermission = await this.getBySignedUser(client);

			// no permission is registered yet, it allows to register
			if (!(permissions.length === 0 && !signedUserPermission)) {
				// only users with owner/write/read permission can register.
				if (!(signedUserPermission && signedUserPermission >= Permission.READ)) {
					error(403, { message: `You have no permission to register this user's permission.` });
				}

				// users cannot register permission which is higher than their own permission to a user.
				if (signedUserPermission < user_permission.permission) {
					error(403, { message: `You have no permission to register this user's permission.` });
				}
			}
		}
		if (permissions.length > 0) {
			// if target user is already registered to the table
			if (permissions.find((p) => p.user_email === user_permission.user_email)) {
				error(400, {
					message: `This user (${user_permission.user_email})'s permission was already registered for the dataset`
				});
			}
		}

		await this.upsert(client, user_permission);
	};

	/**
	 * Update user permission
	 * @param client
	 * @param user_permission user_permission info
	 */
	public update = async (client: PoolClient, user_permission: { [key: string]: string }) => {
		const is_superuser = await isSuperuser(client, this.signed_user);
		if (!is_superuser) {
			// cannot delete signed in user themselves
			if (this.signed_user === user_permission.user_email) {
				error(403, { message: 'You cannot update your own permission' });
			}

			// only users with owner/write/read permission can update.
			const signedUserPermission = await this.getBySignedUser(client);
			if (!(signedUserPermission && signedUserPermission >= Permission.READ)) {
				error(403, { message: `You have no permission to register this user's permission.` });
			}

			// users cannot update permission which is higher than their own permission to a user.
			if (signedUserPermission < user_permission.permission) {
				error(403, { message: `You have no permission to register this user's permission.` });
			}
		}

		const permissions = await this.getAll(client);
		if (permissions.length > 0) {
			// if target user is not registered to the table
			if (!permissions.find((p) => p.user_email === user_permission.user_email)) {
				error(404, {
					message: `This user (${user_permission.user_email})'s permission is not registered for the dataset`
				});
			}
		}

		await this.upsert(client, user_permission);
	};

	/**
	 * Delete user permission
	 * @param client
	 * @param user_email user email address to be deleted
	 */
	public delete = async (client: PoolClient, user_email: string) => {
		const is_superuser = await isSuperuser(client, this.signed_user);
		if (!is_superuser) {
			// cannot delete signed in user themselves
			if (this.signed_user === user_email) {
				error(403, { message: 'You cannot delete your own permission' });
			}

			// only users with owner/write/read permission can delete.
			const permission = await this.getBySignedUser(client);
			if (!(permission && permission >= Permission.READ)) {
				error(403, { message: `You have no permission to delete this user's permission.` });
			}

			// users users cannot delete permission which is higher than their own permission to a user.
			const targetPermission = await this.getByUser(client, user_email);
			if (permission < Permission.OWNER && targetPermission === Permission.OWNER) {
				error(403, { message: `You have no permission to delete this user's permission.` });
			}
		}

		const permissions = await this.getAll(client);
		if (permissions.length > 0) {
			// if target user is not registered to the table
			if (!permissions.find((p) => p.user_email === user_email)) {
				error(404, {
					message: `This user (${user_email})'s permission is not registered to this ${this.ID_COLUMN_NAME}.`
				});
			}

			// if only a user is registered, cannot delete user. at least a user needs to be registered
			const filtered = permissions.filter((p) => p.user_email !== user_email);
			if (filtered.length === 0) {
				error(403, {
					message: `The user permission must have at least a user to be registered. You cannot delete this user's permission.`
				});
			}
		}

		const query = {
			text: `
            DELETE FROM geohub.${this.TABLE_NAME}
            WHERE ${this.ID_COLUMN_NAME}=$1 AND user_email =$2
            `,
			values: [this.id, user_email]
		};
		try {
			await client.query(query);
		} catch (err) {
			client.query('ROLLBACK');
			error(500, err);
		}
	};
}
