// angular
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

// others
import { video } from '../../../../common/video';

@Component({
  selector: 'app-vid-card',
  imports: [],
  templateUrl: './video-card.html',
  styleUrl: './video-card.scss',
})

export class VideoCard implements OnChanges {
  @Input() video: video = new video;

  createdDateFormat: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    const videoCreatedDate = changes['video'].currentValue.createdDate
    if (videoCreatedDate)
      this.createdDateFormat = new Date(videoCreatedDate).toLocaleDateString('pt-BR');
  }

  constructor(private router: Router) {}

  openVideo(): void {
    this.router.navigate([`/video/watch/${this.video.video_url}`]);
  }
}