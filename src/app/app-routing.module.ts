import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ExperiencesComponent } from './modules/experiences/experiences/experiences.component';
import { ProfileComponent } from './modules/profile/profile/profile.component';
import { SkillsComponent } from './modules/skills/skills/skills.component';
import { EducationsComponent } from './modules/educations/educations/educations.component';
import { CertificationsComponent } from './modules/certifications/certifications/certifications.component';
import { LanguagesComponent } from './modules/languages/languages/languages.component';
import { AuthGuard } from './core/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      // Aqui vamos adicionar outras rotas posteriormente
      { path: 'profile', component: ProfileComponent },
      { path: 'experiences', component: ExperiencesComponent },
      { path: 'skills', component: SkillsComponent },
      { path: 'education', component: EducationsComponent },
      { path: 'certifications', component: CertificationsComponent },
      { path: 'languages', component: LanguagesComponent }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }