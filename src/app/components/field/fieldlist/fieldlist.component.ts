import { Component } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-fieldlist',
  templateUrl: './fieldlist.component.html',
  styleUrls: ['./fieldlist.component.css']
})

export class FieldlistComponent {
  query: string;
  variables: any;
  filtroNombre: string = '';
  pageSize: number = 20;
  currentPage: number = 1;
  fields: any = [];
  status: boolean;
  mutation: string;
  

  constructor(
    private titleService: TitleService,
    private snakBar: MatSnackBar,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.titleService.setTitle('Cancha / Lista de Cancha');
    this.query = "";
    this.variables = {};
  }

  async ngOnInit() {
    this.setQuery();
    const fieldsRows = await this.getFields();
    this.fields = fieldsRows;
  }

  async getFields(): Promise<any> {
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getFields;
  }

  setQuery() {
    this.query = `
      query {
        getFields(filters: {
            remove: false   
        }){
          _id,
          nombre,
          autoincrement
        }
    }`;
    this.variables = {
      module: 'field'
    };
  }

  setUpdateStatus(id: string, status: boolean) {
    this.mutation = `
      mutation($id: ID!, $status: Boolean) {
        updateField(_id: $id, input: {
          status: $status
        }){
            _id
        }
    }`;
    this.variables = {
      module: 'field',
      id,
      status
    };
  }

  setMutationDelete(id: string) {
    this.mutation = `
      mutation($id: ID!) {
        updateField(_id: $id, input: {
          remove: true
        }){
            _id
        }
    }`;
    this.variables = {
      module: 'field',
      id
    };
  }

  editarCancha(id: string) {
    this.router.navigate(['/home/fieldform', id]);
  }

  eliminarCancha(id: string, nombre: string) {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      width: '390px',
      data: {
        message: `¿Confirma que desea eliminar el usuario ${nombre}?`,
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
        message: `¿Confirma que desea ${textStatus} la cancha?`,
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
        const field = this.fields.find((field: any) => field._id === id);
        if (field)
        field.status = (!status) ? true : false;
      }
    });
  }
}
