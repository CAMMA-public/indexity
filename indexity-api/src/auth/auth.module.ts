import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './services/jwt.strategy';
import { CONFIGURATION } from '../configuration/configuration.module';
import { AppConfiguration } from '../config';
import { UserRolesGuard } from './guards/user-roles.guard';
import { RedisModule } from 'nestjs-redis';
import { AccessTokensService } from './services/access-tokens.service';
import { RefreshTokensService } from './services/refresh-tokens.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', property: 'user' }),
    JwtModule.registerAsync({
      useFactory: (cfg: AppConfiguration) => ({
        secret: cfg.auth.secret,
      }),
      inject: [CONFIGURATION],
    }),
    forwardRef(() => UsersModule),
    RedisModule.forRootAsync({
      useFactory: (cfg: AppConfiguration) => ({
        host: cfg.auth.redisHost,
        port: cfg.auth.redisPort,
        db: cfg.auth.redisDb,
      }),
      inject: [CONFIGURATION],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserRolesGuard,
    AccessTokensService,
    RefreshTokensService,
  ],
  exports: [AuthService, UserRolesGuard],
})
export class AuthModule {}
