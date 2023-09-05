import { Component } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  users: any = [];
  status: boolean;
  mutation: string;

  constructor(
    private titleService: TitleService,
    private snakBar: MatSnackBar,
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
    const usersRows = await this.getUsers();
    this.users = usersRows;
  }

  async getUsers(): Promise<any> {
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getUsers;
  }

  setQuery() {
    this.query = `
      query {
        getUsers(filters: {
          qry: {
            remove: false
          },
          inner: [
            { path: "state" },
            { path: "profile" }
          ]
        }){
            profile {
              _id,
              name
            },
            state {
              _id,
              name
            },
            _id,
            name,
            lastName,
            mobile,
            email,            
            city,
            status,
            autoincrement
        }
    }`;
    this.variables = {
      module: 'users'
    };
  }

  setUpdateStatus(id: string, status: boolean) {
    this.mutation = `
      mutation($id: ID!, $status: Boolean) {
        updateUser(_id: $id, input: {
          status: $status
        }){
            _id
        }
    }`;
    this.variables = {
      module: 'users',
      id,
      status
    };
  }

  setMutationDelete(id: string) {
    this.mutation = `
      mutation($id: ID!) {
        updateUser(_id: $id, input: {
          remove: true
        }){
            _id
        }
    }`;
    this.variables = {
      module: 'users',
      id
    };
  }

  editarUsuario(id: string) {
    this.router.navigate(['/home/usuario', id]);
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
          duration: 5000,
          horizontalPosition: "right",
          verticalPosition: "top"
        });
      } else {
        const user = this.users.find((user: any) => user._id === id);
        if (user)
          user.status = (!status) ? true : false;
      }
    });
  }
}
