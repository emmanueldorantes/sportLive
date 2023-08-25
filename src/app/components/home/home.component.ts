import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  ngOnInit(): void {
    let script = document.createElement('script');
    script.src = './assets/libs/jquery/dist/jquery.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = './assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = './assets/js/sidebarmenu.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = './assets/js/app.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = './assets/libs/apexcharts/dist/apexcharts.min.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = './assets/libs/simplebar/dist/simplebar.js';
    document.body.appendChild(script);
    script = document.createElement('script');
    script.src = './assets/js/dashboard.js';
    document.body.appendChild(script);
  }
}
