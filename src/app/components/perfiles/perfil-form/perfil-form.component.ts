import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TitleService } from '../../../services/title.service';
import { GraphqlService } from '../../../services/graphql.service';
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
  modules: any;

  todosPerfiles: boolean = false;
  verPerfiles: boolean = false;
  editarPerfiles: boolean = false;
  eliminarPerfiles: boolean = false;
  todosUsuarios: boolean = false;
  verUsuarios: boolean = false;
  editarUsuarios: boolean = false;
  eliminarUsuarios: boolean = false;
  todosCanchas: boolean = false;
  verCanchas: boolean = false;
  editarCanchas: boolean = false;
  eliminarCanchas: boolean = false;
  todosTorneos: boolean = false;
  verTorneos: boolean = false;
  editarTorneos: boolean = false;
  eliminarTorneos: boolean = false;
  todosEquipos: boolean = false;
  verEquipos: boolean = false;
  editarEquipos: boolean = false;
  eliminarEquipos: boolean = false;
  todosJugadores: boolean = false;
  verJugadores: boolean = false;
  editarJugadores: boolean = false;
  eliminarJugadores: boolean = false;
  todosEstadisticas: boolean = false;
  verEstadisticas: boolean = false;
  gruposPermisos: any;

  constructor(
    private fb: FormBuilder,
    private titleService: TitleService,
    private graphqlService: GraphqlService,
    private dialog: MatDialog,
    private snakBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.titleService.setTitle('Perfiles / Nuevo Perfil');
    this.gruposPermisos = [];
    this.profileForm = this.fb.group({
      name: ['', Validators.required],


      todosPerfiles: false,
      verPerfiles: false,
      editarPerfiles: false,
      eliminarPerfiles: false,
      todosUsuarios: false,
      verUsuarios: false,
      editarUsuarios: false,
      eliminarUsuarios: false,
      todosCanchas: false,
      verCanchas: false,
      editarCanchas: false,
      eliminarCanchas: false,
      todosTorneos: false,
      verTorneos: false,
      editarTorneos: false,
      eliminarTorneos: false,
      todosEquipos: false,
      verEquipos: false,
      editarEquipos: false,
      eliminarEquipos: false,
      todosJugadores: false,
      verJugadores: false,
      editarJugadores: false,
      eliminarJugadores: false,
      todosEstadisticas: false,
      verEstadisticas: false
    });
    this.profile = new Profile();
    this.query = "";
    this.mutation = "";
    this.variables = {};
    this.modules = [];
  }

  async ngOnInit() {
    this.modules = await this.getMenu();
    this.modules.forEach((menuData: any, index: number) => {
      console.log(index);
      this.gruposPermisos.push({
        name: menuData.name,
        label: `todos${menuData.name}`,
        permisos: [
          { label: 'Ver', controlName: `ver${menuData.name}` },
          { label: 'Editar', controlName: `editar${menuData.name}` },
          { label: 'Eliminar', controlName: `eliminar${menuData.name}` }
        ]
      });
    });
    console.log(this.gruposPermisos)
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
      const valuesForm = this.profileForm.value;
      this.profile.name = valuesForm.name;
      let isValidForm = this.validationOfActiveModules(valuesForm);
      if (isValidForm) {
        if (this.isCreating) {
          this.setMutationInsert();
          this.saveProfile();
        } else {
          this.setMutationUpdate();
          this.updateProfile();
        }
      }
    } else {
      this.snakBar.open("Debe capturar los campos obligatorios...", "Aceptar", {
        duration: 5000,
        horizontalPosition: "right",
        verticalPosition: "top"
      });
    }
  }

  async saveProfile() {
    let response = await this.graphqlService.post(this.mutation, this.variables);
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
    let response = await this.graphqlService.post(this.mutation, this.variables);
    const miSnackBar = this.snakBar.open("El perfil ha sido modificado correctamente.", "Aceptar", {
      duration: 0,
      horizontalPosition: "right",
      verticalPosition: "top"
    });
    miSnackBar.onAction().subscribe(() => {
      this.router.navigateByUrl('/home/perfiles');
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
    let response = await this.graphqlService.post(this.query, this.variables);
    let profileDocument = response.data.getProfile;
    return (profileDocument) ? profileDocument : false;
  }

  cleanForm() {
    this.name = '';
  }

  toggleAllPermissions(event: any) {
    let checkbox = event.target;
    const isChecked = event.target.checked;
    if (checkbox.id === 'Perfiles') {
      this.verPerfiles = isChecked;
      this.editarPerfiles = isChecked;
      this.eliminarPerfiles = isChecked;
    }
    else if (checkbox.id === 'Usuarios') {
      this.verUsuarios = isChecked;
      this.editarUsuarios = isChecked;
      this.eliminarUsuarios = isChecked;
    }
    else if (checkbox.id === 'Canchas') {
      this.verCanchas = isChecked;
      this.editarCanchas = isChecked;
      this.eliminarCanchas = isChecked;
    }
    else if (checkbox.id === 'Torneos') {
      this.verTorneos = isChecked;
      this.editarTorneos = isChecked;
      this.eliminarTorneos = isChecked;
    }
    else if (checkbox.id === 'Equipos') {
      this.verEquipos = isChecked;
      this.editarEquipos = isChecked;
      this.eliminarEquipos = isChecked;
    }
    else if (checkbox.id === 'Jugadores') {
      this.verJugadores = isChecked;
      this.editarJugadores = isChecked;
      this.eliminarJugadores = isChecked;
    }
    else if (checkbox.id === 'Estadisticas') {
      this.verEstadisticas = isChecked;
    }
  }

  togglePermission(event: any) {
    let checkbox = event.target;
    if (checkbox.id === 'verPerfiles' || checkbox.id === 'editarPerfiles' || checkbox.id === 'eliminarPerfiles') {
      if (this.verPerfiles && !this.editarPerfiles && !this.eliminarPerfiles || !this.verPerfiles && this.editarPerfiles && !this.eliminarPerfiles || !this.verPerfiles && !this.editarPerfiles && this.eliminarPerfiles)
        this.todosPerfiles = true;
      else if (!this.verPerfiles && !this.editarPerfiles && !this.eliminarPerfiles)
        this.todosPerfiles = false;
    }
    else if (checkbox.id === 'verUsuarios' || checkbox.id === 'editarUsuarios' || checkbox.id === 'eliminarUsuarios') {
      if (this.verUsuarios && !this.editarUsuarios && !this.eliminarUsuarios || !this.verUsuarios && this.editarUsuarios && !this.eliminarUsuarios || !this.verUsuarios && !this.editarUsuarios && this.eliminarUsuarios)
        this.todosUsuarios = true;
      else if (!this.verUsuarios && !this.editarUsuarios && !this.eliminarUsuarios)
        this.todosUsuarios = false;
    }
    else if (checkbox.id === 'verCanchas' || checkbox.id === 'editarCanchas' || checkbox.id === 'eliminarCanchas') {
      if (this.verCanchas && !this.editarCanchas && !this.eliminarCanchas || !this.verCanchas && this.editarCanchas && !this.eliminarCanchas || !this.verCanchas && !this.editarCanchas && this.eliminarCanchas)
        this.todosCanchas = true;
      else if (!this.verCanchas && !this.editarCanchas && !this.eliminarCanchas)
        this.todosCanchas = false;
    }
    else if (checkbox.id === 'verTorneos' || checkbox.id === 'editarTorneos' || checkbox.id === 'eliminarTorneos') {
      if (this.verTorneos && !this.editarTorneos && !this.eliminarTorneos || !this.verTorneos && this.editarTorneos && !this.eliminarTorneos || !this.verTorneos && !this.editarTorneos && this.eliminarTorneos)
        this.todosTorneos = true;
      else if (!this.verTorneos && !this.editarTorneos && !this.eliminarTorneos)
        this.todosTorneos = false;
    }
    else if (checkbox.id === 'verEquipos' || checkbox.id === 'editarEquipos' || checkbox.id === 'eliminarEquipos') {
      if (this.verEquipos && !this.editarEquipos && !this.eliminarEquipos || !this.verEquipos && this.editarEquipos && !this.eliminarEquipos || !this.verEquipos && !this.editarEquipos && this.eliminarEquipos)
        this.todosEquipos = true;
      else if (!this.verEquipos && !this.editarEquipos && !this.eliminarEquipos)
        this.todosEquipos = false;
    }
    else if (checkbox.id === 'verJugadores' || checkbox.id === 'editarJugadores' || checkbox.id === 'eliminarJugadores') {
      if (this.verJugadores && !this.editarJugadores && !this.eliminarJugadores || !this.verJugadores && this.editarJugadores && !this.eliminarJugadores || !this.verJugadores && !this.editarJugadores && this.eliminarJugadores)
        this.todosJugadores = true;
      else if (!this.verJugadores && !this.editarJugadores && !this.eliminarJugadores)
        this.todosJugadores = false;
    }
    else if (checkbox.id === 'verEstadisticas') {
      this.todosEstadisticas = this.verEstadisticas;
    }
  }

  validationOfActiveModules(valuesForm: any) {
    if (!valuesForm.todosP && !valuesForm.todosU && !valuesForm.todosC && !valuesForm.todosT && !valuesForm.todosE && !valuesForm.todosJ && !valuesForm.todosEst) {
      this.snakBar.open("Debe seleccionar por le menos un modulo para guardar el perfil.", "Aceptar", {
        duration: 5000,
        horizontalPosition: "right",
        verticalPosition: "top"
      });
      return false;
    } else {
      return true;
    }
  }

  setQueryMenu() {
    this.query = `
      query {
        getMenu(filters: {qry: {}}){
            _id,
            name
        }
    }`;
    this.variables = { module: 'menus' };
  }

  async getMenu(): Promise<any> {
    this.setQueryMenu();
    let response = await this.graphqlService.post(this.query, this.variables);
    let modules = response.data.getMenu;
    return (modules) ? modules : false;
  }
}