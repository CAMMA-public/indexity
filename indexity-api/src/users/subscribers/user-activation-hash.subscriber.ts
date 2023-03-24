import { Connection, EntitySubscriberInterface } from 'typeorm';
import { UserActivationHashEntity } from '../entities/user-activation-hash.entity';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { AppConfiguration } from '../../config';
import { InjectConnection } from '@nestjs/typeorm';
import { Configuration } from '../../common/decorators';
import { UsersService } from '../services/users.service';

@Injectable()
export class UserActivationHashSubscriber
  implements EntitySubscriberInterface<UserActivationHashEntity> {
  constructor(
    @Configuration() private readonly cfg: AppConfiguration,
    @InjectConnection() private readonly connection: Connection,
    private readonly usersService: UsersService,
    @Optional()
    private readonly logger: Logger = new Logger(
      UserActivationHashSubscriber.name,
    ),
  ) {
    connection.subscribers.push(this);
  }

  listenTo(): Function {
    return UserActivationHashEntity;
  }

  // TODO: reactivate with mailchimp

  // async afterInsert(
  //   event: InsertEvent<UserActivationHashEntity>,
  // ): Promise<void> {
  //   return this.usersService.sendActivationEmail(event.entity.user, false, {
  //     manager: event.manager,
  //   });
  // }
}
