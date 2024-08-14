import { type PoolClient } from 'pg';
import { error } from '@sveltejs/kit';

/**
 * Class to manage database connection
 */
class DatabaseManager {
	private client: PoolClient | undefined = undefined;

	/**
	 * Constructor
	 * @param connectionString optional. if not specified, `DATABASE_CONNECTION` variable from process.env will be used
	 */
	constructor(poolClient: PoolClient) {
		this.client = poolClient;
	}

	/**
	 * Start database connection
	 * @returns PoolClient object
	 */
	public async start() {
		if (!this.client) {
			error(500, { message: 'Please create pool connection.' });
		}
		return this.client;
	}

	public async end() {
		// this.client?.release();
		// this.client = undefined;
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
