// angular
import { Component } from '@angular/core';
// import { Route, Router } from '@angular/router';

// components
import { VideoCard } from '../video-card/video-card';

// others
import videos from '../../../assets/files/videos.json';
import { video } from '../../../../common/video';


@Component({
  selector: 'app-videos',
  imports: [
    VideoCard,
  ],
  standalone: true,
  templateUrl: './videos.html',
  styleUrl: './videos.scss'
})
export class Videos {
  videos: video[] = videos as video[];

  // constructor(private router: Router) {}
}
