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
    this.title = "Home / Estadisticas";
  }

  ngOnInit(): void {
    this.titleService.getTitle().subscribe(newTitle => {
      this.title = newTitle;
    });
    
    let scriptElement = document.createElement('script');
    scriptElement.src = "../../../assets/js/core/app.js";
    document.body.appendChild(scriptElement);

    // let scriptElement1 = document.createElement('script');
    // scriptElement1.src = "../../../assets/js/pages/form_checkboxes_radios.js";
    // document.body.appendChild(scriptElement1);

    // let script1 = document.createElement('script');
    // script1.src = '../../../assets/js/pages/datatables_api.js';
    // document.body.appendChild(script1);

    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/visualization/d3/d3.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/visualization/d3/d3_tooltip.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/forms/styling/switchery.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/forms/styling/uniform.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/forms/selects/bootstrap_multiselect.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/ui/moment/moment.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/pickers/daterangepicker.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/ui/bodyroom/bodyroom.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/plugins/ui/bodyroom/bodyroom_jquery.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/core/app.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/pages/layout_navbar_hideable.js';
    // document.body.appendChild(script);

    // script.src = '../../../assets/libs/jquery/dist/jquery.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/sidebarmenu.js';
    // document.body.appendChild(script);    
    // script = document.createElement('script');
    // script.src = '../../../assets/js/app.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/libs/apexcharts/dist/apexcharts.min.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/libs/simplebar/dist/simplebar.js';
    // document.body.appendChild(script);
    // script = document.createElement('script');
    // script.src = '../../../assets/js/dashboard.js';
    // document.body.appendChild(script);
  }
}
