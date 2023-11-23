import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthenticationService } from "../services/authentication.service";

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

      return true;

    // Si el usuario está autenticado y está intentando acceder a la página de login
    if (this.authService.isAuthenticatedUser() && state.url === '/login') {
      this.router.navigate(['/home']);  // Redirige al usuario a la página principal
      return false;  // No permite el acceso a la página de login
    }

    // Si el usuario está autenticado y está intentando acceder a cualquier otra página
    if (this.authService.isAuthenticatedUser()) {
      return true;  // Permite el acceso
    }

    // Si el usuario no está autenticado y está intentando acceder a cualquier otra página
    localStorage.setItem('redirectUrl', state.url);  // Guarda la URL intentada
    this.router.navigate(['/login']);  // Redirige al usuario a la página de login
    return false;  // No permite el acceso a la página solicitada
  }
}
