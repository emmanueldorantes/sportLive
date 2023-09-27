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
  selector: 'app-playerform',
  templateUrl: './playerform.component.html',
  styleUrls: ['./playerform.component.css']
})
export class PlayerformComponent implements OnInit {

  playerForm:FormGroup;
  team: any;
  tournament: any;
  field: any;
  nombre: string;
  apellidos: string;
  correo: string;
  celular: string;
  gender: string;
  file: any;
  selectedFile: File | null = null;
  srcImage: string;
  listfields: any;
  listtournaments: any;
  listteams: any;
  query: string;
  mutation: string;
  variables: any;
  isCreating: boolean = true;
  playerId: any = '';
  displayedImageUrl: string;

  constructor(
    
    private titleService: TitleService,
    private uploadService: UploadService,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private snakBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    ) {

      this.titleService.setTitle('Jugador  / Nuevo Jugador');
    this.srcImage = "../../../../assets/images/user_default.png";
    this.playerForm = this.fb.group({
      nombre: ['', Validators.required],
      field:['', Validators.required],
      tournament:['', Validators.required],
      team:['', Validators.required],
      apellidos:['', Validators.required],
      correo:['', Validators.required],
      celular:['', Validators.required],
      gender:['', Validators.required],
    });

    this.titleService.setTitle('Jugador / Alta de Jugador');
    this.team= '';
    this.tournament= '';
    this.field= '';
    this.nombre = '';
    this.apellidos  = '';
    this.correo = '';
    this.celular = '';
    this.gender = '';
    this.mutation = "";
    }

    async ngOnInit() {

      this.listfields = await this.getFields();
      this.listteams = await this.getTeams();
      this.listtournaments = await this.getTournaments();

      this.route.params.subscribe(async params => {
        this.playerId = params['id'];
        this.isCreating = (this.playerId !== undefined) ? false : true;
        if (!this.isCreating) {
          this.titleService.setTitle('Usuarios / Editar Usuario');
          let dataPlayer = await this.getPlayer();
          this.field = dataPlayer.field._id;
          this.tournament = dataPlayer.tournament._id;
          this.team = dataPlayer.team._id;
          this.nombre = dataPlayer.nombre;
          this.apellidos = dataPlayer.apellidos;
          this.correo = dataPlayer.correo;
          this.celular = dataPlayer.celular;
          this.gender = dataPlayer.gender;
          this.displayedImageUrl = dataPlayer.photo ? `${environment.fileManager}/${dataPlayer.photo}` : `${environment.fileManager}/user_default.png`;
        } else {
          this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
        }
      });
    }
  
    onSubmit(formplayer: NgForm) {
      if (formplayer.valid) {
        // let pathFile = this.userForm.get('file')?.value; {
        if (this.isCreating) {
          this.setMutationInsert();
          this.savePlayer();
        } else {
          this.setMutationUpdate();
          this.updatePlayer();
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
  
    async getTeams() {
      this.setQueryTeams();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getTeams;
    }

    async getTournaments() {
      this.setQueryTournaments();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getTournaments;
    }
  
    async savePlayer() {
      console.log(this.mutation, this.variables)
      try {
        let response = await this.graphqlService.post(this.mutation, this.variables);
        let playerDocument = response.data.createPlayer;
        const dialog = this.dialog.open(ConfirmDialogComponent, {
          width: '390px',
          data: {
            message: `El jugador ${playerDocument.nombre} ha sido creado correctamente.`,
            question: "¿Deseas agregar otro Usuario?",
            ok: "Si",
            cancel: "No"
          }
        });
  
        if (playerDocument && this.selectedFile) {
          const resizedImage = await this.resizeImage(this.selectedFile);
          const formData = new FormData();
          formData.append('image', resizedImage, `${playerDocument._id}_${this.selectedFile?.name}`);
          let responseUpload = await this.uploadService.post(formData);
          if (responseUpload && responseUpload.ok) {
            this.displayedImageUrl = `${environment.fileManager}/image-${playerDocument._id}_${this.selectedFile?.name}`;
            this.setMutationUpdateImage(playerDocument._id);
            await this.graphqlService.post(this.mutation, this.variables);
          }
        }
  
        dialog.afterClosed().subscribe(async result => {
          if (result) {
            this.cleanForm();
          } else {
            this.router.navigateByUrl('/home/playerlist');
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  
    async updatePlayer() {
      let response = await this.graphqlService.post(this.mutation, this.variables);
      const miSnackBar = this.snakBar.open("El jugador ha sido modificado correctamente.", "Aceptar", {
        duration: 0,
        horizontalPosition: "center",
        verticalPosition: "bottom"
      });
      if (this.selectedFile) {
        const resizedImage = await this.resizeImage(this.selectedFile);
        const formData = new FormData();
        formData.append('image', resizedImage, `${this.playerId}_${this.selectedFile?.name}`);
        let responseUpload = await this.uploadService.post(formData);
        if (responseUpload && responseUpload.ok) {
          this.displayedImageUrl = `${environment.fileManager}/image-${this.playerId}_${this.selectedFile?.name}`;
          this.setMutationUpdateImage();
          await this.graphqlService.post(this.mutation, this.variables);
        }
      }
      miSnackBar.onAction().subscribe(() => {
        this.router.navigateByUrl('/home/playerlist');
      });
    }
  
    async getPlayer() {
      this.setQueryPlayer();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getPlayer;
    }
  
    cleanForm() {
      this.nombre = "";
      this.apellidos = "";
      this.correo = "";
      this.celular = "";
      this.gender = "";
      this.field='';
      this.tournament='';
      this.team='';
      this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
    }
  
    setQueryFields() {
      this.query = `
      query {
        getFields(filters: {
        }){
            _id,
            nombre,
        }
      }`;
      this.variables = {
        module: 'field'
      };
    }
  
    setQueryTeams() {
      this.query = `
      query {
        getTeams(filters: {
        }){
            _id,
            nombre          
        }
      }`;
      this.variables = {
        module: 'teams'
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
  
    setMutationInsert() {
      this.mutation = `
        mutation(
          $field: ID!, 
          $team: ID!,
          $tournament: ID!,
          $nombre: String, 
          $apellidos: String, 
          $correo: String, 
          $celular: String, 
          $gender: String) {
          createPlayer(input: {
            field: $field, 
            team: $team,
            tournament: $tournament,
            nombre: $nombre, 
            apellidos: $apellidos, 
            correo: $correo, 
            celular: $celular, 
            gender: $gender
          }){
              _id,
              nombre
          }
      }`;
      this.variables = {
        module: 'players',
        nombre: this.nombre,
        apellidos: this.apellidos,
        correo: this.correo,
        celular: `${this.celular}`,
        gender: this.gender,
        field: this.field,
        team: this.team,
        tournament: this.tournament
      };
    }
  
    setQueryPlayer() {
      this.query = `
      query($id: ID!) {
        getPlayer(_id: $id, filters: {
          inner: [
            { path: "field" }
            { path: "team" } 
            { path: "tournament" }           
          ]
        }){
            _id,
            nombre,
            apellidos,
            correo,
            celular,
            gender,
            photo,
            field {
              _id
            },
            team {
              _id
            },
            tournament {
              _id
            }
        }
      }`;
      this.variables = {
        module: 'players',
        id: this.playerId
      };
    }
  
    setMutationUpdate() {
      this.mutation = `
      mutation(
        $id: ID!,
        $field: ID!, 
        $team: ID!,
        $tournament: ID!,
        $nombre: String!, 
        $apellidos: String!, 
        $correo: String!, 
        $celular: String!, 
        $gender: String!) {
        updatePlayer(_id: $id, input: {
            field: $field, 
            team: $team,
            tournament: $tournament,
            nombre: $nombre, 
            apellidos: $apellidos, 
            correo: $correo, 
            celular: $celular, 
            gender: $gender       
        }){
            _id,
            nombre
        }
    }`;
      this.variables = {
        module: 'players',
        id: this.playerId,
        field: this.field,
        team: this.team,
        tournament: this.tournament,
        nombre: this.nombre,
        apellidos: this.apellidos,
        correo: this.correo,
        celular: `${this.celular}`,
        gender: this.gender
      };
    }
  
    setMutationUpdateImage(id?: any) {
      this.mutation = `
      mutation(
        $id: ID!,
        $photo: String!
      ) {
        updatePlayer(_id: $id, input: {
          photo: $photo        
        }){
            _id
        }
      }`;
      let image = id ? `image-${id}_${this.selectedFile?.name}` : `image-${this.playerId}_${this.selectedFile?.name}`;
      this.variables = {
        module: 'players',
        id: id || this.playerId,
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
  