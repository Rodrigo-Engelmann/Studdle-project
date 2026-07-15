import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterMaterial } from './register-material';

describe('RegisterMaterial', () => {
  let component: RegisterMaterial;
  let fixture: ComponentFixture<RegisterMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterMaterial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
