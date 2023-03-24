import { SettingEntity } from './../../settings/entities/settings.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { VideosSubscriber } from './video.subscriber';
import { getConnectionToken } from '@nestjs/typeorm';
import { Connection, InsertEvent } from 'typeorm';
import { VideosGateway } from '../gateways/videos.gateway';
import { VideosService } from '../services/videos.service';
import { ThumbnailQueue } from '../queues/thumbnail.queue';
import { ScaleQueue } from '../queues/scale.queue';
import { createClassMock } from '../../common/helpers/create-class.mock.helper';
import { CONFIGURATION } from '../../configuration/configuration.module';
import { VideoEntity } from '../entities/video.entity';
import { ScaledVideosService } from '../services/scaled-videos.service';
import { ChunkedVideosService } from '../services/chunked-videos.service';
import { SettingsService } from '../../settings/services/settings.service';
import { NotFoundException } from '@nestjs/common';
import { config as fakeConfig } from '../../config';

// VideosService automatic mock
jest.mock('../services/scaled-videos.service');
// ChunkVideoService automatic mock
jest.mock('../services/chunked-videos.service');
// SettingsService automatic mock
jest.mock('../../settings/services/settings.service');

describe('VideoSubscriber', () => {
  const testingModuleBuilder = Test.createTestingModule({
    providers: [
      VideosSubscriber,
      ScaledVideosService,
      ChunkedVideosService,
      SettingsService,
      {
        provide: getConnectionToken(),
        useValue: createClassMock(Connection, {
          subscribers: [],
        }),
      },
      { provide: VideosGateway, useValue: createClassMock(VideosGateway) },
      { provide: VideosService, useValue: createClassMock(VideosService) },
      { provide: CONFIGURATION, useValue: {} },
      { provide: ThumbnailQueue, useValue: createClassMock(ThumbnailQueue) },
      { provide: ScaleQueue, useValue: createClassMock(ScaleQueue) },
    ],
  });
  let testingModule: TestingModule;
  let subscriber: VideosSubscriber;
  let scaleQueue: ScaleQueue;
  let settings: SettingsService;

  beforeEach(() =>
    testingModuleBuilder.compile().then((m: TestingModule) => {
      testingModule = m;
      subscriber = testingModule.get(VideosSubscriber);
      scaleQueue = testingModule.get(ScaleQueue);
      settings = testingModule.get(SettingsService);
    }),
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be properly injected', () =>
    expect(subscriber).toBeInstanceOf(VideosSubscriber));

  describe('afterInsert', () => {
    it('should schedule the video scaling for original videos', async () => {
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.isOriginal = true;
      fakeVideoEntity.height = 999999;
      const fakeInsertEvent: InsertEvent<VideoEntity> = ({
        entity: fakeVideoEntity,
      } as unknown) as InsertEvent<VideoEntity>;
      jest.spyOn(settings, 'getOne').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      await subscriber.afterInsert(fakeInsertEvent);
      expect(scaleQueue.scheduleVideoScaling).toHaveBeenCalled();
    });
    it(`shouldn't schedule the video scaling for non original videos`, async () => {
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.isOriginal = false;
      fakeVideoEntity.height = 999999;
      const fakeInsertEvent: InsertEvent<VideoEntity> = ({
        entity: fakeVideoEntity,
      } as unknown) as InsertEvent<VideoEntity>;
      await subscriber.afterInsert(fakeInsertEvent);
      expect(scaleQueue.scheduleVideoScaling).not.toHaveBeenCalled();
    });

    it('should use environment "rescale_after_import" setting', async () => {
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.isOriginal = true;
      fakeVideoEntity.height = 999999;
      const fakeInsertEvent: InsertEvent<VideoEntity> = ({
        entity: fakeVideoEntity,
      } as unknown) as InsertEvent<VideoEntity>;
      jest.spyOn(settings, 'getOne').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      fakeConfig.rescaleAfterImport = false;
      await subscriber.afterInsert(fakeInsertEvent);
      expect(scaleQueue.scheduleVideoScaling).not.toHaveBeenCalled();
    });

    it('should use DB "rescale_after_import" setting before environment', async () => {
      const fakeVideoEntity = new VideoEntity();
      fakeVideoEntity.isOriginal = true;
      fakeVideoEntity.height = 999999;
      const fakeInsertEvent: InsertEvent<VideoEntity> = ({
        entity: fakeVideoEntity,
      } as unknown) as InsertEvent<VideoEntity>;
      const fakeSettingEntity = new SettingEntity();
      fakeSettingEntity.value = 'false';
      jest
        .spyOn(settings, 'getOne')
        .mockImplementationOnce(() => Promise.resolve(fakeSettingEntity));
      fakeConfig.rescaleAfterImport = true;
      await subscriber.afterInsert(fakeInsertEvent);
      expect(scaleQueue.scheduleVideoScaling).not.toHaveBeenCalled();
    });
  });
});
