import { CanActivateFn, Router } from '@angular/router';
// import {AuthenticationService} from "../services/authentication.service";
// import {User} from "../models/user.model";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  let isAuthenticated = false;
  // let currentUser = new User();
  // inject(AuthenticationService).currentUser.subscribe( data => {
  //   currentUser = data
  // });
  if (isAuthenticated) {
    // @ts-ignore
    // if (route.data.roles?.indexOf(currentUser.role) === -1) {
    //   inject(Router).createUrlTree(['/401']);
    //   return inject(Router).createUrlTree(['/401']);
    // }
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};

