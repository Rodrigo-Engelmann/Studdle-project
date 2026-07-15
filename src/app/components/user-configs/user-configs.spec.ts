import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConfigs } from './user-configs';

describe('UserConfigs', () => {
  let component: UserConfigs;
  let fixture: ComponentFixture<UserConfigs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserConfigs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserConfigs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
