import pkg, { type PoolClient } from 'pg';
const { Pool } = pkg;
import { env } from '$env/dynamic/private';

/**
 * Class to manage database connection
 */
class DatabaseManager {
	private connectionString: string;
	private pool = undefined;
	private client: PoolClient | undefined = undefined;

	/**
	 * Constructor
	 * @param connectionString optional. if not specified, `DATABASE_CONNECTION` variable from process.env will be used
	 */
	constructor(connectionString?: string) {
		this.connectionString = connectionString ?? env.DATABASE_CONNECTION;
	}

	/**
	 * Start database connection
	 * @returns PoolClient object
	 */
	public async start() {
		this.pool = new Pool({ connectionString: this.connectionString });
		this.client = await this.pool.connect();
		return this.client;
	}

	public async end() {
		this.client?.release();
		this.pool?.end();
		this.client = undefined;
		this.pool = undefined;
	}

	/**
	 * Start database connection and also start transaction
	 * @returns PoolClient
	 */
	public async transactionStart() {
		if (!this.client) {
			this.client = await this.start();
		}
		await this.client.query('BEGIN');
		console.info('Transaction started');
		return this.client;
	}

	/**
	 * Rollback transaction
	 */
	public async transactionRollback() {
		await this.client?.query('ROLLBACK');
		console.info('Transaction rollbacked');
	}

	/**
	 * End transaction and also end database connection
	 */
	public async transactionEnd() {
		await this.client?.query('COMMIT');
		console.info('Transaction ended');
		this.end();
	}
}

export default DatabaseManager;
