// angular
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// components
import { TabHeader } from '../tab-header/tab-header';
import { TabHeaderMobile } from '../tab-header-mobile/tab-header-mobile';

// services
import { UserService } from '../../services/users/users.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    TabHeader,
    TabHeaderMobile
  ],
  styleUrl: './header_layout.component.scss',
  templateUrl: './header_layout.component.html'
})
export class TabHeaderLayoutComponent implements OnInit {
  mobile = window.innerWidth <= 768;

  constructor(
    private userService: UserService
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.mobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.userService.getProfile().subscribe((res) => {
      // updates the colorblindess filter option
      this.userService.updateColorBlindFilter(res.user.colorblindness)
    });
  }

}