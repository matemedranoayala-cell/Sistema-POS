import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsPaginadosComponent } from './logs-paginados.component';

describe('LogsPaginadosComponent', () => {
  let component: LogsPaginadosComponent;
  let fixture: ComponentFixture<LogsPaginadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsPaginadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogsPaginadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
