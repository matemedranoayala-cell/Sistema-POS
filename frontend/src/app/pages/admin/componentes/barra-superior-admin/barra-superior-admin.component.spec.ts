import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraSuperiorAdminComponent } from './barra-superior-admin.component';

describe('BarraSuperiorAdminComponent', () => {
  let component: BarraSuperiorAdminComponent;
  let fixture: ComponentFixture<BarraSuperiorAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraSuperiorAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraSuperiorAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
