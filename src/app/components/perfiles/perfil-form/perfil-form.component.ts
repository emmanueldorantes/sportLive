import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  styleUrls: ['./perfil-form.component.css']
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
  permissions: any;

  idsMenus: any;
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
    this.titleService.setTitle('Perfiles / Alta de Usuario');
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
    this.permissions = [];
    this.idsMenus = {};
  }

  async ngOnInit() {
    this.modules = await this.getMenu();
    this.modules.forEach((menuData: any, index: number) => {
      this.gruposPermisos.push({
        id: menuData._id,
        name: menuData.name,
        label: `todos${menuData.name}`,
        complete: false,
        someComplete: false,
        permisos: []
      });
      if (menuData.name == "Estadisticas") {
        this.gruposPermisos[index].permisos.push(
          { label: 'Ver', controlName: `ver${menuData.name}`, completed: false }
        );
      } else {
        this.gruposPermisos[index].permisos.push(
          { label: 'Ver', controlName: `ver${menuData.name}`, completed: false },
          { label: 'Editar', controlName: `editar${menuData.name}`, completed: false },
          { label: 'Eliminar', controlName: `eliminar${menuData.name}`, completed: false }
        );
      }
    });

    this.route.params.subscribe(async params => {
      this.profileId = params['id'];
      this.isCreating = (this.profileId !== undefined) ? false : true;
      if (!this.isCreating) {
        this.titleService.setTitle('Perfiles / Editar Perfil');
        let dataProfile = await this.getProfile();
        if (dataProfile) {
          this.name = dataProfile.name;
          let menusData = dataProfile.modules;
          for (let index in menusData) {
            let nameModule = menusData[index].menu;
            let permissions = menusData[index].permissions[0];
            this.activeCheckboxesModules(nameModule, permissions);
          }
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
      this.snakBar.open("Capture el nombre del prefil.", "Aceptar", {
        duration: 0,
        horizontalPosition: "center",
        verticalPosition: "bottom"
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
      horizontalPosition: "center",
      verticalPosition: "bottom"
    });
    miSnackBar.onAction().subscribe(() => {
      this.router.navigateByUrl('/home/perfiles');
    });
  }

  setMutationInsert() {
    this.mutation = `
      mutation($name: String!, $modules: Any) {
        createProfile(input: {
          name: $name,
          modules: $modules
        }){
            _id,
            name
        }
    }`;
    this.variables = {
      module: 'profiles',
      name: this.profile.name,
      modules: this.permissions
    };
  }

  setMutationUpdate() {
    this.mutation = `
      mutation($id: ID!, $name: String!, $modules: Any) {
        updateProfile(_id: $id, input: {
          name: $name,
          modules: $modules
        }){
            _id,
            name
        }
    }`;
    this.variables = {
      module: 'profiles',
      id: this.profileId,
      name: this.profile.name,
      modules: this.permissions
    };
  }

  setQuery() {
    this.query = `
      query($id: ID!) {
        getProfile(_id: $id, filters: {
          qry: {}
        }){
            _id,
            name,
            modules {
              menu,
              permissions
            }
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

  async cleanForm() {
    this.name = '';
    let modules = await this.getMenu();
    if (modules) {
      for (let index in modules) {
        let nameModule = modules[index].name;
        let allControl = this.profileForm.get(`todos${nameModule}`);
        allControl?.setValue(false);
        let seeControl = this.profileForm.get(`ver${nameModule}`);
        seeControl?.setValue(false);
        let editControl = this.profileForm.get(`editar${nameModule}`);
        editControl?.setValue(false);
        let deleteControl = this.profileForm.get(`eliminar${nameModule}`);
        deleteControl?.setValue(false);
      }
    }
  }

  toggleAllPermissions(event: any) {
    let isChecked = event.checked;
    let checkbox = event.source;
    this.gruposPermisos.forEach((module: any) => {
      if (module.name === checkbox.id) {
        module.complete = isChecked;
        module.someComplete = false;
        module.permisos.forEach((permission: any) => (permission.completed = isChecked));
      }
    });
  }

  togglePermission(nameModule: string) {
    this.gruposPermisos.forEach((module: any) => {
      if (module.name === nameModule) {
        module.complete = module.permisos.every((permission: any) => permission.completed);
        this.someComplete();
      }
    });
  }

  someComplete() {
    this.gruposPermisos.forEach((module: any) => {
      module.someComplete = module.permisos.filter((permission: any) => permission.completed).length > 0 && !module.complete;
    });
  }

  validationOfActiveModules(valuesForm: any) {
    let totalModules = this.gruposPermisos.length;
    let response;
    this.permissions = [];
    this.gruposPermisos.forEach((module: any) => {
      if (module.complete || module.someComplete) {
        response = true;
        let permissionsValues: any = {};
        if (module.name !== 'Estadisticas') {
          module.permisos.forEach((permission: any) => {
            permissionsValues['see'] = valuesForm[`ver${module.name}`];
            permissionsValues['edit'] = valuesForm[`editar${module.name}`];
            permissionsValues['delete'] = valuesForm[`eliminar${module.name}`];
          });
          this.permissions.push({
            menu: module.name,
            permissions: permissionsValues
          });
        } else {
          module.permisos.forEach((permission: any) => {
            permissionsValues['see'] = valuesForm[`ver${module.name}`];            
          });
          this.permissions.push({
            menu: module.name,
            permissions: permissionsValues
          });
        }
        totalModules++;
      } else
        totalModules--;
    });
    if (totalModules === 0) {
      response = false;
      this.snakBar.open("Debe seleccionar al menos un módulo para guardar el perfil.", "Aceptar", {
        duration: 6000,
        horizontalPosition: "center",
        verticalPosition: "bottom"
      });
    }
    console.log(this.permissions)
    return response;
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

  setIdsMenuModule() {
    this.idsMenus = {};
    for (let menu in this.modules) {
      this.idsMenus[`${this.modules[menu].name}`] = this.modules[menu]._id;
    }
  }

  activeCheckboxesModules(module: string, permission: any) {
    let seeControl;
    let editControl;
    let deleteControl;
    let allControl;
    if (module !== 'Estadisticas') {
      seeControl = this.profileForm.get(`ver${module}`);
      seeControl?.setValue(permission.see);
      editControl = this.profileForm.get(`editar${module}`);
      editControl?.setValue(permission.edit);
      deleteControl = this.profileForm.get(`eliminar${module}`);
      deleteControl?.setValue(permission.delete);
      if (permission.see || permission.edit || permission.delete) {
        allControl = this.profileForm.get(`todos${module}`);
        allControl?.setValue(true);
      }
    } else {
      seeControl = this.profileForm.get(`ver${module}`);
      seeControl?.setValue(permission.see);
      if (permission.see) {
        allControl = this.profileForm.get(`todos${module}`);
        allControl?.setValue(true);
      }
    }
  }
}