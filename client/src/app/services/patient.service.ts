import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
}

interface PatientResponse {
  patient: PatientInfo;
}

interface PatientSaveResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Busca as informações do paciente usando o token atual
   * @returns Um Observable com as informações do paciente
   * @note A API retorna 401 se o paciente não existir ou se o token for inválido
   */
  getPatient(): Observable<PatientResponse> {
    const token = this.authService.getToken();
    return this.http.get<PatientResponse>(
      `${this.API_URL}/patient?token=${token}`
    );
  }

  /**
   * Salva as informações do paciente no servidor
   * @param patient Dados do paciente a serem salvos
   * @returns Um Observable indicando sucesso ou falha da operação
   */
  savePatient(patient: PatientInfo): Observable<PatientSaveResponse> {
    const token = this.authService.getToken();
    return this.http.post<PatientSaveResponse>(`${this.API_URL}/patient`, {
      token,
      patient,
    });
  }
}
