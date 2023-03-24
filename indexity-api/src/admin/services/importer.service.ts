import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { Connection, EntityManager, Repository } from 'typeorm';
import { VideoEntity } from '../../videos/entities/video.entity';
import { AnnotationEntity } from '../../annotations/entities/annotation.entity';
import { AnnotationLabelEntity } from '../../annotations/entities/annotation-label.entity';
import { AppConfiguration } from '../../config';
import { CONFIGURATION } from '../../configuration/configuration.module';
import { isObject } from 'lodash';

@Injectable()
export class ImporterService {
  private readonly logger: Logger = new Logger('Importer', true);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(CONFIGURATION) private readonly cfg: AppConfiguration,
  ) {}

  async import(videos: any[], users: any[], annotations: any[]): Promise<void> {
    const userIds = new Map<number, number>();
    const videoIds = new Map<number, number>();
    await this.connection.transaction(async (em: EntityManager) => {
      const userRepo = em.getRepository(UserEntity);
      const videoRepo = em.getRepository(VideoEntity);
      const annotationRepo = em.getRepository(AnnotationEntity);
      for await (const oldUser of ImporterService.updateUsers(users)) {
        const idPair = await ImporterService.importUser(oldUser, userRepo);
        userIds.set(idPair[0], idPair[1]);
        this.logger.verbose(
          `Imported user ${oldUser.email} with id ${idPair[1]}`,
        );
      }
      for await (const oldVideo of ImporterService.updateVideos(
        videos,
        this.cfg.staticFiles.videos.url,
      )) {
        const idPair = await ImporterService.importVideo(oldVideo, videoRepo);
        videoIds.set(idPair[0], idPair[1]);
        this.logger.verbose(
          `Imported video ${oldVideo.name} with id ${idPair[1]}`,
        );
      }
      for await (const oldAnnotation of ImporterService.updateAnnotations(
        annotations,
      )) {
        oldAnnotation.userId = userIds.get(oldAnnotation.userId);
        oldAnnotation.videoId = videoIds.get(oldAnnotation.videoId);
        await ImporterService.importAnnotation(oldAnnotation, annotationRepo);
        this.logger.verbose(
          `Imported annotation for video ${oldAnnotation.videoId}`,
        );
      }
    });
    this.logger.verbose(
      `Successfully imported ${users.length} users, ${videos.length} videos and ${annotations.length} annotations.`,
    );
  }

  static async importVideo(
    video: VideoEntity,
    repo: Repository<VideoEntity>,
  ): Promise<[number, number]> {
    const existing = await repo.findOne({ name: video.name });
    const { id: oldId } = video;
    if (isObject(existing)) {
      return [oldId, existing.id];
    } else {
      delete video.id;
      const saved = await repo.save(video);
      return [oldId, saved.id];
    }
  }

  static updateVideos(videos: any, dir: string): VideoEntity[] {
    return videos.map(v => {
      const e = new VideoEntity();
      e.id = v.id;
      e.url = `${dir}/${v.url.split('/').pop()}`;
      e.description = v.description;
      e.name = v.name;
      e.thumbnailUrl = v.thumbnail_url;
      e.userId = v.userId;
      return e;
    });
  }

  static async importUser(
    user: UserEntity,
    repo: Repository<UserEntity>,
  ): Promise<[number, number]> {
    const existing = await repo.findOne({ email: user.email });
    const { id: oldId } = user;
    if (isObject(existing)) {
      return [oldId, existing.id];
    } else {
      delete user.id;
      const saved = await repo.save(user);
      return [oldId, saved.id];
    }
  }

  static updateUsers(users: any): UserEntity[] {
    return users.map(u => {
      const e = new UserEntity();
      e.id = u.id;
      e.name = u.name;
      e.email = u.email;
      e.password = u.password;
      e.roles = u.roles;
      e.ipAddress = u.ipAddress;
      e.createdAt = u.createdAt;
      e.updatedAt = u.updatedAt;
      e.deletedAt = u.deletedAt;
      return e;
    });
  }

  static async importAnnotation(
    annotation: AnnotationEntity,
    aRepo: Repository<AnnotationEntity>,
  ): Promise<void> {
    delete annotation.id;
    await aRepo.save(annotation);
  }

  static updateAnnotations(annotations: any[]): AnnotationEntity[] {
    return annotations.map(a => {
      const e = new AnnotationEntity();
      const color = a.shape.color + '';
      delete a.shape.color;
      e.id = a.id;
      e.label = new AnnotationLabelEntity();
      e.label.color = color;
      e.label.name = a.description;
      e.videoId = a.videoId;
      e.userId = a.userId;
      e.duration = a.duration;
      e.category = a.category;
      e.shape = a.shape;
      e.description = a.description;
      e.timestamp = a.timestamp;
      e.ipAdress = a.ipAddress;
      return e;
    });
  }
}
