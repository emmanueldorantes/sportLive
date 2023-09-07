import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service'; // Asegúrate de actualizar la ruta

@Component({
  selector: 'app-fieldform',
  templateUrl: './fieldform.component.html',
  styleUrls: ['./fieldform.component.css']
})
export class FieldformComponent implements OnInit {

  field: {
    name: string;
    telefono: string;
    contacto: {
      nombre: string;
      apellidos: string;
      celular: string;
      correo: string;
    };
    propietario: {
      nombre: string;
      apellidos: string;
      correo: string;
      telefono: string;
    };
    imagenLogotipo: File | null;  
  } = {
    name: '',
    telefono: '',
    contacto: {
      nombre: '',
      apellidos: '',
      celular: '',
      correo: ''
    },
    propietario: {
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: ''
    },
    imagenLogotipo: null  
  };

  constructor(private titleService: TitleService, private graphqlService: GraphqlService) {}

  ngOnInit(): void {
    this.titleService.setTitle('Cancha / Nueva Cancha');
  }

  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.field.imagenLogotipo = file;
    }
  }

  onSubmit(): void {
    const fieldInput = {
      name: this.field.name,
      phone: this.field.telefono,
      contact: {
        name: this.field.contacto.nombre,
        lastName: this.field.contacto.apellidos,
        mobile: this.field.contacto.celular,
        email: this.field.contacto.correo
      },
      owner: {
        name: this.field.propietario.nombre,
        lastName: this.field.propietario.apellidos,
        email: this.field.propietario.correo,
        phone: this.field.propietario.telefono
      },
      // Asumiendo que la imagen se guarda como una URL o una ruta en el servidor
      logoImage: this.field.imagenLogotipo?.name || null 
    };
             console.log(fieldInput)

    

  
  }
}
