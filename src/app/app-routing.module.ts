import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LayoutComponent } from './components/layout/layout.component';
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
      { path: 'profile', component: DashboardComponent }, // Temporário
      { path: 'experiences', component: DashboardComponent }, // Temporário
      { path: 'skills', component: DashboardComponent }, // Temporário
      { path: 'education', component: DashboardComponent }, // Temporário
      { path: 'certifications', component: DashboardComponent }, // Temporário
      { path: 'languages', component: DashboardComponent } // Temporário
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }