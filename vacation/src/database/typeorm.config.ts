import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity as User } from 'src/entities/user.entity';
import { OtpCodeEntity as OtpCode } from 'src/entities/otp-code.entity';
import { VacationRequestEntity as VacationRequest } from 'src/entities/vacation-request.entity';

const entities = [User, OtpCode, VacationRequest];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }

  return value;
}

export async function createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
  if (process.env.DB_TYPE === 'sqljs') {
    const initSqlJs = (await import('sql.js')).default;
    const sqlJsDriver = await initSqlJs({
      locateFile: (file: string) => require.resolve(`sql.js/dist/${file}`),
    });

    return {
      type: 'sqljs',
      driver: sqlJsDriver,
      autoSave: true,
      synchronize: false,
      retryAttempts: 3,
      retryDelay: 2,
      entities,
    };
  }

  return {
    type: 'postgres',
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 5432),
    username: requireEnv('DB_USERNAME'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_DATABASE'),
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    retryAttempts: 3,
    retryDelay: 2,
    autoLoadEntities: true,
    entities,
  };
}
