import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Shared Module
import { SharedModule } from '../shared/shared.module';

// Components
import { ExperiencesComponent } from './experiences/experiences.component';

@NgModule({
  declarations: [
    ExperiencesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    ExperiencesComponent
  ]
})
export class ExperiencesModule { }