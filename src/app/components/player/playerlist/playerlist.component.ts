import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-playerlist',
  templateUrl: './playerlist.component.html',
  styleUrls: ['./playerlist.component.css']
})
export class PlayerlistComponent implements OnInit{
  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle('Jugador / Lista de Jugadores');
  }


}
