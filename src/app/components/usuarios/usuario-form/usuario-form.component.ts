import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit {
  userForm: FormGroup;
  profile: any;
  name: string;
  lastName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  gender: string;
  file: any;
  srcImage: string;
  listProfiles: any;
  listStates: any;
  query: string;
  mutation: string;
  variables: any;
  isCreating: boolean = true;
  userId: any = '';


  constructor(
    private fb: FormBuilder,
    private titleService: TitleService,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private snakBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.titleService.setTitle('Usuarios / Nuevo Usuario');
    this.srcImage = "../../../../assets/images/user_default.png";
    this.userForm = this.fb.group({
      profile: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required],
      mobile: ['', Validators.required],
      state: ['', Validators.required],
      gender: ['', Validators.required],
      city: ['', Validators.required],
      lastName: [''],
      file: [null],
    });
    this.profile = '';
    this.name = '';
    this.lastName = '';
    this.email = '';
    this.mobile = '';
    this.gender = '';
    this.state = '';
    this.city = '';
    this.file = '';
    this.listStates = [];
    this.query = "";
    this.mutation = "";
  }

  async ngOnInit() {
    this.listStates = await this.getStates();
    this.listProfiles = await this.getProfiles();
    this.route.params.subscribe(async params => {
      this.userId = params['id'];
      this.isCreating = (this.userId !== undefined) ? false : true;
      if (!this.isCreating) {
        this.titleService.setTitle('Usuarios / Editar Usuario');

      }
    });
  }

  onSubmit() {
    if (this.userForm.status === 'VALID') {
      // let pathFile = this.userForm.get('file')?.value;
      if (this.isCreating) {
        this.setMutationInsert();
        this.saveUser();
      } else {
        // this.setMutationUpdate();
        // this.updateProfile();
      }
      console.log(this)
    } else {
      this.snakBar.open("Verifique que los campo obligatorios esten capturados.", "Aceptar", {
        duration: 5000,
        horizontalPosition: "right",
        verticalPosition: "top"
      });
    }
  }

  async getProfiles() {
    this.setQueryProfiles();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getProfiles;
  }

  async getStates() {
    this.setQueryStates();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getStates;
  }

  async saveUser() {
    let response = await this.graphqlService.post(this.mutation, this.variables);
    let userDocument = response.data.createUser;
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      width: '390px',
      data: {
        message: `El usuario ${userDocument.name} ha sido creado correctamente.`,
        question: "¿Deseas agregar otro Usuario?",
        ok: "Si",
        cancel: "No"
      }
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.cleanForm();
      } else {
        this.router.navigateByUrl('/home/usuarios');
      }
    });
  }

  cleanForm(){
    this.name = "";
    this.lastName = "";
    this.profile = "";
    this.email = "";
    this.mobile = "";
    this.gender = "";
    this.state = "";
    this.city = "";
    this.file = "";
  }

  setQueryStates() {
    this.query = `
    query {
      getStates(filters: {
        qry: {},
        sort: { autoincrement: 1 }
      }){
          _id,
          name,
          abbreviation
      }
    }`;
    this.variables = {
      module: 'states'
    };
  }

  setQueryProfiles() {
    this.query = `
    query {
      getProfiles(filters: {
        qry: {},
        sort: { autoincrement: 1 }
      }){
          _id,
          name          
      }
    }`;
    this.variables = {
      module: 'states'
    };
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
        $gender: String!) {
        createUser(input: {
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
      module: 'users',
      profile: this.profile,
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      mobile: `${this.mobile}`,
      state: this.state,
      city: this.city,
      gender: this.gender
    };
  }
}
