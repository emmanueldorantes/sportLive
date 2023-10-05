import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroTorneo'
})
export class FiltroTorneoPipe implements PipeTransform {

  transform(items: any[], filterText: string): any[] {
    if (!items || !filterText) {
      return items;
    }

    filterText = filterText.toLowerCase();

    return items.filter(item => {
      let nombreMatch = item.nombre?.toLowerCase().includes(filterText) || false;
      
      // Logging para debug
      if (!item.dia) {
        console.log("Item sin dia:", item);
      }
      
      let diaMatch = item.dia?.toString().toLowerCase().includes(filterText) || false;

      // Logging para debug
      if (item.field && !item.field.name) {
        console.log("Item con field pero sin name:", item);
      }

      let horarioMatch = item.horario?.toLowerCase().includes(filterText) || false;
      let fieldMatch = item.field?.name?.toLowerCase().includes(filterText) || false;

      return nombreMatch || diaMatch || horarioMatch || fieldMatch;
    });
}
}
