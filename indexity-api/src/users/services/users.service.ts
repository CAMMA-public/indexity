import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isUndefined } from 'lodash';
import { EntityManager, Repository } from 'typeorm';
import { ServiceOptions } from '../../common/interfaces';
import { AppConfiguration } from '../../config';
import { CONFIGURATION } from '../../configuration/configuration.module';
import { UserEntity } from '../entities/user.entity';
import { passwordHash } from '../helpers/user.helpers';
import { Credentials } from '../models/user-credentials';
import { GenericCRUDService } from '../../common/services';
import { join } from 'path';
import { format } from 'url';
import { UserActivationHashService } from './user-activation-hash.service';
import { InjectMailService, MailService } from '../../mail';
import { PasswordResetHashEntity } from '../entities/password-reset-hash.entity';

@Injectable()
export class UsersService extends GenericCRUDService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly repository: Repository<UserEntity>,
    @Inject(CONFIGURATION) private readonly cfg: AppConfiguration,
    @InjectEntityManager() manager: EntityManager,
    private readonly activationHashService: UserActivationHashService,
    @InjectMailService() private readonly mail: MailService,
  ) {
    super(manager);
  }

  protected get target(): Type<UserEntity> {
    return UserEntity;
  }

  async login(credentials: Credentials): Promise<UserEntity> {
    const user = await this.getOne({
      where: {
        email: credentials.email,
        password: passwordHash(credentials.password, this.cfg.salt),
      },
    });
    if (isUndefined(user)) {
      throw new HttpException(
        'Email or password incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  async resetPassword(user: Partial<UserEntity>): Promise<UserEntity> {
    const userEntity = await this.getOne({
      where: { email: user.email },
    });
    if (isUndefined(userEntity)) {
      throw new NotFoundException('User not found');
    }
    userEntity.password = passwordHash(user.password, this.cfg.salt);
    return await this.repository.save(userEntity);
  }

  async enable(userId: number): Promise<UserEntity> {
    const user = await this.getOne(userId);
    user.deletedAt = null;
    user.isActivated = true;
    return user.save();
  }

  async disable(userId: number): Promise<UserEntity> {
    const user = await this.getOne(userId);
    user.deletedAt = new Date();
    user.isActivated = false;
    return user.save();
  }

  async sendActivationEmail(
    user: UserEntity,
    forceSend = false,
    serviceOptions?: ServiceOptions,
  ): Promise<void> {
    const { id: userId, name, email, isActivated } = user;
    if (isActivated && !forceSend) {
      // TODO
      // - Implement a UserAlreadyActivedError class
      // - Throw an instance of this kind of error
      throw new Error(`This user is already activated. (${userId})`);
    }
    const { hash } = await this.activationHashService.getOne(
      {
        where: { userId },
      },
      serviceOptions,
    );
    const { protocol, hostname, port } = this.cfg.ui;
    this.mail
      .sendTemplate({
        template: join(__dirname, '..', 'mail-templates', 'user-activation'),
        locals: {
          name,
          link: format({
            protocol,
            hostname,
            port,
            pathname: '/users/activate',
            query: {
              hash,
            },
          }),
        },
        message: {
          to: email,
        },
      })
      .catch((err: Error) => {
        this.logger.error(
          `Failed to send the activation email to ${email}`,
          err.stack,
        );
      });
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.getOne({
        email,
      });
      return Boolean(user);
    } catch (e) {
      return false;
    }
  }

  async findOrCreate(
    email: string,
    newUser: Partial<UserEntity>,
  ): Promise<UserEntity> {
    try {
      return await this.getOne({ where: { email } });
    } catch (err) {
      if (err.status === 404) {
        return this.createOne(newUser);
      } else {
        throw err;
      }
    }
  }

  async sendPasswordResetEmail(
    user: UserEntity,
    resetHash: PasswordResetHashEntity,
  ): Promise<void> {
    const { name, email: to } = user;
    const { hash } = resetHash;
    await this.mail.sendTemplate({
      template: join(__dirname, '..', 'mail-templates', 'password-reset'),
      locals: {
        name,
        link: format({
          ...this.cfg.ui,
          pathname: '/users/password-reset',
          query: { hash },
        }),
      },
      message: { to },
    });
  }
}
