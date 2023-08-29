import { Component } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent {
  constructor(
    private titleService: TitleService
  ){
    this.titleService.setTitle('Perfiles / Lista de Perfiles');
  }
}
