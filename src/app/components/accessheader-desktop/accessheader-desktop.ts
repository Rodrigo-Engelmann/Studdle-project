// angular
import { Component, Input } from '@angular/core';

// services
import { AccessHeaderService } from '../services/accesheader.service';

// classes
import { RouterButton } from '../../classes/routerbuttonclass'

@Component({
  selector: 'app-accessheader-desktop',
  imports: [],
  styleUrl: './accessheader-desktop.scss',
  templateUrl: './accessheader-desktop.html'
})
export class AccessHeaderDesktop {
  @Input() headerConfig: RouterButton = {buttonText: '', buttonRoute: '', sideTitle: undefined, sideSubtitle: undefined};

  constructor(
    public accessHeaderService: AccessHeaderService
  ) {}
}