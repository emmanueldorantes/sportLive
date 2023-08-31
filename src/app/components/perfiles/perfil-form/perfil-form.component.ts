import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../../services/title.service';
import { PefilesService } from '../../../services/pefiles.service';
import { Profile } from '../../../models/profile';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-perfil-form',
  templateUrl: './perfil-form.component.html',
  styleUrls: ['./perfil-form.component.css'],

})
export class PerfilFormComponent implements OnInit {
  profileForm: FormGroup;
  profile: Profile;
  query: string;
  mutation: string;
  variables: any;
  name: string = '';
  profileId: any = '';
  isCreating: boolean = true;

  constructor(
    private fb: FormBuilder,
    private titleService: TitleService,
    private pefilesService: PefilesService,
    private dialog: MatDialog,
    private snakBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.titleService.setTitle('Perfiles / Nuevo Perfil');
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
    });
    this.profile = new Profile();
    this.query = "";
    this.mutation = "";
    this.variables = {};
  }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.profileId = params['id'];
      this.isCreating = (this.profileId !== undefined) ? false : true;
      if (!this.isCreating) {
        this.titleService.setTitle('Perfiles / Editar Perfil');
        let dataProfile = await this.getProfile();
        if (dataProfile) {
          this.name = dataProfile.name;
        }
      }
    });
  }

  onSubmit() {
    if (this.profileForm.status === 'VALID') {
      let values = this.profileForm.value;
      this.profile.name = values.name;
      if (this.isCreating) {
        this.setMutationInsert();
        this.saveProfile();
      } else {
        this.setMutationUpdate();
        this.updateProfile();
      }
    } else {
      const snackbar = this.snakBar.open("Debe capturar los campos obligatorios...", "Aceptar", {
        duration: 5000,
        horizontalPosition: "right",
        verticalPosition: "top"
      });
      
    }
  }

  async saveProfile() {
    let response = await this.pefilesService.post(this.mutation, this.variables);
    let profileDocument = response.data.createProfile;

    const dialog = this.dialog.open(ConfirmDialogComponent, {
      width: '390px',
      data: {
        message: `El perfil ${profileDocument.name} ha sido creado correctamente.`,
        question: "¿Deseas agregar otro Perfil?",
        ok: "Si",
        cancel: "No"
      }
    });

    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.cleanForm();
      } else {
        this.router.navigateByUrl('/home/perfiles');
      }
    });
  }

  async updateProfile() {
    let response = await this.pefilesService.post(this.mutation, this.variables);
    this.snakBar.open("El perfil ha sido modificado correctamente.", "Aceptar", {
      duration: 5000,
      horizontalPosition: "right",
      verticalPosition: "top"
    });
  }

  setMutationInsert() {
    this.mutation = `
      mutation($name: String!) {
        createProfile(input: {
          name: $name
        }){
            _id,
            name
        }
    }`;
    this.variables = {
      module: 'profiles',
      name: this.profile.name
    };
  }

  setMutationUpdate() {
    this.mutation = `
      mutation($id: ID!, $name: String!) {
        updateProfile(_id: $id, input: {
          name: $name
        }){
            _id,
            name
        }
    }`;
    this.variables = {
      module: 'profiles',
      id: this.profileId,
      name: this.profile.name
    };
  }

  setQuery() {
    this.query = `
      query($id: ID!) {
        getProfile(_id: $id, filters: {qry: {}}){
            _id,
            name
        }
    }`;
    this.variables = {
      module: 'profiles',
      id: this.profileId
    };
  }

  async getProfile(): Promise<any> {
    this.setQuery();
    let response = await this.pefilesService.post(this.query, this.variables);
    let profileDocument = response.data.getProfile;
    console.log(this.query)
    return (profileDocument) ? profileDocument : false;
  }

  cleanForm() {
    this.name = '';
  }
}