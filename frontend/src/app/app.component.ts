import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  @HostListener('window:beforeunload', ['$event'])
  cerrarVentana() {
    const sesion = localStorage.getItem('kombat-session');
    if (sesion) {
      const datos = JSON.parse(sesion);
      const url = 'http://127.0.0.1:8000/api/logout/';
      const data = JSON.stringify({ username: datos.usuario });
      navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
    }
  }
}
