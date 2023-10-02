import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment';
import 'moment-timezone';

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
  mutation: string;
  variables: any;
  matches: any;

  constructor(
    private snakBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private titleService: TitleService,
    private graphqlService: GraphqlService
  ) {
    this.titleService.setTitle('Programación / Jornadas');
    this.qry = "";
    this.mutation = "";
    this.variables = {};
    this.matches = [];
    this.lap = "";
    this.type = "";
    this.teams = [];
    this.field = "";
    this.tournament = "";
  }

  async ngOnInit() {
    this.fields = await this.getFields();
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
      this.tournament = "";
      this.teams = [];
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
      this.teams = [];
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

  async matchScheduling() {
    let teamsObjects: any = [];
    this.teams.forEach((rows: any) => {
      rows.row.forEach((team: any) => {
        teamsObjects.push(team);
      });
    });
    let totalTeams = teamsObjects.length;
    let totalMatchDays = teamsObjects.length;
    const isAnOddNumber = totalTeams % 2;
    if (isAnOddNumber) {
      teamsObjects.push({ id: 0, "nombre": "descansa" });
      totalTeams = teamsObjects.length;
    }

    const halfTeams = totalTeams / 2;

    // let teamsBlock1 = teamsObjects.slice(0, halfTeams);
    // let teamsBlock2 = teamsObjects.slice(halfTeams, totalTeams);

    let matchday;
    for (let i = 0; i < totalTeams - 1; i++) {
      matchday = i + 1;
      if (matchday < totalMatchDays) {
        let dataMatchDay = await this.getMatchDay("Activo", matchday);
        // if (!dataMatchDay.length)
        //   let docmentMatch = this.createMatchDay();
      }

      for (let x = 0; x < halfTeams; x++) {
        // this.matches = [];
        // if (teamsObjects[x].id !== 0 && teamsObjects[(totalTeams - 1 - x)].id !== 0) {
        //   let matchTeam = await this.getLastMatchTeam(teamsObjects[x].id, "Sin Jugar", "Activo");
        //   if (!matchTeam.length) {
        //     let indexTeamVs = totalTeams - 1 - x;
        //     // this.addMatchObject(teamsObjects, x, indexTeamVs, matchday);
        //   } else {

        //   }
        // }
      }
      teamsObjects.splice(1, 0, teamsObjects.pop()!);
    }

    // this.router.navigateByUrl('/home/calendario');
  }

  async getLastMatchTeam(team: any, status: string, statusMatch: string): Promise<any> {
    this.setQueryMatchTeam(status, team, statusMatch);
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getMatchs;
  }

  setQueryMatchTeam(status: string, team: any, statusMatch: string) {
    this.qry = `
    query($tournament: ID!, $status: String!, $idTeam: ID!, $statusMacth: ID!) {
      getMatchs(filters: {
        qry: {
          tournament: $tournament,
          status: $status,
          matchs: {
            elemMatch: {
              homeTeam: $idTeam,
              status: $statusMacth
            }
          }                    
        },
        pagination: true,
        limit: 1,
        sort: { date: -1 }
      }){
          _id,
          matchday,
          matchs {
            homeTeam,
            type,
            status
          }
      }
    }`;
    this.variables = {
      module: 'matchs',
      tournament: this.tournament,
      status,
      idTeam: team,
      statusMatch
    };
  }

  async getMatchDay(status: string, matchDay: any): Promise<any> {
    this.setQueryMatchDay(status, matchDay);
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getMatchs;
  }

  setQueryMatchDay(status: string, matchDay: number) {
    this.qry = `
    query($tournament: ID!, $status: String!, $matchday: Int) {
      getMatchs(filters: {
        qry: {
          tournament: $tournament,
          status: $status,
          matchday: $matchday                    
        }
      }){
          _id,
          matchs {
            homeTeam,
            type,
            status
          }
      }
    }`;
    this.variables = {
      module: 'matchs',
      tournament: this.tournament,
      status,
      matchDay
    };
  }

  addMatchObject(teams: any, index: number, lastIndex: number, matchday: number) {
    let homeTeam = teams[index];
    let awayTeam = teams[lastIndex];
    let date = moment.tz('America/Mexico_city').format();
    this.matches = [];
    this.matches.push(
      {
        homeTeam: teams[index],
        awayTeam: teams[lastIndex],
        matchday,
        status: "Sin Jugar",
        type: "Local",
        date
      },
      {
        team: teams[lastIndex],
        teamVs: teams[index],
        matchday,
        status: "Sin Jugar",
        type: "Visita",
        date
      });
  }

  async createMatchDay(): Promise<any> {
    
  }

  saveGame(): void {
    console.log(this.matches)
  }

}
