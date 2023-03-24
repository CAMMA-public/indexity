import { InjectQueue, Process, Queue } from 'nest-bull';
import { Job, Queue as BullQueue } from 'bull';
import { OriginalVideosService } from '../services/original-videos.service';
import { OriginalVideoEntity } from '../entities/original-video.entity';

enum TASKS {
  VIDEO_SCALING = 'video_scaling',
}

export interface VideoScalingJob {
  videoId: number;
  height: number;
  width: number;
}

@Queue()
export class ScaleQueue {
  constructor(
    private readonly videosService: OriginalVideosService,
    @InjectQueue() private readonly queue: BullQueue,
  ) {}

  scheduleVideoScaling(
    videoId: number,
    height: number,
    width?: number,
  ): Promise<Job<VideoScalingJob>> {
    return this.queue.add(
      TASKS.VIDEO_SCALING,
      {
        videoId,
        height,
        width,
      },
      { attempts: 10, removeOnComplete: true },
    );
  }

  @Process({ name: TASKS.VIDEO_SCALING })
  private async processVideoScaling(job: Job<VideoScalingJob>): Promise<void> {
    const { videoId, height, width } = job.data;
    const video = await this.videosService.getOne<OriginalVideoEntity>(videoId);
    await this.videosService.scale(video, height, width);
  }
}
