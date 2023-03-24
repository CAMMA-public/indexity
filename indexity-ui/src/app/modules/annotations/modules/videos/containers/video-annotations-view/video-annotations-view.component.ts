import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  filter,
  first,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { uniq } from 'lodash';

import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { AnnotationsTimelinesComponent } from '@app/annotations/modules/videos/components/annotations-timelines/annotations-timelines.component';
import { getFormattedTimestamp } from '@app/annotations/helpers/base.helpers';
import {
  fitInVideo,
  isAt,
  normalizeOneFrameAnnotations,
  updateAnnotationTimestamp,
} from '@app/annotations/helpers/annotations.helper';
import { Annotation } from '@app/annotations/models/annotation.model';

import { VideosStoreFacade } from '@app/annotations/modules/videos/store/videos/videos.store-facade';
import { VideoPlayerStoreFacade } from '@app/annotations/modules/videos/store/video-player/video-player.store-facade';
import { AnnotationsStoreFacade } from '@app/annotations-store/facades/annotations.store-facade';
import { LocalStorageService } from '@app/annotations/services/local-storage.service';
import { InfoMessageService } from '@app/services/info-message.service';
import { SvgStoreFacade } from '@app/annotations-store/facades/svg.store-facade';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { AnnotationLabelsStoreFacade } from '@app/annotation-labels-store/annotation-labels-store-facade.service';
import {
  getLowerPlaybackRate,
  getNextPlaybackRate,
  getUpperPlaybackRate,
} from '@app/annotations/modules/videos/helpers/video.helpers';
import {
  Mode,
  NormalMode,
  DrawingMode,
  EditMode,
  CreationMode,
} from '@app/annotations/modules/videos/models/mode';
import { SvgAnnotationFormDialogComponent } from '@indexity/annotations';
import { AnnotationShape } from '@app/annotations/models/annotation-shape.model';
import { UiFacade } from '@app/main-store/ui/ui.facade';
import { SettingsStoreFacade } from '@app/settings-store/settings.store-facade';
import { MediaPlayerComponent } from '@app/views';
import { User } from '@app/models/user';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { AnnotationLabelGroup } from '@app/annotations/models/annotation-label-group.model';
import { StructureTrackerFacade } from '@app/annotations/store/structure-tracker/structure-tracker.facade';
import { ANNOTATION_MIN_DURATION } from '../../../../../../constants';
import { ToolbarShortcuts } from '@app/videos/models/toolbar-shortcuts.model';

@Component({
  selector: 'app-video-annotations-view',
  templateUrl: './video-annotations-view.component.html',
  styleUrls: ['./video-annotations-view.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoAnnotationsViewComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MediaPlayerComponent, { static: true })
  mediaPlayer: MediaPlayerComponent;
  @ViewChild(AnnotationsTimelinesComponent, { static: true })
  timelines: AnnotationsTimelinesComponent;
  timelineWidth$ = new BehaviorSubject(1);
  timelineCurrentTimeFormat$ = new BehaviorSubject<'standard' | 'seconds'>(
    'standard',
  );
  // video
  videoDuration$ = this.videoPlayerStoreFacade.duration$;

  currentTimestamp = 0;
  videoTime$ = this.videoPlayerStoreFacade.currentTime$.pipe(
    tap((t) => (this.currentTimestamp = t)),
  );

  formattedVideoTime$ = combineLatest([
    this.videoTime$,
    this.timelineCurrentTimeFormat$,
  ]).pipe(map(([ms, format]) => getFormattedTimestamp(ms, format)));

  timeScaleLabel = '';
  videoTime = 0;
  videoDuration = 0;

  annotationMinDuration = ANNOTATION_MIN_DURATION;

  tmpPause = false;

  videoSize$ = this.videoPlayerStoreFacade.size$;
  videoId: number;
  isVideoPlaying$ = this.videoPlayerStoreFacade.isPlaying$;

  video$ = combineLatest([
    this.videosStoreFacade.video$,
    this.usersFacade.currentUserToken$,
  ]).pipe(
    map(([video, token]) => {
      if (video) {
        this.uiFacade.setTitle(video.name);
        return {
          ...video,
          url: `${video.url}?token=${token}`,
        };
      }
      return null;
    }),
  );

  suggestedAnnotationLabelGroup$: Observable<
    AnnotationLabelGroup
  > = this.video$.pipe(
    filter((v) => v && v.groupIds && v.groupIds.length > 0),
    tap((video) => this.videoGroupsFacade.loadGroup(video.groupIds[0])),
    switchMap((video) =>
      this.videoGroupsFacade.getGroupById(video.groupIds[0]),
    ),
    filter((videoGroup) => videoGroup && !!videoGroup.annotationLabelGroupId),
    tap((videoGroup) =>
      this.labelGroupsFacade.loadOne(videoGroup.annotationLabelGroupId),
    ),
    switchMap((videoGroup) =>
      this.labelGroupsFacade.getGroupById(videoGroup.annotationLabelGroupId),
    ),
    filter((lg) => !!lg),
    tap((lg) => (this.suggestedAnnotationLabelGroup = lg)),
  );

  suggestedAnnotationLabelGroup: AnnotationLabelGroup;

  // svg
  mode$: Observable<Mode> = this.svgStoreFacade.mode$.pipe(
    shareReplay(),
    tap((mode) => (this.mode = mode)),
  );
  mode: Mode;
  svgOverlay$ = this.svgStoreFacade.overlay$;
  shape$: Observable<AnnotationShape> = this.svgStoreFacade.shape$.pipe(
    shareReplay(),
  );

  trackedAnnotationLabelNames$ = this.structureTrackerFacade.getTrackedAnnotationLabelNames();
  trackedAnnotationIds$ = this.structureTrackerFacade.getTrackedAnnotationIds();

  // annotations
  annotations$ = this.annotationsStoreFacade.annotations$;
  normalizedAnnotations$ = combineLatest([
    this.annotations$,
    this.videoPlayerStoreFacade.duration$,
    this.timelineWidth$,
  ]).pipe(
    map(([annotations, videoDuration, timelineW]) =>
      normalizeOneFrameAnnotations(annotations, videoDuration, timelineW),
    ),
  );

  // annotations with tracker information
  annotationsWithTrackerInfo$ = this.structureTrackerFacade.getAnnotationsWithTrackerInfo();
  normalizedAnnotationsWithTrackerInfo$ = combineLatest([
    this.annotationsWithTrackerInfo$,
    this.videoPlayerStoreFacade.duration$,
    this.timelineWidth$,
  ]).pipe(
    map(([annotations, videoDuration, timelineW]) =>
      normalizeOneFrameAnnotations(annotations, videoDuration, timelineW),
    ),
  );

  nextEventTimestamp = 0;
  orderedTimestamps$ = this.annotationsStoreFacade.annotations$.pipe(
    map((annotations) => {
      const timestamps = annotations
        .map((annotation) => annotation.timestamp)
        .sort((t1, t2) => t1 - t2);
      return [...new Set(timestamps)];
    }),
  );
  nextEventTimestamp$ = combineLatest([
    this.videoPlayerStoreFacade.currentTime$,
    this.orderedTimestamps$,
  ]).pipe(
    tap(([currentTime, orderedTimestamps]) => {
      if (orderedTimestamps.length === 0) {
        // don't move cursor
        this.nextEventTimestamp = currentTime;
      } else {
        const nextTimestamps = orderedTimestamps.filter(
          (ts) => ts > currentTime,
        );
        if (nextTimestamps.length === 0) {
          // return at the first event in the timelines
          this.nextEventTimestamp = orderedTimestamps[0];
        } else {
          // go to next event
          this.nextEventTimestamp = nextTimestamps[0];
        }
      }
    }),
  );

  // categoryList$ = this.annotationsStoreFacade.categories$;
  annotationToUpdate$: Observable<Annotation> = this.annotationsStoreFacade
    .annotationToUpdate$;
  annotationToUpdate: Annotation;
  tmpNewAnnotation$: Observable<
    Annotation
  > = this.annotationsStoreFacade.tmpAnnotation$.pipe(shareReplay());
  labelsWithTrackerInfo$ = this.structureTrackerFacade.getLabelsWithTrackerInfo();
  labels$ = combineLatest([
    this.labelsWithTrackerInfo$,
    this.tmpNewAnnotation$,
  ]).pipe(
    map(([labels, tmp]) =>
      tmp && tmp.label
        ? [
            ...labels.filter((label) => label.name !== tmp.label.name),
            tmp.label,
          ]
        : labels,
    ),
  );
  searchResults$ = this.annotationLabelsStoreFacade.searchResults$;
  // descriptions$ = this.normalizedAnnotations$.pipe(
  //   map(getDescriptions)
  // );
  currentAnnotations$ = combineLatest([
    this.normalizedAnnotations$,
    this.videoTime$,
  ]).pipe(map(([annotations, time]) => annotations.filter(isAt(time))));

  // svg display
  annotationStructures$ = this.currentAnnotations$.pipe(
    map((annotations) =>
      annotations.filter((a) => a.label.type === 'structure'),
    ),
  );
  displayedShapes$ = combineLatest([
    this.annotationStructures$,
    this.trackedAnnotationIds$,
  ]).pipe(
    map(([annotations, trackedIds]) => {
      return annotations.map((a) => ({
        ...a,
        readonly: trackedIds.includes(a.id),
      }));
    }),
  );
  enableEditMode$ = this.displayedShapes$.pipe(
    map((annotations) => annotations.some((a) => !a.readonly)),
  );

  highlighted$: BehaviorSubject<number> = new BehaviorSubject(null);
  hiddenAnnotations$: BehaviorSubject<number[]> = new BehaviorSubject([]);
  selectedAnnotations$ = new BehaviorSubject<number[]>([]);

  settings$ = this.settingsStoreFacade.settings$;
  annotationInterpolationSettings$ = this.settingsStoreFacade
    .annotationInterpolationSettings$;
  interpolationActive: boolean;
  interpolationStep: number;

  playbackValues = [0.2, 0.5, 1, 2, 3, 4, 5];
  playbackRate$;
  subscriptions: Array<Subscription> = [];
  copy: Partial<Annotation> = null;
  user: User;

  annotationTrackFn = (i, annotation: Annotation): number => annotation.id;

  toolbarShortcuts: ToolbarShortcuts = {
    activateEditMode: 'KeyE',
    activateCreationMode: 'KeyC',
    activateDrawingMode: 'KeyD',
  };
  lockToolbarShortcuts$ = new BehaviorSubject<boolean>(false);

  constructor(
    private activatedRoute: ActivatedRoute,
    private videosStoreFacade: VideosStoreFacade,
    private videoPlayerStoreFacade: VideoPlayerStoreFacade,
    public annotationsStoreFacade: AnnotationsStoreFacade,
    private settingsStoreFacade: SettingsStoreFacade,
    private localStorageService: LocalStorageService,
    private infoMessageService: InfoMessageService,
    private svgStoreFacade: SvgStoreFacade,
    public usersFacade: UsersFacade,
    public uiFacade: UiFacade,
    private router: Router,
    private annotationLabelsStoreFacade: AnnotationLabelsStoreFacade,
    public dialog: MatDialog,
    private videoGroupsFacade: VideoGroupsStoreFacade,
    private labelGroupsFacade: LabelGroupsFacade,
    private structureTrackerFacade: StructureTrackerFacade,
  ) {}

  ngOnInit(): void {
    const durationSub = this.videoDuration$.subscribe((duration) => {
      this.videoDuration = duration;
    });
    const timeSub = this.videoTime$.subscribe((t) => {
      this.videoTime = t;
    });
    const userSub = this.usersFacade.currentUser$
      .pipe(filter((u) => !!u))
      .subscribe((user) => {
        this.user = user;
      });
    const routeSub = this.activatedRoute.params.subscribe((params) => {
      this.videoId = +params.videoId;
      this.videosStoreFacade.setCurrentVideoId(this.videoId);
      this.structureTrackerFacade.loadVideoStructureTrackers(this.videoId);
    });
    const timelineSub = this.timelines.timeline.timelineStore.timelineElWidth$.subscribe(
      this.timelineWidth$,
    );
    const annotationToUpdateSub = this.annotationToUpdate$.subscribe(
      (annotation) => {
        this.annotationToUpdate = annotation;
        if (annotation) {
          this.annotationsStoreFacade.setTmpAnnotation(annotation);
        }
      },
    );
    const nextEventTimestampSub = this.nextEventTimestamp$.subscribe();
    this.subscriptions.push(
      routeSub,
      userSub,
      durationSub,
      timeSub,
      timelineSub,
      annotationToUpdateSub,
      nextEventTimestampSub,
    );
    this.annotationInterpolationSettings$.subscribe(
      ({ activateAnnotationInterpolation, annotationInterpolationStep }) => {
        this.annotationsStoreFacade.loadAnnotations(
          this.videoId,
          activateAnnotationInterpolation,
          annotationInterpolationStep,
        );
        this.interpolationActive = activateAnnotationInterpolation;
        this.interpolationStep = annotationInterpolationStep;
      },
    );
  }

  ngAfterViewInit(): void {
    if (this.mediaPlayer.surgVideoDir) {
      this.playbackRate$ = this.mediaPlayer.surgVideoDir.playbackRate$;
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event): void {
    this.dialog.closeAll();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.localStorageService.saveVideoTime(this.videoId, this.videoTime);
  }

  ngOnDestroy(): void {
    this.localStorageService.saveVideoTime(this.videoId, this.videoTime);
    this.videoPlayerStoreFacade.clear();
    this.videosStoreFacade.clearVideoList();
    this.svgStoreFacade.clear();
    this.annotationLabelsStoreFacade.clearAll();
    this.subscriptions.map((sub) => sub.unsubscribe());
    this.uiFacade.resetTitle();
  }

  onDataLoaded(bool: boolean): void {
    if (bool) {
      const timestamp = this.activatedRoute.snapshot.queryParamMap.get('t');
      if (timestamp !== null && +timestamp >= 0) {
        this.setCurrentTime(+timestamp / 1000);
      } else {
        const savedTime = this.localStorageService.getVideoTime(this.videoId);
        this.setCurrentTime(savedTime / 1000);
      }
    }
  }

  onStartTracking(a: Annotation): void {
    this.annotationsStoreFacade.trackAnnotation(a.id);
  }

  // timelines
  speedDown(): void {
    if (this.mediaPlayer.surgVideoDir && this.playbackValues) {
      const current = this.mediaPlayer.surgVideoDir.playbackRate$.getValue();
      const rate = getLowerPlaybackRate(this.playbackValues, current);
      if (rate !== current) {
        this.mediaPlayer.surgVideoDir.playbackRate$.next(rate);
      }
    }
  }

  speedUp(): void {
    if (this.mediaPlayer.surgVideoDir && this.playbackValues) {
      const current = this.mediaPlayer.surgVideoDir.playbackRate$.getValue();
      const rate = getUpperPlaybackRate(this.playbackValues, current);
      if (rate !== current) {
        this.mediaPlayer.surgVideoDir.playbackRate$.next(rate);
      }
    }
  }

  updatePlaybackRate(): void {
    if (this.mediaPlayer.surgVideoDir && this.playbackValues) {
      const current = this.mediaPlayer.surgVideoDir.playbackRate$.getValue();
      const rate = getNextPlaybackRate(this.playbackValues, current);
      this.mediaPlayer.surgVideoDir.playbackRate$.next(rate);
    }
  }

  onAnnotationCopy(annotation: Partial<Annotation>): void {
    this.copy = {
      ...annotation,
      user: this.user,
    };
    this.infoMessageService.setMessage('Annotation copied');
  }

  onAnnotationHighlight(id: number): void {
    this.highlighted$.next(id);
  }

  onAnnotationSelect(id: number): void {
    const selected = this.selectedAnnotations$.value;
    const index = selected.indexOf(id);
    if (index < 0) {
      this.selectedAnnotations$.next([...selected, id]);
    } else {
      selected.splice(index, 1);
      this.selectedAnnotations$.next([...selected]);
    }
  }

  onAnnotationsSelect(ids: number[]): void {
    this.selectedAnnotations$.next(ids);
  }

  removeHiddenIds(ids: number[]): void {
    this.hiddenAnnotations$.next(
      this.hiddenAnnotations$.value.filter((h) => !ids.includes(h)),
    );
  }

  addHiddenIds(ids: number[]): void {
    this.hiddenAnnotations$.next(
      uniq([...this.hiddenAnnotations$.value, ...ids]),
    );
  }

  onAnnotationHide(id: number): void {
    this.addHiddenIds([id]);
  }

  onAnnotationShow(id: number): void {
    this.removeHiddenIds([id]);
  }

  onLabelHide(name: string): void {
    this.annotationsStoreFacade
      .getAnnotationsByLabelName(name)
      .pipe(
        first(),
        map((annotations) => annotations.map((a) => a.id)),
      )
      .subscribe((ids) => this.addHiddenIds(ids));
  }

  onLabelShow(name: string): void {
    this.annotationsStoreFacade
      .getAnnotationsByLabelName(name)
      .pipe(
        first(),
        map((annotations) => annotations.map((a) => a.id)),
      )
      .subscribe((ids) => this.removeHiddenIds(ids));
  }

  copyAnnotation(): void {
    if (this.copy) {
      const annotation = updateAnnotationTimestamp(
        this.copy as Annotation,
        this.videoTime,
      );
      this.annotationsStoreFacade.createAnnotation(
        fitInVideo(annotation, this.videoDuration),
      );
    }
  }

  // Annotations
  onJoinRoom(id: number): void {
    this.annotationsStoreFacade.joinRoom(id);
  }

  onLeaveRoom(id: number): void {
    this.annotationsStoreFacade.leaveRoom(id);
  }

  onDeleteAnnotation(id: number): void {
    this.annotationsStoreFacade.deleteAnnotation(id);
    this.tmpPause = false;
  }

  async deleteSelectedAnnotations(): Promise<void> {
    const messageEnd =
      this.selectedAnnotations$.value.length > 1
        ? this.selectedAnnotations$.value.length + ' selected items'
        : 'selected item';
    const confirm = await this.infoMessageService.setConfirm(
      'Confirm suppression',
      `Are you sure you want to delete the ${messageEnd}?`,
    );
    if (confirm) {
      this.annotationsStoreFacade.deleteAnnotations(
        this.selectedAnnotations$.value,
      );
    }
    this.selectedAnnotations$.next([]);
  }

  clearSelection(): void {
    this.selectedAnnotations$.next([]);
  }

  updateSelectedAnnotationsLabels(): void {
    const dialogRef = this.dialog.open(SvgAnnotationFormDialogComponent, {
      width: '600px',
      data: {
        labels$: this.searchResults$,
        suggestedLabelGroup: this.suggestedAnnotationLabelGroup,
        enableDelete: this.user.roles.includes('ADMIN'),
        currentLabel: {
          name: '',
          color: '',
        },
        deleteLabelHandler: (name) => this.onAnnotationLabelDelete(name),
      },
      disableClose: false,
    });

    let queryChangesSub;

    dialogRef.afterOpened().subscribe(() => {
      this.onDialogOpen(true);

      queryChangesSub = dialogRef.componentInstance.queryChanges$.subscribe(
        (q) => this.onSearchQueryChanges(q),
      );
    });

    dialogRef.afterClosed().subscribe((data) => {
      this.onDialogOpen(false);
      queryChangesSub.unsubscribe();

      if (data && data.name) {
        this.annotationsStoreFacade.updateAnnotationsLabel(
          this.selectedAnnotations$.value,
          this.videoId,
          data,
        );
      }
    });
  }

  onUpdateAnnotation(annotation: Partial<Annotation>): void {
    this.annotationsStoreFacade.updateAnnotation(
      annotation,
      this.interpolationActive,
      this.interpolationStep,
    );
  }

  onCreateAnnotation(annotation: Annotation): void {
    this.annotationsStoreFacade.createAnnotation(annotation);
    this.mediaPlayer.updateView();
  }

  onCreateAnnotations(annotations: Array<Annotation>): void {
    this.annotationsStoreFacade.createAnnotations(annotations);
    this.mediaPlayer.updateView();
  }

  onSetTmpAnnotation(annotation: Annotation, pushTimeCursor = true): void {
    if (annotation && !annotation.user) {
      annotation.user = this.user;
    }

    if (
      annotation &&
      (this.mode.name === CreationMode.name ||
        this.mode.name === DrawingMode.name)
    ) {
      this.videoPlayerStoreFacade.setCurrentTime(this.currentTimestamp);
    }

    if (
      annotation &&
      this.mode.name === EditMode.name &&
      this.annotationToUpdate?.id !== annotation.id &&
      this.interpolationActive
    ) {
      this.annotationsStoreFacade.loadAnnotationToUpdate(annotation.id);
    } else {
      this.annotationsStoreFacade.setTmpAnnotation(annotation);
    }
  }

  // Video
  onSetIsVideoPlaying(isPlaying: boolean): void {
    this.videoPlayerStoreFacade.setIsPlaying(isPlaying);
    if (!isPlaying) {
      this.addCurrentTimeToQueryParams();
    }
  }

  onAnnotationLabelDelete(name: string): void {
    this.annotationLabelsStoreFacade.deleteLabel(name);
  }

  addCurrentTimeToQueryParams(): void {
    this.router.navigate([], {
      queryParams: {
        ...this.activatedRoute.snapshot.queryParams,
        t: this.videoTime,
      },
      relativeTo: this.activatedRoute,
      replaceUrl: true,
    });
  }

  onSetVideoTime(time: number): void {
    this.videoPlayerStoreFacade.setCurrentTime(time);
  }

  onSetVideoDuration(duration: number): void {
    this.videoPlayerStoreFacade.setDuration(duration);
  }

  onSetVideoHeight(height: number): void {
    this.settingsStoreFacade.setVideoHeight(height);
    this.localStorageService.setVideoHeight(height);
  }

  onSetVideoSize(size: { h: number; w: number }): void {
    this.videoPlayerStoreFacade.setVideoSize(size);
  }

  setCurrentTime(time: number): void {
    this.mediaPlayer.surgVideoDir.setCurrentTime(time);
  }

  // SVG
  onSetShape(shape?: AnnotationShape): void {
    this.svgStoreFacade.setShape(shape);
  }

  onSetMode(mode: Mode): void {
    this.svgStoreFacade.setMode(mode);
    if (mode.name === CreationMode.name) {
      this.handleAnnotationCreation();
    }
    if (this.annotationToUpdate && mode.name !== EditMode.name) {
      this.annotationsStoreFacade.clearAnnotationToUpdate();
    }
    if (mode.name !== NormalMode.name) {
      this.onSetIsVideoPlaying(false);
    }
  }

  onSetModeFailure(mode: Mode): void {
    if (mode.name === EditMode.name) {
      this.infoMessageService.setMessage('No annotation to edit');
    }
  }

  async handleAnnotationCreation(): Promise<void> {
    this.onDialogOpen(true);

    const allowedLabelTypes = ['event', 'phase', 'action'];
    const dialogRef = this.dialog.open(SvgAnnotationFormDialogComponent, {
      width: '600px',
      data: {
        labels$: this.searchResults$,
        suggestedLabelGroup: this.suggestedAnnotationLabelGroup
          ? {
              ...this.suggestedAnnotationLabelGroup,
              labels: this.suggestedAnnotationLabelGroup.labels.filter((l) =>
                allowedLabelTypes.includes(l.type),
              ),
            }
          : null,
        allowedLabelTypes,
      },
      disableClose: false,
    });

    await dialogRef.afterOpened().toPromise();
    const searchSub = dialogRef.componentInstance.queryChanges$.subscribe((q) =>
      this.annotationLabelsStoreFacade.search(q),
    );

    const data = await dialogRef.afterClosed().toPromise();

    this.onDialogOpen(false);
    searchSub.unsubscribe();

    if (data) {
      const duration = 0;
      const newAnnotation: Annotation = {
        videoId: this.videoId,
        label: data,
        duration,
        timestamp: Math.round(this.currentTimestamp),
        isOneShot: false,
      };

      this.onSetTmpAnnotation(newAnnotation);
    } else {
      this.svgStoreFacade.setMode(NormalMode);
    }
  }

  onDialogOpen(isOpen: boolean): void {
    this.lockToolbarShortcuts$.next(isOpen);
  }

  onSetSvgOverlay(overlay: {
    top: number;
    left: number;
    width: number;
    height: number;
  }): void {
    this.svgStoreFacade.setOverlay(overlay);
  }

  onSeekForward(): void {
    this.mediaPlayer.onForwardSeek();
  }

  onSearchQueryChanges(query: string): void {
    this.annotationLabelsStoreFacade.search(query);
  }

  onSeekBackward(): void {
    this.mediaPlayer.onBackwardSeek();
  }

  onSeekNextEvent(): void {
    this.mediaPlayer.surgVideoDir.setCurrentTime(
      this.nextEventTimestamp / 1000,
    );
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.altKey && event.code === 'KeyO') {
      this.speedDown();
    } else if (event.altKey && event.code === 'KeyP') {
      this.speedUp();
    }
    if (this.copy && event.ctrlKey && event.code === 'KeyV') {
      this.copyAnnotation();
    }
  }

  onCurrentTimeClick(): void {
    if (this.timelineCurrentTimeFormat$.getValue() === 'standard') {
      this.timelineCurrentTimeFormat$.next('seconds');
      this.timeScaleLabel = 's';
    } else {
      this.timelineCurrentTimeFormat$.next('standard');
      this.timeScaleLabel = '';
    }
  }

  onDeleteEngaged(): void {
    this.tmpPause = true;
  }

  onDeleteDisengaged(): void {
    this.tmpPause = false;
  }

  onViewPortScroll(): void {
    window.dispatchEvent(new Event('scroll'));
  }

  onMarkAsFalsePositive({
    annotation,
    isFalsePositive,
  }: {
    annotation: Annotation;
    isFalsePositive: boolean;
  }): void {
    this.annotationsStoreFacade.markAsFalsePositive(
      annotation.id,
      isFalsePositive,
    );
  }
}
