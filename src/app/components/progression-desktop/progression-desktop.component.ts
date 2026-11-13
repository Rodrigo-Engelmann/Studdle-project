import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef, inject } from '@angular/core';
import { UserDataBridgeService } from '../services/userData-bridge.service';
import { takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-progression-desktop',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule, NgClass],
  templateUrl: './progression-desktop.component.html',
  styleUrls: ['./progression-desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressionDesktopComponent implements OnChanges, OnInit {
  @Input() moduleData: any = {};
  @Input() studyTasksData = { studyCompleted: 0, totalStudyContents: 0 }
  @Input() practiceTaskData = { practiceCompleted: 0, totalPracticeContents: 0 }
  @Input() linearProgress: number = 0;
  @Input() profile_picture: any = undefined;

  @Output() pressedLevelUpBtn = new EventEmitter<boolean>();

  private clearPrevTimer?: ReturnType<typeof setTimeout>;
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  constructor(private userDataBridgeService: UserDataBridgeService) {}

  imageLoaded = false;
  currentImage?: string;
  previousImage?: string;

  ngOnInit(): void {
    this.userDataBridgeService.userData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bridgeUserData: any) => {
        if (bridgeUserData.profile_picture)
          this.profile_picture = `http://localhost:3000${bridgeUserData.profile_picture}`;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const newSrc: string | undefined = changes['moduleData']?.currentValue?.image;
    if (!newSrc || newSrc === this.currentImage) return;

    clearTimeout(this.clearPrevTimer);
    this.previousImage = this.currentImage;
    this.currentImage = newSrc;
    this.imageLoaded = false;
  }
  
  onImageLoad() {
    this.imageLoaded = true;

    clearTimeout(this.clearPrevTimer);
    this.clearPrevTimer = setTimeout(() => {
      this.previousImage = undefined;
      this.cdr.markForCheck();
    }, 1500);
  }

  get studyProgress(): number {
    return this.toPercentage(this.studyTasksData.studyCompleted, this.studyTasksData.totalStudyContents);
  }

  get practiceProgress(): number {
    return this.toPercentage(this.practiceTaskData.practiceCompleted, this.practiceTaskData.totalPracticeContents);
  }

  private toPercentage(completed: number, total: number): number {
    return total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0;
  }
}