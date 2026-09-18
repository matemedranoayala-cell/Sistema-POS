import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-login-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-feedback.component.html',
  styleUrls: ['./login-feedback.component.css']
})
export class LoginFeedbackComponent {
  @Input() message = '';
  @Input() loginSuccess = false;
}
