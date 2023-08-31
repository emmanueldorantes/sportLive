import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPerfil'
})
export class FiltroPerfilPipe implements PipeTransform {

  transform(items: any[], filterText: string): any[] {
    if (!items || !filterText) {
      return items;
    }

    filterText = filterText.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(filterText) 
    );
  }
}
// ||       item.email.toLowerCase().includes(filterText)