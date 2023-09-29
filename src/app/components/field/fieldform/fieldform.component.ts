import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../../services/title.service';
import { UploadService } from '../../../services/upload.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxImageCompressService } from 'ngx-image-compress';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-fieldform',
  templateUrl: './fieldform.component.html',
  styleUrls: ['./fieldform.component.css']
})
export class FieldformComponent implements OnInit {

  fieldForm:FormGroup;
  isCreating: boolean = true;
  srcImage: string;
  query: string;
  mutation: string;
  variables: any;
  // Inforamcion de la Cancha
  nombre: string;
  telefono:  string;
  // Informacion de Contacto
  contactonombre: string;
  contactoapellidos: string;
  contactocelular: string;
  contactocorreo : string;
//Informacion de Propietario
  user: any;
  listUsers: any;
  displayedImageUrl: string;
  fieldId: any = '';
  file: any;
  selectedFile: File | null = null;
  
  constructor(
    private fb: FormBuilder,
    private titleService: TitleService,
    private uploadService: UploadService,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private snakBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private imageCompress: NgxImageCompressService
  ) {

    //Para validar que son campos requeridos o no

    this.titleService.setTitle('Cancha / Nueva Cancha');
    this.srcImage = "../../../../assets/images/user_default.png";
    this.fieldForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono:  ['', Validators.required],
      contactonombre: ['', Validators.required],
      contactoapellidos: ['', Validators.required],
      contactocelular: ['', Validators.required],
      contactocorreo : ['', Validators.required],
      propietarionombre: ['', Validators.required],
      propietarioapellidos:['', Validators.required],
      propietariocorreo:['', Validators.required],
      propietariotelefono:['', Validators.required],
    });
   
    this.nombre = '';
    this.telefono = '';
    this.contactonombre = '';
    this.contactoapellidos = ''; 
    this.contactocelular = ''; 
    this.contactocorreo = "";
    this.mutation = "";
    this.user='';
  }

  async ngOnInit() {
    console.log(this.user);
    this.listUsers = await this.getUsers();
    this.route.params.subscribe(async params => {
      this.fieldId = params['id'];
      this.isCreating = (this.fieldId !== undefined) ? false : true;
      if (!this.isCreating) {
        this.titleService.setTitle('Canchas  / Editar Usuario');
       let datafield = await this.getField();
       console.log(datafield)
        this.nombre = datafield.nombre;
        this.user = datafield.user._id;
        this.telefono = datafield.telefono;
        this.contactonombre = datafield.contactonombre;
        this.contactoapellidos = datafield.contactoapellidos;
        this.contactocelular = datafield.contactocelular;
        this.contactocorreo = datafield.contactocorreo;
        this.displayedImageUrl =  datafield.photo ? `${environment.fileManager}/${datafield.photo}` : `${environment.fileManager}/user_default.png`;
      } else {
        this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
      }
    });
  }

  onSubmit() {
    if (this.fieldForm.status === 'VALID') {
      // let pathFile = this.userForm.get('file')?.value;
      if (this.isCreating) {
        this.setMutationInsert();
        this.saveField();
      } else {
        this.setMutationUpdate();
        this.updateField();
      }
    } else {
      this.snakBar.open("Verifique que los campo obligatorios esten capturados.", "Aceptar", {
        duration: 0,
        horizontalPosition: "center",
        verticalPosition: "bottom"
      });
    }
  }
  async getUsers() {
    this.setQueryUsers();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getUsers;
  }

  async updateField() {
    let response = await this.graphqlService.post(this.mutation, this.variables);
    const miSnackBar = this.snakBar.open("El usuario ha sido modificado correctamente.", "Aceptar", {
      duration: 0,
      horizontalPosition: "center",
      verticalPosition: "bottom"
    });
    if (this.selectedFile) {
      const resizedImage = await this.resizeImage(this.selectedFile);
      const formData = new FormData();
      formData.append('image', resizedImage, `${this.fieldId}_${this.selectedFile?.name}`);
      let responseUpload = await this.uploadService.post(formData);
      if (responseUpload && responseUpload.ok) {
        this.displayedImageUrl = `${environment.fileManager}/image-${this.fieldId}_${this.selectedFile?.name}`;
        this.setMutationUpdateImage();
        await this.graphqlService.post(this.mutation, this.variables);
      }
    }
    miSnackBar.onAction().subscribe(() => {
      this.router.navigateByUrl('/home/fieldlist');
    });
  }

  async saveField() {
    try {
      let response = await this.graphqlService.post(this.mutation, this.variables);
      let fieldDocument = response.data.createField;
      const dialog = this.dialog.open(ConfirmDialogComponent, {
        width: '390px',
        data: {
          message: `La cancha ${fieldDocument.nombre} ha sido creado correctamente.`,
          question: "¿Deseas agregar otro Usuario?",
          ok: "Si",
          cancel: "No"
        }
      });
      if (this.selectedFile) {
        const resizedImage = await this.resizeImage(this.selectedFile);
         const formData = new FormData();
         console.log (`${fieldDocument._id}_${this.selectedFile?.name}`)
         formData.append('image', resizedImage, `${fieldDocument._id}_${this.selectedFile?.name}`);
         let responseUpload = await this.uploadService.post(formData);
          if (responseUpload && responseUpload.ok) {
          this.displayedImageUrl = `${environment.fileManager}/image-${fieldDocument._id}_${this.selectedFile?.name}`;
          this.setMutationUpdateImage(fieldDocument._id);
          await this.graphqlService.post(this.mutation, this.variables);
          }
        }
      dialog.afterClosed().subscribe(async result => {
        if (result) {
          this.cleanForm();
          
        } else {
          this.router.navigateByUrl('/home/fieldlist');
        }
      });
    } catch (error) {
      console.log(error);
    }
    
  }

  async getField() {
    this.setQueryField();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getField;
  }

  cleanForm() {
    this.user='';
    this.nombre = '';
    this.telefono = '';
    this.contactonombre = '';
    this.contactoapellidos = ''; 
    this.contactocelular = ''; 
    this.contactocorreo = "";
    this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
  }

  setMutationInsert() {
    this.mutation = `
      mutation(
        $nombre: String!,
        $telefono: String!,
        $contactonombre: String!,
        $contactoapellidos: String!,
        $contactocelular: String!,
        $contactocorreo: String!,
        $propietarionombre: String!,
        $propietarioapellidos: String!,
        $propietariocorreo: String!,
        $propietariotelefono: String!) {
        createField(input: {
          nombre: $nombre,
          telefono: $telefono,
          contactonombre: $contactonombre,
          contactoapellidos: $contactoapellidos,
          contactocelular: $contactocelular,
          contactocorreo: $contactocorreo,
        }){
          _id,
          nombre
        }
      }`;
    this.variables = {
      module: 'field',
      nombre: this.nombre,
      telefono: this.telefono,
      contactonombre: this.contactonombre,
      contactoapellidos: this.contactoapellidos,
      contactocelular: this.contactocelular,
      contactocorreo: this.contactocorreo,
    };

  }
  setQueryUsers() {
    this.query = `
    query getUsersByProfileId($profileId: ID!) {
      getUsers(filters: {
        qry: { profile: $profileId },
      inner: [
            { path: "profile" }
          ]
        }){
            profile {
              _id
            },
            _id,
            name,
        }
    }`;
    this.variables = {
      profileId:'64f20c5400ac95c034f70517',
      module: 'users'
    };
  }

    setQueryField() {
      this.query = `
      query($id: ID!) {
        getField(_id: $id, filters: {}){
              _id,
              nombre,
              telefono,
              contactonombre,
              contactoapellidos,
              contactocelular,
              contactocorreo,
              propietarionombre,
              propietarioapellidos,
              propietariocorreo,
              photo,
              propietariotelefono
              }
      }`;
      this.variables = {
        module: 'field',
        id: this.fieldId
      };
    } 

    setMutationUpdate() {
     this.mutation = `
    mutation(
    $id: ID!,
    $nombre: String!,
    $telefono: String!,
    $contactonombre: String!,
    $contactoapellidos: String!,
    $contactocelular: String!,
    $contactocorreo: String!,
    $propietarionombre: String!,
    $propietarioapellidos: String!,
    $propietariocorreo: String!,
    $propietariotelefono: String!) {
      updateField(_id: $id, input: {
      nombre: $nombre,
      telefono: $telefono,
      contactonombre: $contactonombre,
      contactoapellidos: $contactoapellidos,
      contactocelular: $contactocelular,
      contactocorreo: $contactocorreo,
      propietarionombre: $propietarionombre,
      propietarioapellidos: $propietarioapellidos,
      propietariocorreo: $propietariocorreo,
      propietariotelefono: $propietariotelefono
    }){
      _id,
      nombre
    }
  }`;
this.variables = {
  
  module: 'field',
  id: this.fieldId,
  nombre: this.nombre,
  telefono: this.telefono,
  contactonombre: this.contactonombre,
  contactoapellidos: this.contactoapellidos,
  contactocelular: this.contactocelular,
  contactocorreo: this.contactocorreo,
};

}
setMutationUpdateImage(id?: any) {
  this.mutation = `
  mutation(
    $id: ID!,
    $photo: String!
  ) {
    updateField(_id: $id, input: {
      photo: $photo        
    }){
        _id
    }
}`;
let image = id ? `image-${id}_${this.selectedFile?.name}` : `image-${this.fieldId}_${this.selectedFile?.name}`;
  this.variables = {
    module: 'field',
    id: id || this.fieldId,
    photo: image
  };

}
onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
}
async resizeImage(image: File): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx: any = canvas.getContext('2d');

        // Define las dimensiones de redimensión
        const maxWidth = 180;
        const maxHeight = 180;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convierte la imagen en un Blob redimensionado
        canvas.toBlob((blob: any) => {
          resolve(blob);
        }, image.type);
      };
    };
    reader.readAsDataURL(image);
  });
}
}






