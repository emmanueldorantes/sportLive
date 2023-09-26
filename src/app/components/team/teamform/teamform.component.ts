import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-teamform',
  templateUrl: './teamform.component.html',
  styleUrls: ['./teamform.component.css']
})
export class TeamformComponent implements OnInit {
  teamform: FormGroup
  tournament: any;
  field: any;
  listfields: any;
  listtournaments: any;
  isCreating: boolean = true;
  query: string;
  mutation: string;
  variables: any;
  teamId : any = '';
  nombre: string;
  displayedImageUrl: string;
  file: any;
  selectedFile: File | null = null;
  srcImage: string;
  
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

    this.titleService.setTitle('Equipo  / Nuevo Equipo');
    this.srcImage = "../../../../assets/images/user_default.png";
    this.teamform = this.fb.group({
      nombre: ['', Validators.required],
      field:['', Validators.required],
      tournament:['', Validators.required],
    });
   
    this.nombre = '';
    this.mutation = '';
    this.field='';
    this.tournament="";

  }

  async ngOnInit() {
    
    this.listfields = await this.getFields();
    this.listtournaments = await this.getTournaments();
    this.route.params.subscribe(async params => {
      this.teamId = params['id'];
      this.isCreating = !this.teamId; 
      if (!this.isCreating) {
        this.titleService.setTitle('Equipo  / Editar Equipo');
        let datateam = await this.getTeam();
         console.log(datateam)
        this.nombre = datateam.nombre;
        this.field = datateam.field._id;
        this.tournament = datateam.tournament._id;
        this.displayedImageUrl =  datateam.photo ? `${environment.fileManager}/${datateam.photo}` : `${environment.fileManager}/user_default.png`;
      } else {
        this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
      }
    });
  }
  onSubmit(formTeam: NgForm) {
    if (formTeam.valid) {
    
      if (this.isCreating) {
        this.setMutationInsert();
        this.saveTeam();
      } else {
        this.setMutationUpdate();
        this.updateTeam();
      }
    } else {
      this.snakBar.open("Verifique que los campo obligatorios esten capturados.", "Aceptar", {
        duration: 0,
        horizontalPosition: "center",
        verticalPosition: "bottom"
      });
    }
  }
  async getFields() {
    this.setQueryFields();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getFields;
  }

  async getTournaments(){
    this.setQueryTournaments();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getTournaments;
  }

  async updateTeam() {
    let response = await this.graphqlService.post(this.mutation, this.variables);
    const miSnackBar = this.snakBar.open("El equipo ha sido modificado correctamente.", "Aceptar", {
      duration: 0,
      horizontalPosition: "center",
      verticalPosition: "bottom"
    });
      if (this.selectedFile) {
        const resizedImage = await this.resizeImage(this.selectedFile);
        const formData = new FormData();
        formData.append('image', resizedImage, `${this.teamId}_${this.selectedFile?.name}`);
        let responseUpload = await this.uploadService.post(formData);
        if (responseUpload && responseUpload.ok) {
          this.displayedImageUrl = `${environment.fileManager}/image-${this.teamId}_${this.selectedFile?.name}`;
          this.setMutationUpdateImage();
          await this.graphqlService.post(this.mutation, this.variables);
        }
      }
    miSnackBar.onAction().subscribe(() => {
      this.router.navigateByUrl('/home/teamlist');
    });
  }
  async saveTeam() {
    try {
      let response = await this.graphqlService.post(this.mutation, this.variables);
      let teamDocument = response.data.createTeam;
      const dialog = this.dialog.open(ConfirmDialogComponent, {
        width: '390px',
        data: {
          message: `El equipo ${teamDocument.nombre} ha sido creado correctamente.`,
          question: "¿Deseas agregar otro Usuario?",
          ok: "Si",
          cancel: "No"
        }
      });
      if (this.selectedFile) {
        const resizedImage = await this.resizeImage(this.selectedFile);
         const formData = new FormData();
         console.log (`${teamDocument._id}_${this.selectedFile?.name}`)
         formData.append('image', resizedImage, `${teamDocument._id}_${this.selectedFile?.name}`);
         let responseUpload = await this.uploadService.post(formData);
          if (responseUpload && responseUpload.ok) {
          this.displayedImageUrl = `${environment.fileManager}/image-${teamDocument._id}_${this.selectedFile?.name}`;
          this.setMutationUpdateImage(teamDocument._id);
          await this.graphqlService.post(this.mutation, this.variables);
          }
        }
      dialog.afterClosed().subscribe(async result => {
        if (result) {
          this.cleanForm();
          
        } else {
          this.router.navigateByUrl('/home/teamlist');
        }
      });
    } catch (error) {
      console.log(error);
    }
    
  }
  async getTeam() {
    this.setQueryTeams();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getTeam;
  }

  cleanForm() {
    this.nombre = '';
    this.field=''
    this.tournament='';
    this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
  }

  setMutationInsert() {
    this.mutation = `
    mutation CreateTeam(
      $nombre: String!,
      $field: ID!,
      $tournament: ID!,
    ) {
      createTeam(input: {
        nombre: $nombre,
        field: $field,
        tournament: $tournament,
      }) {
        _id,
        nombre
      }
    }`;
    this.variables = {
      module: 'teams',
      nombre: this.nombre,
      field: this.field,
      tournament : this.tournament,
    };

  }

    setQueryTeams() {
      this.query = `
      query($id: ID!) {
        getTeam(_id: $id, filters: {
          inner: [
            { path: "field" }
            { path: "tournament" }
          ]
        }) {
          _id
          nombre,
          photo,
          field {
            _id
          },
          tournament {
            _id
          }
        }
      }`;
      this.variables = {
        module: 'teams',
        id: this.teamId
      };
    } 
    setQueryFields() {
      this.query = `
      query {
        getFields(filters: {
        }){
            _id,
            nombre          
        }
      }`;
      this.variables = {
        module: 'field'
      };
    }

    setQueryTournaments() {
      this.query = `
      query {
        getTournaments(filters: {
        }){
            _id,
            nombre          
        }
      }`;
      this.variables = {
        module: 'tournaments'
      };
    }

    setMutationUpdate() {
      this.mutation = `
        mutation(
          $id: ID!,
          $field: ID!,
          $tournament: ID!,
          $nombre: String!,
        ) {
          updateTeam(_id: $id, input: {
            nombre: $nombre,
            field: $field,
            tournament: $tournament
          }) {
            _id,
            nombre
          }
        }
      `;
      this.variables = {
        module: 'teams',
        id: this.teamId,
        field: this.field,
        nombre: this.nombre,
        tournament: this.tournament
        
      };
    }

setMutationUpdateImage(id?: any) {
  this.mutation = `
  mutation(
    $id: ID!,
    $photo: String
  ) {
    updateTeam(_id: $id, input: {
      photo: $photo        
    }){
        _id
    }
}`;
let image = id ? `image-${id}_${this.selectedFile?.name}` : `image-${this.teamId}_${this.selectedFile?.name}`;
  this.variables = {
    module: 'teams',
    id: id || this.teamId,
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







