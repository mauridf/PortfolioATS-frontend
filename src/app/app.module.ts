import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './modules/shared/shared.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';
import { SkillsModule } from './modules/skills/skills.module';
import { ProfileModule } from './modules/profile/profile.module';
import { EducationsModule } from './modules/educations/educations.module';
import { CertificationsModule } from './modules/certifications/certifications.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { SocialLinksModule } from './modules/social-links/social-links.module';
import { MaterialModule } from './modules/shared/material.module';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { LayoutComponent } from './components/layout/layout.component';

// Services and Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    // Apenas componentes globais do App
    AppComponent,
    LoginComponent,
    DashboardComponent,
    HeaderComponent,
    SidenavComponent,
    LayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    
    // Feature Modules
    SharedModule,
    ExperiencesModule,
    SkillsModule,
    ProfileModule,
    EducationsModule,
    CertificationsModule,
    LanguagesModule,
    SocialLinksModule,
    MaterialModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }