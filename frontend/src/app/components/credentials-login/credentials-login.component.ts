import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-credentials-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credentials-login.component.html',
  styleUrls: ['./credentials-login.component.css']
})
export class CredentialsLoginComponent {
  @Input() passwordVisible = false;
  @Input() username = '';
  @Input() password = '';
  @Output() passwordVisibleChange = new EventEmitter<boolean>();
  @Output() usernameChange = new EventEmitter<string>();
  @Output() passwordChange = new EventEmitter<string>();

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    this.passwordVisibleChange.emit(this.passwordVisible);
  }
}
