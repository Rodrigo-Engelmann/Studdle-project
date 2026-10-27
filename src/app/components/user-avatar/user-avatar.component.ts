// angular
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

const API_ORIGIN = 'http://localhost:3000';
const PLACEHOLDER = '/assets/images/profile-picture-placeholder.jpg';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img class="avatar"
    [src]="src"
    [alt]="name"
    [style.width]="size"
    [style.height]="size"
    (error)="onImageError()"/>
  `,
  styles: [`
    :host {
      display: inline-flex;
      flex: 0 0 auto;
    }

    .avatar {
      border-radius: 50%;
      object-fit: cover;
      background-color: color-mix(in srgb, currentColor 12%, transparent);
    }
  `]
})
export class UserAvatarComponent {
  @Input() name = '';
  @Input() size = '40px';

  @Input()
  set picture(value: string | null | undefined) {
    this.src = this.buildUrl(value) ?? PLACEHOLDER;
  }

  protected src: string = PLACEHOLDER;

  protected onImageError(): void {
    if (this.src !== PLACEHOLDER)
      this.src = PLACEHOLDER;
  }

  private buildUrl(value: string | null | undefined): string | null {
    if (!value)
      return null;

    if (/^https?:\/\//i.test(value))
      return value;

    if (value.startsWith('/assets') || value.startsWith('assets'))
      return value;

    return API_ORIGIN + (value.startsWith('/') ? value : `/${value}`);
  }
}