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
  selector: 'app-tournamentform',
  templateUrl: './tournamentform.component.html',
  styleUrls: ['./tournamentform.component.css']
})

export class TournamentformComponent implements OnInit {

  field: any;
  dia: string;
  listfields: any;
  tournamentform:FormGroup;
  isCreating: boolean = true;
  query: string;
  mutation: string;
  variables: any;
  nombre: string;
  horario:string;
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
  ) {

    //Para validar que son campos requeridos o no

    this.titleService.setTitle('Torneo  / Nuevo Torneo');
    this.tournamentform = this.fb.group({
      nombre: ['', Validators.required],
      field:['', Validators.required],
      dia:['', Validators.required],
      horario: ['', Validators.required],
    });
   
    this.nombre = '';
    this.mutation = '';
    this.field='';
    this.dia='';
    this.horario;
  }

  async ngOnInit() {
    this.listfields = await this.getFields();
    this.route.params.subscribe(async params => {
      this.tournamentId = params['id'];
      this.isCreating = (this.tournamentId !== undefined) ? false : true;
      if (!this.isCreating) {
        this.titleService.setTitle('Torneo  / Editar Torneo');
       let datatournament = await this.getTournament();
       console.log(datatournament)
        this.nombre = datatournament.nombre;
        this.field = datatournament.field._id;
        this.dia = datatournament.dia;
        this.horario = datatournament.horario;

      }
    });
  }
  onSubmit(formTournament: NgForm) {
    if (formTournament.valid) {
      if (this.isCreating) {
        this.setMutationInsert();
        this.saveTournament();
      } else {
        this.setMutationUpdate();
        this.updateTournament();
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

  async updateTournament() {
    let response = await this.graphqlService.post(this.mutation, this.variables);
    const miSnackBar = this.snakBar.open("El Torneo ha sido modificado correctamente.", "Aceptar", {
      duration: 0,
      horizontalPosition: "center",
      verticalPosition: "bottom"
    });
    miSnackBar.onAction().subscribe(() => {
      this.router.navigateByUrl('/home/perfiles');
    });
  }

  async saveTournament() {
    try {
      let response = await this.graphqlService.post(this.mutation, this.variables);
      let tournamentDocument = response.data.createTournament;
      const dialog = this.dialog.open(ConfirmDialogComponent, {
        width: '390px',
        data: {
          message: `El Torneo ${tournamentDocument.nombre} ha sido creado correctamente.`,
          question: "¿Deseas agregar otro Usuario?",
          ok: "Si",
          cancel: "No"
        }
      });
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
    this.setQueryTournament();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getTournament;
  }

  cleanForm() {
    this.nombre = '';
    this.field='';
    this.dia = '';
    this.horario='';
  }

  setMutationInsert() {
    this.mutation = `
      mutation(
        $nombre: String!,
        $field: ID!,
        $dia: String!
        $horario: String!,
         {
        createTournament(input: {
          nombre: $nombre,
          field : $field,
          dia : $dia,
          horario : $horario
        }){
          _id,
          nombre
        }
      }`;
    this.variables = {
      module: 'tournaments',
      nombre: this.nombre,
      field:this.field,
      dia : this.dia,
      horario : this.horario,
    };

  }
 
    setQueryTournament() {
      this.query = `
      query($id: ID!) {
        getTournament(_id: $id, filters: {
          inner: [
            { path: "field" }          
          ]
        }){
        getTournament(_id: $id, filters: {}){
              _id,
              nombre,
              field{
                _id
              },
              dia,
              horario
              }
      }`;
      this.variables = {
        module: 'tournaments',
        id: this.tournamentId
      };
    } 
    setQueryFields() {
      this.query = `
      query {
        getFields(filters: {
          qry: {},
          sort: { autoincrement: 1 }
        }){
            _id,
            name          
        }
      }`;
      this.variables = {
        module: 'profiles'
      };
    }

    setMutationUpdate() {
     this.mutation = `
    mutation(
    $id: ID!,
    $field: ID!,
    $dia: String!,
    $nombre: String!,
    $horario: String!,
     {
      updateTournament(_id: $id, input: {
      nombre: $nombre,
      dia : $dia,
      $field: $field,
      horario: $horario
    }){
      _id,
      nombre
    }
  }`;
this.variables = {
  
  module: 'tournaments',
  id: this.tournamentId,
  field:this.field,
  nombre: this.nombre,
  dia:this.dia,
  horario:this.horario
};
}
}






