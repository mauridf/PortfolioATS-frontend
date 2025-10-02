import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Shared Module
import { SharedModule } from '../shared/shared.module';

// Components
import { SkillsComponent } from './skills/skills.component';

@NgModule({
  declarations: [
    SkillsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  exports: [
    SkillsComponent
  ]
})
export class SkillsModule { }