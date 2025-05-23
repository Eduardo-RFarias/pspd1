import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messageForm!: FormGroup;
  messages$!: Observable<ChatMessage[]>;
  isLoading = false;
  error = '';
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.messages$ = this.chatService.messageHistory$;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  sendMessage(): void {
    if (this.messageForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.error = '';

      // Disable the form control while loading
      this.messageForm.get('message')?.disable();

      const message = this.messageForm.getRawValue().message;

      const messageSub = this.chatService.sendMessage(message).subscribe({
        next: () => {
          // Não faz nada aqui, pois a resposta está sendo processada em streaming
        },
        error: (error) => {
          this.isLoading = false;
          // Re-enable the control
          this.messageForm.get('message')?.enable();

          console.error('Erro ao enviar mensagem:', error);

          if (error.status === 401) {
            this.error = 'Sessão expirada. Redirecionando para o login...';
            setTimeout(() => {
              this.authService.logout();
              this.router.navigate(['/login']);
            }, 2000);
          } else if (error.status === 400) {
            this.error = 'Mensagem inválida. Por favor, tente novamente.';
          } else if (error.status === 0) {
            this.error = 'Não foi possível conectar ao servidor.';
          } else {
            this.error = 'Ocorreu um erro. Por favor, tente novamente.';
          }
        },
        complete: () => {
          // Streaming finalizado
          this.isLoading = false;
          // Re-enable the control and reset it
          this.messageForm.get('message')?.enable();
          this.messageForm.get('message')?.reset();
          this.scrollToBottom();
        },
      });

      this.subscription.add(messageSub);
    }
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  clearChat(): void {
    if (confirm('Tem certeza que deseja limpar o histórico de chat?')) {
      this.chatService.clearHistory();
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  formatDate(date: Date): string {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
