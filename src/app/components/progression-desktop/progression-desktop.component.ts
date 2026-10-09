import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgClass } from '@angular/common';

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
  @Input() linearProgress: number = 100;
  @Input() profile_picture: any = undefined;

  imageLoaded = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['moduleData'] &&
        changes['moduleData'].previousValue?.image !== changes['moduleData'].currentValue?.image) {
      this.imageLoaded = false;
    }

    console.log("profile_picture: ", this.profile_picture)

    // if (changes[''])
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