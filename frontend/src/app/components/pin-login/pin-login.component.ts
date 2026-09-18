import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pin-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pin-login.component.html',
  styleUrls: ['./pin-login.component.css']
})
export class PinLoginComponent {
  @Input() enteredPin = '';
  @Output() digitPressed = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() backspace = new EventEmitter<void>();

  onDigit(digit: string): void {
    this.digitPressed.emit(digit);
  }

  onClear(): void {
    this.clear.emit();
  }

  onBackspace(): void {
    this.backspace.emit();
  }
}
