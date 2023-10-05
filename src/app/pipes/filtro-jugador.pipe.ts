import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroJugador'
})
export class FiltroJugadorPipe implements PipeTransform {

  transform(items: any[], filterText: string): any[] {
    if (!items || !filterText) {
      return items;
    }

    filterText = filterText.toLowerCase();
    
    return items.filter(item => 
      item.nombre.toLowerCase().includes(filterText) ||
      item.apellidos.toLowerCase().includes(filterText) ||
      item.field?.nombre.toLowerCase().includes(filterText) ||  // Cancha
      item.tournament?.nombre.toLowerCase().includes(filterText) || // Torneo
      item.team?.nombre.toLowerCase().includes(filterText)  // Equipo
    );
  }
}
