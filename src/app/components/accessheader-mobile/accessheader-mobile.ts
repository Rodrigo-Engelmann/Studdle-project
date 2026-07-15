// angular
import { Component, Input } from '@angular/core';

// services
import { AccessHeaderService } from '../services/accesheader.service';

// classes
import { RouterButton } from '../../classes/routerbuttonclass'

@Component({
  selector: 'app-accessheader-mobile',
  imports: [],
  styleUrl: './accessheader-mobile.scss',
  templateUrl: './accessheader-mobile.html'
})
export class AccessHeaderMobile {
    @Input() headerConfig: RouterButton = {buttonText: '', buttonRoute: '', sideTitle: undefined, sideSubtitle: undefined};
    
    constructor(
        public accessHeaderService: AccessHeaderService
    ) {}
}