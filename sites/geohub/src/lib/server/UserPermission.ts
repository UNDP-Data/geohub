import { Permission } from '$lib/config/AppConfig';
import { error } from '@sveltejs/kit';
import { isSuperuser } from './helpers';
import { db, type TransactionSchema } from './db';
import { sql } from 'drizzle-orm';

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
	 * @returns 1: READ, 2: Write, 3: Owner, undefined: no permission registered
	 */
	public getBySignedUser = async () => {
		return await this.getByUser(this.signed_user);
	};

	/**
	 * get permission for target user
	 * @param user_email target user_email address
	 * @returns 1: READ, 2: Write, 3: Owner, undefined: no permission registered
	 */
	public getByUser = async (user_email: string) => {
		const res = await db.execute(
			sql.raw(`
			SELECT permission 
			FROM geohub.${this.TABLE_NAME} 
			WHERE ${this.ID_COLUMN_NAME}='${this.id}'
			and 
			user_email = '${user_email}'
			`)
		);

		if (res.length === 0) {
			return undefined;
		}
		const permission = res[0];
		return permission.permission;
	};

	/**
	 * Get all permission info for a dataset
	 * @returns DatasetPermission[]
	 */
	public getAll = async (tx?: TransactionSchema) => {
		const res = await (tx ?? db).execute(
			sql.raw(`
			SELECT ${this.ID_COLUMN_NAME}, user_email, permission, createdat, updatedat 
            FROM geohub.${this.TABLE_NAME}
            WHERE ${this.ID_COLUMN_NAME}='${this.id}'
			`)
		);

		return res;
	};

	private upsert = async (user_permission: { [key: string]: string }, tx?: TransactionSchema) => {
		const now = new Date().toISOString();
		if (!user_permission.createdat) {
			user_permission.createdat = now;
		}
		if (!user_permission.updatedat) {
			user_permission.updatedat = now;
		}

		await (tx ?? db).execute(
			sql.raw(`
			INSERT INTO geohub.${this.TABLE_NAME} (
			  ${this.ID_COLUMN_NAME},
              user_email,
              permission,
			  createdat
			) 
			values (
			  '${user_permission[this.ID_COLUMN_NAME]}', 
			  '${user_permission.user_email}', 
			  ${user_permission.permission}, 
			  '${user_permission.createdat}'::timestamptz
			) 
			ON CONFLICT (${this.ID_COLUMN_NAME}, user_email)
			DO
			UPDATE
			 SET
			  permission=${user_permission.permission}, 
			  updatedat='${user_permission.updatedat}'::timestamptz
		`)
		);
	};

	/**
	 * Register user permission
	 * @param user_permission user_permission info
	 */
	public register = async (user_permission: { [key: string]: string }, tx?: TransactionSchema) => {
		const is_superuser = await isSuperuser(this.signed_user);
		const permissions = await this.getAll();
		if (!is_superuser) {
			const signedUserPermission = await this.getBySignedUser();

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

		await this.upsert(user_permission, tx);
	};

	/**
	 * Update user permission
	 * @param user_permission user_permission info
	 */
	public update = async (user_permission: { [key: string]: string }, tx?: TransactionSchema) => {
		const is_superuser = await isSuperuser(this.signed_user);
		if (!is_superuser) {
			// cannot delete signed in user themselves
			if (this.signed_user === user_permission.user_email) {
				error(403, { message: 'You cannot update your own permission' });
			}

			// only users with owner/write/read permission can update.
			const signedUserPermission = await this.getBySignedUser();
			if (!(signedUserPermission && signedUserPermission >= Permission.READ)) {
				error(403, { message: `You have no permission to register this user's permission.` });
			}

			// users cannot update permission which is higher than their own permission to a user.
			if (signedUserPermission < user_permission.permission) {
				error(403, { message: `You have no permission to register this user's permission.` });
			}
		}

		const permissions = await this.getAll();
		if (permissions.length > 0) {
			// if target user is not registered to the table
			if (!permissions.find((p) => p.user_email === user_permission.user_email)) {
				error(404, {
					message: `This user (${user_permission.user_email})'s permission is not registered for the dataset`
				});
			}
		}

		await this.upsert(user_permission, tx);
	};

	/**
	 * Delete user permission
	 * @param user_email user email address to be deleted
	 */
	public delete = async (user_email: string, tx?: TransactionSchema) => {
		const is_superuser = await isSuperuser(this.signed_user);
		if (!is_superuser) {
			// cannot delete signed in user themselves
			if (this.signed_user === user_email) {
				error(403, { message: 'You cannot delete your own permission' });
			}

			// only users with owner/write/read permission can delete.
			const permission = await this.getBySignedUser();
			if (!(permission && permission >= Permission.READ)) {
				error(403, { message: `You have no permission to delete this user's permission.` });
			}

			// users users cannot delete permission which is higher than their own permission to a user.
			const targetPermission = await this.getByUser(user_email);
			if (permission < Permission.OWNER && targetPermission === Permission.OWNER) {
				error(403, { message: `You have no permission to delete this user's permission.` });
			}
		}

		const permissions = await this.getAll(tx);
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

		await (tx ?? db).execute(
			sql.raw(`
			DELETE FROM geohub.${this.TABLE_NAME}
            WHERE ${this.ID_COLUMN_NAME}='${this.id}' AND user_email='${user_email}'
			`)
		);
	};
}
