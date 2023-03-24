import { NgModule } from '@angular/core';
import { AnnotationLabelItemComponent } from '@app/annotations/components/annotation-label-item/annotation-label-item.component';
import { AnnotationItemComponent } from '@app/annotations/components/annotation-item/annotation-item.component';
import { FormatMsPipe } from '@app/annotations/modules/videos/pipes/minutes-seconds.pipe';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { SocketIoModule } from 'ngx-socket-io';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ResizableModule } from 'angular-resizable-element';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/annotations/components/toolbar/toolbar.component';
import { SettingsComponent } from '@app/annotations/components/settings/settings.component';
import { HelpComponent } from '@app/annotations/components/help/help.component';
import { DrawerComponent } from '@app/annotations/components/drawer/drawer.component';
import { VideoCardItemComponent } from '@app/annotations/components/video-card-item/video-card-item.component';
import { VideoListComponent } from '@app/annotations/components/video-list/video-list.component';
import { VideoListHeaderComponent } from '@app/annotations/components/video-list-header/video-list-header.component';
import { SearchFieldComponent } from '@app/annotations/components/search-field/search-field.component';
import { GroupFormComponent } from '@app/annotations/components/group-form/group-form.component';
import { HoldableDirective } from '@app/directives/holdable.directive';
import { MaterialCustomModule } from '@app/modules';
import { StatusLineComponent } from '@app/annotations/components/status-line/status-line.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SearchBarComponent } from '../components/search-bar/search-bar.component';
import { UploadVideosButtonComponent } from '@app/annotations/components/upload-videos-button/upload-videos-button.component';
import { EditVideoDialogComponent } from '@app/annotations/components/edit-video-dialog/edit-video-dialog.component';

@NgModule({
  declarations: [
    AnnotationLabelItemComponent,
    ToolbarComponent,
    AnnotationItemComponent,
    HoldableDirective,
    HelpComponent,
    FormatMsPipe,
    SettingsComponent,
    DrawerComponent,
    VideoListHeaderComponent,
    VideoListComponent,
    VideoCardItemComponent,
    SearchFieldComponent,
    GroupFormComponent,
    StatusLineComponent,
    SearchBarComponent,
    UploadVideosButtonComponent,
    EditVideoDialogComponent,
  ],
  imports: [
    LoadingBarHttpClientModule,
    SocketIoModule,
    InfiniteScrollModule,
    ResizableModule,
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialCustomModule,
    RouterModule,
    MatAutocompleteModule,
  ],
  exports: [
    AnnotationLabelItemComponent,
    ToolbarComponent,
    AnnotationItemComponent,
    HoldableDirective,
    SearchFieldComponent,
    FormatMsPipe,
    LoadingBarHttpClientModule,
    SocketIoModule,
    InfiniteScrollModule,
    ResizableModule,
    HelpComponent,
    PerfectScrollbarModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialCustomModule,
    RouterModule,
    SettingsComponent,
    DrawerComponent,
    VideoListHeaderComponent,
    VideoListComponent,
    VideoCardItemComponent,
    GroupFormComponent,
    SearchBarComponent,
    UploadVideosButtonComponent,
    EditVideoDialogComponent,
  ],
  entryComponents: [
    SettingsComponent,
    HelpComponent,
    GroupFormComponent,
    EditVideoDialogComponent,
  ],
})
export class AnnotationsSharedModule {}
