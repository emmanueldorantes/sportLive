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
  onFileSelected: any= "";
  // Inforamcion de la Cancha
  nombre: string;
  telefono:  string;
  // Informacion de Contacto
  contactonombre: string;
  contactoapellidos: string;
  contactocelular: string;
  contactocorreo : string;
//Informacion de Propietario
  propietarionombre: string;
  propietarioapellidos:string;
  propietariocorreo:string;
  propietariotelefono:string;
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

    this.titleService.setTitle('Usuarios / Nuevo Usuario');
    this.srcImage = "../../../../assets/images/user_default.png";
    this.fieldForm = this.fb.group({
      nombre: ['', Validators.required],
      lastName: [''],
      file: [null],
    });
   
    this.nombre = '';
    this.telefono = '';
    this.contactonombre = '';
    this.contactoapellidos = ''; 
    this.contactocelular = ''; 
    this.contactocorreo = "";
    this.propietarionombre = "";
    this.propietarioapellidos = "";
    this.propietariocorreo = "";
    this.propietariotelefono = "";
    this.mutation = "";
  }

  async ngOnInit() {
    
    this.route.params.subscribe(async params => {
      this.fieldId = params['id'];
      this.isCreating = (this.fieldId !== undefined) ? false : true;
      if (!this.isCreating) {
        this.titleService.setTitle('Canchas  / Editar Usuario');
       // let datafield = await this.getField();
        // this.name = dataUser.name;
        // this.lastName = dataUser.lastName;
        // this.email = dataUser.email;
        // this.mobile = dataUser.mobile;
        // this.displayedImageUrl = `${environment.fileManager}/${datafield.photo}`;
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
        //this.setMutationUpdate();
       // this.updateField();
      }
    } else {
      this.snakBar.open("Verifique que los campo obligatorios esten capturados.", "Aceptar", {
        duration: 5000,
        horizontalPosition: "right",
        verticalPosition: "top"
      });
    }
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

      dialog.afterClosed().subscribe(async result => {
        if (result) {
          this.cleanForm();
          //if (this.selectedFile) {
            //const resizedImage = await this.resizeImage(this.selectedFile);
           // const formData = new FormData();
            //formData.append('image', resizedImage, `${fieldDocument._id}_${this.selectedFile?.name}`);
            //let responseUpload = await this.uploadService.post(formData);
            //if (responseUpload && responseUpload.ok) {
            //this.displayedImageUrl = `${environment.fileManager}/image-${fieldDocument._id}_${this.selectedFile?.name}`;
            //this.setMutationUpdateImage(fieldDocument._id);
            //await this.graphqlService.post(this.mutation, this.variables);
           // }
          //}
        } else {
          this.router.navigateByUrl('/home/usuarios');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  

  //async getField() {
    //this.setQueryUser();
    //let response = await this.graphqlService.post(this.query, this.variables);
    //return response.data.getUser;
  //}

  cleanForm() {
    this.nombre = "";
    this.nombre = "";
    this.nombre = "";
    this.nombre = "";
    this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
  }

  setMutationInsert() {
    this.mutation = `
      mutation(
  
       $nombre: string!,
       $telefono:  string!,
       $contactonombre: string!,
       $contactoapellidos: string!
       $contactocelular: string!,
       $contactocorreo : string!,
       $propietarionombre: string!,
       $propietarioapellidos:string!,
       $propietariocorreo:string!,
       $propietariotelefono:string!,
       createField(input: {
       nombre: $nombre,
       telefono:  $telefono,
       contactonombre: $contactonombre,
       contactoapellidos: $contactoapellidos,
       contactocelular: $contactocelular,
       contactocorreo : $contactocorreo,
       propietarionombre: $propietarionombre,
       propietarioapellidos:$propietarioapellidos,
       propietariocorreo:$propietariocorreo,
       propietariotelefono:$propietariotelefono,
      }){
          _id,
          name
      }
    }`;
    this.variables = {
      module: 'field',
      name: this.nombre,
      lastName: this.nombre,
      email: this.nombre,
      mobile: `${this.nombre}`,
    };
  }

  
}
