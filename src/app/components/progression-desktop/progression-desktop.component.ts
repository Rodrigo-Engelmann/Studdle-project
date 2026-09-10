import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-progression-desktop',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule],
  templateUrl: './progression-desktop.component.html',
  styleUrls: ['./progression-desktop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressionDesktopComponent {
  /** Valores editáveis pelo componente-pai. */
  @Input() studyCompleted = 6;
  @Input() practiceCompleted = 3;
  @Input() totalContents = 24;
  @Input() linearProgress = 100;
  @Input() rankName = 'BRONZE';

  /** Troque depois pela imagem definitiva do rank. */
  @Input() rankImageUrl = 'https://media.istockphoto.com/id/1842732901/pt/vetorial/loading-icon.jpg?s=612x612&w=0&k=20&c=Kfry4YuT4ePFeztRZnPEdzONS4Msk1XV3k6nbHHRpas=';

  get studyProgress(): number {
    return this.toPercentage(this.studyCompleted, this.totalContents);
  }

  get practiceProgress(): number {
    return this.toPercentage(this.practiceCompleted, this.totalContents);
  }

  private toPercentage(completed: number, total: number): number {
    return total > 0 ? Math.min(100, Math.max(0, (completed / total) * 100)) : 0;
  }
}