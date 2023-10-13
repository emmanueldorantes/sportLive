import { Component, OnInit } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loginform: FormGroup;

  constructor(
    private fb: FormBuilder,
    private graphqlService: GraphqlService,
    private snakBar: MatSnackBar,
    private router: Router
  ) { 
    this.loginform = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {}

  onSubmit(formLogin: NgForm) {
    if (formLogin.valid) {
      this.loginUser();
    } else {
      this.snakBar.open("Verifique que los campos obligatorios estén capturados.", "Aceptar", {
        duration: 0,
        horizontalPosition: "center",
        verticalPosition: "bottom"
      });
    }
  }

  loginUser() {
    const mutation = `
      mutation LoginUser($email: String!, $password: String!) {
        loginEmail(email: $email, password: $password)
      }
    `;

    const variables = {
      module: 'users', // Agregamos la propiedad module
      email: this.email,
      password: this.password,
    };

    this.graphqlService.post(mutation, variables).then(response => {
      if (response && response.data && response.data.loginEmail) {
        const authToken = response.data.loginEmail;
        localStorage.setItem('authToken', authToken);
    
        // Redirige al usuario después de establecer el token
        this.router.navigate(['/home']); // Utiliza navigate en lugar de navigateByUrl
      } else {
        // Mostrar mensaje de error genérico
        this.snakBar.open("Error durante el inicio de sesión. Intente nuevamente.", "Aceptar", {
          duration: 0,
          horizontalPosition: "center",
          verticalPosition: "bottom"
        });
      }
    }).catch(error => {
      console.error("Error durante el inicio de sesión: ", error);
      this.snakBar.open("Error durante el inicio de sesión. Intente nuevamente.", "Aceptar", {
        duration: 0,
        horizontalPosition: "center",
        verticalPosition: "bottom"
      });
    });
    
  }
}
