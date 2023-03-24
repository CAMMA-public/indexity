import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UsersPage } from './users.page';
import { UserViewComponent } from './user-view/user-view.component';
import { SharedModule } from '../common/modules/shared.module';

const routes: Routes = [
  {
    path: '',
    component: UsersPage,
  },
  { path: ':id', component: UserViewComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [UsersPage, UserViewComponent],
})
export class UsersPageModule {}
