// angular
import { Route, Router } from '@angular/router';
import { Injectable } from '@angular/core';

// class
import { RouterButton } from '../../classes/routerbuttonclass'

@Injectable({
  providedIn: 'root'
})
export class AccessHeaderService {
    constructor(
        private router: Router,
    ) {}

    goTo(event: RouterButton) {
        this.router.navigate([event.buttonRoute]);
    }
}