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
  name: string;
  lastName:  string;
  email:  string;
  mobile:  string;
  displayedImageUrl: string;
  fieldId: any = '';
  file: any;
  selectedFile: File | null = null;
  field: {
    name: string;
    telefono: string;
    contacto: {
      name: string;
      apellidos: string;
      celular: string;
      correo: string;
      
    };
    propietario: {
      name: string;
      apellidos: string;
      correo: string;
      telefono: string;
    };
    imagenLogotipo: File | null;  
  } = {
    name: '',
    telefono: '',
    contacto: {
      name: '',
      apellidos: '',
      celular: '',
      correo: ''
    },
    propietario: {
      name: '',
      apellidos: '',
      correo: '',
      telefono: ''
    },
    imagenLogotipo: null  
  };

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
    
   
    this.name = '';
    this.lastName = '';
    this.email = '';
    this.mobile = ''; 
    this.query = "";
    this.mutation = "";
  }

  async ngOnInit() {
    
    this.route.params.subscribe(async params => {
      this.fieldId = params['id'];
      this.isCreating = (this.fieldId !== undefined) ? false : true;
      if (!this.isCreating) {
        this.titleService.setTitle('Usuarios / Editar Usuario');
        let dataUser = await this.getField();
        this.name = dataUser.name;
        this.lastName = dataUser.lastName;
        this.email = dataUser.email;
        this.mobile = dataUser.mobile;
        this.displayedImageUrl = `${environment.fileManager}/${dataUser.photo}`;
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
        this.saveUser();
      } else {
        this.setMutationUpdate();
        this.updateField();
      }
    } else {
      this.snakBar.open("Verifique que los campo obligatorios esten capturados.", "Aceptar", {
        duration: 5000,
        horizontalPosition: "right",
        verticalPosition: "top"
      });
    }
  }
  async saveUser() {
    try {
      let response = await this.graphqlService.post(this.mutation, this.variables);
      let fieldDocument = response.data.createUser;
      const dialog = this.dialog.open(ConfirmDialogComponent, {
        width: '390px',
        data: {
          message: `La cancha ${fieldDocument.name} ha sido creado correctamente.`,
          question: "¿Deseas agregar otro Usuario?",
          ok: "Si",
          cancel: "No"
        }
      });

      dialog.afterClosed().subscribe(async result => {
        if (result) {
          this.cleanForm();
          if (this.selectedFile) {
            const resizedImage = await this.resizeImage(this.selectedFile);
            const formData = new FormData();
            formData.append('image', resizedImage, `${fieldDocument._id}_${this.selectedFile?.name}`);
            let responseUpload = await this.uploadService.post(formData);
            if (responseUpload && responseUpload.ok) {
              this.displayedImageUrl = `${environment.fileManager}/image-${fieldDocument._id}_${this.selectedFile?.name}`;
              this.setMutationUpdateImage(fieldDocument._id);
              await this.graphqlService.post(this.mutation, this.variables);
            }
          }
        } else {
          this.router.navigateByUrl('/home/usuarios');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updateField() {
    let response = await this.graphqlService.post(this.mutation, this.variables);
    const miSnackBar = this.snakBar.open("La cancha ha sido modificado correctamente.", "Aceptar", {
      duration: 0,
      horizontalPosition: "right",
      verticalPosition: "top"
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
      this.router.navigateByUrl('/home/usuarios');
    });
  }

  async getField() {
    this.setQueryUser();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getUser;
  }

  cleanForm() {
    this.name = "";
    this.lastName = "";
    this.email = "";
    this.mobile = "";
    this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
  }

  setMutationInsert() {
    this.mutation = `
      mutation(
        $profile: ID!, 
        $name: String!, 
        $lastName: String, 
        $email: String!, 
        $mobile: String!, 
        $state: ID!, 
        $city: String!,
          name: $name, 
          lastName: $lastName, 
          email: $email, 
          mobile: $mobile, 

        }){
            _id,
            name
        }
    }`;
    this.variables = {
      module: 'fields',
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      mobile: `${this.mobile}`,
    };
  }

  setQueryUser() {
    this.query = `
    query($id: ID!) {
      getUser(_id: $id, filters: {
        inner: [
          { path: "profile" }          
        ]
      }){
          _id,
          name,
          profile {
            _id
          },
          state {
            _id
          },
          lastName,
          email,
          mobile,
          gender,
          city,
          photo
      }
    }`;
    this.variables = {
      module: 'fields',
      id: this.fieldId
    };
  }

  setMutationUpdate() {
    this.mutation = `
    mutation(
      $id: ID!,
      $profile: ID!, 
      $name: String!, 
      $lastName: String, 
      $email: String!, 
      $mobile: String!, 
      $state: ID!, 
      $city: String!,
      $gender: String!
    ) {
      updateUser(_id: $id, input: {
        profile: $profile, 
        name: $name, 
        lastName: $lastName, 
        email: $email, 
        mobile: $mobile, 
        state: $state, 
        city: $city,
        gender: $gender        
      }){
          _id,
          name
      }
  }`;
    this.variables = {
      module: 'fields',
      id: this.fieldId,
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      mobile: `${this.mobile}`,
    };
  }

  setMutationUpdateImage(id?: any) {
    this.mutation = `
    mutation(
      $id: ID!,
      $photo: String!
    ) {
      updateUser(_id: $id, input: {
        photo: $photo        
      }){
          _id
      }
  }`;
    this.variables = {
      module: 'fields',
      id: id || this.fieldId,
      photo: `image-${this.fieldId}_${this.selectedFile?.name}`
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
