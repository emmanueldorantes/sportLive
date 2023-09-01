import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-fieldlist',
  templateUrl: './fieldlist.component.html',
  styleUrls: ['./fieldlist.component.css']
})
export class FieldlistComponent implements OnInit {

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle('Cancha / Lista Canchas');
  }
}

