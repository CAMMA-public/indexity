import { Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';

import { AnnotationsStoreFacade } from '@app/annotations-store/facades/annotations.store-facade';
import { VideoPlayerStoreFacade } from '@app/videos/store/video-player/video-player.store-facade';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { updateTmpAnnotation } from '@app/annotations-store/actions/annotation.actions';
import { SvgStoreFacade } from '@app/annotations-store/facades/svg.store-facade';

@Injectable()
export class VideoPlayerEffects {
  updateTmpAnnotation$ = createEffect(() =>
    this.videoPlayerFacade.currentTime$.pipe(
      withLatestFrom(
        this.annotationsFacade.tmpAnnotation$,
        this.svgStoreFacade.mode$,
        this.videoPlayerFacade.isPlaying$,
      ),
      filter(
        ([_, __, mode, isPlaying]) =>
          !isPlaying && !['edit', 'draw'].includes(mode.name),
      ),
      filter(([_, tmpAnnotation]) => !!tmpAnnotation),
      map(([currentTimestamp, tmpAnnotation]) =>
        updateTmpAnnotation({
          payload: {
            duration:
              currentTimestamp >= tmpAnnotation.timestamp
                ? Math.round(currentTimestamp - tmpAnnotation.timestamp)
                : Math.round(1000 / 30),
            isOneShot: currentTimestamp <= tmpAnnotation.timestamp,
          },
        }),
      ),
    ),
  );

  constructor(
    private annotationsFacade: AnnotationsStoreFacade,
    private videoPlayerFacade: VideoPlayerStoreFacade,
    private svgStoreFacade: SvgStoreFacade,
  ) {}
}
