import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MenuComponent } from '../menu/menu.component';
import { PerfilFormComponent } from '../perfiles/perfil-form/perfil-form.component';
import { ListaComponent } from '../perfiles/lista/lista.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { FiltroPerfilPipe } from '../../pipes/filtro-perfil.pipe';

@NgModule({
  declarations: [
    HomeComponent,
    MenuComponent,
    PerfilFormComponent,
    ListaComponent,
    FiltroPerfilPipe
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
