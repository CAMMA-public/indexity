import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromVideos from '../index';
import {
  loadVideoStat,
  loadVideoStats,
} from '@app/annotations/modules/videos/store/video-stats/video-stats.actions';
import { Observable } from 'rxjs';
import { VideoStats } from '@app/annotations/modules/videos/models/video.model';
import { Dictionary } from '@ngrx/entity';
import { VideoGroup } from '@app/annotations/models/video-group.model';

@Injectable()
export class VideoStatsStoreFacade {
  videoStats$: Observable<VideoStats[]> = this.store.pipe(
    select(fromVideos.getAllVideoStats),
  );

  videoStatsGroupsMap$: Observable<Dictionary<VideoGroup>> = this.store.pipe(
    select(fromVideos.getVideoStatsGroupsEntities),
  );

  videoGroups$: Observable<VideoGroup[]> = this.store.pipe(
    select(fromVideos.getAllVideoStatsGroups),
  );

  videoStatsMap$: Observable<{
    [videoId: number]: VideoStats;
  }> = this.store.pipe(select(fromVideos.getVideoStatsEntities));

  totalVideoStats$ = this.store.pipe(select(fromVideos.getTotalVideoStats));

  constructor(private store: Store<fromVideos.State>) {}

  loadVideoStats(ids: number[]): void {
    if (ids.length > 0) {
      this.store.dispatch(loadVideoStats({ payload: ids }));
    } else {
      console.warn("loadVideoStats can't execute, ids array is empty");
    }
  }

  loadStatsForVideo(id: number): void {
    this.store.dispatch(loadVideoStat({ payload: id }));
  }

  getStatsByVideoId(id: number): Observable<VideoStats> {
    return this.store.pipe(select(fromVideos.getStatsByVideoId(id)));
  }

  getVideoStatsGroups(ids: number[]): Observable<VideoGroup[]> {
    return this.store.pipe(select(fromVideos.getVideoStatsGroupsByIds(ids)));
  }
}
