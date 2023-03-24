import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersSubscriber } from './subscribers/users.subscriber';
import { UserActivationHashEntity } from './entities/user-activation-hash.entity';
import { UserActivationHashService } from './services/user-activation-hash.service';
import { MailModule } from '../mail';
import { AppConfiguration } from '../config';
import { CONFIGURATION } from '../configuration/configuration.module';
import { UserActivationHashSubscriber } from './subscribers/user-activation-hash.subscriber';
import { PasswordResetHashService } from './services/password-reset-hash.service';
import { PasswordResetService } from './services/password-reset.service';
import { AnnotationsModule } from '../annotations/annotations.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserActivationHashEntity]),
    forwardRef(() => AuthModule),
    MailModule.registerAsync({
      useFactory: (cfg: AppConfiguration) => ({
        template: {
          preview: cfg.mail.preview,
          send: cfg.mail.send,
          templateExtension: 'hbs',
        },
        transport: {
          transport: {
            host: cfg.mail.smtp.host,
            port: cfg.mail.smtp.port,
            secure: cfg.mail.smtp.secure,
            ...(cfg.mail.smtp.auth.user &&
              cfg.mail.smtp.auth.pass && {
                auth: {
                  user: cfg.mail.smtp.auth.user,
                  pass: cfg.mail.smtp.auth.pass,
                },
              }),
            tls: {
              // do not fail on invalid certs
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: cfg.mail.defaults.from,
          },
        },
      }),
      inject: [CONFIGURATION],
    }),
    AnnotationsModule,
    forwardRef(() => VideosModule),
  ],
  controllers: [UserController],
  providers: [
    UsersService,
    UsersSubscriber,
    UserActivationHashService,
    UserActivationHashSubscriber,
    PasswordResetHashService,
    PasswordResetService,
  ],
  exports: [UsersService, UserActivationHashService, PasswordResetHashService],
})
export class UsersModule {}
