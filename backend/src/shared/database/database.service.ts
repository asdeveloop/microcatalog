import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { DatabaseConfig } from '../../config/database.config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;
  public db!: NodePgDatabase<typeof schema>;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const dbConfig = this.configService.get<DatabaseConfig>('database');

    if (!dbConfig) {
      throw new Error('Database configuration not found');
    }

    const poolConfig = {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      max: this.configService.get<number>('DB_POOL_SIZE', 20),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(poolConfig);

    this.pool.on('error', (err: Error) => {
      this.logger.error('Unexpected database error', err.stack);
    });

    this.db = drizzle(this.pool, { schema, logger: true });

    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error(
        'Failed to connect to database',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.log('Database connection closed');
  }

  getDb(): NodePgDatabase<typeof schema> {
    return this.db;
  }
}
