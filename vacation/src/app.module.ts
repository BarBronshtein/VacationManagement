/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { VacationRequestsModule } from './vacation-request/vacation-request.module';
import { createTypeOrmOptions } from './database/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => createTypeOrmOptions(),
    }),
    AuthModule,
    VacationRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
