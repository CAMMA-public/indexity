import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { passwordHash } from '../helpers/user.helpers';
import { CONFIGURATION } from '../../configuration/configuration.module';
import { AppConfiguration } from '../../config';
import { InjectConnection } from '@nestjs/typeorm';
import { UserActivationHashService } from '../services/user-activation-hash.service';
import { AnnotationsService } from '../../annotations/services/annotations.service';
import { UsersService } from '../services/users.service';
import { USER_ROLE } from '../models/user-roles';
import { AnnotationLabelGroupsService } from '../../annotations/services/annotation-label-groups.service';
import { VideosService } from '../../videos/services/videos.service';
import { VideoGroupsService } from '../../videos/services/video-groups.service';
import { PasswordResetHashService } from '../services/password-reset-hash.service';
import { ChunkedVideosService } from '../../videos/services/chunked-videos.service';

@Injectable()
export class UsersSubscriber implements EntitySubscriberInterface {
  constructor(
    @Inject(CONFIGURATION) private readonly cfg: AppConfiguration,
    @InjectConnection() private readonly connection: Connection,
    private readonly userActivationHashService: UserActivationHashService,
    private readonly annotationsService: AnnotationsService,
    private readonly usersService: UsersService,
    private readonly annotationLabelGroupsService: AnnotationLabelGroupsService,
    private readonly videosService: VideosService,
    private readonly chunkedVideosService: ChunkedVideosService,
    private readonly videoGroupsService: VideoGroupsService,
    private readonly passwordResetHashService: PasswordResetHashService,
    @Optional() private readonly logger: Logger = new Logger('UsersSubscriber'),
  ) {
    connection.subscribers.push(this);
  }

  listenTo(): Function {
    return UserEntity;
  }

  beforeInsert(event: InsertEvent<UserEntity>): void {
    event.entity.password = passwordHash(event.entity.password, this.cfg.salt);
  }

  async afterInsert(event: InsertEvent<UserEntity>): Promise<void> {
    const { entity: user, manager } = event;
    await this.userActivationHashService.createOne(
      {
        user,
        hash: this.userActivationHashService.generateHash(),
      },
      { manager },
    );
  }

  async beforeRemove(event: RemoveEvent<UserEntity>): Promise<any> {
    if (event.entity.roles.includes(USER_ROLE.INTERNAL)) {
      throw new HttpException(
        'Cannot delete user with INTERNAL role',
        HttpStatus.BAD_REQUEST,
      );
    }
    const ghostUser = await this.usersService
      .getOne({
        where: { email: this.cfg.defaultUsers.ghost.email },
      })
      .catch(err => {
        throw new HttpException(
          'Ghost user not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    this.logger.verbose(`Handle user (${event.entity.id}) suppression`);
    const findOptions = { where: { userId: event.entity.id } };

    // move data to ghost user

    const annotations = await this.annotationsService.getMany(findOptions);
    await this.annotationsService.saveAnnotationsToUser(annotations, ghostUser);

    const labelGroups = await this.annotationLabelGroupsService.getMany(
      findOptions,
    );
    await this.annotationLabelGroupsService.saveLabelGroupsToUser(
      labelGroups,
      ghostUser,
    );

    const videoGroups = await this.videoGroupsService.getMany(findOptions);
    await this.videoGroupsService.saveVideoGroupsToUser(videoGroups, ghostUser);

    const videos = await this.videosService.getMany(findOptions);
    await this.videosService.saveVideosToUser(videos, ghostUser);

    const videoChunks = await this.chunkedVideosService.getMany(findOptions);
    await this.chunkedVideosService.saveVideoChunksToUser(
      videoChunks,
      ghostUser,
    );

    // remove authentication data
    const activationHashes = await this.userActivationHashService.getMany(
      findOptions,
    );
    await this.userActivationHashService.deleteMany(activationHashes);

    const passwordResetHashes = await this.passwordResetHashService.getMany(
      findOptions,
    );
    await this.passwordResetHashService.deleteMany(passwordResetHashes);
  }
}
