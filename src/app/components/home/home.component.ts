import { Component, OnInit, ViewChild, HostListener, Inject, Input, Output, EventEmitter } from '@angular/core';
import { TitleService } from '../../services/title.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  title: string = "";

  constructor(
    private titleService: TitleService,
    private router: Router
  ) {
    this.title = "Home";

    //this.router.navigateByUrl('/login');
  }

  ngOnInit(): void {
    this.titleService.getTitle().subscribe(newTitle => {
      this.title = newTitle;
    });

    let script = document.createElement('script');
    script.src = '../../../assets/libs/jquery/dist/jquery.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = '../../../assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = '../../../assets/js/sidebarmenu.js';
    document.body.appendChild(script);    
    script = document.createElement('script');
    script.src = '../../../assets/js/app.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = '../../../assets/libs/apexcharts/dist/apexcharts.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = '../../../assets/libs/simplebar/dist/simplebar.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = '../../../assets/js/dashboard.js';
    document.body.appendChild(script);
  }
}
