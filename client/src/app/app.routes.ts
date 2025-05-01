import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard], // Only non-authenticated users can access login
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NoAuthGuard], // Only non-authenticated users can access register
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard], // Only authenticated users can access home
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard], // Only authenticated users can access chat
  },
  // Catch-all redirect to login
  { path: '**', redirectTo: 'login' },
];
