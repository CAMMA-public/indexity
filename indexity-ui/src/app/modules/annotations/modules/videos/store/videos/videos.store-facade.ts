import { Injectable } from '@angular/core';
import { VideosFilter } from '@app/annotations/models/videos-filter.model';
import { VIDEO_ANNOTATION_STATE } from '@app/models/video-annotation-state';
import { Video } from '@app/videos/models/video.model';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromVideos from '../index';
import {
  addVideoBookmark,
  clearFilter,
  clearVideoList,
  load,
  loadAll,
  loadBatch,
  loadVideoBookmarkBatch,
  loadVideoBookmarks,
  loadVideoBookmarksIds,
  remove,
  removeVideoBookmark,
  searchVideosByAnnotationState,
  searchVideosByLabelName,
  searchVideosByName,
  setCurrentFilter,
  setCurrentVideoId,
  setVideoAnnotationState,
  updateVideo,
} from './videos.actions';
import * as videoQuery from './videos.reducer';

@Injectable()
export class VideosStoreFacade {
  video$ = this.store.pipe(select(fromVideos.getVideo));
  videos$ = this.store.pipe(select(fromVideos.getAllVideos));
  videosTotal$ = this.store.pipe(select(fromVideos.getVideosTotal));
  bookmarkedVideos$ = this.store.pipe(select(fromVideos.getBookmarkedVideos));
  bookmarkedVideosTotal$ = this.store.pipe(
    select(fromVideos.getBookmarkedVideosTotal),
  );
  filter$ = this.store.pipe(select(fromVideos.getVideosFilter));

  getVideo(id: number): Observable<Video> {
    return this.store.pipe(select(fromVideos.getVideoById(id)));
  }

  constructor(private store: Store<videoQuery.State>) {}

  /*
   VIDEOS
   */

  // LOAD

  loadVideo(id: number): Observable<Video> {
    this.store.dispatch(load({ payload: id }));
    return this.getVideo(id);
  }

  // LOAD ALL

  loadAllVideos(): void {
    this.store.dispatch(loadAll({ payload: undefined }));
  }

  // LOAD BATCH

  loadNextBatch(limit?: number): void {
    this.store.dispatch(loadBatch({ limit }));
  }

  // SET

  setCurrentVideoId(id: number): Observable<Video> {
    this.store.dispatch(setCurrentVideoId({ payload: id }));
    if (id) {
      this.loadVideo(id);
    }
    return this.video$;
  }

  setVideoAnnotationState(
    videoId: number,
    state: VIDEO_ANNOTATION_STATE,
  ): void {
    this.store.dispatch(
      setVideoAnnotationState({ payload: { videoId, state } }),
    );
  }

  // UPDATE

  updateVideo(video: Partial<Video>): void {
    this.store.dispatch(updateVideo({ payload: video }));
  }

  // REMOVE

  removeVideo(videoId: number): void {
    this.store.dispatch(remove({ payload: videoId }));
  }

  // CLEAR

  clearVideoList(): void {
    this.store.dispatch(clearVideoList());
  }

  /*
   VIDEOS BOOKMARK
   */

  // LOAD

  loadBookmarkedVideos(): void {
    this.store.dispatch(loadVideoBookmarks());
  }

  loadBookmarkedIds(): void {
    this.store.dispatch(loadVideoBookmarksIds());
  }

  loadNextVideoBookmarkBatch(limit?: number): void {
    this.store.dispatch(loadVideoBookmarkBatch({ payload: limit }));
  }

  // ADD

  addVideoBookmark(videoId: number): void {
    this.store.dispatch(addVideoBookmark({ payload: videoId }));
  }

  // REMOVE

  removeVideoBookmark(videoId: number): void {
    this.store.dispatch(removeVideoBookmark({ payload: videoId }));
  }

  /* ---------------------------------------------------------------------------------------------------------------- */

  /*
   VIDEOS FILTER
   */

  // SET

  setCurrentFilter(filter: VideosFilter): void {
    this.store.dispatch(setCurrentFilter({ payload: filter }));
  }

  // SEARCH

  searchByName(name: string): void {
    this.store.dispatch(searchVideosByName({ payload: name }));
  }

  searchByAnnotationState(annotationState: string): void {
    this.store.dispatch(
      searchVideosByAnnotationState({ payload: annotationState }),
    );
  }

  searchByLabelName(labelName: string): void {
    if (labelName && labelName.length > 0) {
      this.store.dispatch(searchVideosByLabelName({ payload: labelName }));
    }
  }

  // CLEAR

  clearFilter(): void {
    this.store.dispatch(clearFilter());
  }
}
