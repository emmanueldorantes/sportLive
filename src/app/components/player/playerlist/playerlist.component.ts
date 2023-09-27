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

  this.fields = await this.getFields();
  this.teams = await this.getTeams();
this.tournaments = await this.getTournaments();


    this.setQuery();
    const playersRows = await this.getPlayers();
    this.players = playersRows;
  }

  async getPlayers(): Promise<any> {
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getPlayers;
  }

  async onFieldChange() {
    // Actualizar tu consulta con el valor de selectedField y refrescar la lista de jugadores.
      this.setQuery(this.selectedField);
      const playersRows = await this.getPlayers();
      this.players = playersRows;
  }

  async onTournamentChange() {
    // Asumiendo que 'selectedTournament' contiene el ID del torneo seleccionado.
    // El primer parámetro de 'setQuery' es para 'field', así que lo pasamos como 'null'.
    this.setQuery(null, this.selectedTournament);
    
    const playersRows = await this.getPlayers();
    this.players = playersRows;
}


async onTeamChange() {
  // Asumiendo que 'selectedTeam' contiene el ID del equipo seleccionado.
  // El primer y segundo parámetro de 'setQuery' son para 'field' y 'tournament', respectivamente. 
  // Por eso, ambos se pasan como 'null' aquí.
  this.setQuery(null, null, this.selectedTeam);
  
  const playersRows = await this.getPlayers();
  this.players = playersRows;
}

  async getFields() {
    this.setQueryFields();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getFields;
  }

  async getTeams() {
    this.setQueryTeams();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getTeams;
  }

  async getTournaments() {
    this.setQueryTournaments();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getTournaments;
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
  
  setQuery(fieldId: string | null = null, tournamentId: string | null = null, teamId: string | null = null) {
    // Aquí vamos a construir las condiciones de filtrado:
    let conditions: string[] = [];
    
    if (fieldId) {
        conditions.push(`field: "${fieldId}"`);
    }

    if (tournamentId) {
        conditions.push(`tournament: "${tournamentId}"`);
    }

    if (teamId) {
        conditions.push(`team: "${teamId}"`);
    }

    // Convertimos las condiciones en una cadena:
    const conditionString = conditions.join(', ');

    this.query = `
    query {
      getPlayers(filters: {
        qry: {
          ${conditionString}
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


