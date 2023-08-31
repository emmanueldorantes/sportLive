import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { Profile } from '../../../models/profile';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  query: string;
  variables: any;
  filtroNombre: string = '';
  pageSize: number = 20;
  currentPage: number = 1;
  profiles: Profile[] = [];

  constructor(
    private titleService: TitleService,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.titleService.setTitle('Perfiles / Lista de Perfiles');
    this.query = "";
    this.variables = {};
  }

  async ngOnInit() {
    this.setQuery();
    const profilesRows = await this.getProfiles();
    this.profiles = profilesRows;
  }

  async getProfiles(): Promise<any> {
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getProfiles;
  }

  setQuery() {
    this.query = `
      query {
        getProfiles(filters: {
          qry: {}
        }){
            _id,
            name,
            autoincrement
        }
    }`;
    this.variables = {
      module: 'profiles'
    };
  }

  async editarPerfil(id: string) {
    this.router.navigate(['/home/perfil', id]);
  }

  async eliminarPerfil(id: string, name: string) {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      width: '390px',
      data: {
        message: `¿Confirma que desea eliminar el perfil ${name}?`,
        ok: "Si",
        cancel: "No"
      }
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {

      } 
    });
  }
}
