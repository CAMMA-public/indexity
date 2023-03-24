import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { VideosApiService } from '../common/services/videos-api.service';
import { Video } from '../common/models/video.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrls: ['./videos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideosPage implements OnInit {
  videos$ = this.videos.getVideos();

  videosTrackBy = (i: number, v: Video): number => v.id;

  constructor(
    private videos: VideosApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (
      this.route.snapshot.queryParams &&
      this.route.snapshot.queryParams.videoIds
    ) {
      this.videos$ = this.videos.loadVideosByIds(
        this.route.snapshot.queryParams.videoIds,
      );
    }
  }
}
