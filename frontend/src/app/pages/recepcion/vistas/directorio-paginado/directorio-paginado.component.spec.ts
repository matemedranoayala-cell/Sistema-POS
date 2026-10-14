import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorioPaginadoComponent } from './directorio-paginado.component';

describe('DirectorioPaginadoComponent', () => {
  let component: DirectorioPaginadoComponent;
  let fixture: ComponentFixture<DirectorioPaginadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorioPaginadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectorioPaginadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
