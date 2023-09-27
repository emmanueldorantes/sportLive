import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCancha'
})
export class FiltroCanchaPipe implements PipeTransform {

  transform(items: any[], filterText: string): any[] {
    if (!items || !filterText) {
      return items;
    }

    filterText = filterText.toLowerCase();
    console.log(filterText)
    return items.filter(item =>
      item.nombre.toLowerCase().includes(filterText) || item.dia.toLowerCase().includes(filterText) || item.horario.toLowerCase().includes(filterText)
    );
  }
}