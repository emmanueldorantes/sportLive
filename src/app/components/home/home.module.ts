import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MenuComponent } from '../menu/menu.component';
import { PerfilFormComponent } from '../perfiles/perfil-form/perfil-form.component';
import { ListaComponent } from '../perfiles/lista/lista.component';
import { UsuarioFormComponent } from '../usuarios/usuario-form/usuario-form.component';
import { ListaUsuariosComponent } from '../usuarios/lista-usuarios/lista-usuarios.component';
import { FormsModule} from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { FiltroPerfilPipe } from '../../pipes/filtro-perfil.pipe';
import { FiltroUsuarioPipe } from '../../pipes/filtro-usuario.pipe';
import { FieldformComponent } from '../field/fieldform/fieldform.component';
import { FieldlistComponent } from '../field/fieldlist/fieldlist.component';
import{TournamentformComponent}from '../Tournament/tournamentform/tournamentform.component';
import{TournamentlistComponent}from'../Tournament/tournamentlist/tournamentlist.component';
import {ReactiveFormsModule} from '@angular/forms';
import { TeamformComponent } from '../team/teamform/teamform.component';
import { TeamlistComponent }from '../team/teamlist/teamlist.component';


@NgModule({
  declarations: [
    HomeComponent,
    MenuComponent,
    PerfilFormComponent,
    ListaComponent,
    UsuarioFormComponent,
    ListaUsuariosComponent,
    FiltroPerfilPipe,
    FiltroUsuarioPipe,
    FieldformComponent,
    FieldlistComponent,
    TournamentlistComponent,
    TournamentformComponent,
    TeamformComponent,
    TeamlistComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
  ]
})
export class HomeModule { }
