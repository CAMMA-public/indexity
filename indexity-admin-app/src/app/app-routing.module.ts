import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './common/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadChildren: './users/users.module#UsersPageModule',
    canActivateChild: [AuthGuard],
  },
  {
    path: 'videos',
    loadChildren: './videos/videos.module#VideosPageModule',
    canActivateChild: [AuthGuard],
  },
  {
    path: 'video-groups',
    loadChildren: './video-groups/video-groups.module#VideoGroupsPageModule',
    canActivateChild: [AuthGuard],
  },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
