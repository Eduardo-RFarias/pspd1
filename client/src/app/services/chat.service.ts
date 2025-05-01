import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  token: string;
  symptoms: string;
}

interface ChatResponse {
  diagnosis: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly API_URL = 'http://localhost:8080/api';
  private messageHistorySubject = new BehaviorSubject<ChatMessage[]>([]);

  public messageHistory$ = this.messageHistorySubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Tentar recuperar histórico do chat do localStorage
    this.loadChatHistoryFromStorage();
  }

  /**
   * Envia uma mensagem para a API de chat e adiciona no histórico
   * @param message Mensagem do usuário (sintomas)
   * @returns Observable com a resposta do diagnóstico
   */
  sendMessage(message: string): Observable<ChatResponse> {
    const token = this.authService.getToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    // Adiciona a mensagem do usuário ao histórico
    this.addMessage({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    const chatRequest: ChatRequest = {
      token: token,
      symptoms: message,
    };

    return this.http
      .post<ChatResponse>(`${this.API_URL}/chat`, chatRequest)
      .pipe(
        tap((response) => {
          // Adiciona a resposta do assistente ao histórico
          this.addMessage({
            role: 'assistant',
            content: response.diagnosis,
            timestamp: new Date(),
          });
        })
      );
  }

  /**
   * Adiciona uma mensagem ao histórico e salva no localStorage
   */
  private addMessage(message: ChatMessage): void {
    const currentHistory = this.messageHistorySubject.getValue();
    const updatedHistory = [...currentHistory, message];

    this.messageHistorySubject.next(updatedHistory);
    this.saveChatHistoryToStorage(updatedHistory);
  }

  /**
   * Salva o histórico de chat no localStorage
   */
  private saveChatHistoryToStorage(history: ChatMessage[]): void {
    try {
      localStorage.setItem('chat_history', JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico do chat:', error);
    }
  }

  /**
   * Carrega o histórico de chat do localStorage
   */
  private loadChatHistoryFromStorage(): void {
    try {
      const history = localStorage.getItem('chat_history');

      if (history) {
        const parsedHistory = JSON.parse(history) as ChatMessage[];
        // Converte as strings de data para objetos Date
        const formattedHistory = parsedHistory.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        this.messageHistorySubject.next(formattedHistory);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do chat:', error);
    }
  }

  /**
   * Limpa o histórico de chat
   */
  clearHistory(): void {
    this.messageHistorySubject.next([]);
    localStorage.removeItem('chat_history');
  }
}
