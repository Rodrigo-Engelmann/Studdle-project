import { ChangeDetectionStrategy, Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { IonIcon, IonProgressBar } from '@ionic/angular/standalone';
import { personCircle } from 'ionicons/icons';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-progression-mobile',
  standalone: true,
  imports: [IonIcon, IonProgressBar, NgClass],
  templateUrl: './progression-mobile.component.html',
  styleUrl: './progression-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressionMobileComponent implements OnChanges {
  @Input() moduleData: any = {};

  @Input() studyTasksData = { studyCompleted: 0, totalStudyContents: 0 }
  @Input() practiceTaskData = { practiceCompleted: 0, totalPracticeContents: 0 }
  @Input() linearProgress = 100;

  imageLoaded = false;
  
  readonly personCircle = personCircle;

  get studyProgress(): number { return this.toPercentage(this.studyTasksData.studyCompleted, this.studyTasksData.totalStudyContents); }
  get practiceProgress(): number { return this.toPercentage(this.practiceTaskData.practiceCompleted, this.practiceTaskData.totalPracticeContents); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['moduleData'] &&
        changes['moduleData'].previousValue?.image !== changes['moduleData'].currentValue?.image) {
      this.imageLoaded = false;
    }
  }

  private toPercentage(completed: number, total: number): number {
    return total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0;
  }
}