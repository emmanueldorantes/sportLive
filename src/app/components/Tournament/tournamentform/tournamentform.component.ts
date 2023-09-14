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
  selector: 'app-tournamentform',
  templateUrl: './tournamentform.component.html',
  styleUrls: ['./tournamentform.component.css']
})

export class TournamentformComponent implements OnInit {

  tournamentForm:FormGroup;
    isCreating: boolean = true;
    query: string;
    mutation: string;
    variables: any;
    // Inforamcion de la Cancha
    nombre: string;
    tournamentId: any = '';
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
  
      this.titleService.setTitle('Torneos / Nuevo Torneo');
      this.tournamentForm = this.fb.group({
        nombre: ['', Validators.required],
      });
     
      this.nombre = '';
      this.mutation = "";
    }
  
    async ngOnInit() {
      
      this.route.params.subscribe(async params => {
        this.tournamentId = params['id'];
        this.isCreating = (this.tournamentId !== undefined) ? false : true;
        if (!this.isCreating) {
          this.titleService.setTitle('Torneos  / Editar Torneos');
         let datatournament = await this.getTournament();
         console.log(datatournament)
          this.nombre = datatournament.nombre;
        }
      });
    }
  
    onSubmit() {
      if (this.tournamentForm.status === 'VALID') {
        // let pathFile = this.userForm.get('file')?.value;
        if (this.isCreating) {
          this.setMutationInsert();
          this.saveTournament();
        } else {
          this.setMutationUpdate();
          this.updateTournament();
        }
      } else {
        this.snakBar.open("Verifique que los campo obligatorios esten capturados.", "Aceptar", {
          duration: 5000,
          horizontalPosition: "right",
          verticalPosition: "top"
        });
      }
    }
    
    async updateTournament() {
      let response = await this.graphqlService.post(this.mutation, this.variables);
      const miSnackBar = this.snakBar.open("El usuario ha sido modificado correctamente.", "Aceptar", {
        duration: 0,
        horizontalPosition: "right",
        verticalPosition: "top"
      });
      miSnackBar.onAction().subscribe(() => {
        this.router.navigateByUrl('/home/tournamentlist');
      });
    }
  
    async saveTournament() {
      try {
        let response = await this.graphqlService.post(this.mutation, this.variables);
        let tournamentDocument = response.data.createTournament;
        const dialog = this.dialog.open(ConfirmDialogComponent, {
          width: '390px',
          data: {
            message: `La cancha ${tournamentDocument.nombre} ha sido creado correctamente.`,
            question: "¿Deseas agregar otro Usuario?",
            ok: "Si",
            cancel: "No"
          }
        });
        if (this.selectedFile) {
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
  
    async getTournament() {
      this.setQueryField();
      let response = await this.graphqlService.post(this.query, this.variables);
      return response.data.getField;
    }
  
    cleanForm() {
      this.nombre = '';
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
        nombre: this.nombre,
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
          id: this.tournamentId
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
    id: this.tournamentId,
    nombre: this.nombre,
  };
  }  
  }


  
  
  
  
  
  
  