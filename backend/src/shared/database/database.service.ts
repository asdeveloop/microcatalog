// path: backend/src/shared/database/database.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const dbConfig = {
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get<string>('DB_USER', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_NAME', 'app_db'),
      max: this.configService.get<number>('DB_POOL_SIZE', 20),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(dbConfig);

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected database error', err);
    });

    this.db = drizzle(this.pool, { schema, logger: true });

    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
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
