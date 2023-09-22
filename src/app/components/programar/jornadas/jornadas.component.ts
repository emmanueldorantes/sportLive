import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-jornadas',
  templateUrl: './jornadas.component.html',
  styleUrls: ['./jornadas.component.css']
})
export class JornadasComponent implements OnInit {
  teams: any = [];

  constructor(
    private titleService: TitleService
  ) {
    this.titleService.setTitle('Programación / Jornadas');
  }

  ngOnInit() {
    this.teams = [
      {
        fila: [
          { "nombre": "Club América", "escudo": "america" },
          { "nombre": "Chivas de Guadalajara", "escudo": "guadalajara" },
          { "nombre": "Cruz Azul", "escudo": "cruz azul" },
          { "nombre": "Tigres UANL", "escudo": "tigres" },
          { "nombre": "Monterrey", "escudo": "monterrey" },
          { "nombre": "Pumas UNAM", "escudo": "pumas" }
        ]
      },
      {
        fila: [
          { "nombre": "Santos Laguna", "escudo": "santos" },
          { "nombre": "Toluca", "escudo": "toluca" },
          { "nombre": "León", "escudo": "leon" },
          { "nombre": "Atlas", "escudo": "atlas" },
          { "nombre": "Pachuca", "escudo": "pachuca" },
          { "nombre": "Querétaro", "escudo": "queretaro" }
        ]
      },
      {
        fila: [
          { "nombre": "Necaxa", "escudo": "necaxa" },
          { "nombre": "Mazatlán FC", "escudo": "mazatlan" },
          { "nombre": "FC Juárez", "escudo": "juarez" },
          { "nombre": "Puebla FC", "escudo": "puebla" },
          { "nombre": "Atlético San Luis", "escudo": "san luis" }
        ]
      }
    ];


  }
}
