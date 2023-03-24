import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UiFacade } from '@app/main-store/ui/ui.facade';

@Component({
  selector: 'app-documentation-index-view',
  templateUrl: './documentation-index-view.component.html',
  styleUrls: ['./documentation-index-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationIndexViewComponent implements OnInit, OnDestroy {
  titles: { id: string; innerHTML: string }[] = [];

  actions = {
    // action: admin, mod, annotator
    'annotate video': [true, true, true],
    'add video': [true, true, false],
    'delete video': [true, true, false],
    'add user': [true, false, false],
    'delete user': [true, false, false],
  };

  originalOrder = (a, b): number => 0;

  code = `
    interface Annotation {
      id: number, // unique identifier (automatically assigned during creation)
      // annotation label (*required)
      label: {
        name: string;
        color: string; // hex format color
        type: 'action' | 'event' | 'phase' | 'structure';  // structure is a bounding box annotation (default)
      },
      // shape of the annotation to the function of time (required only for structure type annotations, not for events, actions, and phases)
      shape: {
        // timestamp when the annotation starts in milliseconds
        // all x/y/width/height values are in percent values from 0.00 to 100.00 relative to video height/width,
        // You can get the height/width of the video (in pixels) either by reading the video file metadata or in the Video object from the Indexity API
        // coordinate system starts from top-left corner (0,0 coordinates) and ends in the bottom right corner (100.00, 100.00 coordinates)
        positions: {
          [timestamp: string]: {x: number, y: number, height: number, width: number}
        }
      },
      timestamp: number, // when the annotation starts (milliseconds) (*required),
      duration: number, // for how long the annotation continues (milliseconds) (*required),
      instance: string, // if you're tracking the same structure through several annotations, you can assign an instance identifier to link the annotations to the same structure instance
      videoId: number, // associated videoId (*required),
      isOneShot: boolean, // wether the annotation appears during a single frame in the video
      description: string, // optional arbitrary description
      isFalsePositive: boolean, // wether the annotation is a false positive
      userId: number, // automatically assigned from your token during creation

      // Other attributes
      updatedAt: Date Time string // example: 2019-12-17T09:22:00.890Z ,
      createAt: Date Time string,

    }
  `;

  constructor(
    private uiFacade: UiFacade,
    private route: ActivatedRoute,
    private router: Router,
    private eltRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.uiFacade.setTitle('Documentation');
    this.getNavigationContent();
  }

  ngOnDestroy(): void {
    this.uiFacade.resetTitle();
  }

  getNavigationContent(): void {
    const h2 = Array.from(this.eltRef.nativeElement.getElementsByTagName('h2'));
    this.titles = h2.map(({ id, innerHTML }) => ({
      innerHTML,
      id,
    }));
  }

  scrollTo(id): void {
    const elt = document.getElementById(id);
    elt.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }
}
