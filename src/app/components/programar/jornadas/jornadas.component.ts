import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
// import 'moment-timezone';

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
  types: any = ["torneo", "mes"];
  type: string;
  laps: any = [
    { "value": "ida", "description": "Ida" },
    { "value": "ida-vuelta", "description": "Ida y Vuelta" }
  ];
  qry: string;
  mutation: string;
  variables: any;
  matches: any;
  totalFileds: number;

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
    this.totalFileds = 0;
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
      getFields(filters: {
        status: true
      }){
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
      this.totalFileds = 3; //await this.getNumFileds();//?Aqui se va el numero total de canchas por bloque.      
      this.viewGridTeams();
    } else {
      this.disabledTournament = true;
      this.tournaments = [];
      this.tournament = "";
      this.teams = [];
    }
  }

  async getNumFileds(): Promise<any> {
    this.setQuerynumberFileds();
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getField;
  }

  setQuerynumberFileds() {
    this.qry = `
    query($id: ID!) {
      getField(_id: $id, filters: {}){
          nombre
      }
    }`;
    this.variables = {
      module: 'field',
      id: this.field
    };
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
          field: $idField,
          status: true
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
    let timeFormat = moment.tz('America/Mexico_city');
    const { dia, horario, _id } = await this.getTournament();
    let datesMatchs = this.getDays(dia);
    const time = await this.convertirHora12a24(horario);
    timeFormat.set('hour', time.hour);
    timeFormat.set('minutes', time.min);
    timeFormat.set('second', 0);

    let teamsObjects: any = [];
    this.teams.forEach((rows: any) => {
      rows.row.forEach((team: any) => {
        teamsObjects.push(team);
      });
    });

    let totalTeams = teamsObjects.length;
    let totalMatchDays = teamsObjects.length;
    if (totalTeams % 2) {
      teamsObjects.push({ id: 0, "nombre": "descansa" });
      totalTeams = teamsObjects.length;
    }
    const halfTeams = totalTeams / 2;

    let matchday;
    let numberFieldAsigment = 0;
    for (let i = 0; i < totalTeams - 1; i++) { //? Ciclo que recorre el total de equipos
      matchday = i + 1;
      if (matchday < totalMatchDays) {
        let dataMatchDay = await this.getMatchDay("Activo", matchday);
        let matchDayDocuemnt = (!dataMatchDay.length) ? await this.createMatchDay(matchday) : dataMatchDay[0];
        const IDMatchDay = matchDayDocuemnt._id;

        for (let x = 0; x < halfTeams; x++) {
          let homeTeamID = teamsObjects[x].id;
          let awayTeamID = teamsObjects[(totalTeams - 1 - x)].id;

          if (homeTeamID !== 0 && awayTeamID !== 0) {
            let matchTemasWithoutPlaying = await this.getMatch(IDMatchDay, homeTeamID, awayTeamID, 'Sin Jugar');
            let matchTemasPlayed = await this.getMatch(IDMatchDay, homeTeamID, awayTeamID, 'Jugado');

            if (this.lap === 'ida') {
              if (!matchTemasWithoutPlaying.length && !matchTemasPlayed.length) {
                if (numberFieldAsigment === this.totalFileds) {
                  numberFieldAsigment = 0;
                  timeFormat.add(1, 'h');
                }

                ++numberFieldAsigment;

                let match = {
                  homeTeam: homeTeamID,
                  awayTeam: awayTeamID,
                  status: "Sin Jugar",
                  type: "Local",
                  date: timeFormat.format(),
                  rescheduledMatch: false,
                  fieldNumber: numberFieldAsigment
                };
                await this.updateMatchDay(IDMatchDay, match);
              }
            } else {
              //           if (!matchTemasWithoutPlaying.length && !matchTemasPlayed.length) {
              //             let match = {
              //               homeTeam: homeTeamID,
              //               awayTeam: awayTeamID,
              //               status: "Sin Jugar",
              //               type: "Local",
              //               date: moment.tz('America/Mexico_city').format(),
              //               rescheduledMatch: false
              //             };
              //             await this.updateMatchDay(IDMatchDay, match);
              //           } else {

              //           }
            }
          } else {
            const teamOnRest = homeTeamID === 0 ? awayTeamID : homeTeamID;
            await this.updateMatch(IDMatchDay, teamOnRest);
          }
        }
      }
      console.log("A")
      teamsObjects.splice(1, 0, teamsObjects.pop()!);
    }
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

  async getMatch(IDMatchDay: any, homeTeam: any, awayTeam: any, status: string): Promise<any> {
    this.setQueryMatch(IDMatchDay, homeTeam, awayTeam, status);
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getMatchs;
  }

  setQueryMatch(IDMatchDay: any, homeTeam: any, awayTeam: any, status: string) {
    this.qry = `
    query($id: ID, $homeTeam: ID, $awayTeam: ID, $status: String) {
      getMatchs(filters: {
        qry: {
          _id: $id,
          matchs: {
            elemMatch: {
              homeTeam: $homeTeam,
              awayTeam: $awayTeam,
              status: $status
            }
          }
        }
      }){
          _id          
      }
    }`;
    this.variables = {
      module: 'matchs',
      id: IDMatchDay,
      homeTeam,
      awayTeam,
      status
    };
  }

  async getMatchDay(statusTournament: string, matchDay: number): Promise<any> {
    this.setQueryMatchDay(statusTournament, matchDay);
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getMatchs;
  }

  setQueryMatchDay(status: string, matchday: number) {
    this.qry = `
    query($tournament: ID, $status: String, $matchday: Int) {
      getMatchs(filters: {
        qry: {
          tournament: $tournament,
          status: $status,
          matchday: $matchday                    
        }
      }){
          _id
      }
    }`;
    this.variables = {
      module: 'matchs',
      tournament: this.tournament,
      status,
      matchday
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

  async createMatchDay(matchDay: number): Promise<any> {
    this.setQueryCreateMatchDay(matchDay);
    let response = await this.graphqlService.post(this.mutation, this.variables);
    return response.data.createMatch;
  }

  setQueryCreateMatchDay(matchday: number) {
    this.mutation = `
    mutation($tournament: ID, $matchday: Int, $status: String) {
      createMatch(input: {
          tournament: $tournament,
          matchday: $matchday,
          status: $status
      }){
          _id
      }
    }`;
    this.variables = {
      module: 'matchs',
      tournament: this.tournament,
      status: "Activo",
      matchday
    };
  }

  async updateMatch(idMatch: any, updateFields: any) {
    this.setQueryUpdateMatch(idMatch, updateFields);
    let response = await this.graphqlService.post(this.mutation, this.variables);
    return response.data.updateMatch;
  }

  setQueryUpdateMatch(idMatch: any, updateField: any) {
    this.mutation = `
    mutation($idMatch: ID!, $updateField: ID) {
      updateMatch(_id: $idMatch, input: { teamOnRest: $updateField }){
          _id
      }
    }`;
    this.variables = {
      module: 'matchs',
      idMatch,
      updateField
    };
  }

  async updateMatchDay(idMatchDay: any, match: any) {
    this.setQueryUpdateMatchDay(idMatchDay, match);
    let response = await this.graphqlService.post(this.mutation, this.variables);
    return response.data.updateMatch;
  }

  setQueryUpdateMatchDay(idMatchDay: any, match: any) {
    this.mutation = `
    mutation($idMatchDay: ID, $match: Any) {
      updatePushMatch(_id: $idMatchDay, match: $match){
          _id,
          matchs {
            homeTeam,
            awayTeam,
            matchResults,
            status,
            type,
            date,
            rescheduledMatch
          }
      }
    }`;
    this.variables = {
      module: 'matchs',
      idMatchDay,
      match
    };
  }

  setQueryCreate() {

  }

  saveGame(): void {
    console.log(this.matches)
  }

  async getTournament(): Promise<any> {
    this.setQueryTournament();
    let response = await this.graphqlService.post(this.qry, this.variables);
    return response.data.getTournament;
  }

  setQueryTournament() {
    this.qry = `
    query($id: ID!) {
      getTournament(_id: $id, filters: {}) {
        _id
        dia
        horario
      }
    }`;
    this.variables = {
      module: 'tournaments',
      id: this.tournament
    };
  }

  getDays(day: string): any {
    const fechaActual = moment();
    const proximosSabados: string[] = [];
    let contador = 0;
    try {
      switch (day) {
        case "lav":
          break;
        case "sabado":
          while (contador < 4) {
            fechaActual.add(1, 'day');
            if (fechaActual.day() === 6) {
              proximosSabados.push(fechaActual.format('YYYY-MM-DD'));
              contador++;
            }
          }
          return proximosSabados;
          break;
        case "domingo":
          break;
      }
    } catch (error) {
      console.log(error);
    }
    console.log(fechaActual);
  }

  async convertirHora12a24(hour12: string): Promise<any | null> {
    const hour12Regex = /^(1[0-2]|0?[1-9]):[0-5][0-9] (am|pm)$/i;

    if (!hour12Regex.test(hour12))
      return null;

    const [, hour, minutes, period] = hour12.match(/(\d+):(\d+) (am|pm)/i) || [];

    if (!hour || !period)
      return null;

    let hour24: number = parseInt(hour, 10);

    if (period.toLowerCase() === 'pm' && hour24 !== 12)
      hour24 += 12;
    else if (period.toLowerCase() === 'am' && hour24 === 12)
      hour24 = 0;

    // const hour24Format = hour24.toString().padStart(2, '0') + ':' + minutes; //hour.match(/:(\d+)/)![1];

    return { hour: hour24.toString().padStart(2, '0'), min: Number(minutes) };
  }
}
