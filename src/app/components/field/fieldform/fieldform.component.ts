import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-fieldform',
  templateUrl: './fieldform.component.html',
  styleUrls: ['./fieldform.component.css']
})
export class FieldformComponent implements OnInit {

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle('Cancha / Nueva Cancha');
  }
}
