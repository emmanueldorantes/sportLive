import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-perfil-form',
  templateUrl: './perfil-form.component.html',
  styleUrls: ['./perfil-form.component.css']
})
export class PerfilFormComponent {
  constructor(
    private titleService: TitleService
  ) {
    this.titleService.setTitle('Perfiles / Nuevo Perfil');
  }
}