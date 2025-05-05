import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Define interface for streaming responses
interface StreamingResponse {
  type: 'progress' | 'complete' | 'error';
  content: string;
  error?: Error;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  token: string;
  messages: { role: string; content: string }[];
}

interface ChatResponse {
  diagnosis: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly API_URL = '/api';
  private messageHistorySubject = new BehaviorSubject<ChatMessage[]>([]);
  private currentAssistantMessage = new BehaviorSubject<string>('');

  public messageHistory$ = this.messageHistorySubject.asObservable();
  public currentStreamingMessage$ = this.currentAssistantMessage.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // No longer loading from localStorage
  }

  /**
   * Envia uma mensagem para a API de chat e adiciona no histórico
   * @param message Mensagem do usuário (sintomas)
   * @returns Observable que completa quando a resposta estiver finalizada
   */
  sendMessage(message: string): Observable<StreamingResponse> {
    const token = this.authService.getToken();

    if (!token) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    // Obtém o histórico atual para converter em formato de mensagens
    const currentHistory = this.messageHistorySubject.getValue();

    // Adiciona a mensagem do usuário ao histórico
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    this.addMessage(userMessage);

    // Prepara as mensagens para o servidor no formato esperado
    // Convertemos o histórico completo + a nova mensagem
    const messages = [
      ...currentHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    const chatRequest: ChatRequest = {
      token: token,
      messages: messages,
    };

    // Reset streaming message
    this.currentAssistantMessage.next('');

    // Inicia uma mensagem temporária para ir acumulando o conteúdo
    const placeholderMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    this.addMessage(placeholderMessage);

    // Obtém o índice da mensagem placeholder
    const updatedHistory = this.messageHistorySubject.getValue();
    const placeholderIndex = updatedHistory.length - 1;

    // Use direct XMLHttpRequest for better streaming support
    return this.streamRequest(chatRequest, placeholderIndex).pipe(
      catchError((error) => {
        // Handle errors gracefully
        this.updateMessageContent(
          placeholderIndex,
          'Erro ao processar diagnóstico. Por favor, tente novamente.'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Perform a streaming request using XMLHttpRequest directly for better control
   */
  private streamRequest(
    chatRequest: ChatRequest,
    placeholderIndex: number
  ): Observable<StreamingResponse> {
    return new Observable((observer) => {
      const xhr = new XMLHttpRequest();
      let responseBuffer = '';

      xhr.open('POST', `${this.API_URL}/chat`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'text/plain');
      xhr.responseType = 'text';

      // Handle streaming data as it arrives
      xhr.onprogress = (event) => {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          try {
            // Get only the new part of the response
            const newResponse = xhr.responseText.substring(
              responseBuffer.length
            );
            if (newResponse) {
              responseBuffer = xhr.responseText;

              // Update the UI with the incremental text
              this.currentAssistantMessage.next(responseBuffer);
              this.updateMessageContent(placeholderIndex, responseBuffer);

              // Notify the observer
              observer.next({
                type: 'progress',
                content: newResponse,
              });
            }
          } catch (err) {
            // Catch any parsing errors but continue
            console.error('Error processing stream chunk:', err);
          }
        }
      };

      // Handle completion
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          this.currentAssistantMessage.next(xhr.responseText);
          this.updateMessageContent(placeholderIndex, xhr.responseText);
          observer.next({
            type: 'complete',
            content: xhr.responseText,
          });
          observer.complete();
        } else {
          const error = new Error(
            `HTTP Error ${xhr.status}: ${xhr.statusText}`
          );
          observer.next({
            type: 'error',
            content: `Erro ${xhr.status}: ${xhr.statusText}`,
            error,
          });
          observer.error(error);
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        const error = new Error('Erro de conexão com o servidor');
        observer.next({
          type: 'error',
          content: 'Erro de conexão com o servidor',
          error,
        });
        observer.error(error);
      };

      // Handle timeouts
      xhr.ontimeout = () => {
        const error = new Error(
          'A conexão expirou. Verifique sua conexão de internet.'
        );
        observer.next({
          type: 'error',
          content: 'A conexão expirou. Verifique sua conexão de internet.',
          error,
        });
        observer.error(error);
      };

      // Set timeout to 60 seconds (matching server side)
      xhr.timeout = 60000;

      // Send the request
      xhr.send(JSON.stringify(chatRequest));

      // Return cleanup function
      return () => {
        xhr.abort();
      };
    });
  }

  /**
   * Atualiza o conteúdo de uma mensagem específica no histórico
   */
  private updateMessageContent(index: number, content: string): void {
    const currentHistory = this.messageHistorySubject.getValue();

    if (index >= 0 && index < currentHistory.length) {
      const updatedHistory = [...currentHistory];
      updatedHistory[index] = {
        ...updatedHistory[index],
        content: content,
      };

      this.messageHistorySubject.next(updatedHistory);
      // Não salva mais no localStorage
    }
  }

  /**
   * Adiciona uma mensagem ao histórico
   */
  private addMessage(message: ChatMessage): void {
    const currentHistory = this.messageHistorySubject.getValue();
    const updatedHistory = [...currentHistory, message];

    this.messageHistorySubject.next(updatedHistory);
    // Não salva mais no localStorage
  }

  /**
   * Limpa o histórico de chat
   */
  clearHistory(): void {
    this.messageHistorySubject.next([]);
    // Não remove mais do localStorage
  }
}
