import { HighlighterSvgComponent } from './components/highlighter-svg/highlighter-svg.component';
import { SvgAnnotationToolbarComponent } from './components/svg-annotation-toolbar/svg-annotation-toolbar.component';
import { MaterialCustomModule } from './modules/material-custom.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { VideoDirective } from './directives/video.directive';
import { SvgAnnotationFormDialogComponent } from './components/svg-annotation-form-dialog/svg-annotation-form-dialog.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialCustomModule,
    HttpClientModule,
    ColorPickerModule,
  ],
  entryComponents: [SvgAnnotationFormDialogComponent],
  declarations: [
    HighlighterSvgComponent,
    SvgAnnotationToolbarComponent,
    VideoDirective,
    SvgAnnotationFormDialogComponent,
  ],
  exports: [
    VideoDirective,
    HighlighterSvgComponent,
    SvgAnnotationToolbarComponent,
    SvgAnnotationFormDialogComponent,
  ],
  providers: [
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { hasBackdrop: true, autoFocus: true, disableClose: true },
    },
  ],
})
export class IndexityAnnotationsModule {}
