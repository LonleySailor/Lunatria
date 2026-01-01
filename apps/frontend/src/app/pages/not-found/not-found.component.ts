// src/app/pages/not-found/not-found.component.ts
import { Component } from '@angular/core';
import { BackgroundComponent } from '../../components/background/background.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
  imports: [BackgroundComponent, FooterComponent],
  standalone: true

})
export class NotFoundComponent { }
