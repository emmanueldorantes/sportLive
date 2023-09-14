import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TitleService } from '../../services/title.service';
import { Router } from '@angular/router';

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
    private router: Router
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
}
