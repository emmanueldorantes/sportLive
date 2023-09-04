import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../../services/title.service';
import { UploadService } from '../../../services/upload.service';
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
  selectedFile: File | null = null;
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
    private uploadService: UploadService,
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
        let dataUser = await this.getUser();
        this.profile = dataUser.profile._id;
        this.name = dataUser.name;
        this.lastName = dataUser.lastName;
        this.email = dataUser.email;
        this.mobile = dataUser.mobile;
        this.state = dataUser.state._id;
        this.city = dataUser.city;
        this.gender = dataUser.gender;
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
        this.setMutationUpdate();
        this.updateUser();
      }
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
    // let response = await this.graphqlService.post(this.mutation, this.variables);
    // let userDocument = response.data.createUser;
    // const dialog = this.dialog.open(ConfirmDialogComponent, {
    //   width: '390px',
    //   data: {
    //     message: `El usuario ${userDocument.name} ha sido creado correctamente.`,
    //     question: "¿Deseas agregar otro Usuario?",
    //     ok: "Si",
    //     cancel: "No"
    //   }
    // });

    // dialog.afterClosed().subscribe(async result => {
      // if (result) {
        // this.cleanForm();
        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('image', this.selectedFile);
          let responseUpload = await this.uploadService.post(formData);
          console.log(responseUpload);
        }
      // } else {
        // this.router.navigateByUrl('/home/usuarios');
      // }
    // });
  }

  async updateUser() {
    let response = await this.graphqlService.post(this.mutation, this.variables);
    const miSnackBar = this.snakBar.open("El usuario ha sido modificado correctamente.", "Aceptar", {
      duration: 0,
      horizontalPosition: "right",
      verticalPosition: "top"
    });
    miSnackBar.onAction().subscribe(() => {
      this.router.navigateByUrl('/home/usuarios');
    });
  }

  async getUser() {
    this.setQueryUser();
    let response = await this.graphqlService.post(this.query, this.variables);
    return response.data.getUser;
  }

  cleanForm() {
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
          city
      }
    }`;
    this.variables = {
      module: 'users',
      id: this.userId
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
      module: 'users',
      id: this.userId,
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
}
