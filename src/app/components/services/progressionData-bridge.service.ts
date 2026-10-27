import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressionDataBridgeService {
  private progressionDataSubject = new BehaviorSubject<number>(0);

  progressionData$ = this.progressionDataSubject.asObservable();

  updateTabProgressData(progress: number): void {
    this.progressionDataSubject.next(progress);
  }
}