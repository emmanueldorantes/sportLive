import { Component } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-playerlist',
  templateUrl: './playerlist.component.html',
  styleUrls: ['./playerlist.component.css']
})
export class PlayerlistComponent {

  query: string;
  variables: any;
  filtroNombre: string = '';
  pageSize: number = 20;
  currentPage: number = 1;
  players: any = [];
  status: boolean;
  mutation: string;
  selectedField: string;
  selectedTournament: string;
  selectedTeam: string;
  fields: any[] = []; // Asume que obtendrás esta lista desde tu API
  tournaments: any[] = []; // Asume que obtendrás esta lista desde tu API
  teams: any[] = []; // Asume que obtendrás esta lista desde tu API
  listfields: any;
  listtournaments: any;
  listteams: any;


  constructor(
    
    private titleService: TitleService,
    private snakBar: MatSnackBar,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.titleService.setTitle('Jugadores / Lista de Jugadores');
    this.query = "";
    this.variables = {};
  }
    
  async ngOnInit() {
  this.setQuery();
    const playersRows = await this.getPlayers();
    this.players = playersRows;
    let scriptElement1 = document.createElement('script');
    scriptElement1.src = "../../../assets/js/pages/form_checkboxes_radios.js";
    document.body.appendChild(scriptElement1);
  }

  async getPlayers(): Promise<any> {
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getPlayers;
  }

  setQueryFields() {
    this.query = `
    query {
      getFields(filters: {
      }){
          _id,
          nombre,
      }
    }`;
    this.variables = {
      module: 'field'
    };
  }

  setQueryTeams() {
    this.query = `
    query {
      getTeams(filters: {
      }){
          _id,
          nombre          
      }
    }`;
    this.variables = {
      module: 'teams'
    };
  }

  setQueryTournaments() {
    this.query = `
    query {
      getTournaments(filters: {
      }){
          _id,
          nombre          
      }
    }`;
    this.variables = {
      module: 'tournaments'
    };
  }
  
  setQuery() {
    this.query = `
    query {
      getPlayers(filters: {
        qry: {
        },
        inner: [
          { path: "field" },
          { path: "tournament" },
          { path: "team" }
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
        team {
          _id,
          nombre
        },
        _id,
        nombre, 
        status,
        apellidos,
        autoincrement
      }
    }`;

    this.variables = {
        module: 'players'
    };
}

  setUpdateStatus(id: string, status: boolean) {
    this.mutation = `
      mutation($id: ID!, $status: Boolean) {
        updatePlayer(_id: $id, input: {
          status: $status
        }){
            _id
        }
    }`;
    this.variables = {
      module: 'players',
      id,
      status
    };
  }

  setMutationDelete(id: string) {
    this.mutation = `
      mutation($id: ID!) {
        updatePlayer(_id: $id, input: {
          delete: true
        }){
            _id
        }
    }`;
    this.variables = {
      module: 'players',
      id
    };
  }

  editarJugador(id: string) {
    this.router.navigate(['/home/playerform', id]);
  }

  eliminarJugador(id: string, nombre: string) {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      width: '390px',
      data: {
        message: `¿Confirma que desea eliminar el jugador ${nombre}?`,
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
        message: `¿Confirma que desea ${textStatus} la jugador?`,
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
        const player = this.players.find((field: any) => field._id === id);
        if (player)
        player.status = (!status) ? true : false;
      }
    });
  }
}


