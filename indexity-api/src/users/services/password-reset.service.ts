import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { PasswordResetHashService } from './password-reset-hash.service';
import { UsersService } from './users.service';
import { Configuration } from '../../common/decorators';
import { AppConfiguration } from '../../config';
import { PasswordResetHashEntity } from '../entities/password-reset-hash.entity';
import { passwordHash } from '../helpers/user.helpers';
import { join } from 'path';
import { InjectMailService, MailService } from '../../mail';
import { format } from 'url';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly resetHashService: PasswordResetHashService,
    private readonly usersService: UsersService,
    @InjectMailService() private readonly mailService: MailService,
    @Configuration() private readonly configuration: AppConfiguration,
  ) {}

  async requestPasswordReset(user: UserEntity): Promise<string> {
    // Create or update the password reset hash
    const resetHash = await this.resetHashService.updateOne({
      user,
      userId: user.id,
      hash: this.resetHashService.generateHash(),
    });
    await this.mailService.sendTemplate({
      template: join(__dirname, '..', 'mail-templates', 'password-reset'),
      locals: {
        name: user.name,
        link: format({
          protocol: this.configuration.ui.protocol,
          hostname: this.configuration.ui.hostname,
          port: this.configuration.ui.port,
          pathname: '/users/password-reset',
          query: {
            hash: resetHash.hash,
          },
        }),
      },
      message: {
        to: user.email,
      },
    });
    // Return the generated hash
    return resetHash.hash;
  }

  async performPasswordReset(
    resetHash: PasswordResetHashEntity,
    password: string,
  ): Promise<void> {
    const { user } = resetHash;
    // Hash the new password
    user.password = passwordHash(password, this.configuration.salt);
    // Update the user password
    await this.usersService.updateOne(user);
    // Delete the PasswordResetHashEntity so it can no longer be used
    await this.resetHashService.deleteOne(resetHash);
  }
}
