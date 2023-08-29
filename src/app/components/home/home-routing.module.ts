import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { PerfilFormComponent } from '../perfiles/perfil-form/perfil-form.component';
import { ListaComponent } from '../perfiles/lista/lista.component';
import { authGuard } from '../../guards/auth.guard';
import { authChildGuard } from '../../guards/auth-child.guard';

const routes: Routes = [
    {
        path: '', component: HomeComponent, canActivate: [authGuard], canActivateChild: [authChildGuard],
        children: [
            { path: 'perfil', component: PerfilFormComponent, canActivate: [authGuard] },
            { path: 'perfiles', component: ListaComponent, canActivate: [authGuard] }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule { }
