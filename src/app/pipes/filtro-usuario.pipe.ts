import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroUsuario'
})
export class FiltroUsuarioPipe implements PipeTransform {

  transform(items: any[], filterText: string): any[] {
    if (!items || !filterText) {
      return items;
    }

    filterText = filterText.toLowerCase();
    console.log(filterText)
    return items.filter(item =>
      item.name.toLowerCase().includes(filterText) || item.email.toLowerCase().includes(filterText) || item.mobile.toLowerCase().includes(filterText)
    );
  }
}