/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserDataBridgeService } from './userData-bridge.service';

describe('Service: UserDataBridge', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserDataBridgeService]
    });
  });

  it('should ...', inject([UserDataBridgeService], (service: UserDataBridgeService) => {
    expect(service).toBeTruthy();
  }));
});
