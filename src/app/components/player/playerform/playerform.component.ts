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
  teams: any = [];
  field: any;
  fields: any = [];
  tournament: any;
  tournaments: any = [];
  disabledTournament: boolean = true;
  lap: any;
  team: any
  nombre: string;
  apellidos: string;
  correo: string;
  celular: string;
  gender: string;
  file: any;
  selectedFile: File | null = null;
  srcImage: string;
  mutation: string;
  isCreating: boolean = true;
  playerId: any = '';
  displayedImageUrl: string;
  listfields: any[] = [];
  listtournaments: any[] = [];
  listteams: any[] = []; 
  variables: any;
  query: string;
  matches: any;

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
      this.fields = await this.getFields();
    }
  
    async getFields(): Promise<any> {
      this.setQryFields();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getFields;
    }
  
    setQryFields() {
      this.query = `
      query {
        getFields(filters: {}){
            _id,
            nombre
        }
      }`;
      this.variables = {
        module: 'field'
      };
    }
  
    async changeFields(): Promise<any> {
      if (this.field) {
        this.disabledTournament = false;
        this.tournaments = await this.getTournaments();
        this.viewGridTeams();
      } else {
        this.disabledTournament = true;
        this.tournaments = [];
        this.tournament = "";
        this.teams = [];
      }
    }
  
    async getTournaments(): Promise<any> {
      this.setQryTournaments();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getTournaments;
    }
  
    setQryTournaments() {
      this.query = `
      query($idField: ID!) {
        getTournaments(filters: {
          qry: {
            field: $idField
          }
        }){
            _id,
            nombre
        }
      }`;
      this.variables = {
        module: 'tournaments',
        idField: this.field
      };
    }
  
    async viewGridTeams() {
      if (this.field && this.tournament) {
        this.teams = [];
        let i = -1;
        const listTeams = await this.getTeams();
        listTeams.forEach((team: any, index: number) => {
          let mod = index % 6;
          if (mod === 0) {
            this.teams.push({ "row": [] });
            ++i;
          }
          let escudo = `${environment.fileManager}/${team.photo}`;
          this.teams[i].row.push({ id: team._id, "nombre": team.nombre, escudo });
        });
      }
    }
  
    async getTeams(): Promise<any> {
      this.setQryTeams();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getTeams;
    }
  
    setQryTeams() {
      this.query = `
      query($idField: ID!, $idTournament: ID!) {
        getTeams(filters: {
          qry: {
            field: $idField,          
            tournament: $idTournament,
            status: true
          }
        }){
            _id,
            nombre,
            photo
        }
      }`;
      this.variables = {
        module: 'teams',
        idField: this.field,
        idTournament: this.tournament
      };
    }
  
    onSubmit(formTeam: NgForm) {
      if (formTeam.valid) {
      
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
    async updatePlayer() {
      let response = await this.graphqlService.post(this.mutation, this.variables);
      const miSnackBar = this.snakBar.open("El equipo ha sido modificado correctamente.", "Aceptar", {
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
        this.router.navigateByUrl('/home/teamlist');
      });
    }
    async savePlayer() {
      try {
        let response = await this.graphqlService.post(this.mutation, this.variables);
        let teamDocument = response.data.createPlayer;
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
    async getPlayer() {
      this.setQueryPlayers();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getPlayer;
    }
  
    cleanForm() {
      this.nombre = '';
      this.field=''
      this.tournament='';
      this.displayedImageUrl = `${environment.fileManager}/user_default.png`;
    }
  
    setMutationInsert() {
      this.mutation = `
      mutation CreatePlayer(
        $nombre: String!,
        $field: ID!,
        $tournament: ID!,
      ) {
        createPlayer(input: {
          nombre: $nombre,
          field: $field,
          tournament: $tournament,
        }) {
          _id,
          nombre
        }
      }`;
      this.variables = {
        module: 'players',
        nombre: this.nombre,
        field: this.field,
        tournament : this.tournament,
      };
  
    }
  
      setQueryPlayers() {
        this.query = `
        query($id: ID!) {
          getPlayer(_id: $id, filters: {
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
          module: 'players',
          id: this.playerId
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
            updatePlayer(_id: $id, input: {
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
          module: 'players',
          id: this.playerId,
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
  