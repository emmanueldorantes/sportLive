import { Component } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent {
  query: string;
  variables: any;
  filtroNombre: string = '';
  pageSize: number = 20;
  currentPage: number = 1;
  users: any;

  constructor(
    private titleService: TitleService,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.titleService.setTitle('Usuarios / Lista de Usuarios');
    this.query = "";
    this.variables = {};
  }

  async ngOnInit() {
    this.setQuery();
    const profilesRows = await this.getUsers();
    this.users = profilesRows;
  }

  async getUsers(): Promise<any> {
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getUsers;
  }

  setQuery() {
    this.query = `
      query {
        getUsers(filters: {
          qry: {}
        }){
            _id,
            name,
            lastName,
            mobile,
            email,
            state,
            city,
            status,
            autoincrement
        }
    }`;
    this.variables = {
      module: 'users'
    };
  }
}
