import { Component, OnInit  } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-playerform',
  templateUrl: './playerform.component.html',
  styleUrls: ['./playerform.component.css']
})
export class PlayerformComponent implements OnInit {

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setTitle('Jugador / Nuevo Jugador');
  }

}
