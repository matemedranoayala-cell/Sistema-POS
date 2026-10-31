import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent role routing', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let login: jasmine.Spy;
  let navigate: jasmine.Spy;

  beforeEach(async () => {
    login = jasmine.createSpy('login');
    navigate = jasmine.createSpy('navigate').and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: AuthService, useValue: { login } },
        { provide: Router, useValue: { navigate } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    component.usuario = 'usuario';
    component.contrasena = 'password';
  });

  [
    ['superadmin', '/superadmin'],
    ['admin', '/admin'],
    ['recepcion', '/recepcion'],
    ['recepcionista', '/recepcion'],
    ['coach', '/coach'],
    ['entrenador', '/coach'],
    ['encargado_tienda', '/tienda']
  ].forEach(([rol, ruta]) => {
    it(`routes ${rol} to ${ruta}`, async () => {
      login.and.resolveTo({ success: true, rol });

      await component.iniciarSesion();

      expect(navigate).toHaveBeenCalledWith([ruta]);
    });
  });

  it('does not route an unrecognized role to another role page', async () => {
    login.and.resolveTo({ success: true, rol: 'unknown' });

    await component.iniciarSesion();

    expect(navigate).not.toHaveBeenCalled();
    expect(component.mensajeError).toBe('Rol no reconocido. Contacta al administrador.');
    expect(component.cargando).toBeFalse();
  });
});
