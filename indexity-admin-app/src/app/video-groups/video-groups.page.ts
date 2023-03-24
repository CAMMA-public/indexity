import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { VideoGroupsService } from '../common/services/video-groups.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-video-groups',
  templateUrl: './video-groups.page.html',
  styleUrls: ['./video-groups.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGroupsPage implements OnInit {
  groups$ = this.videoGroups.getMany();
  constructor(
    private videoGroups: VideoGroupsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (
      this.route.snapshot.queryParams &&
      this.route.snapshot.queryParams.videoIds
    ) {
      this.groups$ = this.videoGroups.loadByIds(
        this.route.snapshot.queryParams.videoIds,
      );
    }
  }
}
