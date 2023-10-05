import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroEquipo'
})
export class FiltroEquipoPipe implements PipeTransform {

  transform(items: any[], filterText: string): any[] {
    if (!items || !filterText) {
      return items;
    }

    filterText = filterText.toLowerCase();

    return items.filter(item =>
      item.nombre.toLowerCase().includes(filterText) ||
      item.field?.nombre.toLowerCase().includes(filterText) ||  // Cancha
      item.tournament?.nombre.toLowerCase().includes(filterText) || // Torneo
      item.status?.toString().toLowerCase().includes(filterText)  // Status (convertido a string y buscamos coincidencias parciales)
    );
  }
}
