import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-tournamentform',
  templateUrl: './tournamentform.component.html',
  styleUrls: ['./tournamentform.component.css']
})

export class TournamentformComponent implements OnInit {

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    // this.titleService.setTitle('Torneo / Nuevo Torneo');
  }
}
