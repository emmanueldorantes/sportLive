import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-jornadas',
  templateUrl: './jornadas.component.html',
  styleUrls: ['./jornadas.component.css']
})
export class JornadasComponent implements OnInit {
  teams: any = [];
  field: any;
  fields: any = [];
  tournament: any;
  tournaments: any = [];
  disabledTournament: boolean = true;
  lap: any;
  types: any = ["torneo", "semana", "mes"];
  type: string;
  laps: any = [
    { "value": "ida", "description": "Ida" },
    { "value": "ida-vuelta", "description": "Ida y Vuelta" }
  ];
  qry: string;
  variables: any;

  constructor(
    private snakBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private titleService: TitleService,
    private graphqlService: GraphqlService
  ) {
    this.titleService.setTitle('Programación / Jornadas');
  }

  async ngOnInit() {
    this.qry = "";
    this.variables = {};
    this.fields = await this.getFields();
    this.field = "";
    this.tournament = "";
    this.lap = "";
    this.type = "";
    this.teams = [];
  }

  async getFields(): Promise<any> {
    this.setQryFields();
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getFields;
  }

  setQryFields() {
    this.qry = `
    query {
      getFields(filters: {}){
          _id,
          nombre
      }
    }`;
    this.variables = {
      module: 'field'
    };
  }

  async changeFields(): Promise<any> {
    if (this.field) {
      this.disabledTournament = false;
      this.tournaments = await this.getTournaments();
      this.viewGridTeams();
    } else {
      this.disabledTournament = true;
      this.tournaments = [];
    }
  }

  async getTournaments(): Promise<any> {
    this.setQryTournaments();
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getTournaments;
  }

  setQryTournaments() {
    this.qry = `
    query($idField: ID!) {
      getTournaments(filters: {
        qry: {
          field: $idField
        }
      }){
          _id,
          nombre
      }
    }`;
    this.variables = {
      module: 'tournaments',
      idField: this.field
    };
  }

  async viewGridTeams() {
    if (this.field && this.tournament) {
      let i = -1;
      const listTeams = await this.getTeams();
      listTeams.forEach((team: any, index: number) => {
        let mod = index % 6;
        if (mod === 0) {
          this.teams.push({ "row": [] });
          ++i;
        }
        let escudo = `${environment.fileManager}/${team.photo}`;
        this.teams[i].row.push({ id: team._id, "nombre": team.nombre, escudo });
      });
    }
  }

  async getTeams(): Promise<any> {
    this.setQryTeams();
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getTeams;
  }

  setQryTeams() {
    this.qry = `
    query($idField: ID!, $idTournament: ID!) {
      getTeams(filters: {
        qry: {
          field: $idField,          
          tournament: $idTournament,
          status: true
        }
      }){
          _id,
          nombre,
          photo
      }
    }`;
    this.variables = {
      module: 'teams',
      idField: this.field,
      idTournament: this.tournament
    };
  }

  onSubmit(formGrid: NgForm) {
    if (formGrid.status === "VALID") {
      const dialog = this.dialog.open(ConfirmDialogComponent, {
        width: '390px',
        data: {
          message: "",
          question: "¿Desea generar la programación de los partidos para estos equipos?",
          ok: "Si",
          cancel: "No"
        }
      });
      dialog.afterClosed().subscribe(async result => {
        if (result) {
          this.matchScheduling();
        }
      });
    } else {
      this.snakBar.open("Verifique que los campos esten seleccionados.", "Aceptar", {
        duration: 0,
        horizontalPosition: "center",
        verticalPosition: "bottom"
      });
    }
  }

  matchScheduling() {
    let teamsObjects: any = [];
    this.teams.forEach((rows: any) => {
      rows.row.forEach((team: any) => {
        teamsObjects.push(team);
      });
    });
    const totalTeams = teamsObjects.length;
    const isAnOddNumber = totalTeams % 2;
    if (isAnOddNumber)
      teamsObjects.push({ id: 0, "nombre": "descansa" });






      
    console.log(teamsObjects);


    // this.router.navigateByUrl('/home/calendario');
  }
}
