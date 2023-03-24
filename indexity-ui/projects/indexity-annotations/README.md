# SurgAnnotation

This angular library contains textual and graphical annotation tools.  

## Installation  

`npm install --save @indexity/annotations`

## Usage  

1. In your root Angular module import SurgAnnotationModule and BrowserAnimationsModule.
2. If you want to use the store module, don't forget to import SurgAnnotationStoreModule.forRoot(environment), StoreModule.forRoot() and EffectsModule.forRoot()
  
```ts
import {SurgAnnotationModule} from '@indexity/annotations';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    SurgAnnotationModule,
    SurgAnnotationStoreModule.forRoot({
      socketConfig: {
        baseUrl: 'socketUrl'
      },
      streamConfig: {
        baseUrl: 'streamsApiUrl'
      }
    })
  ]
})
export class AppModule { }
```

### Directives

#### VideoDirective: The main directive
Use the **surg-video-player** selector and provide a videoId to it, if you don't, an id will be generated.  

```html
<video
  [vgMedia]="media"
  [src]="mediaSource"
  #media
  id="singleVideo"
  preload="auto"
  crossorigin
  surg-video-player
  [videoId]="videoId"
  [isVideoPlaying]="isVideoPlaying$ | async"
  (setVideoSize)="onSetVideoSize($event)"
  (setSvgOverlay)="onSetSvgOverlay($event)"
  (joinRoom)="onJoinRoom($event)"
  (leaveRoom)="onLeaveRoom($event)"
  (setVideoTime)="onSetVideoTime($event)"
  (setVideoDuration)="onSetVideoDuration($event)"
  (setIsVideoPlaying)="onSetIsVideoPlaying($event)"
></video>
```

#### ResizedDirective  

*TODO*

### Components  

Add the components you want to use, depending on your needs.  

#### GraphicalAnnotationsComponent
```html
<surg-graphical-annotations
  [svgOverlay]="svgOverlay$ | async"
  [mode]="mode$ | async"
  [shape]="shape$ | async"
  [videoTime]="videoTime$ | async"
  [annotations]="annotations$ | async"
  [hiddenAnnotation]="hiddenAnnotation$ | async"
  [tmpAnnotation]="tmpNewAnnotation$ | async"
  [videoDuration]="videoDuration$ | async"
  [videoId]="videoId$ | async"
  (setMode)="onSetMode($event)"
  (setTmpAnnotation)="onSetTmpAnnotation($event)"
  (deleteAnnotation)="onDeleteAnnotation($event)"
  (setShape)="onSetShape($event)"
  (updateAnnotation)="onUpdateAnnotation($event)"
  (createAnnotation)="onCreateAnnotation($event)"
></surg-graphical-annotations>
```
See documentation [here](./src/lib/components/graphical-annotations/graphical-annotations.component.md).  

#### AnnotationsToolbarComponent  
```html
<indexity-annotations-toolbar
    [svgOverlay]="svgOverlay$ | async"
    [categoryList]="categoryList$ | async"
    [tmpNewAnnotation]="tmpNewAnnotation$ | async"
    [videoId]="videoId$ | async"
    [mode]="mode$ | async"
    [videoDuration]="videoDuration$ | async"
    [videoTime]="videoTime$ | async"
    [videoSize]="videoSize$ | async"
    (createAnnotation)="onCreateAnnotation($event)"
    (deleteAnnotation)="onDeleteAnnotation($event)"
    (updateAnnotation)="onUpdateAnnotation($event)"
    (setTmpAnnotation)="onSetTmpAnnotation($event)"
    (setIsVideoPlaying)="onSetIsVideoPlaying($event)"
  ></indexity-annotations-toolbar>
``` 
See documentation [here](./src/lib/components/annotations-toolbar/annotations-toolbar.component.md).

