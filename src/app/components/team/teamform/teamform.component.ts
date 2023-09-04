import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-teamform',
  templateUrl: './teamform.component.html',
  styleUrls: ['./teamform.component.css']
})
export class TeamformComponent implements OnInit {
  teamForm: FormGroup = new FormGroup({}); 

  constructor( 
    private fb: FormBuilder,
    private titleService: TitleService
    
    ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Equipo / Nuevo Equipo');
    this.teamForm = this.fb.group({
      cancha: ['', Validators.required],
      torneo: ['', Validators.required],
      nombreEquipo: ['', Validators.required]
    });
  }

  onSubmit(): void {
    console.log(this.teamForm.value);
  }
}
