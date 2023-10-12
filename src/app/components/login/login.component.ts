import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) { }

  onSubmit() {
    // Aquí puedes manejar la lógica del login. 
    // Por ejemplo, una validación muy básica sería:

    if(this.email === 'test@test.com' && this.password === 'password123') {
      alert('Login exitoso!');
      this.router.navigate(['/home']);
    } else {
      alert('Credenciales incorrectas. Intenta nuevamente.');
    }
  }
}
