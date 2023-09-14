import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-tournamentlist',
  templateUrl: './tournamentlist.component.html',
  styleUrls: ['./tournamentlist.component.css']
})
export class TournamentlistComponent {
  
  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    // this.titleService.setTitle('Torneo / Lista de Torneo');
  }
}
