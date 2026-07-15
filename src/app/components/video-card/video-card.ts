// angular
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

// others
import { video } from '../../../../common/video';

@Component({
  selector: 'app-vid-card',
  imports: [],
  templateUrl: './video-card.html',
  styleUrl: './video-card.scss',
})

export class VideoCard {
  @Input() video!: video;

  constructor(private router: Router) {}

  openVideo(): void {
    this.router.navigate(['/watch/video']);
  }
}