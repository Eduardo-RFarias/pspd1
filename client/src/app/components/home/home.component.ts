import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PatientInfo, PatientService } from '../../services/patient.service';
import { PatientFormComponent } from '../patient-form/patient-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PatientFormComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  isLoading = true;
  hasPatientInfo = false;
  patientInfo: PatientInfo | null = null;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.checkPatientInfo();
  }

  checkPatientInfo(): void {
    this.isLoading = true;
    this.error = '';

    this.patientService
      .getPatient()
      .pipe(
        catchError((error) => {
          this.isLoading = false;

          if (error.status === 401) {
            // 401 na rota de getPatient significa que as informações do paciente
            // não existem, não necessariamente que o token é inválido
            this.hasPatientInfo = false;
          } else if (error.status === 0) {
            this.error = 'Não foi possível conectar ao servidor.';
            this.hasPatientInfo = false;
          } else {
            // Para outros erros, podemos assumir que o token pode estar inválido
            console.error('Erro ao buscar informações do paciente:', error);
            this.authService.logout();
            this.router.navigate(['/login']);
          }

          return of(null);
        })
      )
      .subscribe((response) => {
        this.isLoading = false;

        if (response) {
          this.hasPatientInfo = true;
          this.patientInfo = response.patient;
        } else {
          // Mantém o estado definido no catchError
        }
      });
  }

  onPatientSaved(patient: PatientInfo): void {
    this.hasPatientInfo = true;
    this.patientInfo = patient;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
