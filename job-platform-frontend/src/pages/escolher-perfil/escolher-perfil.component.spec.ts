import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscolherPerfilComponent } from './escolher-perfil.component';

describe('EscolherPerfilComponent', () => {
  let component: EscolherPerfilComponent;
  let fixture: ComponentFixture<EscolherPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscolherPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscolherPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
