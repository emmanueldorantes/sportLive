import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TitleService } from '../../services/title.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service'; // Importa tu AuthenticationService

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  title: string;

  constructor(
    private titleService: TitleService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthenticationService  // Inyecta el AuthenticationService
  ) {
    this.title = "Home / Estadisticas";
  }

  ngOnInit(): void {
    this.titleService.getTitle().subscribe(newTitle => {
      this.title = newTitle;
      this.cdr.detectChanges();
    });

    let scriptElement = document.createElement('script');
    scriptElement.src = "../../../assets/js/core/app.js";
    document.body.appendChild(scriptElement);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirige al usuario a la página de login
  }
}
