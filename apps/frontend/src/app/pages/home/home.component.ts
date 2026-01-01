import { Component } from '@angular/core';
import { BackgroundComponent } from '../../components/background/background.component';
import { ButtonsComponent } from '../../components/buttons/buttons.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { UserProfileCircleComponent } from '../../components/user-profile-circle/user-profile-circle.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterComponent, BackgroundComponent, ButtonsComponent, UserProfileCircleComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent { }
