import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVideo } from './view-video';

describe('ViewVideo', () => {
  let component: ViewVideo;
  let fixture: ComponentFixture<ViewVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewVideo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewVideo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
