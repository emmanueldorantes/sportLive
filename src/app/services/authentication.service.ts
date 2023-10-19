import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  isAuthenticated = false;
  currentUser: any;

  login(username: string, password: string): boolean {
    // Lógica de autenticación aquí
    // Si la autenticación es exitosa, establece isAuthenticated en true
    // ... (Podrías hacer esto en el componente de inicio de sesión)
    return this.isAuthenticated;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.isAuthenticated = false;
  }

  isAuthenticatedUser(): boolean {
    return !!localStorage.getItem('authToken') || this.isAuthenticated;
  }
}
