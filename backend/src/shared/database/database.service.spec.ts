import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { DatabaseModule } from './database.module';
import databaseConfig from '../../config/database.config';
import { envValidationSchema } from '../../config/env.validation';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          load: [databaseConfig],
          validationSchema: envValidationSchema,
          ignoreEnvFile: true,
          ignoreEnvVars: false,
        }),
        DatabaseModule,
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    if (service) {
      // Drizzle does not expose a direct disconnect; pool closes on app shutdown
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose a drizzle client instance', () => {
    const db = service.getDb();
    expect(db).toBeDefined();
    expect(typeof db.select).toBe('function');
    expect(typeof db.insert).toBe('function');
  });

  it('should execute a raw health-check query', async () => {
    const result = await service.getDb().execute('SELECT 1 AS alive');
    expect(result).toBeDefined();
  });

  it('should have the schema attached', () => {
    const db = service.getDb();
    // Drizzle query object should be present
    expect(db.query).toBeDefined();
    // users table should be accessible
    expect(db.query.users).toBeDefined();
  });
});
