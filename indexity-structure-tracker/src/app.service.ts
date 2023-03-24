import {
  Injectable,
  HttpService,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AnnotationDto } from './dtos/annotation-dto';
import { spawn } from 'child_process';
import { cloneDeep } from 'lodash';
import { config } from './config';
import { UserService } from './user/user.service';
import {
  TRACKING_FAILURE,
  TRACKING_SUCCESS,
  TrackerStatusMsgDto,
} from './dtos/tracker-status-msg-dto';

export const MSG_END_ANNOTATION = 'EOA';
export const TIME_BETWEEN_UPLOADS = 5000;

export interface PythonAnnotation {
  positions: {
    [timestamp: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  duration: number;
  timestamp: number;
}

export interface AnnotationsData {
  originalAnnotation: AnnotationDto;
  currentAnnotation: string;
  annotations: PythonAnnotation[];
  lastUploadTimestamp: number;
  hasError: boolean;
}

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger('AppService', true);

  constructor(
    private readonly http: HttpService,
    private readonly userService: UserService,
  ) {}

  buildAnnotations(
    originalAnnotation: AnnotationDto,
    trackerAnnotations: PythonAnnotation[],
  ): AnnotationDto[] {
    return trackerAnnotations.map((pythonAnnotation: PythonAnnotation) => {
      const annotation = cloneDeep(originalAnnotation);

      delete annotation.id;
      delete annotation.video;
      if (annotation.label === null) {
        delete annotation.label;
      }

      annotation.shape = { positions: pythonAnnotation.positions };
      annotation.duration = pythonAnnotation.duration;
      annotation.timestamp = pythonAnnotation.timestamp;

      return annotation;
    });
  }

  onTrackerData(
    output: string,
    currentState: AnnotationsData,
  ): AnnotationsData {
    const state = currentState;

    const chunk = output.replace(/[\n\r]+/g, '');

    if (chunk.slice(-3) === MSG_END_ANNOTATION) {
      state.currentAnnotation += chunk.slice(0, -3);
      try {
        const annotationJSON = JSON.parse(state.currentAnnotation);
        state.annotations.push(annotationJSON);
        state.currentAnnotation = '';
      } catch (err) {
        this.logger.error('Could not parse annotation', err);
      }

      const currentTimestamp = Date.now();
      if (
        currentTimestamp - state.lastUploadTimestamp >=
        TIME_BETWEEN_UPLOADS
      ) {
        const builtAnnotations = this.buildAnnotations(
          state.originalAnnotation,
          state.annotations,
        );
        this.uploadAnnotationBulk(builtAnnotations);
        state.annotations = [];
        state.lastUploadTimestamp = currentTimestamp;
      }
    } else {
      state.currentAnnotation += chunk;
    }

    return state;
  }

  async onTrackerError(
    error: string,
    currentState: AnnotationsData,
  ): Promise<AnnotationsData> {
    const state = currentState;
    state.hasError = true;

    this.logger.error(`Tracking process ended with error: ${error}`);
    await this.sendStatus(
      { status: TRACKING_FAILURE },
      state.originalAnnotation.id,
    );

    return currentState;
  }

  async onTrackerClose(currentState: AnnotationsData): Promise<void> {
    const builtAnnotations = this.buildAnnotations(
      currentState.originalAnnotation,
      currentState.annotations,
    );
    await this.uploadAnnotationBulk(builtAnnotations);
    if (!currentState.hasError) {
      await this.sendStatus(
        { status: TRACKING_SUCCESS },
        currentState.originalAnnotation.id,
      );
    }
  }

  async trackAnnotation(originalAnnotation: AnnotationDto): Promise<void> {
    if (!Object.keys(originalAnnotation).includes('video')) {
      throw new HttpException(
        'No video joined to annotation',
        HttpStatus.BAD_REQUEST,
      );
    }

    const videoPath = config.videosPath + originalAnnotation.video.fileName;
    const encodedAnnotation = Buffer.from(
      JSON.stringify(originalAnnotation),
    ).toString('base64');

    const trackingProc = spawn(
      'python3 ./python/main.py',
      [videoPath, encodedAnnotation],
      { shell: true },
    );
    this.logger.verbose(`Tracking process spawned (${trackingProc.pid})`);

    let state: AnnotationsData = {
      originalAnnotation,
      currentAnnotation: '',
      annotations: [],
      lastUploadTimestamp: Date.now(),
      hasError: false,
    };

    trackingProc.stdout.setEncoding('utf8');
    trackingProc.stdout.on('data', data => {
      state = this.onTrackerData(data, state);
    });

    trackingProc.stderr.on('data', async data => {
      state = await this.onTrackerError(data, state);
    });

    trackingProc.on('close', () => this.onTrackerClose(state));
  }

  async uploadAnnotationBulk(annotations: AnnotationDto[]): Promise<void> {
    if (annotations.length > 0) {
      const token = await this.userService.getToken();

      this.http
        .post(
          `${config.indexityApiUrl}/annotations/bulk`,
          { bulk: annotations },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .toPromise()
        .then(() => {
          this.logger.verbose('Successfully sent new annotations to API');
        })
        .catch(err => {
          this.logger.error(`Cannot send annotations to API: ${err}`);
        });
    }
  }

  async sendStatus(
    msg: TrackerStatusMsgDto,
    annotationId: number,
  ): Promise<void> {
    const token = await this.userService.getToken();

    this.http
      .post(
        `${config.indexityApiUrl}/structure-tracker/status/${annotationId}`,
        msg,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .toPromise()
      .then(() => {
        this.logger.verbose(
          `Status ${msg.status} (annotation ${annotationId}) sent to API`,
        );
      })
      .catch(err => {
        this.logger.error(
          `Cannot send status ${msg.status} (annotation ${annotationId}) to the API: ${err}`,
        );
      });
  }
}
