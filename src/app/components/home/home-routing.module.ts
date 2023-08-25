import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { authGuard } from '../../guards/auth.guard';
import { authChildGuard } from '../../guards/auth-child.guard';

const routes: Routes = [
    {
        path: '', component: HomeComponent, canActivate: [authGuard], canActivateChild: [authChildGuard],
        children: []
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule { }
