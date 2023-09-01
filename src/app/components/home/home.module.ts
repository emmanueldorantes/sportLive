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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { FiltroPerfilPipe } from '../../pipes/filtro-perfil.pipe';
import { FieldformComponent } from '../field/fieldform/fieldform.component';
import { FieldlistComponent } from '../field/fieldlist/fieldlist.component';

@NgModule({
  declarations: [
    HomeComponent,
    MenuComponent,
    PerfilFormComponent,
    ListaComponent,
    UsuarioFormComponent,
    ListaUsuariosComponent,
    FiltroPerfilPipe,
    FieldformComponent,
    FieldlistComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class HomeModule { }
