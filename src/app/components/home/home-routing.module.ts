import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { PerfilFormComponent } from '../perfiles/perfil-form/perfil-form.component';
import { ListaComponent } from '../perfiles/lista/lista.component';
import { UsuarioFormComponent } from '../usuarios/usuario-form/usuario-form.component';
import { ListaUsuariosComponent } from '../usuarios/lista-usuarios/lista-usuarios.component';
import { authGuard } from '../../guards/auth.guard';
import { authChildGuard } from '../../guards/auth-child.guard';
import {FieldformComponent}from '../field/fieldform/fieldform.component';
import {FieldlistComponent}from '../field/fieldlist/fieldlist.component';

const routes: Routes = [
    {
        path: '', component: HomeComponent, canActivate: [authGuard], canActivateChild: [authChildGuard],
        children: [
            { path: 'perfil', component: PerfilFormComponent, canActivate: [authGuard] },
            { path: 'perfil/:id', component: PerfilFormComponent, canActivate: [authGuard] },
            { path: 'perfiles', component: ListaComponent, canActivate: [authGuard] },
            { path: 'usuario', component: UsuarioFormComponent, canActivate: [authGuard] },
            { path: 'usuario/:id', component: UsuarioFormComponent, canActivate: [authGuard] },
            { path: 'usuarios', component: ListaUsuariosComponent, canActivate: [authGuard] },
            { path: 'fieldlist', component: FieldlistComponent, canActivate: [authGuard] },
            { path: 'fieldform', component: FieldformComponent, canActivate: [authGuard] }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule { }
