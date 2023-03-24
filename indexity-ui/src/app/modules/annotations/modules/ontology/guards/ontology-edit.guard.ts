import { Injectable, Optional } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { UsersFacade } from '@app/main-store/user/users.facade';
import {
  catchError,
  filter,
  map,
  timeout,
  withLatestFrom,
} from 'rxjs/operators';
import { InfoMessageService } from '@app/services/info-message.service';
import { Observable, of } from 'rxjs';
import { LabelGroupsFacade } from '@app/annotations/store/label-groups/label-groups.facade';
import { userIsModOrAdmin } from '@app/helpers/user.helpers';

@Injectable()
export class OntologyEditGuard implements CanActivate {
  constructor(
    private userFacade: UsersFacade,
    private groupsFacade: LabelGroupsFacade,
    @Optional() private messageInfo: InfoMessageService,
    private router: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<UrlTree | boolean> {
    const groupId = next.params.groupId;
    this.groupsFacade.loadOne(groupId);

    return this.groupsFacade.getGroupById(groupId).pipe(
      filter((gId) => !!gId),
      timeout(3000), // In case if server never responds with the needed group within 3 seconds
      withLatestFrom(this.userFacade.currentUser$),
      map(([group, user]) => {
        if (group.userId === user.id || userIsModOrAdmin(user)) {
          // user owns the group or has higher privileges
          return true;
        } else {
          this.messageInfo.setMessage(
            "You don't have permission to edit this group",
          );
          return this.router.createUrlTree([
            '/annotations',
            'ontology',
            groupId,
          ]);
        }
      }),
      catchError(() => {
        this.messageInfo.setMessage("Couldn't load group (timeout)");
        return of(this.router.createUrlTree(['/annotations', 'ontology']));
      }),
    );
  }
}
