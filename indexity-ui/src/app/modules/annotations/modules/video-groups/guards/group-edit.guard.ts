import { Injectable, Optional } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { UsersFacade } from '@app/main-store/user/users.facade';
import { VideoGroupsStoreFacade } from '@app/annotations/store/video-groups/video-groups.store-facade';
import {
  catchError,
  filter,
  map,
  timeout,
  withLatestFrom,
} from 'rxjs/operators';
import { InfoMessageService } from '@app/services/info-message.service';
import { Observable, of } from 'rxjs';
import { isAdminOrMod } from '@app/helpers/user.helpers';

@Injectable()
export class GroupEditGuard implements CanActivate {
  constructor(
    private userFacade: UsersFacade,
    private groupsFacade: VideoGroupsStoreFacade,
    @Optional() private messageInfo: InfoMessageService,
    private router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> {
    const groupId = next.params.groupId;
    this.groupsFacade.loadGroup(groupId);

    return this.groupsFacade.getGroupById(groupId).pipe(
      filter((gId) => !!gId),
      timeout(3000), // In case if server never responds with the needed group within 3 seconds
      withLatestFrom(this.userFacade.currentUser$),
      map(([group, user]) => {
        if (group.userId === user.id || user.roles.some(isAdminOrMod)) {
          // user owns the group or has higher privileges
          return true;
        } else {
          this.messageInfo.setMessage(
            "You don't have permission to edit this group",
          );
          return this.router.createUrlTree([
            '/annotations',
            'videos',
            'groups',
            groupId,
          ]);
        }
      }),
      catchError(() => {
        this.messageInfo.setMessage("Couldn't load group (timeout)");
        return of(
          this.router.createUrlTree(['/annotations', 'videos', 'groups']),
        );
      }),
    );
  }
}
