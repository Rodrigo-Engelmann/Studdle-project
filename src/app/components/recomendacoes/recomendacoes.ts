// angular
import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';

// others
import materials from '../../../assets/files/recomendacoes/rec-material.json';
import { material } from '../../../../common/material';
import { video } from '../../../../common/video';

// components
import { VideoCard } from '../video-card/video-card';
import { MaterialCard } from '../material-card/material-card';

@Component({
  selector: 'app-recomendacoes',
  imports: [
    VideoCard,
    MaterialCard,
  ],
  templateUrl: './recomendacoes.html',
  styleUrl: './recomendacoes.scss',
})
export class Recomendacoes {
  materials: material[] = materials as material[];
  videos: video[] = [];

  constructor(private router: Router) {}

}
