import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type AuthMode = 'pin' | 'pass';

@Component({
  selector: 'app-auth-mode-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-mode-tabs.component.html',
  styleUrls: ['./auth-mode-tabs.component.css']
})
export class AuthModeTabsComponent {
  @Input() authMode: AuthMode = 'pin';
  @Output() modeChange = new EventEmitter<AuthMode>();

  setMode(mode: AuthMode): void {
    this.modeChange.emit(mode);
  }
}
