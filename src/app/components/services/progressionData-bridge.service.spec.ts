/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProgressionDataBridgeService } from './progressionData-bridge.service';

describe('Service: ProgressionDataBridge', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProgressionDataBridgeService]
    });
  });

  it('should ...', inject([ProgressionDataBridgeService], (service: ProgressionDataBridgeService) => {
    expect(service).toBeTruthy();
  }));
});
