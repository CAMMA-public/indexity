import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from '@app/annotations/store/label-groups/store.reducer';
import { LabelGroupsEffects } from '@app/annotations/store/label-groups/label-groups.effects';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';

@NgModule({
  imports: [
    StoreModule.forFeature('labelGroups', reducers),
    EffectsModule.forFeature([LabelGroupsEffects]),
  ],
  providers: [LabelGroupsFacade],
})
export class LabelGroupsStoreModule {}
