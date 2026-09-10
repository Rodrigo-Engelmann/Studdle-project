import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonIcon, IonProgressBar } from '@ionic/angular/standalone';
import { personCircle } from 'ionicons/icons';

@Component({
  selector: 'app-progression-mobile',
  standalone: true,
  imports: [IonIcon, IonProgressBar],
  templateUrl: './progression-mobile.component.html',
  styleUrl: './progression-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressionMobileComponent {
  @Input() studyCompleted = 6;
  @Input() practiceCompleted = 3;
  @Input() totalContents = 24;
  @Input() linearProgress = 100;
  @Input() rankName = 'BRONZE';
  @Input() rankImageUrl = 'https://media.istockphoto.com/id/1842732901/pt/vetorial/loading-icon.jpg?s=612x612&w=0&k=20&c=Kfry4YuT4ePFeztRZnPEdzONS4Msk1XV3k6nbHHRpas=';

  readonly personCircle = personCircle;

  get studyProgress(): number { return this.toPercentage(this.studyCompleted, this.totalContents); }
  get practiceProgress(): number { return this.toPercentage(this.practiceCompleted, this.totalContents); }

  private toPercentage(completed: number, total: number): number {
    return total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0;
  }
}