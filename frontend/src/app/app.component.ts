import { Component } from '@angular/core';
import { LoginPageComponent } from './components/login-page/login-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginPageComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
