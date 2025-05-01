import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PatientInfo, PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
})
export class PatientFormComponent implements OnInit {
  @Output() patientSaved = new EventEmitter<PatientInfo>();

  patientForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  genderOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'outro', label: 'Outro' },
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      gender: ['', [Validators.required]],
      weight: ['', [Validators.required, Validators.min(0.1)]],
      height: ['', [Validators.required, Validators.min(0.1)]],
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      // Disable all form controls while loading
      Object.keys(this.patientForm.controls).forEach((key) => {
        this.patientForm.get(key)?.disable();
      });

      const patientData: PatientInfo = {
        name: this.patientForm.getRawValue().name,
        age: this.patientForm.getRawValue().age,
        gender: this.patientForm.getRawValue().gender,
        weight: this.patientForm.getRawValue().weight,
        height: this.patientForm.getRawValue().height,
      };

      this.patientService.savePatient(patientData).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Re-enable form controls
          Object.keys(this.patientForm.controls).forEach((key) => {
            this.patientForm.get(key)?.enable();
          });

          if (response.success) {
            this.patientSaved.emit(patientData);
          } else {
            this.errorMessage = 'Falha ao salvar informações. Tente novamente.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          // Re-enable form controls
          Object.keys(this.patientForm.controls).forEach((key) => {
            this.patientForm.get(key)?.enable();
          });

          console.error('Erro ao salvar paciente', error);

          if (error.status === 401) {
            this.errorMessage =
              'Sessão expirada. Por favor, faça login novamente.';
          } else if (error.status === 400) {
            this.errorMessage = 'Dados inválidos. Verifique as informações.';
          } else if (error.status === 0) {
            this.errorMessage = 'Não foi possível conectar ao servidor.';
          } else {
            this.errorMessage =
              'Falha ao salvar informações. Tente novamente mais tarde.';
          }
        },
      });
    }
  }
}
