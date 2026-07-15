// angular
import { Component } from '@angular/core';
// import { Route, Router } from '@angular/router';

// others
import materials from '../../../assets/files/material.json';
import { material } from '../../../../common/material';

// components
import { MaterialCard } from '../material-card/material-card';

@Component({
  selector: 'app-materiais',
  standalone: true,
  imports: [
    MaterialCard,
  ],
  templateUrl: './materiais.html',
  styleUrl: './materiais.scss',
})
export class Materiais {
  materials: material[] = materials as material[];
  // constructor(private router: Router) {}
}

