import {
  Module,
  ClassSerializerInterceptor,
  NestModule,
  MiddlewareConsumer,
  OnModuleInit,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosModule } from './videos/videos.module';
import { UsersModule } from './users/users.module';
import { AnnotationsModule } from './annotations/annotations.module';
import { AppConfiguration, config } from './config';
import {
  CONFIGURATION,
  ConfigurationModule,
} from './configuration/configuration.module';
import { AdminModule } from './admin/admin.module';
import { StatsModule } from './stats/stats.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StructureTrackerModule } from './structure-tracker/structure-tracker.module';
import { VersionController } from './version/version.controller';
import { MaintenanceSettingMiddleware } from './common/middlewares/settings.middleware';
import { UsersService } from './users/services/users.service';
import { USER_ROLE } from './users/models/user-roles';
import { UserEntity } from './users/entities/user.entity';
import { Configuration } from './common/decorators';

@Module({
  imports: [
    ConfigurationModule.forRoot(config),
    TypeOrmModule.forRootAsync({
      useFactory: (cfg: AppConfiguration) => cfg.database,
      inject: [CONFIGURATION],
    }),
    VideosModule,
    UsersModule,
    AdminModule,
    AnnotationsModule,
    StatsModule,
    StructureTrackerModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  controllers: [VersionController],
})
export class AppModule implements OnModuleInit, NestModule {
  constructor(
    private readonly usersService: UsersService,
    @Configuration() private readonly cfg: AppConfiguration,
  ) {}
  configure(consumer: MiddlewareConsumer): any {
    return consumer.apply(MaintenanceSettingMiddleware).forRoutes('*');
  }
  async onModuleInit(): Promise<void> {
    // create default users
    await Promise.all(
      Object.keys(this.cfg.defaultUsers).map(async username => {
        const userCfg = this.cfg.defaultUsers[username];
        const newUser: Partial<UserEntity> = {
          name: userCfg.name,
          email: userCfg.email,
          password: userCfg.password,
          roles: [USER_ROLE.ANNOTATOR, USER_ROLE.INTERNAL],
          isActivated: true,
        };
        await this.usersService.findOrCreate(userCfg.email, newUser);
      }),
    );
  }
}
