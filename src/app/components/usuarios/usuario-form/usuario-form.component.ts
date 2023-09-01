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
  name: string;
  lastName: string;
  email: string;
  mobile: string;
  city: string;
  state: any;
  file: any;
  srcImage: string;


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
      name: ['', Validators.required],
      email: ['', Validators.required],
      mobile: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      lastName: [''],
      file: [null],
    });
    this.name = '';
    this.lastName = '';
    this.email = '';
    this.mobile = '';
    this.state = '';
    this.city = '';
    this.file = '';
  }

  ngOnInit(): void {

  }

  onSubmit() {
    if (this.userForm.status === 'VALID') {
      // let pathFile = this.userForm.get('file')?.value;
      
    }
  }
}
