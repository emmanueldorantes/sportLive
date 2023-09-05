import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-teamlist',
  templateUrl: './teamlist.component.html',
  styleUrls: ['./teamlist.component.css']
})
export class TeamlistComponent implements OnInit {

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle('Equipo / Lista Equipos');
  }
}