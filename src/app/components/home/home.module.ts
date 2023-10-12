import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MenuComponent } from '../menu/menu.component';
import{LoginComponent}from '../login/login.component';
import { PerfilFormComponent } from '../perfiles/perfil-form/perfil-form.component';
import { ListaComponent } from '../perfiles/lista/lista.component';
import { UsuarioFormComponent } from '../usuarios/usuario-form/usuario-form.component';
import { ListaUsuariosComponent } from '../usuarios/lista-usuarios/lista-usuarios.component';
import { FiltroJugadorPipe } from 'src/app/pipes/filtro-jugador.pipe';
import { FiltroEquipoPipe } from 'src/app/pipes/filtro-equipo.pipe';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { FiltroPerfilPipe } from '../../pipes/filtro-perfil.pipe';
import { FiltroUsuarioPipe } from '../../pipes/filtro-usuario.pipe';
import { FiltroCanchaPipe } from '../../pipes/filtro-cancha.pipe';
import { FieldformComponent } from '../field/fieldform/fieldform.component';
import { FieldlistComponent } from '../field/fieldlist/fieldlist.component';
import { TournamentformComponent } from '../Tournament/tournamentform/tournamentform.component';
import { TournamentlistComponent } from '../Tournament/tournamentlist/tournamentlist.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TeamformComponent } from '../team/teamform/teamform.component';
import { TeamlistComponent } from '../team/teamlist/teamlist.component';
import { PlayerformComponent } from '../player/playerform/playerform.component';
import { PlayerlistComponent } from '../player/playerlist/playerlist.component';
import { JornadasComponent } from '../programar/jornadas/jornadas.component';
import { CalendarioComponent } from '../programar/calendario/calendario.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent,
    MenuComponent,
    PerfilFormComponent,
    ListaComponent,
    UsuarioFormComponent,
    ListaUsuariosComponent,
    FiltroPerfilPipe,
    FiltroUsuarioPipe,
    FiltroJugadorPipe,
    FiltroCanchaPipe,
    FiltroEquipoPipe,
    FieldformComponent,
    FieldlistComponent,
    TournamentlistComponent,
    TournamentformComponent,
    TeamformComponent,
    TeamlistComponent,
    PlayerformComponent,
    PlayerlistComponent,
    JornadasComponent,
    CalendarioComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    HttpClientModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    
  ]
})
export class HomeModule { }
