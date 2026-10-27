import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef, inject } from '@angular/core';

@Component({
  selector: 'app-progression-desktop',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule, NgClass],
  templateUrl: './progression-desktop.component.html',
  styleUrls: ['./progression-desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressionDesktopComponent implements OnChanges {
  @Input() moduleData: any = {};
  @Input() studyTasksData = { studyCompleted: 0, totalStudyContents: 0 }
  @Input() practiceTaskData = { practiceCompleted: 0, totalPracticeContents: 0 }
  @Input() linearProgress: number = 0;
  @Input() profile_picture: any = undefined;

  @Output() pressedLevelUpBtn = new EventEmitter<boolean>();

  private clearPrevTimer?: ReturnType<typeof setTimeout>;
  private cdr = inject(ChangeDetectorRef);

  imageLoaded = false;
  currentImage?: string;
  previousImage?: string;

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