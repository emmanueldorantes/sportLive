import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-teamlist',
  templateUrl: './teamlist.component.html',
  styleUrls: ['./teamlist.component.css']
})
export class TeamlistComponent implements OnInit {

  query: string;
  variables: any;
  filtroNombre: string = '';
  pageSize: number = 20;
  currentPage: number = 1;
  teams: any = [];
  status: boolean;
  mutation: string;

  constructor(
    
    private titleService: TitleService,
    private snakBar: MatSnackBar,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private router: Router
    
    ) {

      this.titleService.setTitle('Equipo / Lista de Torneo');
      this.query = "";
      this.variables = {};
    }
    async ngOnInit() {
      this.setQuery();
      const teamsRows = await this.getTeams();
      this.teams = teamsRows;
  
      let scriptElement1 = document.createElement('script');
    scriptElement1.src = "../../../assets/js/pages/form_checkboxes_radios.js";
    document.body.appendChild(scriptElement1);
    }

    async getTeams(): Promise<any> {
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getTeams;
    }
  
      setQuery() {
       this.query = `
    query {
      getTeams(filters: {
        qry: {
        },
        inner: [
          { path: "field" },
          { path: "tournament" }
        ]
      }){
        field {
          _id,
          nombre
        },
        tournament {
          _id,
          nombre
        },
        _id,
        nombre, 
        status,
        autoincrement
      }
    }`;
      this.variables = {
        module: 'teams'
      };
    }
  
    setUpdateStatus(id: string, status: boolean) {
      this.mutation = `
        mutation($id: ID!, $status: Boolean) {
          updateTeam(_id: $id, input: {
            status: $status
          }){
              _id
          }
      }`;
      this.variables = {
        module: 'teams',
        id,
        status
      };
    }
  
    setMutationDelete(id: string) {
      this.mutation = `
        mutation($id: ID!) {
          updateTeams(_id: $id, input: {
            delete: true
          }){
              _id
          }
      }`;
      this.variables = {
        module: 'teams',
        id
      };
    }
  
    editarUsuario(id: string) {
      this.router.navigate(['/home/teamform', id]);
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
          message: `¿Confirma que desea ${textStatus} al equipo?`,
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
          const team = this.teams.find((team: any) => team._id === id);
          if (team)
          team.status = (status) ? false : true;
        }
      });
    }
  }
  