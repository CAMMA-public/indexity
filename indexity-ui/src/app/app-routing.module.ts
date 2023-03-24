import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { HomeGuard } from './core/guards/home.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from '@app/views';

const ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [HomeGuard],
  },
  {
    path: 'annotations',
    loadChildren: () =>
      import('./modules/annotations/annotations.module').then(
        (m) => m.AnnotationsModule,
      ),
    canActivateChild: [AuthGuard],
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./modules/users/users.module').then((m) => m.UsersModule),
    canActivate: [HomeGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
