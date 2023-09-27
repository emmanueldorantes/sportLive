import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tournamentlist',
  templateUrl: './tournamentlist.component.html',
  styleUrls: ['./tournamentlist.component.css']
})
export class TournamentlistComponent {

  query: string;
  variables: any;
  filtroNombre: string = '';
  pageSize: number = 20;
  currentPage: number = 1;
  tournaments: any = [];
  tournament: any;
  status: boolean;
  mutation: string;
  field: any;
  fields: any = [];
  disabledTournament: boolean = true;

  
  constructor(
    private titleService: TitleService,
    private snakBar: MatSnackBar,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private router: Router
    ) {

      this.titleService.setTitle('Torneo / Lista de Torneo');
      this.query = "";
      this.variables = {};
      

    }
    async ngOnInit() {
      this.setQuery();
      //const tournamentsRows = await this.getTournaments();
      //this.tournaments = tournamentsRows;
      this.fields = await this.getFields();
      this.field = "";
  
      let scriptElement1 = document.createElement('script');
      document.body.appendChild(scriptElement1);
    }

    async getFields(): Promise<any> {
      this.setQryFields();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getFields;
    }

    setQryFields() {
      this.query = `
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
    async getTournaments(): Promise<any> {
      this.setQuery();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getTournaments;
    }

    async changeFields(): Promise<any> {
      if (this.field) {
        this.disabledTournament = false;
        this.tournaments = await this.getTournaments();
      } else {
        this.disabledTournament = true;
        this.tournaments = [];
      }
    }
  
      setQuery() {
        this.query = `
        query($idField: ID!) {
          getTournaments(filters: {
            qry: {
              field: $idField
            },
            inner:[
              {path: "field"}
            ]
          }){
              _id,
              nombre,
              field {_id, nombre},
              autoincrement,
              dia,
              horario,
              status 
          }
        }`;
        this.variables = {
          module: 'tournaments',
          idField: this.field
        };
    }
  
    setUpdateStatus(id: string, status: boolean) {
      this.mutation = `
        mutation($id: ID!, $status: Boolean) {
          updateTournament(_id: $id, input: {
            status: $status
          }){
              _id
          }
      }`;
      this.variables = {
        module: 'tournaments',
        id,
        status
      };
    }
  
    setMutationDelete(id: string) {
      this.mutation = `
        mutation($id: ID!) {
          updateTournament(_id: $id, input: {
            delete: true
          }){
              _id
          }
      }`;
      this.variables = {
        module: 'tournaments',
        id
      };
    }
  
    editarUsuario(id: string) {
      this.router.navigate(['/home/tournamentform', id]);
    }
  
    eliminarUsuario(id: string, name: string) {
      const dialog = this.dialog.open(ConfirmDialogComponent, {
        width: '390px',
        data: {
          message: `¿Confirma que desea eliminar el usuario ${name}?`,
          ok: "Si",
          cancel: "No"
        }
      });
  
      dialog.afterClosed().subscribe(async result => {
        if (result) {
          this.setMutationDelete(id);
          await this.graphqlService.post(this.mutation, this.variables);
          window.location.reload();
        }
      });
    }
  
    changeStatus(id: string, status: boolean) {
      const textStatus = (status) ? 'habilitar' : 'deshabilitar';
      const dialog = this.dialog.open(ConfirmDialogComponent, {
        width: '390px',
        data: {
          message: `¿Confirma que desea ${textStatus} al usuario?`,
          ok: "Si",
          cancel: "No"
        }
      });
  
      dialog.afterClosed().subscribe(async (result) => {
        if (result) {
              this.setUpdateStatus(id, status);
              let response = await this.graphqlService.post(this.mutation, this.variables);
              this.snakBar.open("Se cambio el estatus correctamente.", "Aceptar", {
                duration: 0,
                horizontalPosition: "center",
                verticalPosition: "bottom"
              });
        } else {
          const tournament = this.tournaments.find((tournament: any) => tournament._id === id);
          if (tournament)
          tournament.status = (status) ? false : true;
        }
      });
    }
  }
  