// angular
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

// others
import { material } from '../../../../common/material';

@Component({
  selector: 'app-mat-card',
  imports: [],
  templateUrl: './material-card.html',
  styleUrl: './material-card.scss',
})

export class MaterialCard {
  @Input() material!: material;

  constructor(private router: Router) {}

  openMaterial(): void {
    const url = 'view/material/'+this.material.link;
    this.router.navigate([url]);
  }
}