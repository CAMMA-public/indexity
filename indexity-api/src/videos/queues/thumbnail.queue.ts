import { InjectQueue, Queue, QueueProcess } from 'nest-bull';
import { Job, Queue as BullQueue } from 'bull';
import { ThumbnailGenerationJob } from '../interfaces/thumbnail-generation-job.interface';
import { Logger, Optional } from '@nestjs/common';
import { OriginalVideosService } from '../services/original-videos.service';
import { OriginalVideoEntity } from '../entities/original-video.entity';

enum TASKS {
  THUMBNAIL_GENERATION = 'thumbnail_generation',
  THUMBNAILS_REGENERATION = 'thumbnails_regeneration',
}

@Queue()
export class ThumbnailQueue {
  constructor(
    private readonly videosService: OriginalVideosService,
    @InjectQueue() private readonly queue: BullQueue,
    @Optional() private readonly logger: Logger = new Logger('ThumbnailQueue'),
  ) {}

  scheduleThumbnailGeneration(
    videoId: number,
  ): Promise<Job<ThumbnailGenerationJob>> {
    return this.queue.add(
      TASKS.THUMBNAIL_GENERATION,
      { videoId },
      { attempts: 10, removeOnComplete: true },
    );
  }

  scheduleAllThumbnailsRegeneration(): Promise<Job<null>> {
    return this.queue.add(TASKS.THUMBNAILS_REGENERATION, {
      attempts: 10,
      removeOnComplete: true,
    });
  }

  @QueueProcess({ name: TASKS.THUMBNAIL_GENERATION })
  private async processThumbnailGeneration(
    job: Job<ThumbnailGenerationJob>,
  ): Promise<void> {
    this.logger.verbose(
      `Processing thumbnail generation job (attempt ${job.attemptsMade + 1}/${
        job.opts.attempts
      }) for one video. (id: ${job.data.videoId})`,
    );
    const video = await this.videosService.getOne<OriginalVideoEntity>(
      job.data.videoId,
    );
    await this.videosService.generateThumbnail(video);
    this.logger.verbose(
      `Processed thumbnail generation job for one video. (id: ${job.data.videoId})`,
    );
  }
  @QueueProcess({ name: TASKS.THUMBNAILS_REGENERATION })
  private async processThumbnailsRegeneration(): Promise<void> {
    await this.videosService.regenerateThumbnails();
    this.logger.verbose(`Processed thumbnails regeneration job.`);
  }
}
