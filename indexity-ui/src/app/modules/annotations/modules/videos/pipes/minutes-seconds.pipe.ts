import { Pipe, PipeTransform } from '@angular/core';
import { msToTime } from '@app/annotations/helpers/base.helpers';

@Pipe({
  name: 'formatMs',
  pure: true,
})
export class FormatMsPipe implements PipeTransform {
  transform(value: number): string {
    return msToTime(value);
  }
}
